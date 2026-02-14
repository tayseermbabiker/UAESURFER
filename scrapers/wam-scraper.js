const BaseScraper = require('./base-scraper');
const logger = require('./utils/logger');

const WAM_URL = 'https://www.wam.ae/en';

class WamScraper extends BaseScraper {
  constructor() {
    super('WAM');
  }

  classifyCategory(text) {
    const lower = text.toLowerCase();
    if (/airport|aviation|airline|flight|route|terminal|runway/.test(lower)) return 'Airport';
    if (/visa|entry|passport|residency|permit|immigration|golden visa/.test(lower)) return 'Visa';
    if (/law|legal|regulation|fine|court|decree|ban|rule/.test(lower)) return 'Legal';
    if (/weather|temperature|fog|storm|flood|rain|heatwave|humidity|forecast/.test(lower)) return 'Weather';
    if (/festival|celebration|eid|ramadan|national day|concert|firework|new year/.test(lower)) return 'Events';
    if (/metro|tram|bus|taxi|road|transport|rail|salik|rta|etihad rail/.test(lower)) return 'Transport';
    return 'General';
  }

  async scrape() {
    logger.info(this.name, `Fetching: ${WAM_URL}`);
    await this.page.goto(WAM_URL, { waitUntil: 'domcontentloaded' });
    await this.page.waitForTimeout(5000);

    // WAM homepage lists articles as links to /en/article/...
    const articles = await this.page.$$eval('a[href*="/en/article/"]', els => {
      const results = [];
      const seen = new Set();

      for (const a of els) {
        const href = a.href;
        const text = a.textContent.trim();

        // Extract slug from URL for dedup
        const slug = href.split('/').filter(Boolean).pop() || '';
        if (!slug || seen.has(slug)) continue;
        if (text.length < 20) continue;

        seen.add(slug);
        results.push({
          headline: text.substring(0, 200),
          source_url: href,
          slug,
        });
      }
      return results;
    });

    logger.info(this.name, `Found ${articles.length} unique articles`);

    // Filter to travel/tourism/transport relevant articles only
    // Removed overly broad terms (dubai, abu dhabi, emirates, culture, heritage, expo)
    // that matched nearly every WAM article regardless of tourist relevance
    const travelKeywords = /\b(travel|tourism|tourist|airport|visa|passport|immigration|golden visa|flight route|new route|new flight|airline|hotel|resort|beach|weather|temperature|fog|storm|flood|rain|heatwave|ramadan|eid|festival|celebration|national day|metro|tram|bus route|road closure|salik|vat|tax|duty.free|customs|attraction|theme park|waterpark|ticket price|entry fee|safety|advisory|warning|alert|museum open|new opening)\b/i;

    const relevant = articles.filter(a => travelKeywords.test(a.headline));
    logger.info(this.name, `Travel-relevant: ${relevant.length}`);

    return relevant.slice(0, 10).map(a => ({
      headline: a.headline,
      summary: '',
      source_name: 'WAM',
      source_url: a.source_url,
      source_article_id: `wam-${a.slug}`,
      category: this.classifyCategory(a.headline),
      published_date: new Date().toISOString().split('T')[0],
    }));
  }
}

module.exports = WamScraper;
