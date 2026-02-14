const Airtable = require('airtable');

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base(process.env.AIRTABLE_BASE_ID);

exports.handler = async (event) => {
  // Auth check
  const params = new URLSearchParams(event.rawQuery || '');
  if (params.get('key') !== process.env.UPDATES_SECRET) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let articles;
  try {
    articles = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  if (!Array.isArray(articles) || articles.length === 0) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Expected non-empty array' }) };
  }

  const table = base('Travel_Updates');
  const today = new Date().toISOString().split('T')[0];

  // Fetch existing source_article_ids for dedup
  const existingIds = new Set();
  try {
    const records = await table.select({
      fields: ['source_article_id'],
      pageSize: 100,
    }).all();
    for (const rec of records) {
      const id = rec.get('source_article_id');
      if (id) existingIds.add(id);
    }
  } catch (err) {
    console.error('Failed to fetch existing records:', err.message);
  }

  const results = { inserted: 0, skipped: 0, errors: 0 };

  for (const article of articles) {
    if (!article.headline || !article.source_article_id) {
      results.errors++;
      continue;
    }

    // Skip duplicates
    if (existingIds.has(article.source_article_id)) {
      results.skipped++;
      continue;
    }

    try {
      await table.create({
        headline: article.headline,
        summary: article.summary || '',
        source_name: article.source_name || '',
        source_url: article.source_url || '',
        source_article_id: article.source_article_id,
        category: article.category || 'General',
        published_date: article.published_date || today,
        is_active: true,
        created_at: today,
      });
      existingIds.add(article.source_article_id);
      results.inserted++;
    } catch (err) {
      console.error(`Failed to insert "${article.headline}":`, err.message);
      results.errors++;
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `Inserted ${results.inserted}, skipped ${results.skipped} dupes, ${results.errors} errors`,
      results,
    }),
  };
};
