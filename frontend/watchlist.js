/* MovieMind — Watchlist module
 * Tracks watchlist / watched status in memory and syncs with the profile API.
 * Exposes window.watchlist (add, remove, toggle, markWatched, getStatus)
 * and window.watchlistIds / window.watchedIds (Sets of tmdb_id integers).
 */

window.watchlistIds = new Set();
window.watchedIds   = new Set();

window.watchlist = (() => {

  // ── Load both Sets from the profile API ───────────────────────────────────
  async function loadUserSets() {
    if (!window.currentUser) return;
    try {
      const res = await fetch(`${API}/profile/movies`, { credentials: 'include' });
      if (!res.ok) return;
      const movies = await res.json();
      window.watchlistIds.clear();
      window.watchedIds.clear();
      movies.forEach(m => {
        const id = parseInt(m.tmdb_id);
        if (m.status === 'watchlist') window.watchlistIds.add(id);
        if (m.status === 'watched')   window.watchedIds.add(id);
      });
      // Refresh any open modal button if present
      _syncModalBtn();
    } catch { /* silently fail */ }
  }

  // ── Status query ──────────────────────────────────────────────────────────
  function getStatus(tmdbId) {
    const id = parseInt(tmdbId);
    if (window.watchedIds.has(id))   return 'watched';
    if (window.watchlistIds.has(id)) return 'watchlist';
    return null;
  }

  // ── Add / upsert ──────────────────────────────────────────────────────────
  async function add(movie, status = 'watchlist') {
    if (!window.currentUser) {
      document.getElementById('headerAuthBtn')?.click();
      return false;
    }
    const tmdbId = parseInt(movie.tmdb_id || movie.id);
    try {
      const res = await fetch(`${API}/profile/movies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          tmdb_id:      tmdbId,
          title:        movie.title,
          year:         movie.year,
          poster:       movie.poster,
          vote_average: movie.vote_average,
          genres:       movie.genres || [],
          status,
        }),
      });
      if (res.ok) {
        if (status === 'watched') {
          window.watchedIds.add(tmdbId);
          window.watchlistIds.delete(tmdbId);
        } else {
          window.watchlistIds.add(tmdbId);
          window.watchedIds.delete(tmdbId);
        }
        if (typeof showToast === 'function') {
          showToast(status === 'watched' ? `Marked watched: ${movie.title}` : `Added to Watchlist: ${movie.title}`);
        }
        return true;
      }
    } catch { /* silently fail */ }
    return false;
  }

  // ── Mark watched (update existing entry) ──────────────────────────────────
  async function markWatched(tmdbId) {
    if (!window.currentUser) return false;
    tmdbId = parseInt(tmdbId);
    try {
      const res = await fetch(`${API}/profile/movies/${tmdbId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'watched' }),
      });
      if (res.ok) {
        window.watchedIds.add(tmdbId);
        window.watchlistIds.delete(tmdbId);
        if (typeof showToast === 'function') showToast('Marked as watched ✓');
        return true;
      }
    } catch { /* silently fail */ }
    return false;
  }

  // ── Move back to watchlist ─────────────────────────────────────────────────
  async function moveToWatchlist(tmdbId) {
    if (!window.currentUser) return false;
    tmdbId = parseInt(tmdbId);
    try {
      const res = await fetch(`${API}/profile/movies/${tmdbId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'watchlist' }),
      });
      if (res.ok) {
        window.watchlistIds.add(tmdbId);
        window.watchedIds.delete(tmdbId);
        if (typeof showToast === 'function') showToast('Moved back to Watchlist');
        return true;
      }
    } catch { /* silently fail */ }
    return false;
  }

  // ── Remove entirely ────────────────────────────────────────────────────────
  async function remove(tmdbId) {
    if (!window.currentUser) return false;
    tmdbId = parseInt(tmdbId);
    try {
      const res = await fetch(`${API}/profile/movies/${tmdbId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        window.watchlistIds.delete(tmdbId);
        window.watchedIds.delete(tmdbId);
        if (typeof showToast === 'function') showToast('Removed from list');
        return true;
      }
    } catch { /* silently fail */ }
    return false;
  }

  // ── Cycle: null → watchlist → watched → null ───────────────────────────────
  async function cycle(movie) {
    const tmdbId = parseInt(movie.tmdb_id || movie.id);
    const current = getStatus(tmdbId);
    if (!current)                  return add(movie, 'watchlist');
    if (current === 'watchlist')   return markWatched(tmdbId);
    /* current === 'watched' */    return remove(tmdbId);
  }

  // ── Keep modal button in sync ──────────────────────────────────────────────
  function _syncModalBtn() {
    const btn = document.getElementById('modalWatchlistBtn');
    if (!btn) return;
    const tmdbId = parseInt(btn.dataset.tmdb || '0');
    if (!tmdbId) return;
    _applyBtnState(btn, getStatus(tmdbId));
  }

  function _applyBtnState(btn, status) {
    if (status === 'watched') {
      btn.textContent = '✓ Watched';
      btn.className   = 'modal-watchlist-btn is-watched';
      btn.title       = 'Click to remove from list';
    } else if (status === 'watchlist') {
      btn.textContent = '★ Watchlisted';
      btn.className   = 'modal-watchlist-btn is-watchlisted';
      btn.title       = 'Click to mark as watched';
    } else {
      btn.textContent = '+ Watchlist';
      btn.className   = 'modal-watchlist-btn';
      btn.title       = 'Save to your watchlist';
    }
  }

  // ── Wire up a watchlist button in a modal ──────────────────────────────────
  function wireModalBtn(movie) {
    const btn = document.getElementById('modalWatchlistBtn');
    if (!btn) return;
    const tmdbId = parseInt(movie.tmdb_id || movie.id);
    btn.dataset.tmdb = tmdbId;
    _applyBtnState(btn, getStatus(tmdbId));

    btn.onclick = async () => {
      if (!window.currentUser) {
        document.getElementById('headerAuthBtn')?.click();
        return;
      }
      const ok = await cycle(movie);
      if (ok) _applyBtnState(btn, getStatus(tmdbId));
    };
  }

  // ── Auto-load when user logs in ────────────────────────────────────────────
  const _origRefresh = window.profileRefresh;
  window.profileRefresh = function () {
    loadUserSets();
    if (typeof _origRefresh === 'function') _origRefresh();
  };

  // If already logged in at script parse time (session restore)
  setTimeout(() => { if (window.currentUser) loadUserSets(); }, 900);

  return { loadUserSets, getStatus, add, remove, cycle, markWatched, moveToWatchlist, wireModalBtn };
})();
