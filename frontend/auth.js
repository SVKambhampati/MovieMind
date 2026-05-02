/* MovieMind — Auth module */

window.currentUser = null;

(function () {
  // ── DOM refs ─────────────────────────────────────────────────────────────
  const authModal       = document.getElementById('authModal');
  const authBackdrop    = document.getElementById('authBackdrop');
  const authClose       = document.getElementById('authClose');
  const headerAuthBtn   = document.getElementById('headerAuthBtn');
  const headerUserChip  = document.getElementById('headerUserChip');
  const headerAvatar    = document.getElementById('headerAvatar');
  const headerUsername  = document.getElementById('headerUsername');
  const logoutBtn       = document.getElementById('logoutBtn');

  const authTabSignIn   = document.getElementById('authTabSignIn');
  const authTabRegister = document.getElementById('authTabRegister');
  const formSignIn      = document.getElementById('formSignIn');
  const formRegister    = document.getElementById('formRegister');

  const signInEmail     = document.getElementById('signInEmail');
  const signInPassword  = document.getElementById('signInPassword');
  const signInError     = document.getElementById('signInError');
  const signInSubmit    = document.getElementById('signInSubmit');

  const regUsername     = document.getElementById('regUsername');
  const regEmail        = document.getElementById('regEmail');
  const regPassword     = document.getElementById('regPassword');
  const regError        = document.getElementById('regError');
  const regSubmit       = document.getElementById('regSubmit');

  // ── Tab switching ─────────────────────────────────────────────────────────
  function showTab(tab) {
    const isSignIn = tab === 'signin';
    authTabSignIn.classList.toggle('active', isSignIn);
    authTabRegister.classList.toggle('active', !isSignIn);
    formSignIn.style.display   = isSignIn ? '' : 'none';
    formRegister.style.display = isSignIn ? 'none' : '';
    signInError.textContent = '';
    regError.textContent = '';
  }

  authTabSignIn.addEventListener('click',   () => showTab('signin'));
  authTabRegister.addEventListener('click', () => showTab('register'));

  // ── Open / close modal ────────────────────────────────────────────────────
  function openAuthModal(tab) {
    showTab(tab || 'signin');
    authModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeAuthModal() {
    authModal.style.display = 'none';
    document.body.style.overflow = '';
    signInError.textContent = '';
    regError.textContent = '';
  }

  headerAuthBtn.addEventListener('click', () => openAuthModal('signin'));
  authClose.addEventListener('click', closeAuthModal);
  authBackdrop.addEventListener('click', closeAuthModal);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && authModal.style.display === 'flex') closeAuthModal();
  });

  // ── UI state ──────────────────────────────────────────────────────────────
  function updateHeaderUI(user) {
    if (user) {
      headerAuthBtn.style.display  = 'none';
      headerUserChip.style.display = 'flex';
      headerAvatar.textContent = user.username.charAt(0).toUpperCase();
      headerAvatar.style.background = user.avatar_color;
      headerUsername.textContent = user.username;
    } else {
      headerAuthBtn.style.display  = '';
      headerUserChip.style.display = 'none';
    }
  }

  function onAuthSuccess(user) {
    window.currentUser = user;
    updateHeaderUI(user);
    closeAuthModal();
    if (typeof window.profileRefresh === 'function') window.profileRefresh();
  }

  // ── Sign in ───────────────────────────────────────────────────────────────
  formSignIn.addEventListener('submit', async e => {
    e.preventDefault();
    signInError.textContent = '';
    signInSubmit.disabled = true;
    signInSubmit.textContent = 'Signing in…';

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email:    signInEmail.value.trim(),
          password: signInPassword.value,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        signInError.textContent = data.error || 'Sign in failed';
      } else {
        signInPassword.value = '';
        onAuthSuccess(data);
      }
    } catch {
      signInError.textContent = 'Network error. Please try again.';
    } finally {
      signInSubmit.disabled = false;
      signInSubmit.textContent = 'Sign In';
    }
  });

  // ── Register ──────────────────────────────────────────────────────────────
  formRegister.addEventListener('submit', async e => {
    e.preventDefault();
    regError.textContent = '';
    regSubmit.disabled = true;
    regSubmit.textContent = 'Creating account…';

    try {
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: regUsername.value.trim(),
          email:    regEmail.value.trim(),
          password: regPassword.value,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        regError.textContent = data.error || 'Registration failed';
      } else {
        regPassword.value = '';
        onAuthSuccess(data);
      }
    } catch {
      regError.textContent = 'Network error. Please try again.';
    } finally {
      regSubmit.disabled = false;
      regSubmit.textContent = 'Create Account';
    }
  });

  // ── Logout ────────────────────────────────────────────────────────────────
  logoutBtn.addEventListener('click', async () => {
    try {
      await fetch(`${API}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch { /* ignore */ }
    window.currentUser = null;
    updateHeaderUI(null);
    if (typeof window.profileHide === 'function') window.profileHide();
  });

  // ── Session check on load ─────────────────────────────────────────────────
  async function checkSession() {
    try {
      const res = await fetch(`${API}/auth/me`, { credentials: 'include' });
      if (res.ok) {
        const user = await res.json();
        window.currentUser = user;
        updateHeaderUI(user);
      }
    } catch { /* not logged in */ }
  }

  checkSession();
})();
