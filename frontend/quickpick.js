/* MovieMind — "What to watch tonight" quick-pick */

(function () {
  const API = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5001/api' : '/api';

  const modal   = document.getElementById('quickPickModal');
  const body    = document.getElementById('quickPickBody');
  const closeBtn= document.getElementById('quickPickClose');
  const backdrop= document.getElementById('quickPickBackdrop');
  if (!modal) return;

  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  function close() {
    modal.classList.remove('qp-open');
    setTimeout(() => { modal.style.display = 'none'; }, 220);
  }

  // ── Step definitions ───────────────────────────────────────────────────────
  const STEPS = [
    {
      key: 'genre', title: 'What are you in the mood for?',
      options: [
        { label: 'Action',       emoji: '💥' },
        { label: 'Comedy',       emoji: '😂' },
        { label: 'Drama',        emoji: '🎭' },
        { label: 'Horror',       emoji: '👻' },
        { label: 'Sci-Fi',       emoji: '🚀' },
        { label: 'Romance',      emoji: '❤️' },
        { label: 'Thriller',     emoji: '🔪' },
        { label: 'Documentary',  emoji: '📽️' },
        { label: 'Animation',    emoji: '✨' },
        { label: 'Surprise me',  emoji: '🎲' },
      ],
    },
    {
      key: 'vibe', title: 'What\'s the vibe?',
      options: [
        { label: 'Feel-good',     emoji: '☀️' },
        { label: 'Intense',       emoji: '⚡' },
        { label: 'Thoughtful',    emoji: '🧠' },
        { label: 'Funny',         emoji: '🤣' },
        { label: 'Romantic',      emoji: '🌹' },
        { label: 'Mind-bending',  emoji: '🌀' },
        { label: 'Emotional',     emoji: '😭' },
        { label: 'Exciting',      emoji: '🔥' },
      ],
    },
    {
      key: 'runtime', title: 'How much time do you have?',
      options: [
        { label: 'Quick watch',  emoji: '⚡', value: 90  },
        { label: 'Standard',     emoji: '🎬', value: 120 },
        { label: 'Epic night',   emoji: '🌙', value: 999 },
      ],
    },
  ];

  let selections = {};
  let stepIdx    = 0;

  // ── Render a step ──────────────────────────────────────────────────────────
  function renderStep() {
    const step = STEPS[stepIdx];
    const progress = ((stepIdx) / STEPS.length) * 100;

    body.innerHTML = `
      <div class="qp-progress-wrap">
        <div class="qp-progress-bar" style="width:${progress}%"></div>
      </div>
      <div class="qp-step">
        <div class="qp-step-num">${stepIdx + 1} of ${STEPS.length}</div>
        <h2 class="qp-question">${escHtml(step.title)}</h2>
        <div class="qp-options">
          ${step.options.map(o => `
            <button class="qp-option" data-value="${escHtml(o.value || o.label)}">
              <span class="qp-option-emoji">${o.emoji}</span>
              <span class="qp-option-label">${escHtml(o.label)}</span>
            </button>`).join('')}
        </div>
      </div>`;

    body.querySelectorAll('.qp-option').forEach(btn => {
      btn.addEventListener('click', () => {
        selections[step.key] = btn.dataset.value;
        stepIdx++;
        if (stepIdx < STEPS.length) renderStep();
        else fetchPick();
      });
    });
  }

  // ── Fetch the perfect pick ─────────────────────────────────────────────────
  async function fetchPick() {
    body.innerHTML = `
      <div class="qp-loading">
        <div class="spinner"></div>
        <p>Claude is choosing your perfect film…</p>
      </div>`;

    try {
      const res  = await fetch(`${API}/quickpick`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          genre:       selections.genre || '',
          vibe:        selections.vibe || '',
          max_runtime: parseInt(selections.runtime) || 999,
        }),
      });
      const movie = await res.json();
      if (movie.error) throw new Error(movie.error);
      renderResult(movie);
    } catch {
      body.innerHTML = `
        <div class="qp-error">
          <p>Couldn't find a film. Try again!</p>
          <button class="qp-restart-btn" id="qpRestartErr">Start over</button>
        </div>`;
      document.getElementById('qpRestartErr')?.addEventListener('click', restart);
    }
  }

  // ── Render result ──────────────────────────────────────────────────────────
  function renderResult(movie) {
    body.innerHTML = `
      <div class="qp-result">
        ${movie.backdrop || movie.poster
          ? `<div class="qp-result-bg" style="background-image:url(${movie.backdrop || movie.poster})"></div>`
          : ''}
        <div class="qp-result-gradient"></div>
        <div class="qp-result-content">
          <div class="qp-result-eyebrow">✦ Tonight's Pick</div>
          <h2 class="qp-result-title">${escHtml(movie.title)}</h2>
          <div class="qp-result-meta">
            ${movie.year ? `<span>${movie.year}</span>` : ''}
            ${movie.vote_average ? `<span class="qp-rating">★ ${movie.vote_average}</span>` : ''}
            ${movie.runtime ? `<span>${movie.runtime} min</span>` : ''}
          </div>
          ${movie.reason ? `<p class="qp-result-reason">"${escHtml(movie.reason)}"</p>` : ''}
          <div class="qp-result-actions">
            <button class="qp-action-primary" id="qpAddBtn">+ Add to List</button>
            <button class="qp-action-secondary" id="qpInfoBtn">More Info</button>
            <button class="qp-action-ghost" id="qpRestartBtn">Try again →</button>
          </div>
        </div>
      </div>`;

    document.getElementById('qpAddBtn')?.addEventListener('click', () => {
      if (typeof window.addMovie === 'function') window.addMovie(movie);
      close();
    });
    document.getElementById('qpInfoBtn')?.addEventListener('click', () => {
      close();
      if (typeof window.openModal === 'function') window.openModal(movie);
    });
    document.getElementById('qpRestartBtn')?.addEventListener('click', restart);
  }

  function restart() { selections = {}; stepIdx = 0; renderStep(); }

  // ── Open ───────────────────────────────────────────────────────────────────
  function openQuickPick() {
    restart();
    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.classList.add('qp-open'));
  }

  function escHtml(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  window.openQuickPick = openQuickPick;
})();
