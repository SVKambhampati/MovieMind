/* MovieMind — Browse / Discover module */
/* Depends on: API, esc(), showToast(), openModal() from app.js */

const browse = (() => {
  // ── State ─────────────────────────────────────────────────────────────
  const st = {
    genres: [],
    activeGenreId: null,
    activeGenreName: '',
    searchQuery: '',
    gridPage: 1,
    gridTotalPages: 1,
    mode: 'home', // 'home' | 'search' | 'genre'
  };

  // ── DOM ───────────────────────────────────────────────────────────────
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

  // ── Nav tab switching ─────────────────────────────────────────────────
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const view = tab.dataset.view;
      document.getElementById('viewRecommend').style.display = view === 'recommend' ? '' : 'none';
      document.getElementById('viewBrowse').style.display    = view === 'browse'    ? '' : 'none';
      if (view === 'browse' && st.genres.length === 0) init();
    });
  });

  // ── Search ────────────────────────────────────────────────────────────
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

  // ── Genre pills ───────────────────────────────────────────────────────
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
    } catch { /* genres are non-critical */ }
  }

  function toggleGenre(id, name) {
    if (st.activeGenreId === id) {
      clearGenre(); return;
    }
    st.activeGenreId = id;
    st.activeGenreName = name;
    genrePillsEl.querySelectorAll('.genre-pill').forEach(p => {
      p.classList.toggle('active', parseInt(p.dataset.id) === id);
    });
    browseSearchInput.value = '';
    browseSearchClear.style.display = 'none';
    runGenre(id, name, 1);
  }

  function clearGenre() {
    st.activeGenreId = null;
    genrePillsEl.querySelectorAll('.genre-pill').forEach(p => p.classList.remove('active'));
    showHome();
  }

  // ── Home rows ─────────────────────────────────────────────────────────
  async function loadHomeRows() {
    const rows = [
      { id: 'bTrendingCards',  endpoint: 'browse/trending' },
      { id: 'bNowPlayingCards',endpoint: 'browse/now-playing' },
      { id: 'bPopularCards',   endpoint: 'browse/popular' },
      { id: 'bTopRatedCards',  endpoint: 'browse/top-rated' },
    ];
    await Promise.all(rows.map(async ({ id, endpoint }) => {
      try {
        const res  = await fetch(`${API}/${endpoint}`);
        const data = await res.json();
        const movies = data.results || data;
        const container = document.getElementById(id);
        if (container) renderScrollRow(movies, container);
      } catch { /* non-critical */ }
    }));
  }

  function showHome() {
    st.mode = 'home';
    st.activeGenreId = null;
    genrePillsEl.querySelectorAll('.genre-pill').forEach(p => p.classList.remove('active'));
    browseHome.style.display = '';
    browseGrid.style.display = 'none';
  }

  function showGridView(title) {
    st.mode = 'search'; // overridden for genre
    browseHome.style.display = 'none';
    browseGrid.style.display = '';
    browseGridTitle.textContent = title;
  }

  // ── Search flow ───────────────────────────────────────────────────────
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
      browseGridCards.innerHTML = `<p style="color:var(--text-dim);grid-column:1/-1">Search failed. Try again.</p>`;
    } finally {
      setLoading(false);
    }
  }

  // ── Genre flow ────────────────────────────────────────────────────────
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
      browseGridCards.innerHTML = `<p style="color:var(--text-dim);grid-column:1/-1">Failed to load genre.</p>`;
    } finally {
      setLoading(false);
    }
  }

  // ── Load more ─────────────────────────────────────────────────────────
  browseLoadMoreBtn.addEventListener('click', () => {
    const nextPage = st.gridPage + 1;
    if (st.mode === 'search') runSearch(st.searchQuery, nextPage);
    else if (st.mode === 'genre') runGenre(st.activeGenreId, st.activeGenreName, nextPage);
  });

  browseGridClear.addEventListener('click', showHome);

  // ── Rendering ─────────────────────────────────────────────────────────
  function renderScrollRow(movies, container) {
    container.innerHTML = '';
    movies.forEach(m => container.appendChild(buildBrowseCard(m)));
  }

  function renderGridCards(movies, reset) {
    if (reset) browseGridCards.innerHTML = '';
    movies.forEach(m => browseGridCards.appendChild(buildBrowseCard(m, true)));
  }

  function buildBrowseCard(m, gridMode = false) {
    const card = document.createElement('div');
    card.className = gridMode ? 'movie-card' : 'browse-card';

    if (gridMode) {
      const posterInner = m.poster
        ? `<img class="card-poster" src="${m.poster}" alt="${esc(m.title)}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'card-poster-placeholder\\'>🎬</div>'">`
        : `<div class="card-poster-placeholder">🎬</div>`;
      const genres = (m.genres || []).slice(0, 2);
      card.innerHTML = `
        <div class="card-poster-wrap">${posterInner}</div>
        <div class="card-body">
          <div class="card-title">${esc(m.title)}</div>
          <div class="card-meta">
            ${m.year ? `<span>${m.year}</span><span class="dot">·</span>` : ''}
            <span class="card-rating">★ ${m.vote_average || '?'}</span>
          </div>
          ${genres.length ? `<div class="card-genres">${genres.map(g => `<span class="genre-tag">${esc(g)}</span>`).join('')}</div>` : ''}
        </div>`;
    } else {
      // Scroll-row card: poster fills card, text overlaid at bottom
      const posterHTML = m.poster
        ? `<img class="browse-card-poster" src="${m.poster}" alt="${esc(m.title)}" loading="lazy" onerror="this.outerHTML='<div class=\\'browse-card-placeholder\\'>🎬</div>'">`
        : `<div class="browse-card-placeholder">🎬</div>`;
      card.innerHTML = `
        ${posterHTML}
        <div class="browse-card-body">
          <div class="browse-card-title">${esc(m.title)}</div>
          <div class="browse-card-meta">
            ${m.year ? `<span>${m.year}</span><span class="dot">·</span>` : ''}
            <span class="browse-card-rating">★ ${m.vote_average || '?'}</span>
          </div>
        </div>`;
    }

    card.addEventListener('click', () => openBrowseModal(m));
    return card;
  }

  // ── Cast / Crew section builder (shared) ─────────────────────────────
  function buildCrewCastSection(d) {
    const crewItems = [];
    if (d.directors?.length)  crewItems.push({ role: 'Director',   names: d.directors.join(', ') });
    else if (d.director)       crewItems.push({ role: 'Director',   names: d.director });
    if (d.writers?.length)     crewItems.push({ role: 'Screenplay', names: d.writers.join(', ') });

    const castDetail = d.cast_detail || [];
    if (!crewItems.length && !castDetail.length) return '';

    return `
      <div class="modal-cast-section">
        ${crewItems.length ? `
          <div class="modal-crew-row">
            ${crewItems.map(c => `
              <div class="crew-item">
                <span class="crew-role">${esc(c.role)}</span>
                <span class="crew-name">${esc(c.names)}</span>
              </div>`).join('')}
          </div>` : ''}
        ${castDetail.length ? `
          <div class="modal-section-label">Cast</div>
          <div class="cast-scroll">
            ${castDetail.map(c => `
              <div class="cast-member">
                ${c.photo
                  ? `<img class="cast-photo" src="${c.photo}" alt="${esc(c.name)}" loading="lazy" onerror="this.outerHTML='<div class=\\'cast-photo-placeholder\\'>👤</div>'">`
                  : `<div class="cast-photo-placeholder">👤</div>`}
                <span class="cast-name">${esc(c.name)}</span>
                ${c.character ? `<span class="cast-character">${esc(c.character)}</span>` : ''}
              </div>`).join('')}
          </div>` : ''}
      </div>`;
  }

  // ── Movie detail modal (enriched with TMDB) ───────────────────────────
  async function openBrowseModal(m) {
    // Fetch full details from TMDB
    let detail = m;
    try {
      const tmdbId = m.tmdb_id || m.id;
      const res = await fetch(`${API}/browse/movie/${tmdbId}`);
      if (res.ok) detail = await res.json();
    } catch { /* use what we have */ }

    const genres = (detail.genres || []);
    const alreadyAdded = typeof state !== 'undefined' && state.liked?.find(l => l.id === detail.id || l.tmdb_id === detail.tmdb_id);

    const modalBody = document.getElementById('modalBody');
    const modal     = document.getElementById('modal');
    const modalCard = document.querySelector('.modal-card');

    // Set backdrop image on modal card
    if (detail.backdrop) {
      modalCard.style.setProperty('--modal-backdrop', `url(${detail.backdrop})`);
    } else {
      modalCard.style.removeProperty('--modal-backdrop');
    }

    modalBody.innerHTML = `
      ${detail.backdrop ? `<div class="modal-backdrop-img" style="background-image:url(${detail.backdrop})"></div>` : ''}
      <div class="modal-poster-row">
        ${detail.poster
          ? `<img class="modal-poster" src="${detail.poster}" alt="${esc(detail.title)}" onerror="this.outerHTML='<div class=\\'modal-poster-placeholder\\'>🎬</div>'">`
          : `<div class="modal-poster-placeholder">🎬</div>`}
        <div class="modal-info">
          <div class="modal-title">${esc(detail.title)}</div>
          <div class="modal-meta">
            ${detail.year ? `<span>${detail.year}</span><span class="dot">·</span>` : ''}
            ${detail.runtime ? `<span class="modal-runtime">${detail.runtime} min</span><span class="dot">·</span>` : ''}
            <span class="modal-rating-badge">★ ${detail.vote_average || '?'}</span>
          </div>
          ${(detail.imdb_rating || detail.rt_score || detail.metacritic) ? `
          <div class="modal-scores">
            ${detail.imdb_rating ? `<span class="score-badge score-imdb"><span class="score-logo">IMDb</span>${detail.imdb_rating}</span>` : ''}
            ${detail.rt_score ? `<span class="score-badge score-rt"><span class="score-logo">RT</span>${detail.rt_score}</span>` : ''}
            ${detail.metacritic ? `<span class="score-badge score-mc"><span class="score-logo">MC</span>${detail.metacritic}</span>` : ''}
          </div>` : ''}
          ${detail.tagline ? `<div class="modal-tagline">${esc(detail.tagline)}</div>` : ''}
          ${genres.length ? `<div class="modal-genres">${genres.map(g => `<span class="modal-genre-tag">${esc(g)}</span>`).join('')}</div>` : ''}
          <div class="modal-actions">
            <button class="modal-add-btn" id="modalAddListBtn" ${alreadyAdded ? 'disabled' : ''}>
              ${alreadyAdded ? '✓ In your list' : '+ Add to my list'}
            </button>
            <button class="modal-add-rec-btn" id="modalGetRecsBtn">
              🎯 Recommend based on this
            </button>
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

    // Add to liked list button
    document.getElementById('modalAddListBtn').addEventListener('click', () => {
      if (typeof addMovie === 'function') {
        addMovie({
          id: detail.tmdb_id || detail.id,
          tmdb_id: detail.tmdb_id || detail.id,
          title: detail.title,
          year: detail.year,
          genres: detail.genres,
          vote_average: detail.vote_average,
          poster: detail.poster,
          rating: null,
        });
      }
      document.getElementById('modalAddListBtn').disabled = true;
      document.getElementById('modalAddListBtn').textContent = '✓ In your list';
    });

    // Get recommendations based on this movie — switch to For You tab
    document.getElementById('modalGetRecsBtn').addEventListener('click', () => {
      if (typeof addMovie === 'function') {
        addMovie({
          id: detail.tmdb_id || detail.id,
          tmdb_id: detail.tmdb_id || detail.id,
          title: detail.title,
          year: detail.year,
          genres: detail.genres,
          vote_average: detail.vote_average,
          poster: detail.poster,
          rating: null,
        });
      }
      // Switch to For You tab
      document.querySelector('.nav-tab[data-view="recommend"]')?.click();
      document.getElementById('modal').style.display = 'none';
      document.body.style.overflow = '';
      // Auto-trigger recommendations
      setTimeout(() => {
        if (typeof fetchRecommendations === 'function') fetchRecommendations(true);
      }, 150);
    });

    if (detail.stills?.length && typeof openLightbox === 'function') {
      modalBody.querySelectorAll('.gallery-still').forEach(img => {
        img.addEventListener('click', () => openLightbox(detail.stills, parseInt(img.dataset.idx)));
      });
    }

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  // ── Loading helper ────────────────────────────────────────────────────
  function setLoading(show) {
    browseLoading.style.display = show ? '' : 'none';
    if (show) browseGridCards.style.opacity = '0.4';
    else      browseGridCards.style.opacity = '1';
  }

  // ── Init ──────────────────────────────────────────────────────────────
  async function init() {
    await Promise.all([loadGenres(), loadHomeRows()]);
  }

  return { init, openBrowseModal };
})();
