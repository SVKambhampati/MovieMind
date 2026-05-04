/* MovieMind — Browse / Discover module */
/* Depends on: API, esc(), showToast(), openModal(), addMovie(), buildGallerySection(), openLightbox() from app.js */

const browse = (() => {
  const st = {
    genres: [],
    activeGenreId: null,
    activeGenreName: '',
    searchQuery: '',
    gridPage: 1,
    gridTotalPages: 1,
    mode: 'home',
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
  async function loadHomeRows() {
    const rows = [
      { id: 'bTrendingCards',   endpoint: 'browse/trending' },
      { id: 'bNowPlayingCards', endpoint: 'browse/now-playing' },
      { id: 'bPopularCards',    endpoint: 'browse/popular' },
      { id: 'bTopRatedCards',   endpoint: 'browse/top-rated' },
    ];
    await Promise.all(rows.map(async ({ id, endpoint }) => {
      try {
        const res  = await fetch(`${API}/${endpoint}`);
        const data = await res.json();
        const movies = data.results || data;
        const container = document.getElementById(id);
        if (container) renderScrollRow(movies, container);
      } catch {}
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
    try {
      const res  = await fetch(`${API}/browse/search?query=${encodeURIComponent(query)}&page=${page}`);
      const data = await res.json();
      st.gridTotalPages = data.total_pages || 1;
      renderGridCards(data.results || [], page === 1);
      browseLoadMoreWrap.style.display = page < st.gridTotalPages ? '' : 'none';
    } catch {
      browseGridCards.innerHTML = `<p style="color:var(--t2);grid-column:1/-1;padding:40px;text-align:center">Search failed.</p>`;
    } finally { setLoading(false); }
  }

  async function runGenre(id, name, page) {
    st.gridPage = page;
    st.mode = 'genre';
    if (page === 1) browseGridCards.innerHTML = '';
    showGridView(name);
    setLoading(true);
    try {
      const res  = await fetch(`${API}/browse/genre/${id}?page=${page}`);
      const data = await res.json();
      st.gridTotalPages = data.total_pages || 1;
      renderGridCards(data.results || [], page === 1);
      browseLoadMoreWrap.style.display = page < st.gridTotalPages ? '' : 'none';
    } catch {
      browseGridCards.innerHTML = `<p style="color:var(--t2);grid-column:1/-1;padding:40px;text-align:center">Failed to load.</p>`;
    } finally { setLoading(false); }
  }

  browseLoadMoreBtn.addEventListener('click', () => {
    const next = st.gridPage + 1;
    if (st.mode === 'search') runSearch(st.searchQuery, next);
    else if (st.mode === 'genre') runGenre(st.activeGenreId, st.activeGenreName, next);
  });

  browseGridClear.addEventListener('click', showHome);

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
        <div class="card-hover-overlay">
          <div class="card-hover-title">${esc(m.title)}</div>
          <div class="card-hover-meta">${m.year ? m.year : ''}${m.vote_average ? ` · ★ ${m.vote_average}` : ''}</div>
          <button class="card-hover-add">+ Add to List</button>
        </div>
      </div>
    `;

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

  // ── Movie detail modal ────────────────────────────────────────────────
  async function openBrowseModal(m) {
    // Show a quick preview right away, then enrich
    const modal     = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');

    renderBrowseModalContent(m, false);
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    // Fetch full TMDB details in background
    try {
      const tmdbId = m.tmdb_id || m.id;
      const res = await fetch(`${API}/browse/movie/${tmdbId}`);
      if (res.ok && modal.style.display !== 'none') {
        const detail = await res.json();
        renderBrowseModalContent(detail, true);
      }
    } catch {}
  }

  function renderBrowseModalContent(detail, enriched) {
    const modalBody = document.getElementById('modalBody');
    const alreadyAdded = typeof state !== 'undefined' && state.liked?.find(l => (l.id || l.tmdb_id) === (detail.id || detail.tmdb_id));

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
            <button class="modal-rec-btn" id="modalRecBtn">Recommend from this</button>
          </div>
        </div>
      </div>
      ${detail.overview ? `<div class="modal-overview">${esc(detail.overview)}</div>` : ''}
      ${buildCrewCastSection(detail)}
      ${typeof buildGallerySection === 'function' ? buildGallerySection(detail) : ''}
      ${detail.trailer_key ? `
        <div class="modal-trailer">
          <iframe src="https://www.youtube.com/embed/${detail.trailer_key}?rel=0"
            title="Trailer" allowfullscreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
          </iframe>
        </div>` : ''}
    `;

    document.getElementById('modalAddBtn').addEventListener('click', () => {
      if (typeof addMovie === 'function') addMovie({ ...detail, id: detail.tmdb_id || detail.id });
      document.getElementById('modalAddBtn').disabled = true;
      document.getElementById('modalAddBtn').textContent = '✓ In List';
    });

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
    await Promise.all([loadGenres(), loadHomeRows()]);
  }

  return { init };
})();
