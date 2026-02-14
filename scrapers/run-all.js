const config = require('./config');
const logger = require('./utils/logger');

const WamScraper = require('./wam-scraper');
const TheNationalScraper = require('./the-national-scraper');

const ALL_SCRAPERS = [
  { key: 'wam',         Cls: WamScraper },
  { key: 'theNational', Cls: TheNationalScraper },
];

async function postBatch(articles) {
  const url = config.webhookUrl + '?key=' + process.env.UPDATES_SECRET;
  logger.info('Runner', `POSTing batch of ${articles.length} articles to webhook`);

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(articles),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST failed (${res.status}): ${text}`);
  }

  const json = await res.json();
  logger.info('Runner', `Response: ${json.message || JSON.stringify(json)}`);
  return json;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const startTime = Date.now();
  logger.info('Runner', '=== Travel updates scrape started ===');

  const allArticles = [];
  const summary = {};

  for (const { key, Cls } of ALL_SCRAPERS) {
    if (!config.scrapers[key]?.enabled) {
      logger.info('Runner', `Skipping ${key} (disabled)`);
      summary[key] = { status: 'skipped', count: 0 };
      continue;
    }

    logger.info('Runner', `--- Running ${key} ---`);
    const scraper = new Cls();
    const articles = await scraper.run();

    summary[key] = { status: articles.length > 0 ? 'ok' : 'empty', count: articles.length };
    allArticles.push(...articles);

    await sleep(1000);
  }

  logger.info('Runner', `Total articles collected: ${allArticles.length}`);

  if (allArticles.length === 0) {
    logger.warn('Runner', 'No articles scraped — nothing to POST');
    printSummary(summary, startTime);
    return;
  }

  // POST in batches
  const batchSize = config.batch.size;
  let posted = 0;
  let errors = 0;

  for (let i = 0; i < allArticles.length; i += batchSize) {
    const batch = allArticles.slice(i, i + batchSize);
    try {
      await postBatch(batch);
      posted += batch.length;
    } catch (err) {
      logger.error('Runner', `Batch POST failed: ${err.message}`);
      errors += batch.length;
    }

    if (i + batchSize < allArticles.length) {
      await sleep(config.batch.delayMs);
    }
  }

  logger.info('Runner', `Posted: ${posted}, Errors: ${errors}`);
  printSummary(summary, startTime);
}

function printSummary(summary, startTime) {
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  logger.info('Runner', '=== Summary ===');
  for (const [key, val] of Object.entries(summary)) {
    logger.info('Runner', `  ${key}: ${val.status} (${val.count} articles)`);
  }
  logger.info('Runner', `Total time: ${elapsed}s`);
  logger.info('Runner', '=== Scrape run complete ===');
  logger.close();
}

main().catch(err => {
  logger.error('Runner', `Fatal: ${err.message}`);
  logger.close();
  process.exit(1);
});
