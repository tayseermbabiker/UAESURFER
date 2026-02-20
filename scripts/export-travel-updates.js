// Export active travel updates from Airtable to static JSON (1 API call per day)
const Airtable = require('airtable');
const fs = require('fs');
const path = require('path');

const EVERGREEN_TIPS = [
  { headline: 'Standard tourist visa is 30 days on arrival for US, UK, EU & Australian citizens', category: 'Visa', source_name: 'UAESurfer' },
  { headline: 'Download the Careem or UBER app before you land — easiest transport in any emirate', category: 'Transport', source_name: 'UAESurfer' },
  { headline: 'UAE has 5% VAT on most purchases — tourists can claim refunds at the airport', category: 'General', source_name: 'UAESurfer' },
  { headline: 'Dubai Metro runs until midnight — Red Line covers all major tourist spots', category: 'Transport', source_name: 'UAESurfer' },
  { headline: 'Summer temperatures exceed 45C — plan outdoor activities for early morning or evening', category: 'Weather', source_name: 'UAESurfer' },
];

async function exportUpdates() {
  const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
    .base(process.env.AIRTABLE_BASE_ID);

  const records = await base('Travel_Updates')
    .select({
      filterByFormula: '{is_active} = TRUE()',
      sort: [{ field: 'published_date', direction: 'desc' }],
      maxRecords: 5,
      fields: ['headline', 'summary', 'source_name', 'category', 'published_date'],
    })
    .all();

  const updates = records.map(rec => ({
    id: rec.id,
    headline: rec.get('headline') || '',
    summary: rec.get('summary') || '',
    source_name: rec.get('source_name') || '',
    category: rec.get('category') || 'General',
    published_date: rec.get('published_date') || '',
  }));

  // Fill remaining slots with evergreen tips if fewer than 5 active items
  if (updates.length < 5) {
    const needed = 5 - updates.length;
    for (let i = 0; i < needed; i++) {
      updates.push({
        id: null,
        headline: EVERGREEN_TIPS[i].headline,
        summary: '',
        source_name: EVERGREEN_TIPS[i].source_name,
        category: EVERGREEN_TIPS[i].category,
        published_date: '',
      });
    }
  }

  const output = { updates };

  fs.writeFileSync(
    path.join(__dirname, '..', 'travel-updates.json'),
    JSON.stringify(output)
  );

  console.log(`Exported ${records.length} active updates (${updates.length} total with tips) to travel-updates.json`);
}

exportUpdates().catch(err => {
  console.error('Export failed:', err);
  process.exit(1);
});
