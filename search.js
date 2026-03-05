// UAESurfer Search — client-side search across all pages
(function () {
  var SEARCH_INDEX = [
    {
      url: 'visa-requirements.html',
      title: 'UAE Visa Requirements',
      description: 'Complete guide to UAE visa requirements. Visa on arrival, tourist visa, transit visa, and how to apply.',
      keywords: 'visa passport entry immigration tourist transit apply requirements india pakistan uk usa eu'
    },
    {
      url: 'alcohol-laws-uae.html',
      title: 'Alcohol Laws in the UAE',
      description: 'Everything you need to know about alcohol laws in the UAE. Where to drink, legal age, dry emirates, and penalties.',
      keywords: 'alcohol drinking beer wine liquor bars clubs dry sharjah legal age license'
    },
    {
      url: 'dress-code-uae.html',
      title: 'UAE Dress Code Guide',
      description: 'What to wear in the UAE. Dress code rules for malls, beaches, mosques, and public places.',
      keywords: 'dress code clothing wear modest bikini swimwear mosque mall beach abaya'
    },
    {
      url: 'weather-guide-uae.html',
      title: 'UAE Weather Guide',
      description: 'Best time to visit the UAE. Monthly weather breakdown, temperatures, and what to expect each season.',
      keywords: 'weather temperature hot summer winter best time visit season rain humidity'
    },
    {
      url: 'safety-security-uae.html',
      title: 'UAE Safety & Security',
      description: 'How safe is the UAE for tourists? Crime rates, emergency numbers, and safety tips for travelers.',
      keywords: 'safety security crime police emergency safe dangerous women solo travel'
    },
    {
      url: 'currency-exchange-uae.html',
      title: 'UAE Currency & Exchange',
      description: 'UAE currency guide. AED dirham exchange rates, ATMs, credit cards, tipping, and money-saving tips.',
      keywords: 'currency money dirham aed exchange rate atm credit card tip tipping cash'
    },
    {
      url: 'transportation-guide-uae.html',
      title: 'UAE Transportation Guide',
      description: 'Getting around the UAE. Metro, taxis, buses, car rental, ride-hailing apps, and intercity travel.',
      keywords: 'transport metro taxi bus car rental uber careem driving license nol card'
    },
    {
      url: 'scams-tourist-traps-uae.html',
      title: 'UAE Scams & Tourist Traps',
      description: 'Avoid common scams and tourist traps in the UAE. Fake deals, overcharging, and how to stay safe.',
      keywords: 'scams tourist traps overcharge fake deals avoid ripoff fraud'
    },
    {
      url: 'best-restaurants-uae.html',
      title: 'Best Restaurants in the UAE',
      description: 'Top restaurants across the UAE. Fine dining, street food, local cuisine, and budget-friendly options.',
      keywords: 'restaurants food dining eat cuisine arabic local street food halal vegetarian'
    },
    {
      url: 'ramadan-guide-uae.html',
      title: 'Ramadan Guide for Tourists',
      description: 'Visiting the UAE during Ramadan? Everything you need to know about rules, etiquette, and what to expect.',
      keywords: 'ramadan fasting iftar rules etiquette eating drinking public muslim'
    },
    {
      url: 'summer-guide-uae.html',
      title: 'UAE Summer Guide',
      description: 'Visiting the UAE in summer? Beat the heat with indoor activities, deals, and survival tips.',
      keywords: 'summer hot heat june july august indoor activities deals waterpark'
    },
    {
      url: 'dubai-travel-guide.html',
      title: 'Dubai Travel Guide',
      description: 'Complete Dubai travel guide. Top attractions, hotels, restaurants, shopping, nightlife, and insider tips.',
      keywords: 'dubai burj khalifa mall emirates palm jumeirah marina downtown deira creek desert safari'
    },
    {
      url: 'abu-dhabi-travel-guide.html',
      title: 'Abu Dhabi Travel Guide',
      description: 'Complete Abu Dhabi guide. Grand Mosque, Louvre, Yas Island, Saadiyat, hotels, and things to do.',
      keywords: 'abu dhabi grand mosque louvre yas island ferrari world saadiyat corniche'
    },
    {
      url: 'sharjah-travel-guide.html',
      title: 'Sharjah Travel Guide',
      description: 'Explore Sharjah — the cultural capital. Museums, heritage areas, souks, and family-friendly attractions.',
      keywords: 'sharjah culture museum heritage souk art gallery family al qasba'
    },
    {
      url: 'ajman-travel-guide.html',
      title: 'Ajman Travel Guide',
      description: 'Discover Ajman. Beaches, Ajman Museum, mangroves, and the most relaxed emirate in the UAE.',
      keywords: 'ajman beach museum mangroves relaxed quiet budget'
    },
    {
      url: 'fujairah-travel-guide.html',
      title: 'Fujairah Travel Guide',
      description: 'Explore Fujairah on the east coast. Beaches, mountains, diving, waterfalls, and Al Bidyah Mosque.',
      keywords: 'fujairah east coast beach diving snorkeling mountains waterfall al bidyah mosque'
    },
    {
      url: 'ras-al-khaimah-travel-guide.html',
      title: 'Ras Al Khaimah Travel Guide',
      description: 'Adventure in Ras Al Khaimah. Jebel Jais, zip line, hiking, hot springs, and desert camping.',
      keywords: 'ras al khaimah rak jebel jais zipline hiking adventure camping hot springs'
    },
    {
      url: 'umm-al-quwain-travel-guide.html',
      title: 'Umm Al Quwain Travel Guide',
      description: 'Discover Umm Al Quwain. Dreamland Aqua Park, mangroves, fishing, and off-the-beaten-path experiences.',
      keywords: 'umm al quwain uaq dreamland aqua park mangroves fishing quiet'
    },
    {
      url: 'seaworld-abu-dhabi.html',
      title: 'SeaWorld Abu Dhabi',
      description: 'Complete guide to SeaWorld Abu Dhabi on Yas Island. Tickets, rides, shows, tips, and what to expect.',
      keywords: 'seaworld yas island aquarium rides tickets show marine ocean'
    },
    {
      url: 'warner-bros-world-abu-dhabi.html',
      title: 'Warner Bros World Abu Dhabi',
      description: 'Complete guide to Warner Bros World Abu Dhabi. Rides, zones, tickets, tips, and what to expect.',
      keywords: 'warner bros world theme park rides batman superman bugs bunny yas island'
    },
    {
      url: 'faq.html',
      title: 'UAE Travel FAQ',
      description: 'Frequently asked questions about traveling to the UAE. Quick answers to common visitor questions.',
      keywords: 'faq questions answers help common'
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
