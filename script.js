// ─── Background Image (random bg*.png from /Assets/s_source/) ───────────────

(function setBg() {
  const files = ['bg1.png', 'bg2.png', 'bg3.png'];
  const pick = files[Math.floor(Math.random() * files.length)];
  const img = new Image();
  img.onload = () => {
    document.body.style.backgroundImage = `url(Assets/s_source/${pick})`;
  };
  img.src = `Assets/s_source/${pick}`;
})();

// ─── Birthday Countdown ──────────────────────────────────────────────────────

const countdownEl = document.getElementById('dob-countdown');

function updateCountdown() {
  const now = new Date();
  const target = new Date(now.getFullYear(), 11, 18);
  if (now > target) target.setFullYear(now.getFullYear() + 1);

  const diff = target - now;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);

  if (countdownEl) {
    countdownEl.textContent = `${days}d ${hours}h ${mins}m ${secs}s until my birthday!`;
  }
}

setInterval(updateCountdown, 1000);
updateCountdown();

// ─── Template Tiles ──────────────────────────────────────────────────────────

const templateItems = [
  { title: '0x01', body: 'dhauhdiqd', meta: 'daid' },
  { title: 'Tool Tile', body: 'god saves queen', meta: '-x2' },
  { title: '0x02', body: 'oh my days', meta: '-1x' },
  { title: '0x03', body: '-0x', meta: 'let template remain the same' },
];

function renderTemplateTiles() {
  const grid = document.getElementById('template-grid');
  if (!grid) return;
  grid.innerHTML = '';

  templateItems.forEach((item, i) => {
    const card = document.createElement('article');
    card.className = 'template-card' + (i % 3 === 0 ? ' tile-wide' : '');
    card.innerHTML = `
      <h3>${item.title}</h3>
      <p>${item.body}</p>
      <span class="template-meta">${item.meta}</span>
    `;
    grid.appendChild(card);
  });
}

renderTemplateTiles();

// ─── Discord Presence ────────────────────────────────────────────────────────

function getStatusClass(status) {
  switch ((status || '').toLowerCase()) {
    case 'online':  return 'status-online';
    case 'idle':    return 'status-idle';
    case 'dnd':     return 'status-dnd';
    default:        return 'status-offline';
  }
}

function resolveLargeImage(act) {
  const li = act?.assets?.large_image;
  if (!li) return null;
  if (li.startsWith('http://') || li.startsWith('https://')) return li;

  if (li.startsWith('mp:')) {
    const rest = li.slice(3);
    return rest.startsWith('/')
      ? `https://media.discordapp.net${rest}`
      : `https://media.discordapp.net/${rest}`;
  }

  if (act.application_id) {
    return `https://cdn.discordapp.com/app-assets/${act.application_id}/${li}.png`;
  }

  return null;
}

async function loadDiscordPresence() {
  try {
    const res = await fetch('https://api.lanyard.rest/v1/users/744471023834890330');
    if (!res.ok) return;
    const data = await res.json();
    if (!data.success) return;

    const user = data.data.discord_user;
    const status = data.data.discord_status;
    const activities = data.data.activities || [];

    const avatarEl = document.getElementById('discord-avatar');
    if (avatarEl && user?.id && user?.avatar) {
      avatarEl.src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`;
    }

    const usernameEl = document.getElementById('discord-username');
    const statusTextEl = document.getElementById('discord-status');

    if (usernameEl) {
      const display = user?.global_name || user?.display_name || user?.username || 'Unknown';
      usernameEl.textContent = `${display} (@${user?.username || 'unknown'})`;
    }

    if (statusTextEl) {
      statusTextEl.textContent = `Status: ${(status || 'OFFLINE').toUpperCase()}`;
    }

    const dot = document.getElementById('discord-status-dot');
    if (dot) dot.className = 'status-dot ' + getStatusClass(status);

    const container = document.getElementById('activities-container');
    if (!container) return;
    container.innerHTML = '';

    if (activities.length === 0) {
      const p = document.createElement('p');
      p.className = 'custom-status';
      p.textContent = 'No current activity';
      container.appendChild(p);
    } else {
      activities.forEach((act) => {
        if (act.type === 4) {
          const custom = document.createElement('div');
          custom.className = 'custom-status';
          custom.textContent = act.state || '';
          container.appendChild(custom);
          return;
        }

        const card = document.createElement('div');
        card.className = 'activity-card';

        const img = document.createElement('img');
        img.src = resolveLargeImage(act) || 'https://cdn.discordapp.com/embed/avatars/0.png';
        img.alt = act.name || 'activity';
        img.loading = 'lazy';

        const info = document.createElement('div');
        info.className = 'activity-info';

        const title = document.createElement('h3');
        title.textContent = act.name || 'Unknown';
        info.appendChild(title);

        if (act.details) {
          const d = document.createElement('p');
          d.textContent = act.details;
          info.appendChild(d);
        }

        if (act.state) {
          const s = document.createElement('p');
          s.textContent = act.state;
          info.appendChild(s);
        }

        card.appendChild(img);
        card.appendChild(info);
        container.appendChild(card);
      });
    }
  } catch (e) {
    console.error('Failed to load Discord presence', e);
  }
}

loadDiscordPresence();
setInterval(loadDiscordPresence, 30000);
