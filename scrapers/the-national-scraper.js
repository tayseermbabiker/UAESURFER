const BaseScraper = require('./base-scraper');
const logger = require('./utils/logger');

const TRAVEL_URL = 'https://www.thenationalnews.com/travel/';

class TheNationalScraper extends BaseScraper {
  constructor() {
    super('TheNational');
  }

  classifyCategory(text) {
    const lower = text.toLowerCase();
    if (/airport|aviation|airline|flight|route|terminal|runway|etihad|emirates|flydubai/.test(lower)) return 'Airport';
    if (/visa|entry|passport|residency|permit|immigration|golden visa/.test(lower)) return 'Visa';
    if (/law|legal|regulation|fine|court|decree|ban|rule|dress code/.test(lower)) return 'Legal';
    if (/metro|tram|bus|taxi|road|transport|rail|salik|rta|hyperloop/.test(lower)) return 'Transport';
    return 'General';
  }

  async scrape() {
    logger.info(this.name, `Fetching: ${TRAVEL_URL}`);
    await this.page.goto(TRAVEL_URL, { waitUntil: 'domcontentloaded' });
    await this.page.waitForTimeout(5000);

    // The National uses article cards on their section pages
    const articles = await this.page.$$eval('article, [class*="story"], [class*="article"], [class*="card"]', (elements) => {
      const results = [];
      for (const el of elements) {
        const linkEl = el.querySelector('a[href*="/travel/"]') || el.querySelector('a[href]');
        const titleEl = el.querySelector('h2, h3, h4, [class*="title"], [class*="headline"]');
        const summaryEl = el.querySelector('p, [class*="standfirst"], [class*="summary"], [class*="desc"]');
        const dateEl = el.querySelector('time, [class*="date"], [datetime]');

        if (!linkEl || !titleEl) continue;

        const headline = titleEl.textContent.trim();
        const href = linkEl.href;

        if (!headline || headline.length < 10) continue;
        if (!href.includes('/travel/')) continue;

        // Extract slug for dedup
        const pathParts = new URL(href).pathname.split('/').filter(Boolean);
        const slug = pathParts[pathParts.length - 1] || '';

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
        source_name: 'The National',
        source_url: a.source_url,
        source_article_id: `national-${a.slug}`,
        category: this.classifyCategory(a.headline + ' ' + a.summary),
        published_date: pubDate,
      };
    });
  }
}

module.exports = TheNationalScraper;
