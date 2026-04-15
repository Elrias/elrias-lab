const API_BASE = "https://abyssawakening-backend.onrender.com";
const BASE_PATH = "/elrias-lab/abyssawakening/";

async function loadLeaderboard() {
  try {
    const res = await fetch(`${API_BASE}/leaderboards`);
    const data = await res.json();

    renderLeaderboard(data.players);

  } catch (err) {
    console.error(err);
  }
}

function goToProfile(username) {
  window.location.href = `${BASE_PATH}profile/?user=${username}`;
}

function renderLeaderboard(players) {
  const container = document.getElementById("leaderboard");

    container.innerHTML = players.map((p, index) => `
    <div 
        class="leaderboard-row rank-${index + 1}" 
        onclick="goToProfile('${p.username}')"
    >

        <div class="rank">#${index + 1}</div>

        <img 
        class="avatar rank-${index + 1}" 
        src="${p.avatar_url || BASE_PATH + "img/avatars/default.png"}"
        onerror="this.src='${BASE_PATH}img/avatars/default.png'"
        >

        <div class="name">${p.username}</div>

        <div class="score">${p.score} pts</div>

    </div>
    `).join("");
}

document.addEventListener("DOMContentLoaded", loadLeaderboard);