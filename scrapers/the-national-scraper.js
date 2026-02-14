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
    if (/law|legal|regulation|fine|court|decree|ban|rule|dress code|ramadan/.test(lower)) return 'Legal';
    if (/metro|tram|bus|taxi|road|transport|rail|salik|rta|hyperloop|driving/.test(lower)) return 'Transport';
    return 'General';
  }

  async scrape() {
    logger.info(this.name, `Fetching: ${TRAVEL_URL}`);
    await this.page.goto(TRAVEL_URL, { waitUntil: 'domcontentloaded' });
    await this.page.waitForTimeout(5000);

    // The National travel section — extract article links
    const articles = await this.page.$$eval('a[href*="/travel/"]', els => {
      const results = [];
      const seen = new Set();

      for (const a of els) {
        const href = a.href;
        const text = a.textContent.trim();

        // Only article links (have date slug pattern like /2026/01/30/)
        if (!/\/travel\/\d{4}\//.test(href)) continue;

        // Extract slug for dedup
        const pathParts = href.split('/').filter(Boolean);
        const slug = pathParts[pathParts.length - 1] || '';
        if (!slug || seen.has(slug)) continue;
        if (text.length < 20) continue;

        seen.add(slug);

        // Extract date from URL: /travel/2026/01/30/...
        const dateMatch = href.match(/\/travel\/(\d{4})\/(\d{2})\/(\d{2})\//);
        const pubDate = dateMatch ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}` : '';

        results.push({
          headline: text.substring(0, 200),
          source_url: href,
          slug,
          published_date: pubDate,
        });
      }
      return results;
    });

    logger.info(this.name, `Found ${articles.length} unique articles`);

    return articles.slice(0, 10).map(a => ({
      headline: a.headline,
      summary: '',
      source_name: 'The National',
      source_url: a.source_url,
      source_article_id: `national-${a.slug}`,
      category: this.classifyCategory(a.headline),
      published_date: a.published_date || new Date().toISOString().split('T')[0],
    }));
  }
}

module.exports = TheNationalScraper;
