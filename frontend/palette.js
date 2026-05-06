/* MovieMind — Command Palette (⌘K) */

(function () {
  const API = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5001/api' : '/api';

  const palette   = document.getElementById('cmdPalette');
  const backdrop  = document.getElementById('cmdBackdrop');
  const input     = document.getElementById('cmdInput');
  const resultsEl = document.getElementById('cmdResults');
  if (!palette || !input) return;

  // ── Quick actions always available ────────────────────────────────────────
  const ACTIONS = [
    { icon: '✦', label: 'For You — get personalised picks',  action: () => switchView('recommend') },
    { icon: '🎬', label: 'Browse all movies',                 action: () => switchView('browse') },
    { icon: '⟳',  label: 'Discover by swiping',               action: () => { close(); if (typeof window.openSwipeMode === 'function') window.openSwipeMode(); } },
    { icon: '🌙', label: 'What to watch tonight',             action: () => { close(); if (typeof window.openQuickPick === 'function') window.openQuickPick(); } },
    { icon: '✍️', label: 'Search by vibe / mood',             action: () => { close(); switchView('recommend'); switchMode('vibe'); } },
    { icon: '👥', label: 'Watch Together mode',               action: () => { close(); switchView('recommend'); switchMode('together'); } },
  ];

  function switchView(view) {
    close();
    const tab = document.querySelector(`.nav-tab[data-view="${view}"]`);
    if (tab) tab.click();
  }

  function switchMode(mode) {
    const tab = document.querySelector(`.input-mode-tab[data-mode="${mode}"]`);
    if (tab) tab.click();
  }

  // ── Open / close ───────────────────────────────────────────────────────────
  function open() {
    palette.style.display = 'flex';
    requestAnimationFrame(() => palette.classList.add('open'));
    input.value = '';
    renderActions('');
    setTimeout(() => input.focus(), 50);
  }

  function close() {
    palette.classList.remove('open');
    setTimeout(() => { palette.style.display = 'none'; }, 220);
  }

  backdrop.addEventListener('click', close);

  // ── Keyboard trigger ───────────────────────────────────────────────────────
  document.addEventListener('keydown', e => {
    const tag = document.activeElement?.tagName;
    // ⌘K or Ctrl+K
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      palette.style.display === 'none' ? open() : close();
      return;
    }
    // '/' when not in an input
    if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA' && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      open();
      return;
    }
    if (e.key === 'Escape' && palette.classList.contains('open')) close();
  });

  // ── Search + render ────────────────────────────────────────────────────────
  let debounce = null;
  let focusIdx = -1;

  input.addEventListener('input', () => {
    clearTimeout(debounce);
    const q = input.value.trim();
    focusIdx = -1;
    if (!q) { renderActions(''); return; }
    debounce = setTimeout(() => fetchAndRender(q), 250);
  });

  input.addEventListener('keydown', e => {
    const items = [...resultsEl.querySelectorAll('.cmd-item')];
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusIdx = Math.min(focusIdx + 1, items.length - 1);
      items.forEach((el, i) => el.classList.toggle('focused', i === focusIdx));
      items[focusIdx]?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusIdx = Math.max(focusIdx - 1, 0);
      items.forEach((el, i) => el.classList.toggle('focused', i === focusIdx));
      items[focusIdx]?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusIdx >= 0 && items[focusIdx]) items[focusIdx].click();
      else if (items[0]) items[0].click();
    }
  });

  function renderActions(filter) {
    const filtered = filter
      ? ACTIONS.filter(a => a.label.toLowerCase().includes(filter.toLowerCase()))
      : ACTIONS;

    const header = filter ? '' : `<div class="cmd-section-label">Quick Actions</div>`;
    resultsEl.innerHTML = header + filtered.map((a, i) => `
      <div class="cmd-item" data-idx="${i}" role="option">
        <span class="cmd-item-icon">${a.icon}</span>
        <span class="cmd-item-label">${escHtml(a.label)}</span>
      </div>`).join('');

    resultsEl.querySelectorAll('.cmd-item').forEach((el, i) => {
      el.addEventListener('click', () => { filtered[i].action(); });
    });
  }

  async function fetchAndRender(q) {
    // Show matching actions first
    const matchedActions = ACTIONS.filter(a => a.label.toLowerCase().includes(q.toLowerCase()));

    try {
      const res    = await fetch(`${API}/search?query=${encodeURIComponent(q)}`);
      const movies = await res.json();

      const actionHtml = matchedActions.length ? `
        <div class="cmd-section-label">Actions</div>
        ${matchedActions.map((a, i) => `
          <div class="cmd-item cmd-action-item" data-action-idx="${i}" role="option">
            <span class="cmd-item-icon">${a.icon}</span>
            <span class="cmd-item-label">${escHtml(a.label)}</span>
          </div>`).join('')}` : '';

      const movieHtml = movies.length ? `
        <div class="cmd-section-label">Movies</div>
        ${movies.slice(0, 6).map(m => `
          <div class="cmd-item" data-movie-id="${m.id}" role="option">
            ${m.poster
              ? `<img class="cmd-item-poster" src="${m.poster}" alt="" loading="lazy">`
              : `<span class="cmd-item-icon">🎬</span>`}
            <div class="cmd-item-info">
              <span class="cmd-item-label">${escHtml(m.title)}</span>
              <span class="cmd-item-meta">${m.year || ''} · ${(m.genres || []).slice(0,2).join(', ')}</span>
            </div>
            ${m.vote_average ? `<span class="cmd-item-rating">★ ${m.vote_average}</span>` : ''}
          </div>`).join('')}` : '';

      resultsEl.innerHTML = actionHtml + movieHtml ||
        `<div class="cmd-empty">No results for "<strong>${escHtml(q)}</strong>"</div>`;

      // Wire action clicks
      resultsEl.querySelectorAll('.cmd-action-item').forEach(el => {
        const idx = parseInt(el.dataset.actionIdx);
        el.addEventListener('click', () => matchedActions[idx].action());
      });

      // Wire movie clicks → open modal
      resultsEl.querySelectorAll('[data-movie-id]').forEach(el => {
        el.addEventListener('click', () => {
          const m = movies.find(x => x.id === parseInt(el.dataset.movieId));
          if (m && typeof window.openModal === 'function') { close(); window.openModal(m); }
        });
      });

    } catch {
      renderActions(q);
    }
  }

  function escHtml(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // ── Expose ─────────────────────────────────────────────────────────────────
  window.openPalette = open;

  // Wire footer + header trigger buttons
  ['footerPaletteBtn'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', open);
  });

  // Wire "Tonight's Pick" footer button
  const footerQuickPickBtn = document.getElementById('footerQuickPickBtn');
  if (footerQuickPickBtn) {
    footerQuickPickBtn.addEventListener('click', () => {
      if (typeof window.openQuickPick === 'function') window.openQuickPick();
    });
  }

  // Wire footer view links
  document.querySelectorAll('.footer-link[data-view]').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  // Wire footer swipe button
  const footerSwipeBtn = document.getElementById('footerSwipeBtn');
  if (footerSwipeBtn) {
    footerSwipeBtn.addEventListener('click', () => {
      if (typeof window.openSwipeMode === 'function') window.openSwipeMode();
    });
  }

  // Wire footer vibe button
  const footerVibeBtn = document.getElementById('footerVibeBtn');
  if (footerVibeBtn) {
    footerVibeBtn.addEventListener('click', () => { switchView('recommend'); switchMode('vibe'); });
  }
})();
