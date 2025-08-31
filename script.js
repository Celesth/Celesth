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

// Map Discord presence status to CSS classes
function getStatusClass(status) {
  switch ((status || "").toLowerCase()) {
    case "online": return "status-online";
    case "idle": return "status-idle";
    case "dnd": return "status-dnd";
    default: return "status-offline";
  }
}

// Helper to resolve activity large image URL
function resolveLargeImage(act) {
  const li = act?.assets?.large_image;
  if (!li) return null;

  // If it's a full URL already
  if (li.startsWith("http://") || li.startsWith("https://")) return li;

  // mp: prefix (media proxy) -> convert to media.discordapp.net path
  if (li.startsWith("mp:")) {
    // slice off 'mp:' and ensure leading slash
    const rest = li.slice(3);
    return rest.startsWith("/") ? `https://media.discordapp.net${rest}` : `https://media.discordapp.net/${rest}`;
  }

  // fallback to app-assets (common for game assets)
  if (act.application_id) {
    return `https://cdn.discordapp.com/app-assets/${act.application_id}/${li}.png`;
  }

  return null;
}

// Discord Presence via Lanyard API
async function loadDiscordPresence() {
  try {
    const res = await fetch("https://api.lanyard.rest/v1/users/744471023834890330");
    const data = await res.json();
    if (!data.success) return;

    const user = data.data.discord_user;
    const status = data.data.discord_status;
    const activities = data.data.activities || [];

    // Avatar & Basic Info
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

    // Status Dot
    const dot = document.getElementById("discord-status-dot");
    if (dot) {
      dot.className = "status-dot " + getStatusClass(status);
    }

    // Activities rendering (name, type, state, session_id, details, assets.large_image)
    const container = document.getElementById("activities-container");
    if (!container) return;
    container.innerHTML = "";

    if (activities.length === 0) {
      const p = document.createElement("p");
      p.className = "custom-status";
      p.textContent = "No current activity";
      container.appendChild(p);
    } else {
      activities.forEach(act => {
        // custom status (type 4) -> show like small text
        if (act.type === 4) {
          const custom = document.createElement("div");
          custom.className = "custom-status";
          custom.textContent = act.state || "";
          container.appendChild(custom);
          return;
        }

        // Normal activity card
        const card = document.createElement("div");
        card.className = "activity-card";

        const img = document.createElement("img");
        const imgUrl = resolveLargeImage(act) || "https://cdn.discordapp.com/embed/avatars/0.png";
        img.src = imgUrl;
        img.alt = act.name || "activity";

        const info = document.createElement("div");
        info.className = "activity-info";

        // Top: activity name
        const title = document.createElement("h3");
        title.textContent = act.name || "Unknown";
        info.appendChild(title);

        // details (if present)
        if (act.details) {
          const d = document.createElement("p");
          d.textContent = act.details;
          info.appendChild(d);
        }

        // state (if present)
        if (act.state) {
          const s = document.createElement("p");
          s.textContent = act.state;
          info.appendChild(s);
        }

        // session_id & type (small)
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
  } catch (e) {
    console.error("Failed to load Discord presence", e);
  }
}

loadDiscordPresence();
setInterval(loadDiscordPresence, 30000);
