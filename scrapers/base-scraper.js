const { chromium } = require('playwright');
const config = require('./config');
const logger = require('./utils/logger');

class BaseScraper {
  constructor(name) {
    this.name = name;
    this.browser = null;
    this.page = null;
  }

  async launch() {
    logger.info(this.name, 'Launching browser...');
    this.browser = await chromium.launch({
      headless: config.browser.headless,
    });
    const context = await this.browser.newContext({
      userAgent: config.browser.userAgent,
      viewport: { width: 1280, height: 800 },
    });
    this.page = await context.newPage();
    this.page.setDefaultTimeout(config.browser.timeout);
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
      logger.info(this.name, 'Browser closed');
    }
  }

  /**
   * Override in subclass. Must return an array of raw article objects.
   */
  async scrape() {
    throw new Error(`${this.name}: scrape() not implemented`);
  }

  /**
   * Validate and normalize a single article object.
   * Returns null if required fields are missing.
   */
  validate(article) {
    if (!article.headline || !article.source_name || !article.source_article_id) {
      logger.warn(this.name, `Skipping article missing required fields: ${article.headline || '(no headline)'}`);
      return null;
    }

    const category = config.validCategories.includes(article.category) ? article.category : 'General';

    return {
      headline: article.headline.trim().substring(0, 500),
      summary: (article.summary || '').trim().substring(0, 1000),
      source_name: article.source_name,
      source_url: article.source_url || null,
      source_article_id: String(article.source_article_id),
      category,
      published_date: article.published_date || new Date().toISOString().split('T')[0],
    };
  }

  /**
   * Main entry point: launch browser, scrape, validate, close.
   * Returns validated articles array. Never throws — returns [] on failure.
   */
  async run() {
    try {
      await this.launch();
      const raw = await this.scrape();
      logger.info(this.name, `Raw articles scraped: ${raw.length}`);

      const articles = raw.map(a => this.validate(a)).filter(Boolean);
      logger.info(this.name, `Valid articles after filtering: ${articles.length}`);
      return articles;
    } catch (err) {
      logger.error(this.name, `Fatal error: ${err.message}`);
      return [];
    } finally {
      await this.close();
    }
  }
}

module.exports = BaseScraper;
