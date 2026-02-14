module.exports = {
  webhookUrl: process.env.UPDATES_URL || 'https://uaesurfer.com/.netlify/functions/receive-updates',

  browser: {
    headless: true,
    timeout: 30000,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  },

  batch: {
    size: 20,
    delayMs: 2000,
  },

  scrapers: {
    wam:           { enabled: true },
    theNational:   { enabled: true },
  },

  validCategories: [
    'Airport',
    'Visa',
    'Legal',
    'Transport',
    'Weather',
    'Events',
    'General',
  ],
};
