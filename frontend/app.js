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
// Start transparent (no class) since hero is at top

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
  } catch {
    resultsGrid.innerHTML = `<p style="color:var(--text-dim);grid-column:1/-1;padding:60px;text-align:center">Could not load recommendations.</p>`;
  } finally {
    showLoading(false);
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

    showLoading(true);
    resultsGrid.innerHTML = '';
    loadMoreWrapper.style.display = 'none';

    try {
      const endpoint = state.currentTab === 'trending' ? 'trending' : 'top-rated';
      const res = await fetch(`${API}/${endpoint}?n=20`);
      const movies = await res.json();
      renderMovieCards(movies, resultsGrid, false);
    } catch {
      resultsGrid.innerHTML = `<p style="color:var(--text-dim);grid-column:1/-1;padding:40px;text-align:center">Could not load data.</p>`;
    } finally {
      showLoading(false);
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
});

// ── Discovery ──────────────────────────────────────────────────────────────
async function loadDiscovery() {
  try {
    const [tRes, trRes] = await Promise.all([
      fetch(`${API}/top-rated?n=16`),
      fetch(`${API}/trending?n=16`),
    ]);
    const topRated = await tRes.json();
    const trending = await trRes.json();

    if (trending.length) initHero(trending);

    renderMovieCards(trending, trendingRow, false);
    renderMovieCards(topRated, topRatedRow, false);
  } catch {
    // Non-critical
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
  if (delayMs) card.style.animationDelay = `${delayMs}ms`;

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
        </div>
      </div>
    </div>
    ${detail.overview ? `<div class="modal-overview">${esc(detail.overview)}</div>` : ''}
    ${buildCrewCastSection(detail)}
    ${buildGallerySection(detail)}
    ${detail.trailer_key ? `
      <div class="modal-trailer">
        <iframe src="https://www.youtube.com/embed/${detail.trailer_key}?rel=0"
          title="Trailer" allowfullscreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
        </iframe>
      </div>` : ''}
  `;

  $('modalAddBtn').addEventListener('click', () => {
    addMovie(detail);
    $('modalAddBtn').disabled = true;
    $('modalAddBtn').textContent = '✓ In your list';
  });

  if (detail.stills?.length) {
    modalBody.querySelectorAll('.gallery-still').forEach(img => {
      img.addEventListener('click', () => openLightbox(detail.stills, parseInt(img.dataset.idx)));
    });
  }
}

async function openModal(m) {
  const alreadyAdded = state.liked.find(l => l.id === m.id);
  renderModal(m, alreadyAdded);
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';

  try {
    const tmdbId = m.tmdb_id || m.id;
    const res = await fetch(`${API}/browse/movie/${tmdbId}`);
    if (res.ok && modal.style.display !== 'none') {
      const detail = await res.json();
      renderModal(detail, state.liked.find(l => l.id === m.id));
    }
  } catch { /* keep basic modal */ }
}

function closeModal() {
  modal.style.display = 'none';
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', closeModal);
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeLightbox(); } });

// ── Helpers ────────────────────────────────────────────────────────────────
function showLoading(show) {
  loadingState.style.display = show ? '' : 'none';
  resultsGrid.style.opacity  = show ? '0.3' : '1';
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
