/* Grama Seva notification centre. Announcements are read from Flask /api/announcements. */
(() => {
  const bell = document.getElementById('notificationBell');
  const panel = document.getElementById('notificationPanel');
  const list = document.getElementById('notificationList');
  const count = document.getElementById('notificationCount');
  const enableButton = document.getElementById('enableNotifications');
  if (!bell || !panel || !list || !count) return;

  const SEEN_KEY = 'gramaSevaSeenAnnouncementIds';
  let announcements = [];
  const getSeen = () => { try { return JSON.parse(localStorage.getItem(SEEN_KEY) || '[]'); } catch (_) { return []; } };
  const setSeen = ids => localStorage.setItem(SEEN_KEY, JSON.stringify(ids));

  function render() {
    const seen = getSeen();
    const unread = announcements.filter(item => !seen.includes(item.id));
    count.textContent = unread.length > 9 ? '9+' : String(unread.length);
    count.hidden = unread.length === 0;
    if (!announcements.length) { list.innerHTML = '<p>No announcements yet.</p>'; return; }
    list.innerHTML = announcements.map(item =>
      `<a class="notification-item" href="${item.url || '/updates'}"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.message)} · ${escapeHtml(item.date || '')}</span></a>`
    ).join('');
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  }

  async function loadAnnouncements() {
    try {
      const response = await fetch('/api/announcements', { cache: 'no-store' });
      if (!response.ok) throw new Error('Could not load announcements');
      const latest = await response.json();
      if (!Array.isArray(latest)) return;
      const oldIds = new Set(announcements.map(item => item.id));
      const seenBefore = localStorage.getItem(SEEN_KEY) !== null;
      const newItems = latest.filter(item => !oldIds.has(item.id));
      announcements = latest;
      // First visit: show the current announcements in the panel without treating old items as new alerts.
      if (!seenBefore) setSeen(latest.map(item => item.id));
      render();
      if (seenBefore && newItems.length && 'Notification' in window && Notification.permission === 'granted') {
        newItems.forEach(item => new Notification(item.title, { body: item.message, tag: item.id }));
      }
    } catch (error) {
      list.innerHTML = '<p>Updates could not be loaded. Please refresh the page.</p>';
      console.error(error);
    }
  }

  bell.addEventListener('click', () => {
    panel.hidden = !panel.hidden;
    bell.setAttribute('aria-expanded', String(!panel.hidden));
    if (!panel.hidden) { setSeen(announcements.map(item => item.id)); render(); }
  });
  document.addEventListener('click', event => {
    if (!panel.contains(event.target) && !bell.contains(event.target)) { panel.hidden = true; bell.setAttribute('aria-expanded', 'false'); }
  });
  enableButton?.addEventListener('click', async () => {
    if (!('Notification' in window)) { alert('This browser does not support notifications.'); return; }
    const permission = await Notification.requestPermission();
    alert(permission === 'granted' ? 'Browser notifications enabled.' : 'Notification permission was not granted.');
  });
  loadAnnouncements();
  // Detect newly added announcements while a visitor has the site open.
  window.setInterval(loadAnnouncements, 60000);
})();
