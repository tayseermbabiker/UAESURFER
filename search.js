// UAESurfer Search — client-side search across all pages
(function () {
  var SEARCH_INDEX = [
    {
      url: 'visa-requirements.html',
      title: 'UAE Visa & Entry Requirements',
      description: '100+ nationalities get free visa on arrival to the UAE including US, UK and EU. Full list of visa-free countries, tourist visa costs, overstay fines and how to apply.',
      keywords: 'visa passport entry immigration tourist transit apply requirements india pakistan uk usa eu do i need'
    },
    {
      url: 'alcohol-laws-uae.html',
      title: 'UAE Drinking Age & Alcohol Rules',
      description: 'The legal drinking age in the UAE is 21. Rules differ by emirate — Sharjah is completely dry. What tourists need to know about buying, carrying and consuming alcohol.',
      keywords: 'alcohol drinking beer wine liquor bars clubs dry sharjah legal age license fines'
    },
    {
      url: 'dress-code-uae.html',
      title: 'Dubai Dress Code: What Tourists Can Wear',
      description: 'Shorts and sleeveless tops are fine in malls. Swimwear at beaches and pools only. Mosques require full cover. The real dress code by location.',
      keywords: 'dress code clothing wear modest bikini swimwear mosque mall beach abaya shorts sleeveless'
    },
    {
      url: 'weather-guide-uae.html',
      title: 'Best Time to Visit the UAE',
      description: 'November to March is peak season — pleasant 20-30C weather and outdoor festivals. Summer hits 45C+ but hotels are 50% cheaper. Month-by-month breakdown.',
      keywords: 'weather temperature hot summer winter best time visit season rain humidity month'
    },
    {
      url: 'safety-security-uae.html',
      title: 'Is Dubai Safe? UAE Safety Guide',
      description: 'Yes, Dubai is extremely safe — but there are laws you must follow. Crime rates, scam warnings, women\'s safety, things that are illegal and emergency contacts.',
      keywords: 'safety security crime police emergency safe dangerous women solo travel illegal laws'
    },
    {
      url: 'currency-exchange-uae.html',
      title: 'UAE Currency & Money Guide',
      description: 'UAE currency guide: 1 USD = 3.67 AED (fixed). Credit cards work everywhere. ATMs have best rates. Complete guide to money, tipping and saving.',
      keywords: 'currency money dirham aed exchange rate atm credit card tip tipping cash usd dollar'
    },
    {
      url: 'transportation-guide-uae.html',
      title: 'UAE Transportation Guide',
      description: 'Dubai transport guide: Metro is AED 3-7 per trip. Uber/Careem work everywhere. Car rental from AED 80/day. Getting around UAE.',
      keywords: 'transport metro taxi bus car rental uber careem driving license nol card getting around'
    },
    {
      url: 'scams-tourist-traps-uae.html',
      title: 'Dubai Scams & Tourist Traps to Avoid',
      description: 'Dubai scams to avoid: Taxi overcharges, fake gold, safari rip-offs, unlicensed tours. How to spot them and book safely.',
      keywords: 'scams tourist traps overcharge fake deals avoid ripoff fraud taxi gold safari'
    },
    {
      url: 'best-restaurants-uae.html',
      title: 'Best Restaurants in UAE',
      description: 'Best restaurants in UAE: Dubai and Abu Dhabi fine dining, mid-range gems, budget eats. Complete dining guide with prices, reservations and tips.',
      keywords: 'restaurants food dining eat cuisine arabic local street food halal vegetarian where to eat'
    },
    {
      url: 'ramadan-guide-uae.html',
      title: 'Visiting UAE During Ramadan',
      description: 'Complete guide to visiting UAE during Ramadan. Fasting rules, restaurant hours, cultural etiquette, and what tourists should know.',
      keywords: 'ramadan fasting iftar rules etiquette eating drinking public muslim holy month'
    },
    {
      url: 'summer-guide-uae.html',
      title: 'UAE Summer Travel Guide',
      description: 'Is Dubai worth visiting in summer? 40-60% cheaper hotels, zero crowds, 50+ indoor attractions. An honest guide from a UAE resident.',
      keywords: 'summer hot heat june july august indoor activities deals waterpark cheap'
    },
    {
      url: 'dubai-travel-guide.html',
      title: 'Dubai Travel Guide',
      description: 'Planning your first Dubai trip? Best things to do, where to stay (Marina vs Downtown vs Palm), desert safari tips, and honest advice.',
      keywords: 'dubai burj khalifa mall emirates palm jumeirah marina downtown deira creek desert safari things to do'
    },
    {
      url: 'abu-dhabi-travel-guide.html',
      title: 'Abu Dhabi Travel Guide',
      description: 'Planning a day trip from Dubai to Abu Dhabi? Things to do, Sheikh Zayed Mosque dress code, Yas Island theme parks, and Abu Dhabi vs Dubai advice.',
      keywords: 'abu dhabi grand mosque louvre yas island ferrari world saadiyat corniche day trip sheikh zayed'
    },
    {
      url: 'sharjah-travel-guide.html',
      title: 'Sharjah Travel Guide',
      description: 'Sharjah is completely dry — zero alcohol. But it\'s rich in culture, museums and waterfront areas. Alcohol rules, things to do and day trip from Dubai.',
      keywords: 'sharjah culture museum heritage souk art gallery family al qasba dry no alcohol'
    },
    {
      url: 'ajman-travel-guide.html',
      title: 'Ajman Travel Guide',
      description: 'Is Ajman dry? No — alcohol is available in licensed hotels and shops. Quiet beaches, budget hotels and Dubai\'s cheapest beach day trip.',
      keywords: 'ajman beach museum mangroves relaxed quiet budget cheap day trip'
    },
    {
      url: 'fujairah-travel-guide.html',
      title: 'Fujairah Travel Guide',
      description: 'Can you drink in Fujairah? Yes. Best beaches, snorkeling spots, mountains and how to get there from Dubai.',
      keywords: 'fujairah east coast beach diving snorkeling mountains waterfall al bidyah mosque'
    },
    {
      url: 'ras-al-khaimah-travel-guide.html',
      title: 'Ras Al Khaimah Travel Guide',
      description: 'RAK is the UAE\'s adventure capital — Jebel Jais zipline, mountain hiking, beach resorts and no crowds.',
      keywords: 'ras al khaimah rak jebel jais zipline hiking adventure camping hot springs'
    },
    {
      url: 'umm-al-quwain-travel-guide.html',
      title: 'Umm Al Quwain Travel Guide',
      description: 'UAE\'s most underrated emirate. Mangrove kayaking, camping, Dreamland Aqua Park and zero crowds.',
      keywords: 'umm al quwain uaq dreamland aqua park mangroves fishing quiet hidden'
    },
    {
      url: 'seaworld-abu-dhabi.html',
      title: 'SeaWorld Abu Dhabi Guide',
      description: 'SeaWorld Abu Dhabi: tickets from AED 375, 8 realms, marine encounters, shows. World\'s largest aquarium.',
      keywords: 'seaworld yas island aquarium rides tickets show marine ocean theme park'
    },
    {
      url: 'warner-bros-world-abu-dhabi.html',
      title: 'Warner Bros World Abu Dhabi Guide',
      description: 'Warner Bros World Abu Dhabi: tickets from AED 295, 29 rides and attractions, insider tips, best time to visit.',
      keywords: 'warner bros world theme park rides batman superman bugs bunny yas island tickets'
    },
    {
      url: 'faq.html',
      title: 'Dubai Travel FAQ',
      description: 'Answers to the most searched Dubai travel questions: visa requirements, safety, dress code, alcohol rules, costs, best time to visit, and what NOT to do.',
      keywords: 'faq questions answers help common first time visitor'
    }
  ];

  // Build search overlay HTML
  function createSearchOverlay() {
    var overlay = document.createElement('div');
    overlay.id = 'search-overlay';
    overlay.className = 'search-overlay';
    overlay.innerHTML =
      '<div class="search-overlay-inner">' +
        '<div class="search-overlay-header">' +
          '<div class="search-input-wrap">' +
            '<svg class="search-icon-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
            '<input type="text" id="search-overlay-input" class="search-overlay-input" placeholder="Search guides, e.g. visa, alcohol, dress code, Dubai..." autocomplete="off">' +
            '<button class="search-overlay-close" id="search-overlay-close" aria-label="Close search">&times;</button>' +
          '</div>' +
        '</div>' +
        '<div class="search-overlay-results" id="search-overlay-results"></div>' +
      '</div>';
    document.body.appendChild(overlay);
    return overlay;
  }

  // Search logic
  function search(query) {
    if (!query || query.length < 2) return [];
    var q = query.toLowerCase().trim();
    var terms = q.split(/\s+/);
    var results = [];

    for (var i = 0; i < SEARCH_INDEX.length; i++) {
      var page = SEARCH_INDEX[i];
      var haystack = (page.title + ' ' + page.description + ' ' + page.keywords).toLowerCase();
      var score = 0;

      for (var t = 0; t < terms.length; t++) {
        if (haystack.indexOf(terms[t]) !== -1) {
          score++;
          // Boost title matches
          if (page.title.toLowerCase().indexOf(terms[t]) !== -1) score += 2;
        }
      }

      if (score > 0) {
        results.push({ page: page, score: score });
      }
    }

    results.sort(function (a, b) { return b.score - a.score; });
    return results;
  }

  // Render results in overlay
  function renderResults(results, query) {
    var container = document.getElementById('search-overlay-results');
    if (!container) return;

    if (results.length === 0 && query.length >= 2) {
      container.innerHTML =
        '<div class="search-no-results">' +
          '<p>No results for "<strong>' + escapeHtml(query) + '</strong>"</p>' +
          '<p class="search-no-results-sub">Try: visa, alcohol, dress code, Dubai, safety, weather</p>' +
        '</div>';
      return;
    }

    if (query.length < 2) {
      container.innerHTML =
        '<div class="search-popular">' +
          '<p class="search-popular-title">Popular searches</p>' +
          '<div class="search-popular-tags">' +
            '<a href="visa-requirements.html" class="search-tag">Visa Requirements</a>' +
            '<a href="alcohol-laws-uae.html" class="search-tag">Alcohol Laws</a>' +
            '<a href="dress-code-uae.html" class="search-tag">Dress Code</a>' +
            '<a href="dubai-travel-guide.html" class="search-tag">Dubai Guide</a>' +
            '<a href="weather-guide-uae.html" class="search-tag">Weather</a>' +
            '<a href="safety-security-uae.html" class="search-tag">Safety</a>' +
            '<a href="transportation-guide-uae.html" class="search-tag">Transport</a>' +
            '<a href="currency-exchange-uae.html" class="search-tag">Currency</a>' +
          '</div>' +
        '</div>';
      return;
    }

    var html = '';
    for (var i = 0; i < results.length; i++) {
      var p = results[i].page;
      var desc = highlightMatch(p.description, query);
      html +=
        '<a href="' + p.url + '" class="search-result-card">' +
          '<div class="search-result-title">' + highlightMatch(p.title, query) + '</div>' +
          '<div class="search-result-desc">' + desc + '</div>' +
        '</a>';
    }
    container.innerHTML = html;
  }

  function highlightMatch(text, query) {
    var terms = query.toLowerCase().trim().split(/\s+/);
    var result = escapeHtml(text);
    for (var i = 0; i < terms.length; i++) {
      if (terms[i].length < 2) continue;
      var regex = new RegExp('(' + escapeRegex(terms[i]) + ')', 'gi');
      result = result.replace(regex, '<mark>$1</mark>');
    }
    return result;
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Open/close overlay
  function openSearch() {
    var overlay = document.getElementById('search-overlay');
    if (!overlay) overlay = createSearchOverlay();
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    var input = document.getElementById('search-overlay-input');
    setTimeout(function () { input.focus(); }, 100);
    renderResults([], '');

    // Bind events
    input.addEventListener('input', function () {
      var results = search(this.value);
      renderResults(results, this.value);
    });

    document.getElementById('search-overlay-close').addEventListener('click', closeSearch);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeSearch();
    });
  }

  function closeSearch() {
    var overlay = document.getElementById('search-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
      var input = document.getElementById('search-overlay-input');
      if (input) input.value = '';
    }
  }

  // Keyboard shortcut: Escape to close, Ctrl+K to open
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeSearch();
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      openSearch();
    }
  });

  // Bind nav search button
  document.addEventListener('DOMContentLoaded', function () {
    var btns = document.querySelectorAll('.nav-search-btn');
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', function (e) {
        e.preventDefault();
        openSearch();
      });
    }

    // Hero search bar (homepage only)
    var heroInput = document.getElementById('hero-search-input');
    var heroBtn = document.getElementById('hero-search-btn');
    if (heroInput) {
      heroInput.addEventListener('focus', function () {
        openSearch();
        this.blur();
      });
    }
    if (heroBtn) {
      heroBtn.addEventListener('click', function (e) {
        e.preventDefault();
        openSearch();
      });
    }
  });

  // Expose for external use
  window.UAESurferSearch = { open: openSearch, close: closeSearch };
})();
