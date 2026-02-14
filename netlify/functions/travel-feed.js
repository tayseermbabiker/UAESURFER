const Airtable = require('airtable');

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base(process.env.AIRTABLE_BASE_ID);

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'public, max-age=3600',
};

// Evergreen tips shown when fewer than 5 active news items exist
const EVERGREEN_TIPS = [
  { headline: 'Standard tourist visa is 30 days on arrival for US, UK, EU & Australian citizens', category: 'Visa', source_name: 'UAESurfer' },
  { headline: 'Download the Careem or UBER app before you land — easiest transport in any emirate', category: 'Transport', source_name: 'UAESurfer' },
  { headline: 'UAE has 5% VAT on most purchases — tourists can claim refunds at the airport', category: 'General', source_name: 'UAESurfer' },
  { headline: 'Dubai Metro runs until midnight — Red Line covers all major tourist spots', category: 'Transport', source_name: 'UAESurfer' },
  { headline: 'Summer temperatures exceed 45C — plan outdoor activities for early morning or evening', category: 'Weather', source_name: 'UAESurfer' },
];

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const table = base('Travel_Updates');
    const records = await table.select({
      filterByFormula: '{is_active} = TRUE()',
      sort: [{ field: 'published_date', direction: 'desc' }],
      maxRecords: 5,
      fields: ['headline', 'summary', 'source_name', 'category', 'published_date'],
    }).all();

    const updates = records.map(rec => ({
      id: rec.id,
      headline: rec.get('headline') || '',
      summary: rec.get('summary') || '',
      source_name: rec.get('source_name') || '',
      category: rec.get('category') || 'General',
      published_date: rec.get('published_date') || '',
    }));

    // Fill remaining slots with evergreen tips if fewer than 5 active news items
    if (updates.length < 5) {
      const needed = 5 - updates.length;
      for (let i = 0; i < needed; i++) {
        const tip = EVERGREEN_TIPS[i];
        updates.push({
          id: null,
          headline: tip.headline,
          summary: '',
          source_name: tip.source_name,
          category: tip.category,
          published_date: '',
        });
      }
    }

    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates }),
    };
  } catch (err) {
    console.error('travel-feed error:', err.message);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Failed to fetch updates' }),
    };
  }
};
