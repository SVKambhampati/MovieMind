/* MovieMind — Frontend App */

const API = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? `http://localhost:5001/api`
  : '/api';

// ── State ──────────────────────────────────────────────────────────────────
const state = {
  liked: [],
  currentPage: 1,
  totalPages: 1,
  currentTab: 'forYou',
  recs: [],
};

// ── DOM refs ───────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const searchInput     = $('searchInput');
const suggestions     = $('suggestions');
const selectedMovies  = $('selectedMovies');
const emptyHint       = $('emptyHint');
const recommendBtn    = $('recommendBtn');
const searchPanel     = $('searchPanel');
const resultsPanel    = $('resultsPanel');
const resultsGrid     = $('resultsGrid');
const backBtn         = $('backBtn');
const trendingRow     = $('trendingRow');
const topRatedRow     = $('topRatedRow');
const discoverySection = $('discoverySection');
const loadMoreBtn     = $('loadMoreBtn');
const loadMoreWrapper = $('loadMoreWrapper');
const loadingState    = $('loadingState');
const modal           = $('modal');
const modalBody       = $('modalBody');
const modalBackdrop   = $('modalBackdrop');
const modalClose      = $('modalClose');
const resultsSubtitle = $('resultsSubtitle');
const heroSection     = $('heroSection');

// ── Header scroll effect ───────────────────────────────────────────────────
const siteHeader = $('siteHeader');
window.addEventListener('scroll', () => {
  siteHeader.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ── Session cache (5-min TTL) ──────────────────────────────────────────────
function cachedFetch(url, ttlMs = 300_000) {
  const key = `mm_${url}`;
  try {
    const raw = sessionStorage.getItem(key);
    if (raw) {
      const { ts, data } = JSON.parse(raw);
      if (Date.now() - ts < ttlMs) return Promise.resolve(data);
    }
  } catch {}
  return fetch(url)
    .then(r => r.json())
    .then(data => {
      try { sessionStorage.setItem(key, JSON.stringify({ ts: Date.now(), data })); } catch {}
      return data;
    });
}

// ── Scroll reveal ─────────────────────────────────────────────────────────
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.06 });

function observeSections() {
  document.querySelectorAll('.discovery-row, .browse-row').forEach(el => revealObserver.observe(el));
}

// ── Hero ───────────────────────────────────────────────────────────────────
let _heroMovies = [];
let _heroIdx    = 0;
let _heroTimer  = null;

function initHero(movies) {
  _heroMovies = movies.filter(m => m.backdrop).slice(0, 6);
  if (!_heroMovies.length) {
    heroSection.style.display = 'none';
    return;
  }
  renderHeroSlide(0);
  buildHeroDots();
  startHeroTimer();
}

function renderHeroSlide(idx, crossfade = false) {
  const m = _heroMovies[idx];
  if (!m) return;
  _heroIdx = idx;

  const heroBg     = $('heroBg');
  const heroBgPrev = $('heroBgPrev');
  const heroMeta   = $('heroMeta');

  // Crossfade backdrop
  const newUrl = `url(${m.backdrop.replace('w780', 'w1280')})`;
  if (crossfade && heroBg.style.backgroundImage) {
    heroBgPrev.style.backgroundImage = heroBg.style.backgroundImage;
    heroBgPrev.style.opacity = '1';
    heroBg.style.backgroundImage = newUrl;
    setTimeout(() => { heroBgPrev.style.opacity = '0'; }, 50);
  } else {
    heroBg.style.backgroundImage = newUrl;
  }

  // Animate text change — double-rAF avoids forced layout reflow
  heroMeta.classList.remove('hero-text-change');
  requestAnimationFrame(() => requestAnimationFrame(() => heroMeta.classList.add('hero-text-change')));

  // Preload next hero image so the crossfade is instant
  const nextM = _heroMovies[(_heroIdx + 1) % _heroMovies.length];
  if (nextM?.backdrop) { const pi = new Image(); pi.src = nextM.backdrop.replace('w780', 'w1280'); }

  const genres = (m.genres || []).slice(0, 3);
  heroMeta.innerHTML = `
    <div class="hero-label">✦ Featured Film</div>
    ${genres.length ? `<div class="hero-genre-pills">${genres.map(g => `<span class="hero-genre-pill">${esc(g)}</span>`).join('')}</div>` : ''}
    <h1 class="hero-title">${esc(m.title)}</h1>
    <div class="hero-meta-line">
      ${m.year       ? `<span>${m.year}</span><span class="sep">·</span>` : ''}
      ${m.vote_average ? `<span class="hero-rating">★ ${m.vote_average}</span>` : ''}
      ${m.runtime    ? `<span class="sep">·</span><span>${m.runtime} min</span>` : ''}
    </div>
    ${m.overview ? `<p class="hero-overview">${esc(m.overview)}</p>` : ''}
    <div class="hero-actions">
      <button class="hero-btn hero-btn-primary" id="heroAddBtn">+ Add to List</button>
      <button class="hero-btn hero-btn-secondary" id="heroInfoBtn">More Info</button>
    </div>
  `;

  $('heroAddBtn').addEventListener('click', e => { e.stopPropagation(); addMovie(m); });
  $('heroInfoBtn').addEventListener('click', e => { e.stopPropagation(); openModal(m); });

  // Update dots
  document.querySelectorAll('.hero-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === idx);
  });
}

function buildHeroDots() {
  const dotsEl = $('heroDots');
  dotsEl.innerHTML = _heroMovies.map((_, i) =>
    `<div class="hero-dot${i === 0 ? ' active' : ''}" data-idx="${i}"></div>`
  ).join('');
  dotsEl.querySelectorAll('.hero-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      stopHeroTimer();
      renderHeroSlide(parseInt(dot.dataset.idx), true);
      startHeroTimer();
    });
  });
}

function startHeroTimer() {
  stopHeroTimer();
  _heroTimer = setInterval(() => {
    renderHeroSlide((_heroIdx + 1) % _heroMovies.length, true);
  }, 7000);
}

function stopHeroTimer() {
  if (_heroTimer) { clearInterval(_heroTimer); _heroTimer = null; }
}

// ── Search ─────────────────────────────────────────────────────────────────
let searchDebounce = null;
let focusedIdx = -1;

searchInput.addEventListener('input', () => {
  clearTimeout(searchDebounce);
  const q = searchInput.value.trim();
  if (q.length < 2) { closeSuggestions(); return; }
  searchDebounce = setTimeout(() => fetchSuggestions(q), 220);
});

searchInput.addEventListener('keydown', e => {
  const items = [...suggestions.querySelectorAll('.suggestion-item')];
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    focusedIdx = Math.min(focusedIdx + 1, items.length - 1);
    items.forEach((el, i) => el.classList.toggle('focused', i === focusedIdx));
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    focusedIdx = Math.max(focusedIdx - 1, 0);
    items.forEach((el, i) => el.classList.toggle('focused', i === focusedIdx));
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (focusedIdx >= 0 && items[focusedIdx]) items[focusedIdx].click();
  } else if (e.key === 'Escape') {
    closeSuggestions();
  }
});

document.addEventListener('click', e => {
  if (!e.target.closest('.search-wrapper')) closeSuggestions();
});

async function fetchSuggestions(query) {
  try {
    const res = await fetch(`${API}/search?query=${encodeURIComponent(query)}`);
    const movies = await res.json();
    renderSuggestions(movies);
  } catch { closeSuggestions(); }
}

function renderSuggestions(movies) {
  focusedIdx = -1;
  if (!movies.length) { closeSuggestions(); return; }
  suggestions.innerHTML = movies.map(m => `
    <div class="suggestion-item" data-id="${m.id}" role="option">
      ${m.poster
        ? `<img class="suggestion-thumb" src="${m.poster}" alt="" loading="lazy" onerror="this.style.display='none'">`
        : `<div class="suggestion-thumb-placeholder">🎬</div>`}
      <div class="suggestion-info">
        <div class="suggestion-title">${esc(m.title)}</div>
        <div class="suggestion-meta">${m.year || ''} · ${(m.genres||[]).slice(0,2).join(', ')}</div>
      </div>
      <div class="suggestion-rating">★ ${m.vote_average || ''}</div>
    </div>
  `).join('');
  suggestions.querySelectorAll('.suggestion-item').forEach((el, i) => {
    el.addEventListener('click', () => addMovie(movies[i]));
  });
  suggestions.classList.add('open');
}

function closeSuggestions() {
  suggestions.classList.remove('open');
  suggestions.innerHTML = '';
  focusedIdx = -1;
}

// ── Movie selection ────────────────────────────────────────────────────────
function addMovie(movie) {
  if (state.liked.find(m => m.id === movie.id)) {
    showToast(`${movie.title} already added`);
    closeSuggestions();
    searchInput.value = '';
    return;
  }
  state.liked.push({ ...movie, rating: null });
  renderChips();
  closeSuggestions();
  searchInput.value = '';
  recommendBtn.disabled = false;
  emptyHint.style.display = 'none';
  showToast(`Added ${movie.title}`);
}

function removeMovie(id) {
  state.liked = state.liked.filter(m => m.id !== id);
  renderChips();
  if (!state.liked.length) {
    recommendBtn.disabled = true;
    emptyHint.style.display = '';
  }
}

function setRating(movieId, rating) {
  const m = state.liked.find(m => m.id === movieId);
  if (m) m.rating = rating;
  const chip = selectedMovies.querySelector(`[data-chip-id="${movieId}"]`);
  if (chip) {
    chip.querySelectorAll('.star').forEach((s, i) => {
      s.classList.toggle('active', i < rating);
    });
  }
}

function renderChips() {
  selectedMovies.querySelectorAll('.selected-chip').forEach(el => el.remove());
  state.liked.forEach(m => {
    const chip = document.createElement('div');
    chip.className = 'selected-chip';
    chip.dataset.chipId = m.id;
    chip.innerHTML = `
      <span class="chip-title">${esc(m.title)}</span>
      ${m.year ? `<span class="chip-year">${m.year}</span>` : ''}
      <div class="chip-stars">
        ${[1,2,3,4,5].map(v => `<span class="star${m.rating >= v ? ' active' : ''}" data-val="${v}">★</span>`).join('')}
      </div>
      <button class="chip-remove" title="Remove" aria-label="Remove ${esc(m.title)}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M18 6 6 18M6 6l12 12"/>
        </svg>
      </button>
    `;
    chip.querySelectorAll('.star').forEach(star => {
      star.addEventListener('click', () => setRating(m.id, parseInt(star.dataset.val)));
    });
    chip.querySelector('.chip-remove').addEventListener('click', () => removeMovie(m.id));
    selectedMovies.appendChild(chip);
  });
}

// ── Recommendations ────────────────────────────────────────────────────────
recommendBtn.addEventListener('click', () => fetchRecommendations(true));

async function fetchRecommendations(reset = true) {
  if (reset) {
    state.currentPage = 1;
    state.recs = [];
  }

  startProgress();
  showLoading(true);
  searchPanel.style.display = 'none';
  heroSection.style.display = 'none';
  resultsPanel.style.display = 'block';
  discoverySection.style.display = 'none';

  try {
    const body = {
      liked: state.liked.map(m => ({
        id: m.id, title: m.title,
        ...(m.rating ? { rating: m.rating } : {}),
      })),
      page: state.currentPage,
      per_page: 12,
    };
    const res = await fetch(`${API}/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    state.recs.push(...(data.recommendations || []));
    state.totalPages = data.pages || 1;

    if (reset) {
      resultsGrid.innerHTML = '';
      resultsSubtitle.textContent = `Based on: ${state.liked.map(m => m.title).join(', ')}`;
    }

    renderMovieCards(data.recommendations || [], resultsGrid, true);
    loadMoreWrapper.style.display = state.currentPage < state.totalPages ? '' : 'none';
    if (reset) buildFilterBar();
  } catch {
    resultsGrid.innerHTML = `<p style="color:var(--t2);grid-column:1/-1;padding:60px;text-align:center">Could not load recommendations.</p>`;
  } finally {
    showLoading(false);
    finishProgress();
  }
}

loadMoreBtn.addEventListener('click', () => {
  state.currentPage++;
  fetchRecommendations(false);
});

// ── Tabs ───────────────────────────────────────────────────────────────────
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', async () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    state.currentTab = tab.dataset.tab;

    if (state.currentTab === 'forYou') {
      resultsGrid.innerHTML = '';
      state.recs.forEach(m => resultsGrid.appendChild(buildCard(m)));
      loadMoreWrapper.style.display = state.currentPage < state.totalPages ? '' : 'none';
      return;
    }

    startProgress();
    showLoading(true);
    resultsGrid.innerHTML = '';
    loadMoreWrapper.style.display = 'none';

    try {
      const endpoint = state.currentTab === 'trending' ? 'trending' : 'top-rated';
      const movies = await cachedFetch(`${API}/${endpoint}?n=20`);
      renderMovieCards(movies, resultsGrid, false);
    } catch {
      resultsGrid.innerHTML = `<p style="color:var(--t2);grid-column:1/-1;padding:40px;text-align:center">Could not load data.</p>`;
    } finally {
      showLoading(false);
      finishProgress();
    }
  });
});

// ── Back button ────────────────────────────────────────────────────────────
backBtn.addEventListener('click', () => {
  resultsPanel.style.display = 'none';
  searchPanel.style.display = '';
  heroSection.style.display = '';
  discoverySection.style.display = '';
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === 'forYou'));
  state.currentTab = 'forYou';
  _filterState = { genre: '', sort: 'relevance' };
  const bar = $('filterBar');
  if (bar) bar.remove();
});

// ── Skeleton loaders ──────────────────────────────────────────────────────
function showSkeletons(container, count = 8) {
  container.innerHTML = Array.from({ length: count }, () =>
    `<div class="card-skeleton"><div class="card-skeleton-poster"></div></div>`
  ).join('');
}

// ── Discovery ──────────────────────────────────────────────────────────────
async function loadDiscovery() {
  startProgress();
  showSkeletons(trendingRow);
  showSkeletons(topRatedRow);
  try {
    const [topRated, trending] = await Promise.all([
      cachedFetch(`${API}/top-rated?n=16`),
      cachedFetch(`${API}/trending?n=16`),
    ]);

    if (trending.length) initHero(trending);

    trendingRow.innerHTML = '';
    topRatedRow.innerHTML = '';
    renderMovieCards(trending, trendingRow, false);
    renderMovieCards(topRated, topRatedRow, false);
    observeSections();
  } catch {
    // Non-critical — skeletons will just stay until refresh
    trendingRow.innerHTML = '';
    topRatedRow.innerHTML = '';
  } finally {
    finishProgress();
  }
}

// ── Card rendering ─────────────────────────────────────────────────────────
function renderMovieCards(movies, container, animate) {
  movies.forEach((m, i) => {
    const card = buildCard(m, animate ? i * 35 : 0);
    container.appendChild(card);
  });
}

function buildCard(m, delayMs = 0) {
  const card = document.createElement('div');
  card.className = 'movie-card';
  card.style.animationDelay = `${delayMs}ms`;

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

  // Fade in poster once loaded
  const img = card.querySelector('.card-poster');
  if (img) {
    if (img.complete && img.naturalWidth) {
      img.classList.add('img-loaded');
    } else {
      img.addEventListener('load', () => img.classList.add('img-loaded'), { once: true });
    }
  }

  card.querySelector('.card-hover-add').addEventListener('click', e => {
    e.stopPropagation();
    addMovie(m);
  });
  card.addEventListener('click', () => openModal(m));
  return card;
}

// ── Gallery lightbox ───────────────────────────────────────────────────────
let _galleryStills = [];
let _galleryIdx = 0;

function openLightbox(stills, idx) {
  _galleryStills = stills;
  _galleryIdx = idx;

  let lb = $('galleryLightbox');
  if (!lb) {
    lb = document.createElement('div');
    lb.id = 'galleryLightbox';
    lb.className = 'gallery-lightbox';
    lb.innerHTML = `
      <div class="lb-backdrop"></div>
      <button class="lb-close" aria-label="Close">✕</button>
      <button class="lb-prev" aria-label="Previous">‹</button>
      <img class="lb-img" alt="" />
      <button class="lb-next" aria-label="Next">›</button>
      <div class="lb-counter"></div>
    `;
    document.body.appendChild(lb);
    lb.querySelector('.lb-backdrop').addEventListener('click', closeLightbox);
    lb.querySelector('.lb-close').addEventListener('click', closeLightbox);
    lb.querySelector('.lb-prev').addEventListener('click', () => stepLightbox(-1));
    lb.querySelector('.lb-next').addEventListener('click', () => stepLightbox(1));
    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'ArrowLeft')  stepLightbox(-1);
      if (e.key === 'ArrowRight') stepLightbox(1);
      if (e.key === 'Escape')     closeLightbox();
    });
  }
  renderLightboxSlide();
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function renderLightboxSlide() {
  const lb = $('galleryLightbox');
  lb.querySelector('.lb-img').src = _galleryStills[_galleryIdx].full;
  lb.querySelector('.lb-counter').textContent = `${_galleryIdx + 1} / ${_galleryStills.length}`;
  lb.querySelector('.lb-prev').style.display = _galleryIdx === 0 ? 'none' : '';
  lb.querySelector('.lb-next').style.display = _galleryIdx === _galleryStills.length - 1 ? 'none' : '';
}

function stepLightbox(dir) {
  _galleryIdx = Math.max(0, Math.min(_galleryStills.length - 1, _galleryIdx + dir));
  renderLightboxSlide();
}

function closeLightbox() {
  const lb = $('galleryLightbox');
  if (lb) lb.classList.remove('open');
  document.body.style.overflow = '';
}

function buildGallerySection(d) {
  if (!d.stills?.length) return '';
  return `
    <div class="modal-gallery">
      <div class="modal-section-label">Photos</div>
      <div class="gallery-scroll">
        ${d.stills.map((s, i) => `
          <img class="gallery-still" src="${s.thumb}" alt="Still ${i+1}" loading="lazy"
            data-idx="${i}" onerror="this.style.display='none'">`
        ).join('')}
      </div>
    </div>`;
}

// ── Filter bar (recommendations) ──────────────────────────────────────────
let _filterState = { genre: '', sort: 'relevance' };

function buildFilterBar() {
  // Extract unique genres from ALL loaded recs
  const genreCount = {};
  state.recs.forEach(m => (m.genres || []).forEach(g => { genreCount[g] = (genreCount[g] || 0) + 1; }));
  const genres = Object.entries(genreCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 9)
    .map(([g]) => g);

  let bar = $('filterBar');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'filterBar';
    bar.className = 'filter-bar';
    resultsPanel.insertBefore(bar, resultsGrid);
  }

  bar.innerHTML = `
    <div class="filter-genre-pills">
      ${genres.map(g => `<button class="filter-genre-pill${_filterState.genre === g ? ' active' : ''}" data-genre="${esc(g)}">${esc(g)}</button>`).join('')}
    </div>
    <div class="filter-controls">
      <select id="filterSort" class="filter-select">
        <option value="relevance"   ${_filterState.sort === 'relevance'   ? 'selected' : ''}>Relevance</option>
        <option value="rating-desc" ${_filterState.sort === 'rating-desc' ? 'selected' : ''}>Best Rated</option>
        <option value="year-desc"   ${_filterState.sort === 'year-desc'   ? 'selected' : ''}>Newest</option>
        <option value="year-asc"    ${_filterState.sort === 'year-asc'    ? 'selected' : ''}>Oldest</option>
      </select>
      <button id="filterReset" class="filter-reset">Clear</button>
    </div>
  `;

  bar.querySelectorAll('.filter-genre-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      _filterState.genre = pill.classList.contains('active') ? '' : pill.dataset.genre;
      bar.querySelectorAll('.filter-genre-pill').forEach(p =>
        p.classList.toggle('active', p.dataset.genre === _filterState.genre)
      );
      applyFilters();
    });
  });

  $('filterSort').addEventListener('change', e => {
    _filterState.sort = e.target.value;
    applyFilters();
  });

  $('filterReset').addEventListener('click', () => {
    _filterState = { genre: '', sort: 'relevance' };
    buildFilterBar();
    applyFilters();
  });
}

function applyFilters() {
  let filtered = [...state.recs];
  if (_filterState.genre) filtered = filtered.filter(m => (m.genres || []).includes(_filterState.genre));
  if (_filterState.sort === 'rating-desc') filtered.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
  if (_filterState.sort === 'year-desc')   filtered.sort((a, b) => (b.year || 0) - (a.year || 0));
  if (_filterState.sort === 'year-asc')    filtered.sort((a, b) => (a.year || 0) - (b.year || 0));

  resultsGrid.innerHTML = '';
  if (filtered.length) {
    filtered.forEach((m, i) => resultsGrid.appendChild(buildCard(m, i * 25)));
  } else {
    resultsGrid.innerHTML = `<p style="color:var(--t2);grid-column:1/-1;padding:40px;text-align:center">No movies match these filters.</p>`;
  }
  // Hide load-more when filters are active
  loadMoreWrapper.style.display = (_filterState.genre || _filterState.sort !== 'relevance')
    ? 'none'
    : (state.currentPage < state.totalPages ? '' : 'none');
}

// ── Providers section ──────────────────────────────────────────────────────
function buildProvidersSection(d) {
  const p = d.watch_providers;
  if (!p) return '';
  const stream = p.stream || [];
  const rent   = (p.rent || []).slice(0, 5);
  if (!stream.length && !rent.length) return '';

  const logoHtml = arr => arr.map(pr =>
    pr.logo
      ? `<img class="provider-logo" src="${pr.logo}" alt="${esc(pr.name)}" title="${esc(pr.name)}" loading="lazy" onerror="this.style.display='none'">`
      : `<span style="font-size:10px;color:var(--t3);padding:4px">${esc(pr.name.slice(0,8))}</span>`
  ).join('');

  const rows = [];
  if (stream.length) rows.push(`<div class="providers-row"><span class="providers-row-label">Stream</span>${logoHtml(stream)}</div>`);
  if (rent.length)   rows.push(`<div class="providers-row"><span class="providers-row-label">Rent</span>${logoHtml(rent)}</div>`);

  return `
    <div class="modal-providers">
      <div class="modal-section-label">Where to Watch</div>
      <div class="modal-providers-rows">${rows.join('')}</div>
      ${p.link ? `<a class="providers-more-link" href="${p.link}" target="_blank" rel="noopener noreferrer">More options →</a>` : ''}
    </div>`;
}

// ── Collection section ─────────────────────────────────────────────────────
function buildCollectionSection(d) {
  if (!d.collection) return '';
  const c = d.collection;
  return `
    <div class="modal-collection" id="modalCollectionLink"
         data-collection-id="${c.id}" data-collection-name="${esc(c.name)}">
      ${c.poster
        ? `<img class="modal-collection-poster" src="${c.poster}" alt="" loading="lazy" onerror="this.style.display='none'">`
        : `<div class="modal-collection-poster"></div>`}
      <div class="modal-collection-info">
        <div class="modal-collection-sub">Part of a Collection</div>
        <div class="modal-collection-name">${esc(c.name)}</div>
      </div>
      <span class="modal-collection-arrow">›</span>
    </div>`;
}

// ── Wire collection link ───────────────────────────────────────────────────
function wireCollectionLink() {
  const link = $('modalCollectionLink');
  if (!link) return;
  link.addEventListener('click', () => {
    const id   = parseInt(link.dataset.collectionId);
    const name = link.dataset.collectionName;
    if (typeof window.browseCollection === 'function') window.browseCollection(id, name);
  });
}

// ── Load similar movies into modal ────────────────────────────────────────
async function loadSimilarMovies(detail) {
  const container = $('modalSimilar');
  if (!container) return;
  const tmdbId = detail.tmdb_id || detail.id;
  if (!tmdbId) return;
  try {
    const res = await fetch(`${API}/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        liked: [{
          id:                tmdbId,
          tmdb_id:           tmdbId,
          title:             detail.title || '',
          original_language: detail.original_language || 'en',
          genre_ids:         detail.genre_ids || (detail.genres || []).map(g => g.id || g),
        }],
        page:     1,
        per_page: 12,
      }),
    });
    if (!res.ok || !container.isConnected) return;
    const data = await res.json();
    const movies = (data.recommendations || []).slice(0, 12);
    if (!movies.length || !container.isConnected) return;
    container.innerHTML = `
      <div class="modal-similar">
        <div class="modal-similar-label">More Like This</div>
        <div class="modal-similar-row" id="modalSimilarRow"></div>
      </div>`;
    const row = $('modalSimilarRow');
    movies.forEach((m, i) => {
      const card = buildCard(m, i * 30);
      row.appendChild(card);
    });
    // Wire fade-in for these posters too
    row.querySelectorAll('.card-poster').forEach(img => {
      if (img.complete && img.naturalWidth) img.classList.add('img-loaded');
      else img.addEventListener('load', () => img.classList.add('img-loaded'), { once: true });
    });
  } catch { /* silently fail */ }
}

// ── Modal ──────────────────────────────────────────────────────────────────
function buildCrewCastSection(d) {
  const crewItems = [];
  if (d.directors?.length)  crewItems.push({ role: 'Director',   names: d.directors.join(', ') });
  else if (d.director)      crewItems.push({ role: 'Director',   names: d.director });
  if (d.writers?.length)    crewItems.push({ role: 'Screenplay', names: d.writers.join(', ') });

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

function renderModal(detail, alreadyAdded) {
  const genres = detail.genres || [];
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
        ${genres.length ? `
          <div class="modal-genres">
            ${genres.map(g => `<span class="modal-genre-tag">${esc(g)}</span>`).join('')}
          </div>` : ''}
        <div class="modal-actions">
          <button class="modal-add-btn" id="modalAddBtn" ${alreadyAdded ? 'disabled' : ''}>
            ${alreadyAdded ? '✓ In List' : '+ Add to List'}
          </button>
          <button class="modal-watchlist-btn${wlStatus === 'watched' ? ' is-watched' : wlStatus === 'watchlist' ? ' is-watchlisted' : ''}"
            id="modalWatchlistBtn" data-tmdb="${detail.tmdb_id || detail.id}"
            title="${wlStatus === 'watched' ? 'Click to remove' : wlStatus === 'watchlist' ? 'Click to mark as watched' : 'Save to your watchlist'}">
            ${wlStatus === 'watched' ? '✓ Watched' : wlStatus === 'watchlist' ? '★ Watchlisted' : '+ Watchlist'}
          </button>
        </div>
      </div>
    </div>
    ${detail.overview ? `<div class="modal-overview">${esc(detail.overview)}</div>` : ''}
    ${buildProvidersSection(detail)}
    ${buildCollectionSection(detail)}
    ${buildCrewCastSection(detail)}
    ${buildGallerySection(detail)}
    ${detail.trailer_key ? `
      <div class="modal-trailer">
        <iframe src="https://www.youtube.com/embed/${detail.trailer_key}?rel=0"
          title="Trailer" allowfullscreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
        </iframe>
      </div>` : ''}
    <div id="modalSimilar"></div>
  `;

  $('modalAddBtn').addEventListener('click', () => {
    addMovie(detail);
    $('modalAddBtn').disabled = true;
    $('modalAddBtn').textContent = '✓ In your list';
  });

  // Wire watchlist button
  if (typeof window.watchlist !== 'undefined') {
    window.watchlist.wireModalBtn(detail);
  }

  // Wire collection link
  wireCollectionLink();

  if (detail.stills?.length) {
    modalBody.querySelectorAll('.gallery-still').forEach(img => {
      img.addEventListener('click', () => openLightbox(detail.stills, parseInt(img.dataset.idx)));
    });
  }
}

function renderModalSkeleton() {
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

async function openModal(m) {
  // If we have poster/title, show immediately; otherwise show skeleton
  const alreadyAdded = state.liked.find(l => l.id === m.id);
  if (m.poster || m.backdrop) {
    renderModal(m, alreadyAdded);
  } else {
    renderModalSkeleton();
  }
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';

  try {
    const tmdbId = m.tmdb_id || m.id;
    const res = await fetch(`${API}/browse/movie/${tmdbId}`);
    if (res.ok && modal.style.display !== 'none') {
      const detail = await res.json();
      renderModal(detail, state.liked.find(l => l.id === m.id));
      loadSimilarMovies(detail);
    }
  } catch { /* keep basic modal */ }
}

function closeModal() {
  modal.classList.add('closing');
  setTimeout(() => {
    modal.style.display = 'none';
    modal.classList.remove('closing');
    document.body.style.overflow = '';
  }, 200);
}

modalClose.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', closeModal);
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeLightbox(); } });

// ── Helpers ────────────────────────────────────────────────────────────────
function showLoading(show) {
  loadingState.style.display = show ? '' : 'none';
  resultsGrid.style.opacity  = show ? '0.3' : '1';
}

// ── Page progress bar ──────────────────────────────────────────────────────
const pageProgress = $('pageProgress');
let _progressTimer = null;
let _progressVal   = 0;

function startProgress() {
  clearTimeout(_progressTimer);
  _progressVal = 0;
  pageProgress.style.transition = 'none';
  pageProgress.style.width = '0%';
  pageProgress.classList.add('active');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      pageProgress.style.transition = 'width 0.5s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease';
      _progressVal = 22;
      pageProgress.style.width = '22%';
      _tickProgress();
    });
  });
}

function _tickProgress() {
  _progressTimer = setTimeout(() => {
    if (_progressVal < 84) {
      _progressVal += Math.random() * 14 + 5;
      _progressVal = Math.min(_progressVal, 84);
      pageProgress.style.transition = 'width 0.7s cubic-bezier(0.16,1,0.3,1)';
      pageProgress.style.width = `${_progressVal}%`;
      _tickProgress();
    }
  }, 550);
}

function finishProgress() {
  clearTimeout(_progressTimer);
  pageProgress.style.transition = 'width 0.25s cubic-bezier(0.16,1,0.3,1)';
  pageProgress.style.width = '100%';
  setTimeout(() => {
    pageProgress.style.transition = 'width 0.25s cubic-bezier(0.16,1,0.3,1), opacity 0.35s ease';
    pageProgress.classList.remove('active');
    setTimeout(() => { pageProgress.style.width = '0%'; }, 360);
  }, 260);
}

function esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

let toastTimer = null;
function showToast(msg) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

// ── Init ───────────────────────────────────────────────────────────────────
loadDiscovery();
