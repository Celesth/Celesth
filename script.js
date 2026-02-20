// Birthday Countdown
const countdown = document.getElementById("dob-countdown");
const targetDate = new Date(new Date().getFullYear(), 11, 18);

function updateCountdown() {
  const now = new Date();
  if (now > targetDate) targetDate.setFullYear(now.getFullYear() + 1);

  const diff = targetDate - now;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  if (countdown) {
    countdown.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s until my birthday!`;
  }
}
setInterval(updateCountdown, 1000);
updateCountdown();

const templateItems = [
  { title: "Project Tile", body: "Name, summary, stack, and repo/demo links.", meta: "Use for upcoming projects" },
  { title: "Tool Tile", body: "Small utility concept with one quick objective.", meta: "Use for scripts and bots" },
  { title: "Blog/Note Tile", body: "Topic, short teaser, and read-more URL.", meta: "Use for future posts" },
  { title: "Now Playing Tile", body: "Game title, rank/progress, and current status.", meta: "Use for game updates" }
];

function renderTemplateTiles() {
  const templateGrid = document.getElementById("template-grid");
  if (!templateGrid) return;

  templateGrid.innerHTML = "";
  templateItems.forEach((item, index) => {
    const card = document.createElement("article");
    card.className = "template-card";

    if (index % 3 === 0) card.classList.add("tile-wide");

    card.innerHTML = `
      <h3>${item.title}</h3>
      <p>${item.body}</p>
      <span class="template-meta">${item.meta}</span>
    `;

    templateGrid.appendChild(card);
  });
}

function applyDynamicTiling() {
  document.querySelectorAll(".tile-grid").forEach((grid) => {
    [...grid.children].forEach((tile) => {
      const textSize = tile.textContent.trim().length;
      tile.classList.remove("tile-wide", "tile-tall");

      if (textSize > 80) tile.classList.add("tile-wide");
      if (textSize > 120) tile.classList.add("tile-tall");
    });
  });
}

// Map Discord presence status to CSS classes
function getStatusClass(status) {
  switch ((status || "").toLowerCase()) {
    case "online": return "status-online";
    case "idle": return "status-idle";
    case "dnd": return "status-dnd";
    default: return "status-offline";
  }
}

function resolveLargeImage(act) {
  const li = act?.assets?.large_image;
  if (!li) return null;
  if (li.startsWith("http://") || li.startsWith("https://")) return li;

  if (li.startsWith("mp:")) {
    const rest = li.slice(3);
    return rest.startsWith("/") ? `https://media.discordapp.net${rest}` : `https://media.discordapp.net/${rest}`;
  }

  if (act.application_id) {
    return `https://cdn.discordapp.com/app-assets/${act.application_id}/${li}.png`;
  }

  return null;
}

async function loadDiscordPresence() {
  try {
    const res = await fetch("https://api.lanyard.rest/v1/users/744471023834890330");
    const data = await res.json();
    if (!data.success) return;

    const user = data.data.discord_user;
    const status = data.data.discord_status;
    const activities = data.data.activities || [];

    const avatarEl = document.getElementById("discord-avatar");
    if (avatarEl && user && user.id && user.avatar) {
      avatarEl.src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`;
    }

    const usernameEl = document.getElementById("discord-username");
    const statusTextEl = document.getElementById("discord-status");

    if (usernameEl) {
      const display = user?.global_name || user?.display_name || user?.username || "Unknown";
      usernameEl.textContent = `${display} (@${user.username || "unknown"})`;
    }
    if (statusTextEl) {
      statusTextEl.textContent = "Status: " + (status || "OFFLINE").toUpperCase();
    }

    const dot = document.getElementById("discord-status-dot");
    if (dot) dot.className = "status-dot " + getStatusClass(status);

    const container = document.getElementById("activities-container");
    if (!container) return;
    container.innerHTML = "";

    if (activities.length === 0) {
      const p = document.createElement("p");
      p.className = "custom-status";
      p.textContent = "No current activity";
      container.appendChild(p);
    } else {
      activities.forEach((act) => {
        if (act.type === 4) {
          const custom = document.createElement("div");
          custom.className = "custom-status";
          custom.textContent = act.state || "";
          container.appendChild(custom);
          return;
        }

        const card = document.createElement("div");
        card.className = "activity-card";

        const img = document.createElement("img");
        img.src = resolveLargeImage(act) || "https://cdn.discordapp.com/embed/avatars/0.png";
        img.alt = act.name || "activity";

        const info = document.createElement("div");
        info.className = "activity-info";

        const title = document.createElement("h3");
        title.textContent = act.name || "Unknown";
        info.appendChild(title);

        if (act.details) {
          const d = document.createElement("p");
          d.textContent = act.details;
          info.appendChild(d);
        }

        if (act.state) {
          const s = document.createElement("p");
          s.textContent = act.state;
          info.appendChild(s);
        }

        const metaParts = [];
        if (act.session_id) metaParts.push(`Session: ${act.session_id}`);
        if (typeof act.type !== "undefined") metaParts.push(`Type: ${act.type}`);
        if (metaParts.length) {
          const meta = document.createElement("p");
          meta.style.opacity = "0.8";
          meta.style.fontSize = "0.75rem";
          meta.textContent = metaParts.join(" • ");
          info.appendChild(meta);
        }

        card.appendChild(img);
        card.appendChild(info);
        container.appendChild(card);
      });
    }

    applyDynamicTiling();
  } catch (e) {
    console.error("Failed to load Discord presence", e);
  }
}

renderTemplateTiles();
applyDynamicTiling();
loadDiscordPresence();
setInterval(loadDiscordPresence, 30000);
window.addEventListener("resize", applyDynamicTiling);
