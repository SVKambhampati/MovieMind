/* MovieMind — Browse / Discover module */
/* Depends on: API, esc(), showToast(), openModal(), addMovie(), buildGallerySection(), openLightbox(),
   buildProvidersSection(), buildCollectionSection(), wireCollectionLink(), loadSimilarMovies() from app.js */

const browse = (() => {
  const st = {
    genres: [],
    activeGenreId: null,
    activeGenreName: '',
    searchQuery: '',
    gridPage: 1,
    gridTotalPages: 1,
    mode: 'home',       // 'home' | 'search' | 'genre' | 'collection' | 'discover'
    collectionId: null,
    discoverParams: {},
  };

  const browseSearchInput  = document.getElementById('browseSearchInput');
  const browseSearchClear  = document.getElementById('browseSearchClear');
  const genrePillsEl       = document.getElementById('genrePills');
  const browseHome         = document.getElementById('browseHome');
  const browseGrid         = document.getElementById('browseGrid');
  const browseGridTitle    = document.getElementById('browseGridTitle');
  const browseGridCards    = document.getElementById('browseGridCards');
  const browseGridClear    = document.getElementById('browseGridClear');
  const browseLoadMoreWrap = document.getElementById('browseLoadMoreWrap');
  const browseLoadMoreBtn  = document.getElementById('browseLoadMoreBtn');
  const browseLoading      = document.getElementById('browseLoading');

  // ── Nav tab switching ──────────────────────────────────────────────────
  const viewMap = {
    recommend: document.getElementById('viewRecommend'),
    browse:    document.getElementById('viewBrowse'),
    profile:   document.getElementById('viewProfile'),
  };

  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const view = tab.dataset.view;

      // Use class-based switching so CSS `display:none` on .view is respected
      Object.entries(viewMap).forEach(([key, el]) => {
        if (!el) return;
        el.classList.toggle('active', key === view);
      });

      const target = viewMap[view];
      if (target) {
        target.classList.add('view-enter');
        setTimeout(() => target.classList.remove('view-enter'), 400);
      }

      if (view === 'browse' && st.genres.length === 0) init();
    });
  });

  // ── Search ─────────────────────────────────────────────────────────────
  let searchDebounce = null;

  browseSearchInput.addEventListener('input', () => {
    const q = browseSearchInput.value.trim();
    browseSearchClear.style.display = q ? '' : 'none';
    clearTimeout(searchDebounce);
    if (!q) { showHome(); return; }
    searchDebounce = setTimeout(() => runSearch(q, 1), 350);
  });

  browseSearchClear.addEventListener('click', () => {
    browseSearchInput.value = '';
    browseSearchClear.style.display = 'none';
    showHome();
  });

  // ── Advanced search filter panel ───────────────────────────────────────
  const browseHeroEl = document.querySelector('.browse-hero');

  function buildAdvFilterPanel() {
    // Toggle button
    let toggleBtn = document.getElementById('browseFilterToggle');
    if (!toggleBtn) {
      toggleBtn = document.createElement('button');
      toggleBtn.id = 'browseFilterToggle';
      toggleBtn.className = 'browse-filter-toggle';
      toggleBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg> Filters`;
      browseHeroEl.appendChild(toggleBtn);
    }

    let panel = document.getElementById('browseAdvFilters');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'browseAdvFilters';
      panel.className = 'browse-adv-filters';
      panel.style.display = 'none';
      browseHeroEl.appendChild(panel);
    }

    panel.innerHTML = `
      <select id="advDecade" class="filter-select">
        <option value="">Any Decade</option>
        <option value="2020">2020s</option>
        <option value="2010">2010s</option>
        <option value="2000">2000s</option>
        <option value="1990">1990s</option>
        <option value="1980">1980s</option>
        <option value="1970">1970s</option>
        <option value="1960">Before 1970</option>
      </select>
      <select id="advLanguage" class="filter-select">
        <option value="">Any Language</option>
        <option value="en">English</option>
        <option value="es">Spanish</option>
        <option value="fr">French</option>
        <option value="de">German</option>
        <option value="ja">Japanese</option>
        <option value="ko">Korean</option>
        <option value="hi">Hindi</option>
        <option value="zh">Chinese</option>
        <option value="pt">Portuguese</option>
        <option value="it">Italian</option>
      </select>
      <select id="advSort" class="filter-select">
        <option value="popularity.desc">Most Popular</option>
        <option value="vote_average.desc">Best Rated</option>
        <option value="release_date.desc">Newest</option>
        <option value="release_date.asc">Oldest</option>
        <option value="revenue.desc">Highest Grossing</option>
      </select>
      <button id="advApply" class="adv-filter-apply">Apply</button>
      <button id="advClear" class="adv-filter-clear">Clear</button>
    `;

    toggleBtn.addEventListener('click', () => {
      const open = panel.style.display !== 'none';
      panel.style.display = open ? 'none' : '';
      toggleBtn.classList.toggle('open', !open);
    });

    document.getElementById('advApply').addEventListener('click', () => {
      const decade   = document.getElementById('advDecade').value;
      const language = document.getElementById('advLanguage').value;
      const sort     = document.getElementById('advSort').value;
      if (!decade && !language && sort === 'popularity.desc') { showHome(); return; }
      runDiscover({ decade, language, sort }, 1);
    });

    document.getElementById('advClear').addEventListener('click', () => {
      ['advDecade', 'advLanguage', 'advSort'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = id === 'advSort' ? 'popularity.desc' : '';
      });
      panel.style.display = 'none';
      toggleBtn.classList.remove('open');
      showHome();
    });
  }

  // ── Streaming provider filter strip ───────────────────────────────────
  const PROVIDERS = [
    { id: 8,   name: 'Netflix',       logo: 'https://image.tmdb.org/t/p/original/t2yyOv40HZeVlLjYsCsPHnWLk4W.jpg' },
    { id: 337, name: 'Disney+',       logo: 'https://image.tmdb.org/t/p/original/7rwgEs15tFwyR9NPQ5vpzxTj19Q.jpg' },
    { id: 384, name: 'HBO Max',       logo: 'https://image.tmdb.org/t/p/original/Ajqyt5aNxNx6dRF2wJWoQaGqhHc.jpg' },
    { id: 9,   name: 'Prime Video',   logo: 'https://image.tmdb.org/t/p/original/emthp39XA2YScoYL1p0sdbLH2IC.jpg' },
    { id: 15,  name: 'Hulu',          logo: 'https://image.tmdb.org/t/p/original/zxrVdFjIjLqkfnwyghnfywTn3Lh.jpg' },
    { id: 531, name: 'Paramount+',    logo: 'https://image.tmdb.org/t/p/original/xbhHHa1YgtpwhC8lb1NQ3ACVcLd.jpg' },
    { id: 2,   name: 'Apple TV+',     logo: 'https://image.tmdb.org/t/p/original/peURlLlr8jggOwK53fJ5wdQl05y.jpg' },
  ];

  let activeProviderId = null;

  function buildProviderStrip() {
    const wrap = document.createElement('div');
    wrap.className = 'provider-strip-wrap';
    wrap.innerHTML = `
      <div class="provider-strip">
        ${PROVIDERS.map(p => `
          <button class="provider-pill" data-id="${p.id}" title="${p.name}">
            <img src="${p.logo}" alt="${p.name}" class="provider-pill-logo" onerror="this.parentElement.style.display='none'">
          </button>`).join('')}
      </div>`;

    wrap.querySelectorAll('.provider-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        if (activeProviderId === id) {
          activeProviderId = null;
          wrap.querySelectorAll('.provider-pill').forEach(b => b.classList.remove('active'));
          showHome();
        } else {
          activeProviderId = id;
          wrap.querySelectorAll('.provider-pill').forEach(b => b.classList.toggle('active', parseInt(b.dataset.id) === id));
          runProviderFilter(id, PROVIDERS.find(p => p.id === id)?.name || '');
        }
      });
    });

    // Insert after genre pills wrap
    const genreWrap = document.querySelector('.genre-pills-wrap');
    if (genreWrap) genreWrap.parentNode.insertBefore(wrap, genreWrap.nextSibling);
  }

  async function runProviderFilter(providerId, name, page = 1) {
    showGridView(`Streaming on ${name}`);
    browseGridCards.innerHTML = '';
    browseLoading.style.display = '';

    try {
      const res  = await fetch(`${API}/browse/discover?with_watch_providers=${providerId}&watch_region=US&page=${page}`);
      const data = await res.json();
      const movies = data.results || [];
      browseLoading.style.display = 'none';
      if (page === 1) browseGridCards.innerHTML = '';
      movies.forEach(m => browseGridCards.appendChild(buildBrowseCard(m)));
      st.gridPage        = page;
      st.gridTotalPages  = data.total_pages || 1;
      browseLoadMoreWrap.style.display = page < st.gridTotalPages ? '' : 'none';
    } catch {
      browseLoading.style.display = 'none';
    }
  }

  // ── Genres ─────────────────────────────────────────────────────────────
  async function loadGenres() {
    try {
      const res = await fetch(`${API}/browse/genres`);
      st.genres = await res.json();
      genrePillsEl.innerHTML = st.genres.map(g =>
        `<button class="genre-pill" data-id="${g.id}" data-name="${esc(g.name)}">${esc(g.name)}</button>`
      ).join('');
      genrePillsEl.querySelectorAll('.genre-pill').forEach(pill => {
        pill.addEventListener('click', () => toggleGenre(parseInt(pill.dataset.id), pill.dataset.name));
      });
    } catch {}
  }

  function toggleGenre(id, name) {
    if (st.activeGenreId === id) { clearGenre(); return; }
    st.activeGenreId = id;
    st.activeGenreName = name;
    genrePillsEl.querySelectorAll('.genre-pill').forEach(p =>
      p.classList.toggle('active', parseInt(p.dataset.id) === id)
    );
    browseSearchInput.value = '';
    browseSearchClear.style.display = 'none';
    runGenre(id, name, 1);
  }

  function clearGenre() {
    st.activeGenreId = null;
    genrePillsEl.querySelectorAll('.genre-pill').forEach(p => p.classList.remove('active'));
    showHome();
  }

  // ── Home rows ──────────────────────────────────────────────────────────
  function showRowSkeletons(container, count = 10) {
    if (!container) return;
    container.innerHTML = Array.from({ length: count }, () =>
      `<div class="card-skeleton"><div class="card-skeleton-poster"></div></div>`
    ).join('');
  }

  async function loadHomeRows() {
    const rows = [
      { id: 'bTrendingCards',   endpoint: 'browse/trending' },
      { id: 'bNowPlayingCards', endpoint: 'browse/now-playing' },
      { id: 'bPopularCards',    endpoint: 'browse/popular' },
      { id: 'bTopRatedCards',   endpoint: 'browse/top-rated' },
    ];

    // Show skeletons while fetching
    rows.forEach(({ id }) => showRowSkeletons(document.getElementById(id)));

    await Promise.all(rows.map(async ({ id, endpoint }) => {
      try {
        const res  = await fetch(`${API}/${endpoint}`);
        const data = await res.json();
        const movies = data.results || data;
        const container = document.getElementById(id);
        if (container) renderScrollRow(movies, container);
      } catch {
        const container = document.getElementById(id);
        if (container) container.innerHTML = '';
      }
    }));
    if (typeof observeSections === 'function') observeSections();
  }

  function showHome() {
    st.mode = 'home';
    st.activeGenreId = null;
    genrePillsEl.querySelectorAll('.genre-pill').forEach(p => p.classList.remove('active'));
    browseHome.style.display = '';
    browseGrid.style.display = 'none';
  }

  function showGridView(title) {
    browseHome.style.display = 'none';
    browseGrid.style.display = '';
    browseGridTitle.textContent = title;
  }

  // ── Search / Genre flows ───────────────────────────────────────────────
  async function runSearch(query, page) {
    st.searchQuery = query;
    st.gridPage = page;
    st.mode = 'search';
    if (page === 1) browseGridCards.innerHTML = '';
    showGridView(`Results for "${query}"`);
    setLoading(true);
    if (typeof startProgress === 'function') startProgress();
    try {
      const res  = await fetch(`${API}/browse/search?query=${encodeURIComponent(query)}&page=${page}`);
      const data = await res.json();
      st.gridTotalPages = data.total_pages || 1;
      renderGridCards(data.results || [], page === 1);
      browseLoadMoreWrap.style.display = page < st.gridTotalPages ? '' : 'none';
    } catch {
      browseGridCards.innerHTML = `<p style="color:var(--t2);grid-column:1/-1;padding:40px;text-align:center">Search failed.</p>`;
    } finally {
      setLoading(false);
      if (typeof finishProgress === 'function') finishProgress();
    }
  }

  async function runGenre(id, name, page) {
    st.gridPage = page;
    st.mode = 'genre';
    if (page === 1) browseGridCards.innerHTML = '';
    showGridView(name);
    setLoading(true);
    if (typeof startProgress === 'function') startProgress();
    try {
      const res  = await fetch(`${API}/browse/genre/${id}?page=${page}`);
      const data = await res.json();
      st.gridTotalPages = data.total_pages || 1;
      renderGridCards(data.results || [], page === 1);
      browseLoadMoreWrap.style.display = page < st.gridTotalPages ? '' : 'none';
    } catch {
      browseGridCards.innerHTML = `<p style="color:var(--t2);grid-column:1/-1;padding:40px;text-align:center">Failed to load.</p>`;
    } finally {
      setLoading(false);
      if (typeof finishProgress === 'function') finishProgress();
    }
  }

  // ── Collection flow ────────────────────────────────────────────────────
  async function runCollection(id, name) {
    st.mode = 'collection';
    st.collectionId = id;
    st.gridPage = 1;
    browseGridCards.innerHTML = '';
    showGridView(name);
    setLoading(true);
    if (typeof startProgress === 'function') startProgress();
    try {
      const res  = await fetch(`${API}/browse/collection/${id}`);
      const data = await res.json();
      const movies = data.results || [];
      renderGridCards(movies, true);
      browseLoadMoreWrap.style.display = 'none';
    } catch {
      browseGridCards.innerHTML = `<p style="color:var(--t2);grid-column:1/-1;padding:40px;text-align:center">Failed to load collection.</p>`;
    } finally {
      setLoading(false);
      if (typeof finishProgress === 'function') finishProgress();
    }
  }

  // ── Discover / advanced search flow ───────────────────────────────────
  async function runDiscover(params, page) {
    st.mode = 'discover';
    st.discoverParams = params;
    st.gridPage = page;
    if (page === 1) browseGridCards.innerHTML = '';

    const parts = [];
    if (params.decade)   parts.push(`${params.decade}s`);
    if (params.language) {
      const langNames = { en:'English', es:'Spanish', fr:'French', de:'German', ja:'Japanese', ko:'Korean', hi:'Hindi', zh:'Chinese', pt:'Portuguese', it:'Italian' };
      parts.push(langNames[params.language] || params.language.toUpperCase());
    }
    showGridView(parts.length ? parts.join(' · ') : 'Discover');
    setLoading(true);
    if (typeof startProgress === 'function') startProgress();
    try {
      const qs = new URLSearchParams({ page, sort: params.sort || 'popularity.desc' });
      if (params.decade)   qs.set('decade',   params.decade);
      if (params.language) qs.set('language', params.language);
      if (params.genre_id) qs.set('genre_id', params.genre_id);
      const res  = await fetch(`${API}/browse/discover?${qs}`);
      const data = await res.json();
      st.gridTotalPages = data.total_pages || 1;
      renderGridCards(data.results || [], page === 1);
      browseLoadMoreWrap.style.display = page < st.gridTotalPages ? '' : 'none';
    } catch {
      browseGridCards.innerHTML = `<p style="color:var(--t2);grid-column:1/-1;padding:40px;text-align:center">Failed to load.</p>`;
    } finally {
      setLoading(false);
      if (typeof finishProgress === 'function') finishProgress();
    }
  }

  browseLoadMoreBtn.addEventListener('click', () => {
    const next = st.gridPage + 1;
    if (st.mode === 'search')   runSearch(st.searchQuery, next);
    else if (st.mode === 'genre')    runGenre(st.activeGenreId, st.activeGenreName, next);
    else if (st.mode === 'discover') runDiscover(st.discoverParams, next);
  });

  browseGridClear.addEventListener('click', showHome);

  // ── Expose collection opener globally (used by modal collection links) ──
  window.browseCollection = function (id, name) {
    // Close any open modal
    const modal = document.getElementById('modal');
    if (modal && modal.style.display !== 'none') {
      modal.classList.add('closing');
      setTimeout(() => {
        modal.style.display = 'none';
        modal.classList.remove('closing');
        document.body.style.overflow = '';
      }, 200);
    }
    // Switch to browse tab
    document.querySelector('.nav-tab[data-view="browse"]')?.click();
    // Slight delay so view switch completes
    setTimeout(() => runCollection(id, name), 60);
  };

  // ── Card rendering — uses same structure as app.js buildCard ───────────
  function buildBrowseCard(m) {
    const card = document.createElement('div');
    card.className = 'movie-card';

    const posterInner = m.poster
      ? `<img class="card-poster" src="${m.poster}" alt="${esc(m.title)}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'card-poster-placeholder\\'>🎬</div>'">`
      : `<div class="card-poster-placeholder">🎬</div>`;

    card.innerHTML = `
      <div class="card-poster-wrap">
        ${posterInner}
        ${m.vote_average ? `<div class="card-rating-pip">★ ${m.vote_average}</div>` : ''}
        <div class="card-hover-overlay">
          <button class="card-hover-add">+ Add to List</button>
        </div>
      </div>
      <div class="card-info">
        <div class="card-title-text">${esc(m.title)}</div>
        ${m.year ? `<div class="card-year-text">${m.year}</div>` : ''}
      </div>
    `;

    // Fade-in poster image when loaded
    const img = card.querySelector('.card-poster');
    if (img) {
      if (img.complete && img.naturalWidth) img.classList.add('img-loaded');
      else img.addEventListener('load', () => img.classList.add('img-loaded'), { once: true });
    }

    card.querySelector('.card-hover-add').addEventListener('click', e => {
      e.stopPropagation();
      if (typeof addMovie === 'function') addMovie(m);
    });
    card.addEventListener('click', () => openBrowseModal(m));
    return card;
  }

  function renderScrollRow(movies, container) {
    container.innerHTML = '';
    movies.forEach((m, i) => {
      const card = buildBrowseCard(m);
      card.style.animationDelay = `${i * 40}ms`;
      container.appendChild(card);
    });
  }

  function renderGridCards(movies, reset) {
    if (reset) browseGridCards.innerHTML = '';
    movies.forEach((m, i) => {
      const card = buildBrowseCard(m);
      card.style.animationDelay = `${(reset ? i : 0) * 35}ms`;
      browseGridCards.appendChild(card);
    });
  }

  // ── Modal skeleton ────────────────────────────────────────────────────
  function renderBrowseModalSkeleton(modalBody) {
    modalBody.innerHTML = `
      <div class="modal-skeleton">
        <div class="modal-skeleton-backdrop"></div>
        <div class="modal-skeleton-body">
          <div class="modal-skeleton-poster"></div>
          <div class="modal-skeleton-lines">
            <div class="modal-skeleton-line"></div>
            <div class="modal-skeleton-line"></div>
            <div class="modal-skeleton-line"></div>
            <div class="modal-skeleton-line"></div>
          </div>
        </div>
      </div>`;
  }

  // ── Movie detail modal ────────────────────────────────────────────────
  async function openBrowseModal(m) {
    const modal     = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');

    // If card has enough info show immediately, else show skeleton
    if (m.poster || m.backdrop) {
      renderBrowseModalContent(m, false);
    } else {
      renderBrowseModalSkeleton(modalBody);
    }
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    // Fetch full TMDB details in background
    try {
      const tmdbId = m.tmdb_id || m.id;
      const res = await fetch(`${API}/browse/movie/${tmdbId}`);
      if (res.ok && modal.style.display !== 'none') {
        const detail = await res.json();
        renderBrowseModalContent(detail, true);
        if (typeof loadSimilarMovies === 'function') loadSimilarMovies(detail);
      }
    } catch {}
  }

  function renderBrowseModalContent(detail, enriched) {
    const modalBody = document.getElementById('modalBody');
    const alreadyAdded = typeof state !== 'undefined' && state.liked?.find(l => (l.id || l.tmdb_id) === (detail.id || detail.tmdb_id));
    const wlStatus = typeof window.watchlist !== 'undefined'
      ? window.watchlist.getStatus(detail.tmdb_id || detail.id) : null;

    modalBody.innerHTML = `
      ${detail.backdrop ? `<div class="modal-backdrop-img" style="background-image:url(${detail.backdrop.replace('w780','w1280')})"></div>` : ''}
      <div class="modal-poster-row">
        ${detail.poster
          ? `<img class="modal-poster" src="${detail.poster}" alt="${esc(detail.title)}" onerror="this.outerHTML='<div class=\\'modal-poster-placeholder\\'>🎬</div>'">`
          : `<div class="modal-poster-placeholder">🎬</div>`}
        <div class="modal-info">
          <div class="modal-title">${esc(detail.title)}</div>
          <div class="modal-meta">
            ${detail.year    ? `<span>${detail.year}</span><span class="dot">·</span>` : ''}
            ${detail.runtime ? `<span class="modal-runtime">${detail.runtime} min</span><span class="dot">·</span>` : ''}
            <span class="modal-rating-badge">★ ${detail.vote_average || '?'}</span>
          </div>
          ${(detail.imdb_rating || detail.rt_score || detail.metacritic) ? `
          <div class="modal-scores">
            ${detail.imdb_rating ? `<span class="score-badge score-imdb"><span class="score-logo">IMDb</span>${detail.imdb_rating}</span>` : ''}
            ${detail.rt_score    ? `<span class="score-badge score-rt"><span class="score-logo">RT</span>${detail.rt_score}</span>` : ''}
            ${detail.metacritic  ? `<span class="score-badge score-mc"><span class="score-logo">MC</span>${detail.metacritic}</span>` : ''}
          </div>` : ''}
          ${detail.tagline ? `<div class="modal-tagline">${esc(detail.tagline)}</div>` : ''}
          ${(detail.genres||[]).length ? `
            <div class="modal-genres">
              ${detail.genres.map(g => `<span class="modal-genre-tag">${esc(g)}</span>`).join('')}
            </div>` : ''}
          <div class="modal-actions">
            <button class="modal-add-btn" id="modalAddBtn" ${alreadyAdded ? 'disabled' : ''}>
              ${alreadyAdded ? '✓ In List' : '+ Add to List'}
            </button>
            <button class="modal-watchlist-btn${wlStatus === 'watched' ? ' is-watched' : wlStatus === 'watchlist' ? ' is-watchlisted' : ''}"
              id="modalWatchlistBtn" data-tmdb="${detail.tmdb_id || detail.id}"
              title="${wlStatus === 'watched' ? 'Click to remove' : wlStatus === 'watchlist' ? 'Mark as watched' : 'Save to watchlist'}">
              ${wlStatus === 'watched' ? '✓ Watched' : wlStatus === 'watchlist' ? '★ Watchlisted' : '+ Watchlist'}
            </button>
            <button class="modal-rec-btn" id="modalRecBtn">Recommend from this</button>
          </div>
        </div>
      </div>
      ${detail.overview ? `<div class="modal-overview">${esc(detail.overview)}</div>` : ''}
      ${typeof buildProvidersSection === 'function' ? buildProvidersSection(detail) : ''}
      ${typeof buildCollectionSection === 'function' ? buildCollectionSection(detail) : ''}
      ${buildCrewCastSection(detail)}
      ${typeof buildGallerySection === 'function' ? buildGallerySection(detail) : ''}
      ${detail.trailer_key ? `
        <div class="modal-trailer">
          <iframe src="https://www.youtube.com/embed/${detail.trailer_key}?rel=0"
            title="Trailer" allowfullscreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
          </iframe>
        </div>` : ''}
      <div id="modalSimilar"></div>
    `;

    document.getElementById('modalAddBtn').addEventListener('click', () => {
      if (typeof addMovie === 'function') addMovie({ ...detail, id: detail.tmdb_id || detail.id });
      document.getElementById('modalAddBtn').disabled = true;
      document.getElementById('modalAddBtn').textContent = '✓ In List';
    });

    // Wire watchlist button
    if (typeof window.watchlist !== 'undefined') {
      window.watchlist.wireModalBtn({ ...detail, id: detail.tmdb_id || detail.id });
    }

    // Wire collection link
    if (typeof wireCollectionLink === 'function') wireCollectionLink();

    document.getElementById('modalRecBtn').addEventListener('click', () => {
      if (typeof addMovie === 'function') addMovie({ ...detail, id: detail.tmdb_id || detail.id });
      document.querySelector('.nav-tab[data-view="recommend"]')?.click();
      document.getElementById('modal').style.display = 'none';
      document.body.style.overflow = '';
      setTimeout(() => { if (typeof fetchRecommendations === 'function') fetchRecommendations(true); }, 150);
    });

    if (detail.stills?.length && typeof openLightbox === 'function') {
      modalBody.querySelectorAll('.gallery-still').forEach(img => {
        img.addEventListener('click', () => openLightbox(detail.stills, parseInt(img.dataset.idx)));
      });
    }
  }

  function buildCrewCastSection(d) {
    const crewItems = [];
    if (d.directors?.length) crewItems.push({ role: 'Director',   names: d.directors.join(', ') });
    else if (d.director)     crewItems.push({ role: 'Director',   names: d.director });
    if (d.writers?.length)   crewItems.push({ role: 'Screenplay', names: d.writers.join(', ') });
    const castDetail = d.cast_detail || [];
    if (!crewItems.length && !castDetail.length) return '';
    return `
      <div class="modal-cast-section">
        ${crewItems.length ? `<div class="modal-crew-row">${crewItems.map(c => `<div class="crew-item"><span class="crew-role">${esc(c.role)}</span><span class="crew-name">${esc(c.names)}</span></div>`).join('')}</div>` : ''}
        ${castDetail.length ? `
          <div class="modal-section-label">Cast</div>
          <div class="cast-scroll">
            ${castDetail.map(c => `
              <div class="cast-member">
                ${c.photo ? `<img class="cast-photo" src="${c.photo}" alt="${esc(c.name)}" loading="lazy" onerror="this.outerHTML='<div class=\\'cast-photo-placeholder\\'>👤</div>'">` : `<div class="cast-photo-placeholder">👤</div>`}
                <span class="cast-name">${esc(c.name)}</span>
                ${c.character ? `<span class="cast-character">${esc(c.character)}</span>` : ''}
              </div>`).join('')}
          </div>` : ''}
      </div>`;
  }

  function setLoading(show) {
    browseLoading.style.display = show ? '' : 'none';
    browseGridCards.style.opacity = show ? '0.4' : '1';
  }

  async function init() {
    buildAdvFilterPanel();
    buildProviderStrip();
    if (typeof startProgress === 'function') startProgress();
    await Promise.all([loadGenres(), loadHomeRows()]);
    if (typeof finishProgress === 'function') finishProgress();
  }

  return { init };
})();
