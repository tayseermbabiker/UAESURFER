const BaseScraper = require('./base-scraper');
const logger = require('./utils/logger');

const TRAVEL_URL = 'https://www.wam.ae/en/search?query=travel+tourism+UAE';

class WamScraper extends BaseScraper {
  constructor() {
    super('WAM');
  }

  classifyCategory(text) {
    const lower = text.toLowerCase();
    if (/airport|aviation|airline|flight|route|terminal|runway/.test(lower)) return 'Airport';
    if (/visa|entry|passport|residency|permit|immigration/.test(lower)) return 'Visa';
    if (/law|legal|regulation|fine|court|decree|ban|rule/.test(lower)) return 'Legal';
    if (/metro|tram|bus|taxi|road|transport|rail|salik|rta/.test(lower)) return 'Transport';
    return 'General';
  }

  async scrape() {
    logger.info(this.name, `Fetching: ${TRAVEL_URL}`);
    await this.page.goto(TRAVEL_URL, { waitUntil: 'domcontentloaded' });
    await this.page.waitForTimeout(5000);

    // WAM search results — extract article cards
    const articles = await this.page.$$eval('article, .news-item, .search-result-item, [class*="card"], [class*="article"]', (elements) => {
      const results = [];
      for (const el of elements) {
        const linkEl = el.querySelector('a[href]');
        const titleEl = el.querySelector('h2, h3, h4, .title, [class*="title"], [class*="headline"]');
        const summaryEl = el.querySelector('p, .summary, .excerpt, [class*="summary"], [class*="desc"]');
        const dateEl = el.querySelector('time, .date, [class*="date"], [datetime]');

        if (!linkEl || !titleEl) continue;

        const headline = titleEl.textContent.trim();
        const href = linkEl.href;

        if (!headline || headline.length < 10) continue;

        // Extract slug for dedup
        const slug = href.split('/').filter(Boolean).pop() || '';

        results.push({
          headline,
          summary: summaryEl ? summaryEl.textContent.trim() : '',
          source_url: href,
          slug,
          date: dateEl ? (dateEl.getAttribute('datetime') || dateEl.textContent.trim()) : '',
        });
      }
      return results;
    });

    logger.info(this.name, `Found ${articles.length} raw article elements`);

    // Deduplicate by slug
    const seen = new Set();
    const deduped = [];
    for (const a of articles) {
      if (a.slug && !seen.has(a.slug)) {
        seen.add(a.slug);
        deduped.push(a);
      }
    }

    // Take latest 10
    return deduped.slice(0, 10).map(a => {
      let pubDate = new Date().toISOString().split('T')[0];
      if (a.date) {
        try {
          const parsed = new Date(a.date);
          if (!isNaN(parsed.getTime())) {
            pubDate = parsed.toISOString().split('T')[0];
          }
        } catch { /* use today */ }
      }

      return {
        headline: a.headline,
        summary: a.summary,
        source_name: 'WAM',
        source_url: a.source_url,
        source_article_id: `wam-${a.slug}`,
        category: this.classifyCategory(a.headline + ' ' + a.summary),
        published_date: pubDate,
      };
    });
  }
}

module.exports = WamScraper;
