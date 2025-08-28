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

  countdown.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s until my birthday!`;
}
setInterval(updateCountdown, 1000);
updateCountdown();

// Discord Presence via Lanyard API
async function loadDiscordPresence() {
  try {
    const res = await fetch("https://api.lanyard.rest/v1/users/744471023834890330");
    const data = await res.json();
    if (!data.success) return;

    const user = data.data.discord_user;
    const status = data.data.discord_status;
    const activities = data.data.activities;

    // Avatar & Basic Info
    const avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`;
    document.getElementById("discord-avatar").src = avatarUrl;
    document.getElementById("discord-username").textContent = `${user.global_name} (@${user.username})`;
    document.getElementById("discord-status").textContent = "Status: " + status.toUpperCase();

    // Activities
    const container = document.getElementById("activities-container");
    container.innerHTML = "";

    if (activities.length === 0) {
      container.innerHTML = "<p>No current activity</p>";
    } else {
      activities.forEach(act => {
        // Custom status
        if (act.type === 4) {
          const custom = document.createElement("div");
          custom.className = "custom-status";
          custom.textContent = act.state || "";
          container.appendChild(custom);
          return;
        }

        // Normal Activity
        const card = document.createElement("div");
        card.className = "activity-card";

        let imgSrc = act.assets?.large_image 
          ? `https://cdn.discordapp.com/app-assets/${act.application_id}/${act.assets.large_image}.png`
          : "https://cdn.discordapp.com/embed/avatars/0.png";

        const img = document.createElement("img");
        img.src = imgSrc;

        const info = document.createElement("div");
        info.className = "activity-info";

        const title = document.createElement("h3");
        title.textContent = act.name || "Unknown Activity";

        const state = document.createElement("p");
        state.textContent = act.state ? `State: ${act.state}` : "";

        const details = document.createElement("p");
        details.textContent = act.details ? `Details: ${act.details}` : "";

        info.appendChild(title);
        if (state.textContent) info.appendChild(state);
        if (details.textContent) info.appendChild(details);

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
