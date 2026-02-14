const Airtable = require('airtable');

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base(process.env.AIRTABLE_BASE_ID);

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'public, max-age=3600',
};

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
      fields: ['headline', 'summary', 'source_name', 'source_url', 'category', 'published_date'],
    }).all();

    const updates = records.map(rec => ({
      id: rec.id,
      headline: rec.get('headline') || '',
      summary: rec.get('summary') || '',
      source_name: rec.get('source_name') || '',
      category: rec.get('category') || 'General',
      published_date: rec.get('published_date') || '',
    }));

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
