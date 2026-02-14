const Airtable = require('airtable');

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base(process.env.AIRTABLE_BASE_ID);

// Category-based expiry windows (in days)
const EXPIRY_DAYS = {
  Airport:   5,
  Transport: 7,
  Weather:   3,
  Events:    14,
  General:   14,
  Visa:      30,
  Legal:     45,
};

// Headlines containing these keywords are irrelevant to tourists — skip them
const IRRELEVANT_KEYWORDS = new RegExp([
  // Diplomacy & politics & royal mentions
  'bilateral ties', 'state visit', 'delegation visit', 'diplomatic',
  'ambassador', 'consul general', 'foreign minister', 'MoU sign',
  'cooperation agreement', 'trilateral', 'summit meeting',
  'receives.*leader', 'receives.*president', 'receives.*minister',
  'receives.*delegation', 'meets.*president', 'meets.*prime minister',
  'congratulates', 'condolences', 'credentials',
  'his highness', 'her highness', 'highness sheikh', 'ruler of',
  'sheikh mohammed', 'sheikh mohamed', 'sheikh mansour',
  'sheikh hamdan', 'sheikh maktoum', 'crown prince',
  // Government operations
  'cabinet reshuffle', 'cabinet approves', 'minister appoint',
  'council of ministers', 'federal authority', 'royal decree',
  'federal decree', 'national strategy', 'government accelerator',
  'chairs meeting', 'inaugurates', 'launches initiative',
  'commends', 'praises', 'directs formation',
  // Economy & finance
  'economy', 'stock market', 'stock exchange', 'oil price',
  'GDP', 'inflation', 'trade deficit', 'IPO', 'bond issuance',
  'investment fund', 'sovereign wealth', 'central bank',
  'real estate market', 'property prices', 'corporate earnings',
  // Military & defense
  'armed forces', 'military exercise', 'joint exercise',
  'naval force', 'air force', 'defense cooperation',
  // Sports (not tourist events)
  'football', 'soccer', 'cricket', 'tennis tournament',
  'golf tournament', 'marathon result', 'league match',
  'world cup qualifier', 'champions league',
  // Medical & academic
  'medical conference', 'healthcare forum', 'hospital expansion',
  'health authority', 'clinical trial', 'university', 'academic',
  'scholarship', 'research grant', 'education forum', 'PhD',
  // Airport milestones (not useful to tourists)
  'million passengers', 'passenger record', 'busiest airport',
  'airport milestone', 'processing capacity', 'passenger growth',
  // General noise
  'martyrs', 'commemoration ceremony', 'charity donation',
  'humanitarian aid', 'relief effort', 'peacekeeping',
].join('|'), 'i');

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

  const results = { inserted: 0, skipped: 0, filtered: 0, errors: 0 };

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

    // Filter irrelevant headlines
    if (IRRELEVANT_KEYWORDS.test(article.headline)) {
      results.filtered++;
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

  // Auto-expire: category-based expiry windows
  let expired = 0;
  try {
    const activeRecords = await table.select({
      filterByFormula: '{is_active} = TRUE()',
      fields: ['published_date', 'category'],
    }).all();

    const now = new Date();
    for (const rec of activeRecords) {
      const category = rec.get('category') || 'General';
      const pubDate = rec.get('published_date');
      if (!pubDate) continue;

      const maxDays = EXPIRY_DAYS[category] || 14;
      const age = Math.floor((now - new Date(pubDate)) / (1000 * 60 * 60 * 24));

      if (age > maxDays) {
        await table.update(rec.id, { is_active: false });
        expired++;
      }
    }
  } catch (err) {
    console.error('Auto-expire failed:', err.message);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `Inserted ${results.inserted}, skipped ${results.skipped} dupes, filtered ${results.filtered} irrelevant, expired ${expired}`,
      results: { ...results, expired },
    }),
  };
};
