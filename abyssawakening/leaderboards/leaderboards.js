const API_BASE = "https://abyssawakening-backend.onrender.com";

async function loadLeaderboard() {
  try {
    const res = await fetch(`${API_BASE}/leaderboards`);
    const data = await res.json();

    renderLeaderboard(data.players);

  } catch (err) {
    console.error(err);
  }
}

function renderLeaderboard(players) {
  const container = document.getElementById("leaderboard");

  container.innerHTML = players.map((p, index) => `
    <div class="leaderboard-row">
      
      <div class="rank">#${index + 1}</div>

      <img class="avatar" src="${p.avatar_url || "img/avatars/default.png"}">

      <div class="name">${p.username}</div>

      <div class="score">${p.score} pts</div>

    </div>
  `).join("");
}

document.addEventListener("DOMContentLoaded", loadLeaderboard);