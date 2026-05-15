const API_BASE = 'http://localhost:3001/api';

// Handle Alt+Shift+S keyboard shortcut — saves current tab silently
chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'save-link') return;

  const { token } = await chrome.storage.local.get('token');
  if (!token) return;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) return;

  try {
    const res = await fetch(`${API_BASE}/links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ url: tab.url }),
    });

    const color = res.ok ? '#22c55e' : '#ef4444';
    const text  = res.ok ? '✓' : '✗';

    await chrome.action.setBadgeText({ text, tabId: tab.id });
    await chrome.action.setBadgeBackgroundColor({ color, tabId: tab.id });
    setTimeout(() => chrome.action.setBadgeText({ text: '', tabId: tab.id }), 2000);
  } catch {
    // silent fail
  }
});
