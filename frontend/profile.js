/* MovieMind — Profile module */

(function () {
  // ── Helpers ───────────────────────────────────────────────────────────────
  function escHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatDate(iso) {
    try {
      return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    } catch {
      return '';
    }
  }

  // ── Nav tab injection ─────────────────────────────────────────────────────
  let profileTabInjected = false;

  function ensureProfileTab() {
    if (profileTabInjected) return;
    const nav = document.querySelector('.main-nav');
    if (!nav) return;
    const tab = document.createElement('button');
    tab.className = 'nav-tab';
    tab.dataset.view = 'profile';
    tab.textContent = 'Profile';
    nav.appendChild(tab);

    tab.addEventListener('click', () => {
      document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('viewRecommend').style.display = 'none';
      document.getElementById('viewBrowse').style.display    = 'none';
      document.getElementById('viewProfile').style.display   = '';
      loadProfile();
    });

    profileTabInjected = true;
  }

  function removeProfileTab() {
    const tab = document.querySelector('.nav-tab[data-view="profile"]');
    if (tab) tab.remove();
    profileTabInjected = false;
  }

  // ── Profile view ──────────────────────────────────────────────────────────
  const viewProfile = document.getElementById('viewProfile');
  let currentFilter = 'all';
  let cachedMovies  = [];

  async function loadProfile() {
    if (!window.currentUser) return;
    viewProfile.innerHTML = `
      <div class="profile-loading">
        <div class="spinner"></div>
        <p>Loading profile…</p>
      </div>`;

    try {
      const [statsRes, moviesRes] = await Promise.all([
        fetch(`${API}/profile/stats`,  { credentials: 'include' }),
        fetch(`${API}/profile/movies`, { credentials: 'include' }),
      ]);
      const stats  = await statsRes.json();
      const movies = await moviesRes.json();
      cachedMovies = movies;
      renderProfile(stats, movies);
    } catch {
      viewProfile.innerHTML = `<div class="profile-loading"><p>Failed to load profile.</p></div>`;
    }
  }

  function renderProfile(stats, movies) {
    const u = window.currentUser;
    const initials = u.username.charAt(0).toUpperCase();
    const avgStr = stats.avg_rating != null ? stats.avg_rating.toFixed(1) : '—';

    viewProfile.innerHTML = `
      <main class="main profile-main">
        <div class="profile-header-card">
          <div class="profile-avatar-wrap">
            <div class="profile-avatar" style="background:${escHtml(u.avatar_color)}">${escHtml(initials)}</div>
          </div>
          <div class="profile-header-info">
            <div class="profile-username">${escHtml(u.username)}</div>
            <div class="profile-joined">Member since ${formatDate(u.created_at)}</div>
            <div class="profile-stats-row">
              <div class="profile-stat">
                <span class="profile-stat-num">${stats.watched_count}</span>
                <span class="profile-stat-label">Watched</span>
              </div>
              <div class="profile-stat-divider"></div>
              <div class="profile-stat">
                <span class="profile-stat-num">${stats.watchlist_count}</span>
                <span class="profile-stat-label">Watchlist</span>
              </div>
              <div class="profile-stat-divider"></div>
              <div class="profile-stat">
                <span class="profile-stat-num">${avgStr}</span>
                <span class="profile-stat-label">Avg Rating</span>
              </div>
            </div>
          </div>
        </div>

        <div class="profile-filter-tabs">
          <button class="profile-filter-tab ${currentFilter === 'all'       ? 'active' : ''}" data-filter="all">All</button>
          <button class="profile-filter-tab ${currentFilter === 'watched'   ? 'active' : ''}" data-filter="watched">Watched</button>
          <button class="profile-filter-tab ${currentFilter === 'watchlist' ? 'active' : ''}" data-filter="watchlist">Watchlist</button>
        </div>

        <div id="profileGrid" class="results-grid profile-grid"></div>
      </main>
    `;

    viewProfile.querySelectorAll('.profile-filter-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        currentFilter = btn.dataset.filter;
        viewProfile.querySelectorAll('.profile-filter-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderMovieGrid(cachedMovies);
      });
    });

    renderMovieGrid(movies);
  }

  function renderMovieGrid(movies) {
    const grid = document.getElementById('profileGrid');
    if (!grid) return;

    const filtered = currentFilter === 'all'
      ? movies
      : movies.filter(m => m.status === currentFilter);

    if (!filtered.length) {
      grid.innerHTML = `<p class="profile-empty">No movies here yet.</p>`;
      return;
    }

    grid.innerHTML = '';
    filtered.forEach(m => grid.appendChild(buildProfileCard(m)));
  }

  function buildProfileCard(m) {
    const card = document.createElement('div');
    card.className = 'movie-card profile-movie-card';

    const posterInner = m.poster
      ? `<img class="card-poster" src="${escHtml(m.poster)}" alt="${escHtml(m.title)}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'card-poster-placeholder\\'>🎬</div>'">`
      : `<div class="card-poster-placeholder">🎬</div>`;

    const genres = (m.genres || []).slice(0, 2);
    const statusLabel = m.status === 'watched' ? 'Watched' : 'Watchlist';
    const statusClass = m.status === 'watched' ? 'badge-watched' : 'badge-watchlist';

    card.innerHTML = `
      <button class="profile-card-remove" data-tmdb="${m.tmdb_id}" title="Remove">×</button>
      <div class="card-poster-wrap">${posterInner}</div>
      <div class="card-body">
        <div class="card-title">${escHtml(m.title)}</div>
        <div class="card-meta">
          ${m.year ? `<span>${escHtml(m.year)}</span><span class="dot">·</span>` : ''}
          <span class="card-rating">★ ${m.vote_average || '?'}</span>
        </div>
        <div class="profile-card-stars" data-tmdb="${m.tmdb_id}">
          ${[1,2,3,4,5].map(v =>
            `<span class="profile-star${m.rating >= v ? ' active' : ''}" data-val="${v}">★</span>`
          ).join('')}
        </div>
        ${genres.length ? `<div class="card-genres">${genres.map(g => `<span class="genre-tag">${escHtml(g)}</span>`).join('')}</div>` : ''}
        <span class="profile-status-badge ${statusClass}">${statusLabel}</span>
      </div>
    `;

    // Star rating
    card.querySelectorAll('.profile-star').forEach(star => {
      star.addEventListener('click', async e => {
        e.stopPropagation();
        const val    = parseInt(star.dataset.val);
        const tmdbId = parseInt(m.tmdb_id);
        await updateMovieField(tmdbId, { rating: val });
        m.rating = val;
        card.querySelectorAll('.profile-star').forEach((s, i) => {
          s.classList.toggle('active', i < val);
        });
        // update cachedMovies
        const cached = cachedMovies.find(c => c.tmdb_id === tmdbId);
        if (cached) cached.rating = val;
      });
    });

    // Remove button
    card.querySelector('.profile-card-remove').addEventListener('click', async e => {
      e.stopPropagation();
      const tmdbId = parseInt(m.tmdb_id);
      try {
        await fetch(`${API}/profile/movies/${tmdbId}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        cachedMovies = cachedMovies.filter(c => c.tmdb_id !== tmdbId);
        card.remove();
        const grid = document.getElementById('profileGrid');
        if (grid && !grid.querySelector('.profile-movie-card')) {
          grid.innerHTML = `<p class="profile-empty">No movies here yet.</p>`;
        }
      } catch {
        if (typeof showToast === 'function') showToast('Failed to remove movie');
      }
    });

    return card;
  }

  async function updateMovieField(tmdbId, fields) {
    try {
      await fetch(`${API}/profile/movies/${tmdbId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(fields),
      });
    } catch { /* silently fail */ }
  }

  // ── Save movie to profile (called after addMovie) ─────────────────────────
  async function saveToProfile(movie, status) {
    if (!window.currentUser) return;
    try {
      await fetch(`${API}/profile/movies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          tmdb_id:      movie.tmdb_id || movie.id,
          title:        movie.title,
          year:         movie.year,
          poster:       movie.poster,
          vote_average: movie.vote_average,
          genres:       movie.genres || [],
          rating:       movie.rating || null,
          status:       status || 'watchlist',
        }),
      });
    } catch { /* silently fail */ }
  }

  // ── Hook into existing addMovie ───────────────────────────────────────────
  const _origAddMovie = window.addMovie;
  if (typeof _origAddMovie === 'function') {
    window.addMovie = function (movie) {
      _origAddMovie(movie);
      saveToProfile(movie, 'watchlist');
    };
  }

  // ── Public API ────────────────────────────────────────────────────────────
  window.profileRefresh = function () {
    if (window.currentUser) {
      ensureProfileTab();
      // If profile view is currently active, reload it
      if (viewProfile.style.display !== 'none' && viewProfile.style.display !== '') {
        loadProfile();
      }
    }
  };

  window.profileHide = function () {
    removeProfileTab();
    // If profile view is active, go back to recommend
    if (viewProfile && viewProfile.style.display === '') {
      viewProfile.style.display = 'none';
      document.getElementById('viewRecommend').style.display = '';
      document.querySelectorAll('.nav-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.view === 'recommend');
      });
    }
  };

  // On load: if already logged in (from auth.js checkSession), inject tab
  // We poll once after a short delay so auth.js has time to populate currentUser
  setTimeout(() => {
    if (window.currentUser) ensureProfileTab();
  }, 600);
})();
