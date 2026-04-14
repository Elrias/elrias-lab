const API_BASE = "https://abyssawakening-backend.onrender.com";

// =========================
// ROUTING (FIXED)
// =========================
const path = window.location.pathname.split("/").filter(Boolean);

// Exemple GitHub Pages:
// /elrias-lab/abyssawakening/profile/Mercenary_1
// => ["elrias-lab","abyssawakening","profile","Mercenary_1"]

const profileIndex = path.indexOf("profile");

// /profile
if (profileIndex === -1 || profileIndex === path.length - 1) {
  loadPrivateProfile();
}
// /profile/username
else {
  const username = path[profileIndex + 1];
  loadPublicProfile(username);
}

// =========================
// PRIVATE PROFILE
// =========================
function loadPrivateProfile() {
  const token = localStorage.getItem("TOKEN");

  if (!token) {
    console.error("No token found");
    return;
  }

  fetch(`${API_BASE}/profile`, {
    headers: {
      Authorization: "Bearer " + token
    }
  })
  .then(handleResponse)
  .then(data => renderProfile(data, { isOwner: true }))
  .catch(handleError);
}

// =========================
// PUBLIC PROFILE
// =========================
function loadPublicProfile(username) {
  fetch(`${API_BASE}/profile/${username}`)
    .then(handleResponse)
    .then(data => renderProfile(data, { isOwner: false }))
    .catch(handleError);
}

// =========================
// RESPONSE HANDLER
// =========================
function handleResponse(res) {
  if (!res.ok) {
    throw new Error("HTTP " + res.status);
  }
  return res.json();
}

// =========================
// ERROR HANDLER
// =========================
function handleError(err) {
  console.error("Profile error:", err);

  document.body.innerHTML = `
    <div style="color:red; padding:20px;">
      Error loading profile<br>
      ${err.message}
    </div>
  `;
}

// =========================
// RENDER
// =========================
function renderProfile(data, options = {}) {
  const isOwner = options.isOwner;

  if (!data || !data.user) {
    console.error("Invalid data");
    return;
  }

  // HEADER
  document.getElementById("avatar").src =
    data.user.avatar || "/img/default.png";

  document.getElementById("username").textContent =
    data.user.username;

  document.getElementById("title").textContent =
    data.user.title || "";

  document.getElementById("score").textContent =
    data.user.score + " pts";

  // OWNER FEATURES
  if (isOwner) {
    document.getElementById("header").insertAdjacentHTML("beforeend", `
      <button onclick="copyProfileLink()">Copy profile link</button>
    `);
  }

  // MAIN CHARACTER
  const main = data.mainCharacter;

  if (main) {
    document.getElementById("main-character").innerHTML = `
      <div class="card">
        <h3>${main.name} (Lvl ${main.level})</h3>
        <p><strong>Skills:</strong> ${main.skills.join(", ")}</p>
        <p><strong>Equipment:</strong> ${main.equipment.join(", ")}</p>
      </div>
    `;
  }

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

// =========================
// SHARE BUTTON (FIXED)
// =========================
function copyProfileLink() {
  const username = document.getElementById("username").textContent;

  // IMPORTANT pour GitHub Pages
  const basePath = window.location.pathname.split("/profile")[0];

  const url = `${window.location.origin}${basePath}/profile/${username}`;

  navigator.clipboard.writeText(url);

  alert("Profile link copied!");
}