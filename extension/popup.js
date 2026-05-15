const API_BASE = 'https://trace-87d0.onrender.com/api';

const loginView = document.getElementById('login-view');
const saveView  = document.getElementById('save-view');
const errorEl   = document.getElementById('error');
const statusEl  = document.getElementById('status');
const urlEl     = document.getElementById('current-url');

async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function saveLink(token, url) {
  const res = await fetch(`${API_BASE}/links`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Save failed');
  }
  return res.json();
}

function showSaveView(token) {
  loginView.style.display = 'none';
  saveView.style.display  = 'block';

  getCurrentTab().then(tab => {
    urlEl.textContent = tab?.url || '';

    document.getElementById('save-btn').addEventListener('click', async () => {
      const btn = document.getElementById('save-btn');
      btn.disabled = true;
      btn.textContent = 'Saving…';
      statusEl.className = '';
      statusEl.textContent = '';

      try {
        await saveLink(token, tab.url);
        statusEl.textContent = '✓ Saved!';
        statusEl.className = 'success';
        btn.textContent = 'Saved';
      } catch (err) {
        statusEl.textContent = err.message;
        statusEl.className = 'error-msg';
        btn.disabled = false;
        btn.textContent = 'Save this page';
      }
    });
  });

  document.getElementById('logout-btn').addEventListener('click', () => {
    chrome.storage.local.remove('token', () => {
      saveView.style.display  = 'none';
      loginView.style.display = 'block';
    });
  });
}

// Boot: check for stored token
chrome.storage.local.get('token', ({ token }) => {
  if (token) {
    showSaveView(token);
  } else {
    loginView.style.display = 'block';
  }
});

// Login form
document.getElementById('login-btn').addEventListener('click', async () => {
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const btn      = document.getElementById('login-btn');

  if (!email || !password) {
    errorEl.textContent = 'Enter email and password.';
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Signing in…';
  errorEl.textContent = '';

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');

    chrome.storage.local.set({ token: data.token }, () => showSaveView(data.token));
  } catch (err) {
    errorEl.textContent = err.message;
    btn.disabled = false;
    btn.textContent = 'Sign in';
  }
});
