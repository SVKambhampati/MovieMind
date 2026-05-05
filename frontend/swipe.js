/* MovieMind — Swipe mode (Discover by swiping) */

(function () {
  const API = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5001/api'
    : '/api';

  // ── State ──────────────────────────────────────────────────────────────────
  const swipeState = {
    queue:    [],    // upcoming movies
    idx:      0,     // current position in queue
    liked:    [],    // swiped-right movies
    skipped:  0,     // swiped-left count
  };

  // ── Build overlay ──────────────────────────────────────────────────────────
  function buildOverlay() {
    const el = document.createElement('div');
    el.id = 'swipeOverlay';
    el.className = 'swipe-overlay';
    el.innerHTML = `
      <div class="swipe-header">
        <button class="swipe-close" id="swipeClose" aria-label="Close">✕</button>
        <div class="swipe-title">Discover</div>
        <div class="swipe-progress-wrap">
          <div class="swipe-progress-bar" id="swipeProgressBar"></div>
        </div>
      </div>

      <div class="swipe-stage" id="swipeStage">
        <div class="swipe-loading" id="swipeLoading">
          <div class="spinner"></div>
          <p>Loading films…</p>
        </div>
      </div>

      <div class="swipe-hint" id="swipeHint">
        <span class="swipe-hint-left">← Skip</span>
        <span class="swipe-hint-keys">Arrow keys or drag</span>
        <span class="swipe-hint-right">Like →</span>
      </div>

      <div class="swipe-actions">
        <button class="swipe-action-btn swipe-skip" id="swipeSkipBtn" title="Skip (←)">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>
        <button class="swipe-action-btn swipe-info" id="swipeInfoBtn" title="More info">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
          </svg>
        </button>
        <button class="swipe-action-btn swipe-like" id="swipeLikeBtn" title="Like (→)">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>

      <div class="swipe-liked-summary" id="swipeSummary" style="display:none">
        <div class="swipe-summary-inner">
          <div class="swipe-summary-title">You liked <span id="swipeLikedCount">0</span> films!</div>
          <p class="swipe-summary-sub">Add them to your list and get recommendations?</p>
          <div class="swipe-summary-posters" id="swipeSummaryPosters"></div>
          <div class="swipe-summary-actions">
            <button class="swipe-summary-btn primary" id="swipeAddAllBtn">Add all &amp; Recommend</button>
            <button class="swipe-summary-btn secondary" id="swipeKeepBrowsingBtn">Keep Browsing</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(el);
    return el;
  }

  // ── Load queue from trending + now-playing ─────────────────────────────────
  async function loadQueue() {
    const [trending, popular] = await Promise.all([
      fetch(`${API}/trending?n=20`).then(r => r.json()),
      fetch(`${API}/browse/discover?sort_by=popularity.desc&page=1`).then(r => r.json()).then(d => d.results || []),
    ]);
    // Shuffle & dedupe
    const seen = new Set();
    const all  = [...trending, ...popular].filter(m => {
      if (!m.poster || seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
    // Fisher-Yates shuffle
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    return all.slice(0, 40);
  }

  // ── Render current card ────────────────────────────────────────────────────
  function renderCard(movie, stage) {
    const card = document.createElement('div');
    card.className = 'swipe-card';
    card.dataset.id = movie.id;

    const genres = (movie.genres || []).slice(0, 3);
    card.innerHTML = `
      <div class="swipe-card-bg" style="background-image:url(${movie.backdrop || movie.poster})"></div>
      <div class="swipe-card-gradient"></div>
      <div class="swipe-card-content">
        ${genres.length ? `<div class="swipe-card-genres">${genres.map(g => `<span class="swipe-genre-tag">${g}</span>`).join('')}</div>` : ''}
        <div class="swipe-card-title">${escHtml(movie.title)}</div>
        <div class="swipe-card-meta">
          ${movie.year ? `<span>${movie.year}</span>` : ''}
          ${movie.vote_average ? `<span class="swipe-card-rating">★ ${movie.vote_average}</span>` : ''}
          ${movie.runtime ? `<span>${movie.runtime} min</span>` : ''}
        </div>
        ${movie.overview ? `<p class="swipe-card-overview">${escHtml(movie.overview.slice(0, 160))}…</p>` : ''}
      </div>
      <div class="swipe-label swipe-label-like">LIKE ♥</div>
      <div class="swipe-label swipe-label-skip">SKIP ✕</div>
    `;

    // Wire drag/pointer events
    wireDrag(card, movie, stage);
    stage.appendChild(card);
    requestAnimationFrame(() => card.classList.add('swipe-card-enter'));
    return card;
  }

  // ── Pointer drag ──────────────────────────────────────────────────────────
  function wireDrag(card, movie, stage) {
    let startX = 0, startY = 0, curX = 0, isDragging = false;

    card.addEventListener('pointerdown', e => {
      if (e.target.closest('button')) return;
      startX = e.clientX;
      startY = e.clientY;
      curX   = 0;
      isDragging = true;
      card.setPointerCapture(e.pointerId);
      card.style.transition = 'none';
    });

    card.addEventListener('pointermove', e => {
      if (!isDragging) return;
      curX = e.clientX - startX;
      const rotate = curX * 0.07;
      card.style.transform = `translateX(${curX}px) rotate(${rotate}deg)`;
      // Show labels
      const likeLabel = card.querySelector('.swipe-label-like');
      const skipLabel = card.querySelector('.swipe-label-skip');
      if (curX > 30)  { likeLabel.style.opacity = Math.min((curX - 30) / 80, 1); skipLabel.style.opacity = 0; }
      else if (curX < -30) { skipLabel.style.opacity = Math.min((-curX - 30) / 80, 1); likeLabel.style.opacity = 0; }
      else { likeLabel.style.opacity = 0; skipLabel.style.opacity = 0; }
    });

    card.addEventListener('pointerup', () => {
      if (!isDragging) return;
      isDragging = false;
      card.style.transition = '';
      if (curX > 80)       resolveSwipe('like', card, movie, stage);
      else if (curX < -80) resolveSwipe('skip', card, movie, stage);
      else {
        card.style.transform = '';
        card.querySelector('.swipe-label-like').style.opacity = 0;
        card.querySelector('.swipe-label-skip').style.opacity = 0;
      }
    });
  }

  // ── Resolve swipe decision ─────────────────────────────────────────────────
  function resolveSwipe(decision, card, movie, stage) {
    const dir = decision === 'like' ? 1 : -1;
    card.style.transition = 'transform 0.38s cubic-bezier(0.16,1,0.3,1), opacity 0.38s ease';
    card.style.transform  = `translateX(${dir * 140}%) rotate(${dir * 12}deg)`;
    card.style.opacity    = '0';

    if (decision === 'like') {
      swipeState.liked.push(movie);
      updateSwipeSummaryPosters();
    } else {
      swipeState.skipped++;
    }

    updateProgress();
    setTimeout(() => {
      card.remove();
      swipeState.idx++;
      showNextCard(stage);
    }, 380);
  }

  // ── Show next card ─────────────────────────────────────────────────────────
  function showNextCard(stage) {
    const m = swipeState.queue[swipeState.idx];
    if (!m) {
      showSummary();
      return;
    }
    renderCard(m, stage);
    // Pre-render one-ahead
    const next = swipeState.queue[swipeState.idx + 1];
    if (next) {
      const ghost = document.createElement('div');
      ghost.className = 'swipe-card swipe-card-ghost';
      ghost.style.transform = 'scale(0.94) translateY(12px)';
      ghost.innerHTML = `<div class="swipe-card-bg" style="background-image:url(${next.backdrop || next.poster})"></div><div class="swipe-card-gradient"></div>`;
      stage.insertBefore(ghost, stage.firstChild);
    }
  }

  // ── Progress bar ───────────────────────────────────────────────────────────
  function updateProgress() {
    const bar = document.getElementById('swipeProgressBar');
    if (!bar) return;
    const pct = Math.min((swipeState.idx / swipeState.queue.length) * 100, 100);
    bar.style.width = `${pct}%`;
  }

  // ── Summary panel ──────────────────────────────────────────────────────────
  function updateSwipeSummaryPosters() {
    const el = document.getElementById('swipeLikedCount');
    if (el) el.textContent = swipeState.liked.length;
  }

  function showSummary() {
    const stage   = document.getElementById('swipeStage');
    const summary = document.getElementById('swipeSummary');
    if (stage)   stage.style.display   = 'none';
    if (summary) summary.style.display = '';

    const count = document.getElementById('swipeLikedCount');
    if (count) count.textContent = swipeState.liked.length;

    const postersEl = document.getElementById('swipeSummaryPosters');
    if (postersEl) {
      postersEl.innerHTML = swipeState.liked.slice(0, 8).map(m =>
        m.poster ? `<img src="${m.poster}" alt="${escHtml(m.title)}" class="swipe-summary-poster" loading="lazy">` : ''
      ).join('');
    }

    const addAllBtn = document.getElementById('swipeAddAllBtn');
    if (addAllBtn) {
      addAllBtn.addEventListener('click', () => {
        swipeState.liked.forEach(m => {
          if (typeof window.addMovie === 'function') window.addMovie(m);
        });
        closeSwipeMode();
        // Auto-trigger recommendations if we added movies
        if (swipeState.liked.length) {
          setTimeout(() => {
            const btn = document.getElementById('recommendBtn');
            if (btn && !btn.disabled) btn.click();
          }, 300);
        }
      });
    }

    const keepBtn = document.getElementById('swipeKeepBrowsingBtn');
    if (keepBtn) {
      keepBtn.addEventListener('click', () => {
        // Reset and reload
        const summary = document.getElementById('swipeSummary');
        const stage   = document.getElementById('swipeStage');
        if (summary) summary.style.display = 'none';
        if (stage)   stage.style.display   = '';
        swipeState.idx = 0;
        swipeState.queue = [];
        loadAndStart(stage);
      });
    }
  }

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  function onKey(e) {
    const overlay = document.getElementById('swipeOverlay');
    if (!overlay || !overlay.classList.contains('open')) return;
    if (e.key === 'ArrowRight' || e.key === 'd') triggerBtnSwipe('like');
    else if (e.key === 'ArrowLeft' || e.key === 'a') triggerBtnSwipe('skip');
    else if (e.key === 'Escape') closeSwipeMode();
  }

  function triggerBtnSwipe(decision) {
    const stage = document.getElementById('swipeStage');
    const card  = stage?.querySelector('.swipe-card:not(.swipe-card-ghost)');
    if (!card) return;
    const movie = swipeState.queue[swipeState.idx];
    if (!movie) return;
    resolveSwipe(decision, card, movie, stage);
  }

  // ── Load and start ─────────────────────────────────────────────────────────
  async function loadAndStart(stage) {
    const loading = document.getElementById('swipeLoading');
    if (loading) loading.style.display = '';
    try {
      swipeState.queue  = await loadQueue();
      swipeState.idx    = 0;
      swipeState.liked  = [];
      swipeState.skipped= 0;
      if (loading) loading.style.display = 'none';
      updateProgress();
      showNextCard(stage);
    } catch {
      if (loading) loading.innerHTML = '<p style="color:var(--t2)">Could not load movies. Try again.</p>';
    }
  }

  // ── Open / close ───────────────────────────────────────────────────────────
  function openSwipeMode() {
    let overlay = document.getElementById('swipeOverlay');
    if (!overlay) overlay = buildOverlay();

    // Wire close button
    const closeBtn = overlay.querySelector('#swipeClose');
    if (closeBtn) closeBtn.onclick = closeSwipeMode;

    // Wire action buttons
    const likeBtn = overlay.querySelector('#swipeLikeBtn');
    const skipBtn = overlay.querySelector('#swipeSkipBtn');
    const infoBtn = overlay.querySelector('#swipeInfoBtn');
    if (likeBtn) likeBtn.onclick = () => triggerBtnSwipe('like');
    if (skipBtn) skipBtn.onclick = () => triggerBtnSwipe('skip');
    if (infoBtn) infoBtn.onclick = () => {
      const m = swipeState.queue[swipeState.idx];
      if (m && typeof window.openModal === 'function') window.openModal(m);
    };

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);

    const stage = overlay.querySelector('#swipeStage');
    loadAndStart(stage);
  }

  function closeSwipeMode() {
    const overlay = document.getElementById('swipeOverlay');
    if (overlay) {
      overlay.classList.remove('open');
      setTimeout(() => overlay.remove(), 300);
    }
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onKey);
  }

  // ── Utils ─────────────────────────────────────────────────────────────────
  function escHtml(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ── Expose globally ────────────────────────────────────────────────────────
  window.openSwipeMode = openSwipeMode;
})();
