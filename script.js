// ─── Background Image ────────────────────────────────────────────────────────

(function setBg() {
  const files = ['bg1.png', 'bg2.png', 'bg3.png'];
  const pick = files[Math.floor(Math.random() * files.length)];
  const img = new Image();
  img.onload = () => {
    document.body.style.backgroundImage = `url(Assets/s_source/${pick})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';
  };
  img.src = `Assets/s_source/${pick}`;
})();

// ─── 3D Tilt Effect ──────────────────────────────────────────────────────────

function initTilt(selector) {
  const cards = document.querySelectorAll(selector);
  if (!cards.length) return;
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rx = ((y - cy) / cy) * -6;
      const ry = ((x - cx) / cx) * 6;
      card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'rotateX(0deg) rotateY(0deg)';
    });
  });
}

// ─── Birthday Countdown ──────────────────────────────────────────────────────

const countdownEl = document.getElementById('dob-countdown');

function updateCountdown() {
  const now = new Date();
  const target = new Date(now.getFullYear(), 11, 18);
  if (now > target) target.setFullYear(now.getFullYear() + 1);
  const diff = target - now;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff / 3600000) % 24);
  const m = Math.floor((diff / 60000) % 60);
  const s = Math.floor((diff / 1000) % 60);
  if (countdownEl) countdownEl.textContent = `${d}d ${h}h ${m}m ${s}s until my birthday!`;
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
  initTilt('#template-grid .template-card');
}

renderTemplateTiles();

// ─── Projects (static) ───────────────────────────────────────────────────────

const projects = [
  { name: 'Modules', desc: 'A Collection Of Scripts I\'ve Used Or Made.', url: 'https://github.com/Celesth/Modules.git' },
  { name: 'RUSniper', desc: 'Python Script To Snipe/Generate Names :3', url: 'https://github.com/Celesth/Roblox-Username-Sniper.git' },
  { name: 'Stellarium', desc: 'A Project Mainly Focused On Useful, Trolling etc..', url: 'https://github.com/Celesth/Stellarium.git' },
  { name: 'Varveil', desc: 'Script to Download Video From Various Sources Using yt-dlp.', url: 'https://github.com/Celesth/Varveil.git', archived: true },
];

function renderProjects() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;
  grid.innerHTML = '';
  projects.forEach(p => {
    const card = document.createElement('a');
    card.href = p.url;
    card.target = '_blank';
    card.rel = 'noopener';
    card.className = 'tilt-card';
    card.innerHTML = `
      <h3>${p.name}${p.archived ? ' <span class="badge">Archived</span>' : ''}</h3>
      <p>${p.desc}</p>
      <span class="card-link">View on GitHub →</span>
    `;
    grid.appendChild(card);
  });
  initTilt('#projects-grid .tilt-card');
}

renderProjects();

// ─── GitHub Repos (live) ─────────────────────────────────────────────────────

const langColors = {
  JavaScript: '#f1e05a', Python: '#3572a5', Lua: '#000080', Luau: '#00A2FF',
  Shell: '#89e051', CSS: '#563d7c', HTML: '#e34c26', TypeScript: '#3178c6',
};

async function loadRepos() {
  const grid = document.getElementById('repo-grid');
  if (!grid) return;
  grid.innerHTML = '<p style="opacity:0.5;font-size:0.85rem">Loading repos...</p>';
  try {
    const res = await fetch('https://api.github.com/users/Celesth/repos?per_page=20&sort=updated');
    if (!res.ok) throw Error('fetch failed');
    const repos = await res.json();
    grid.innerHTML = '';
    repos.forEach(r => {
      const card = document.createElement('a');
      card.href = r.html_url;
      card.target = '_blank';
      card.rel = 'noopener';
      card.className = 'repo-card';
      const lang = r.language || 'N/A';
      const color = langColors[lang] || '#888';
      card.innerHTML = `
        <h3>${r.name}</h3>
        <p>${r.description || 'No description'}</p>
        <div class="repo-meta">
          <span><span class="repo-lang-dot" style="background:${color}"></span>${lang}</span>
          <span>★ ${r.stargazers_count}</span>
          ${r.fork ? '<span>Fork</span>' : ''}
        </div>
      `;
      grid.appendChild(card);
    });
    initTilt('.repo-card');
  } catch {
    grid.innerHTML = '<p style="opacity:0.5;font-size:0.85rem">Could not load repos</p>';
  }
}

loadRepos();

// ─── Discord Presence ────────────────────────────────────────────────────────

function getStatusClass(s) {
  switch ((s || '').toLowerCase()) {
    case 'online': return 'online';
    case 'idle': return 'idle';
    case 'dnd': return 'dnd';
    default: return 'offline';
  }
}

function resolveImage(act) {
  const li = act?.assets?.large_image;
  if (!li) return null;
  if (li.startsWith('http://') || li.startsWith('https://')) return li;
  if (li.startsWith('mp:')) {
    const r = li.slice(3);
    return (r.startsWith('/') ? 'https://media.discordapp.net' : 'https://media.discordapp.net/') + r;
  }
  if (act.application_id) return `https://cdn.discordapp.com/app-assets/${act.application_id}/${li}.png`;
  return null;
}

async function loadDiscord() {
  try {
    const res = await fetch('https://api.lanyard.rest/v1/users/744471023834890330');
    if (!res.ok) return;
    const d = await res.json();
    if (!d.success) return;
    const user = d.data.discord_user;
    const status = d.data.discord_status;
    const activities = d.data.activities || [];

    const av = document.getElementById('discord-avatar');
    if (av && user?.id && user?.avatar) av.src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`;

    const un = document.getElementById('discord-username');
    const st = document.getElementById('discord-status');
    if (un) {
      const dn = user?.global_name || user?.display_name || user?.username || 'Unknown';
      un.textContent = `${dn} (@${user?.username || 'unknown'})`;
    }
    if (st) st.textContent = `Status: ${(status || 'OFFLINE').toUpperCase()}`;

    const dot = document.getElementById('discord-status-dot');
    if (dot) dot.className = 'status-dot ' + getStatusClass(status);

    const con = document.getElementById('activities-container');
    if (!con) return;
    con.innerHTML = '';

    if (!activities.length) {
      const p = document.createElement('p');
      p.className = 'custom-status';
      p.textContent = 'No current activity';
      con.appendChild(p);
    } else {
      activities.forEach(act => {
        if (act.type === 4) {
          const c = document.createElement('div');
          c.className = 'custom-status';
          c.textContent = act.state || '';
          con.appendChild(c);
          return;
        }
        const card = document.createElement('div');
        card.className = 'activity-card';
        const img = document.createElement('img');
        img.src = resolveImage(act) || 'https://cdn.discordapp.com/embed/avatars/0.png';
        img.alt = act.name || '';
        img.loading = 'lazy';
        const info = document.createElement('div');
        info.className = 'activity-info';
        const t = document.createElement('h3');
        t.textContent = act.name || 'Unknown';
        info.appendChild(t);
        if (act.details) {
          const p = document.createElement('p');
          p.textContent = act.details;
          info.appendChild(p);
        }
        if (act.state) {
          const p = document.createElement('p');
          p.textContent = act.state;
          info.appendChild(p);
        }
        card.appendChild(img);
        card.appendChild(info);
        con.appendChild(card);
      });
    }
  } catch (e) {
    console.error('Discord error', e);
  }
}

loadDiscord();
setInterval(loadDiscord, 30000);
