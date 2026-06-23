const { XMLParser } = require('fast-xml-parser');

// Live "What's On This Week" aggregator for UAESurfer.
// Ported from the new-in-abudhabi whats-new function, opened up UAE-wide.
// No Airtable, no cron — fetches live on request and caches at the CDN.

const MAX_ITEMS = 8;
const CACHE_SECONDS = 1800; // 30 minutes
const FETCH_TIMEOUT = 8000;

const EXCLUDED_KEYWORDS = [
  'workshop', 'seminar', 'webinar', 'conference', 'summit',
  'promo code', 'betwinner', 'betting', '1xbet', 'casino',
  // keep the tourist feed clean of alcohol-led listings
  'happy hour', 'ladies night', 'brunch with bubbly', 'free flow', 'open bar'
];

// UAE-wide evergreen fallbacks (shown only if every live source is down)
const FALLBACK_ITEMS = [
  { title: 'Burj Khalifa — At The Top', description: 'Ride to the observation decks of the world\'s tallest building for panoramic views across Dubai and the desert beyond.', pubDate: new Date().toISOString(), category: 'Dubai' },
  { title: 'Sheikh Zayed Grand Mosque, Abu Dhabi', description: 'One of the world\'s largest and most beautiful mosques — 82 domes, 1,000+ columns and the world\'s largest hand-knotted carpet.', pubDate: new Date().toISOString(), category: 'Culture' },
  { title: 'Dubai Marina & JBR Beach', description: 'Stroll the waterfront promenade, hit the beach, and watch the yachts roll past the skyline at golden hour.', pubDate: new Date().toISOString(), category: 'Outdoor' },
  { title: 'Desert Safari — Dunes at Sunset', description: 'Dune bashing, camel rides and a starlit dinner in the desert — the classic UAE evening out.', pubDate: new Date().toISOString(), category: 'Adventure' },
  { title: 'Louvre Abu Dhabi, Saadiyat Island', description: 'Masterpieces from around the world under a stunning domed "rain of light" — the first universal museum in the Arab world.', pubDate: new Date().toISOString(), category: 'Culture' },
  { title: 'Old Dubai — Al Fahidi & the Creek', description: 'Wander the historic Al Fahidi quarter, ride an abra across Dubai Creek, and explore the gold and spice souks.', pubDate: new Date().toISOString(), category: 'Heritage' }
];

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

function safeCodePoint(num, fallback) {
  try {
    if (!Number.isFinite(num) || num < 0 || num > 0x10ffff) return fallback;
    return String.fromCodePoint(num);
  } catch { return fallback; }
}

// Decode HTML entities: numeric (decimal + hex) and common named ones.
function decodeEntities(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&#x([0-9a-fA-F]+);/g, (m, h) => safeCodePoint(parseInt(h, 16), m))
    .replace(/&#(\d+);/g, (m, n) => safeCodePoint(parseInt(n, 10), m))
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&rsquo;/g, '’').replace(/&lsquo;/g, '‘')
    .replace(/&rdquo;/g, '”').replace(/&ldquo;/g, '“')
    .replace(/&ndash;/g, '–').replace(/&mdash;/g, '—')
    .replace(/&hellip;/g, '…');
}

function stripHtml(str) {
  if (!str) return '';
  return decodeEntities(str.replace(/<[^>]*>/g, ''))
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(str, len) {
  if (str.length <= len) return str;
  return str.substring(0, len).replace(/\s+\S*$/, '') + '...';
}

function isExcluded(title) {
  const lower = (title || '').toLowerCase();
  return EXCLUDED_KEYWORDS.some(kw => lower.includes(kw));
}

function isFutureDate(dateStr) {
  if (!dateStr) return true; // keep items without dates
  try {
    const d = new Date(dateStr);
    return d >= new Date(new Date().toDateString());
  } catch { return true; }
}

const LOCATION_TAGS = ['abu dhabi', 'dubai', 'sharjah', 'ajman', 'ras al khaimah', 'fujairah', 'umm al quwain', 'uae', 'united arab emirates'];

function pickCategory(cats) {
  // Prefer a real topic category (Music, Food, Art...) over a location tag.
  const nonLocation = cats.find(c => {
    const l = (c || '').toLowerCase();
    return l && !LOCATION_TAGS.includes(l);
  });
  if (nonLocation) return nonLocation;
  // Otherwise use the location it belongs to, capitalised.
  const loc = cats.find(c => (c || '').trim());
  return loc || 'UAE';
}

// Title-case an emirate/category string for display.
function titleCase(str) {
  return (str || '').replace(/\b\w/g, c => c.toUpperCase());
}

// -- Source 1: What's On UAE RSS (UAE-wide: Dubai, Abu Dhabi & more) --
async function fetchWhatsOn() {
  const res = await fetch('https://whatson.ae/feed/', {
    headers: { 'User-Agent': UA },
    signal: AbortSignal.timeout(FETCH_TIMEOUT)
  });
  if (!res.ok) return [];

  const xml = await res.text();
  const parser = new XMLParser({ ignoreAttributes: false, isArray: (name) => name === 'item' || name === 'category' });
  const feed = parser.parse(xml);

  return (feed?.rss?.channel?.item || [])
    .filter(item => !isExcluded(item.title))
    .slice(0, 12)
    .map(item => {
      const cats = (Array.isArray(item.category) ? item.category : [item.category || ''])
        .map(c => stripHtml(typeof c === 'string' ? c : (c?.['#text'] || '')));
      const category = titleCase(pickCategory(cats));
      const full = stripHtml(item.description || '');
      return {
        title: stripHtml(item.title || ''),
        description: truncate(full, 150),
        fullDescription: truncate(full, 500),
        pubDate: item.pubDate || new Date().toISOString(),
        category,
        link: typeof item.link === 'string' ? item.link : '',
        source: 'whatson'
      };
    });
}

// -- Source 2: Etihad Arena, Yas Island (embedded JSON) --
async function fetchEtihadArena() {
  const res = await fetch('https://www.etihadarena.ae/en/events', {
    headers: { 'User-Agent': UA },
    signal: AbortSignal.timeout(FETCH_TIMEOUT)
  });
  if (!res.ok) return [];

  const html = await res.text();
  const items = [];

  const detailRe = /"imageDetail"\s*:\s*\[([\s\S]*?)\]/g;
  let match;
  while ((match = detailRe.exec(html)) !== null) {
    const block = match[1];
    if (block.length < 100) continue;

    const eventRe = /"imageTitle":"([^"]*)"/g;
    const linkRe = /"moreLinkButton":\{[^}]*"href":"([^"]*)","label":"([^"]*)"/g;

    const dates = [];
    const links = [];
    let em;
    while ((em = eventRe.exec(block)) !== null) dates.push(em[1]);
    while ((em = linkRe.exec(block)) !== null) links.push({ href: em[1], label: em[2] });

    for (let i = 0; i < Math.min(dates.length, links.length); i++) {
      const href = links[i].href.replace(/\\u002F/g, '/');
      const fullUrl = href.startsWith('http') ? href : 'https://www.etihadarena.ae' + href;
      const label = links[i].label;
      const slug = href.split(/\\u002F|\//).filter(Boolean).pop() || '';
      const name = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

      if (isExcluded(name)) continue;

      const evDesc = dates[i] + ' at Etihad Arena, Yas Island';
      items.push({
        title: name,
        description: evDesc,
        fullDescription: evDesc,
        pubDate: new Date().toISOString(),
        category: label === 'SOLD OUT' ? 'Sold Out' : 'Shows',
        link: fullUrl,
        source: 'etihad-arena'
      });
    }
  }

  return items.slice(0, 8);
}

// -- Source 3: Abu Dhabi events (visitabudhabi.ae public API) --
async function fetchAbuDhabiCalendar() {
  const res = await fetch('https://scapim.dct.gov.ae/prod-vad/search/v1', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Referer': 'https://visitabudhabi.ae/',
      'User-Agent': UA
    },
    body: JSON.stringify({
      contentType: 'Event',
      language: 'en',
      facetFields: [],
      limit: 20,
      offset: 0,
      filters: [],
      isPreviewMode: false
    }),
    signal: AbortSignal.timeout(FETCH_TIMEOUT)
  });
  if (!res.ok) return [];

  const json = await res.json();
  const events = json?.data?.results || [];

  return events
    .filter(ev => ev.name && !isExcluded(ev.name))
    .filter(ev => isFutureDate(ev.startDate))
    .slice(0, 10)
    .map(ev => {
      const cats = ev.eventCategories || [];
      const category = cats[0] || 'Abu Dhabi';
      const full = ev.description
        ? stripHtml(ev.description)
        : (ev.startDate ? new Date(ev.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Abu Dhabi Event');
      const slug = ev.slug || ev.urlSlug || '';
      const link = ev.url || ev.canonicalUrl || ev.permalink ||
        (slug ? 'https://visitabudhabi.ae/en/events-calendar/' + slug : '');
      return {
        title: stripHtml(ev.name),
        description: truncate(full, 150),
        fullDescription: truncate(full, 500),
        pubDate: ev.startDate || new Date().toISOString(),
        category,
        link,
        source: 'ad-calendar'
      };
    });
}

// -- Deduplicate by title similarity --
function deduplicate(items) {
  const seen = new Set();
  return items.filter(item => {
    const key = item.title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 30);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Interleave sources so one feed doesn't dominate the top of the list.
function interleave(buckets) {
  const out = [];
  const max = Math.max(0, ...buckets.map(b => b.length));
  for (let i = 0; i < max; i++) {
    for (const b of buckets) {
      if (b[i]) out.push(b[i]);
    }
  }
  return out;
}

exports.handler = async function () {
  const ok = (body, maxAge) => ({
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': `public, max-age=${maxAge}`,
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(body)
  });

  try {
    const results = await Promise.allSettled([
      fetchWhatsOn(),
      fetchEtihadArena(),
      fetchAbuDhabiCalendar()
    ]);

    const sources = ['whatson', 'etihad-arena', 'ad-calendar'];
    const activeSources = [];
    const buckets = [];

    results.forEach((result, i) => {
      if (result.status === 'fulfilled' && result.value.length > 0) {
        buckets.push(result.value);
        activeSources.push(sources[i]);
      }
    });

    const items = deduplicate(interleave(buckets)).slice(0, MAX_ITEMS);

    if (items.length === 0) {
      return ok({ items: FALLBACK_ITEMS, source: 'fallback', sources: [] }, 300);
    }
    return ok({ items, source: 'live', sources: activeSources }, CACHE_SECONDS);
  } catch (err) {
    console.error('whats-on error:', err.message);
    return ok({ items: FALLBACK_ITEMS, source: 'fallback', sources: [] }, 300);
  }
};
