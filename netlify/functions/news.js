const Airtable = require('airtable');

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base(process.env.AIRTABLE_BASE_ID);

exports.handler = async (event) => {
  const params = new URLSearchParams(event.rawQuery || '');
  const id = params.get('id');

  if (!id) {
    return { statusCode: 400, body: 'Missing id parameter' };
  }

  let record;
  try {
    record = await base('Travel_Updates').find(id);
  } catch (err) {
    return { statusCode: 404, body: 'Update not found' };
  }

  const headline = record.get('headline') || 'Travel Update';
  const summary = record.get('summary') || '';
  const sourceName = record.get('source_name') || '';
  const sourceUrl = record.get('source_url') || '#';
  const category = record.get('category') || 'General';
  const publishedDate = record.get('published_date') || '';

  const formattedDate = publishedDate
    ? new Date(publishedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  const categoryColors = {
    Airport: '#667eea',
    Visa: '#10b981',
    Legal: '#f5576c',
    Transport: '#f59e0b',
    General: '#764ba2',
  };
  const tagColor = categoryColors[category] || '#764ba2';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${headline} — UAESurfer Travel Updates</title>
  <meta name="description" content="${summary.substring(0, 160)}">
  <meta property="og:title" content="${headline}">
  <meta property="og:description" content="${summary.substring(0, 160)}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="UAESurfer">
  <link rel="canonical" href="https://uaesurfer.com/api/news?id=${id}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Poppins', system-ui, sans-serif;
      background: #f8f9fa;
      color: #333;
      min-height: 100vh;
    }
    .header {
      background: rgba(250, 250, 250, 0.95);
      backdrop-filter: blur(10px);
      padding: 16px 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }
    .header-inner {
      max-width: 800px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .logo {
      font-size: 24px;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 30%, #f093fb 70%, #f5576c 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      text-decoration: none;
    }
    .back-link {
      color: #764ba2;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
    }
    .back-link:hover { text-decoration: underline; }
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 24px 60px;
    }
    .category-tag {
      display: inline-block;
      background: ${tagColor};
      color: white;
      padding: 4px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 16px;
    }
    h1 {
      font-size: 32px;
      font-weight: 700;
      line-height: 1.3;
      color: #1a1a2e;
      margin-bottom: 16px;
    }
    .meta {
      display: flex;
      align-items: center;
      gap: 16px;
      color: #666;
      font-size: 14px;
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 1px solid #e8e8e8;
    }
    .summary {
      font-size: 19px;
      line-height: 1.9;
      color: #333;
      margin-bottom: 40px;
      background: white;
      padding: 32px;
      border-radius: 12px;
      box-shadow: 0 2px 16px rgba(0,0,0,0.06);
    }
    .key-takeaway {
      background: linear-gradient(135deg, ${tagColor}10, ${tagColor}08);
      border-left: 4px solid ${tagColor};
      border-radius: 0 12px 12px 0;
      padding: 20px 24px;
      margin-bottom: 32px;
    }
    .key-takeaway h3 {
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: ${tagColor};
      margin-bottom: 8px;
    }
    .key-takeaway p {
      font-size: 15px;
      line-height: 1.6;
      color: #444;
    }
    .source-box {
      background: white;
      border: 1px solid #e8e8e8;
      border-radius: 12px;
      padding: 24px 28px;
      margin-bottom: 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      flex-wrap: wrap;
    }
    .source-info {
      flex: 1;
    }
    .source-info .source-label {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #999;
      font-weight: 600;
      margin-bottom: 4px;
    }
    .source-info .source-name {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
    .source-link {
      display: inline-block;
      color: white;
      background: linear-gradient(135deg, #667eea, #764ba2);
      padding: 12px 28px;
      border-radius: 8px;
      text-decoration: none;
      font-size: 14px;
      font-weight: 600;
      transition: opacity 0.2s;
      white-space: nowrap;
    }
    .source-link:hover { opacity: 0.9; }
    .home-cta {
      text-align: center;
      margin-top: 40px;
    }
    .home-cta a {
      color: #764ba2;
      font-weight: 600;
      text-decoration: none;
      font-size: 15px;
    }
    .home-cta a:hover { text-decoration: underline; }
    .related {
      margin-top: 48px;
      padding-top: 32px;
      border-top: 1px solid #e8e8e8;
    }
    .related h3 {
      font-size: 18px;
      font-weight: 600;
      color: #1a1a2e;
      margin-bottom: 16px;
    }
    .related-links {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .related-links a {
      display: inline-block;
      padding: 8px 16px;
      background: white;
      border: 1px solid #e8e8e8;
      border-radius: 8px;
      color: #764ba2;
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
      transition: border-color 0.2s;
    }
    .related-links a:hover { border-color: #764ba2; }
    @media (max-width: 600px) {
      h1 { font-size: 24px; }
      .summary { font-size: 16px; }
      .container { padding: 24px 16px 40px; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-inner">
      <a href="https://uaesurfer.com/" class="logo">UAESurfer</a>
      <a href="https://uaesurfer.com/" class="back-link">Back to Travel Guide</a>
    </div>
  </div>
  <div class="container">
    <span class="category-tag">${category}</span>
    <h1>${headline}</h1>
    <div class="meta">
      ${formattedDate ? '<span>' + formattedDate + '</span>' : ''}
      ${sourceName ? '<span>Source: ' + sourceName + '</span>' : ''}
    </div>
    <div class="summary">${summary}</div>
    <div class="key-takeaway">
      <h3>Why This Matters for Travelers</h3>
      <p>This ${category.toLowerCase()} update may affect your travel plans to the UAE. Check our related guides below for the latest practical advice.</p>
    </div>
    <div class="source-box">
      <div class="source-info">
        <div class="source-label">Original Source</div>
        <div class="source-name">${sourceName}</div>
      </div>
      <a href="${sourceUrl}" target="_blank" rel="noopener" class="source-link">Read Full Article</a>
    </div>
    <div class="related">
      <h3>Explore UAE Travel Guides</h3>
      <div class="related-links">
        <a href="https://uaesurfer.com/visa-requirements.html">Visa Requirements</a>
        <a href="https://uaesurfer.com/alcohol-laws-uae.html">Alcohol Laws</a>
        <a href="https://uaesurfer.com/dress-code-uae.html">Dress Code</a>
        <a href="https://uaesurfer.com/transportation-guide-uae.html">Transportation</a>
        <a href="https://uaesurfer.com/safety-security-uae.html">Safety Tips</a>
        <a href="https://uaesurfer.com/ramadan-guide-uae.html">Ramadan Guide</a>
      </div>
    </div>
    <div class="home-cta">
      <a href="https://uaesurfer.com/">Back to UAESurfer.com — Your Local's Guide to the UAE</a>
    </div>
  </div>
</body>
</html>`;

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
    body: html,
  };
};
