const token = localStorage.getItem("TOKEN");

fetch("https://ton-backend.onrender.com/profile", {
  headers: {
    Authorization: "Bearer " + token
  }
})
.then(res => res.json())
.then(renderProfile);

function renderProfile(data) {

  // HEADER
  document.getElementById("avatar").src = data.user.avatar || "/img/default.png";
  document.getElementById("username").textContent = data.user.username;
  document.getElementById("title").textContent = data.user.title || "";
  document.getElementById("score").textContent = data.user.score + " pts";

  // MAIN CHARACTER
  const main = data.mainCharacter;

  document.getElementById("main-character").innerHTML = `
    <div class="card">
      <h3>${main.name} (Lvl ${main.level})</h3>
      <p><strong>Skills:</strong> ${main.skills.join(", ")}</p>
      <p><strong>Equipment:</strong> ${main.equipment.join(", ")}</p>
    </div>
  `;

  // PARTY
  document.getElementById("party").innerHTML = data.party.map(p => `
    <div class="card">
      <strong>${p.name} (Lvl ${p.level})</strong>
      <div>${p.equipment.join(", ")}</div>
    </div>
  `).join("");

  // ACHIEVEMENTS
  document.getElementById("achievements").innerHTML = data.achievements.map(a => `
    <div class="achievement">
      <img src="${a.icon}" onerror="this.src='/img/achievements/default.png'">
      <div>
        <strong>${a.title}</strong>
        <p>${a.description}</p>
        <span>${a.score} pts</span>
      </div>
    </div>
  `).join("");
}