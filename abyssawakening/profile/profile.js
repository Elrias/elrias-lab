const API_BASE = "https://abyssawakening-backend.onrender.com";
const BASE_PATH = "/elrias-lab/abyssawakening/";

const DEFAULT_AVATAR = BASE_PATH + "img/avatars/default.png";
const DEFAULT_ACHIEVEMENT_ICON = BASE_PATH + "img/achievements/default.png";

// =========================
// ROUTING (CLEAN)
// =========================
const params = new URLSearchParams(window.location.search);
const username = params.get("user");

if (username) {
  loadPublicProfile(username);
} else {
  loadPrivateProfile();
}

// =========================
// PRIVATE PROFILE
// =========================
function loadPrivateProfile() {
  const token = localStorage.getItem("cloudsave_token")

  if (!token) {
    console.warn("No token found (not logged in)");
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
// RENDER PROFILE
// =========================
function renderProfile(data, { isOwner }) {
  if (!data || !data.user) {
    console.error("Invalid profile data");
    return;
  }

  // HEADER
  const avatarImg = document.getElementById("avatar");

  avatarImg.src = data.user.avatar || DEFAULT_AVATAR;

  avatarImg.onerror = () => {
    avatarImg.src = DEFAULT_AVATAR;
  };

  document.getElementById("username").textContent =
    data.user.username;

  document.getElementById("title").textContent =
    data.user.title || "";

  document.getElementById("score").textContent =
    data.user.score + " pts";

  // OWNER BUTTON
  if (isOwner) {
    document.getElementById("header").insertAdjacentHTML("beforeend", `
      <button onclick="copyProfileLink()">Copy profile link</button>
    `);
  }

  // =========================
  // MAIN CHARACTER
  // =========================
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

  // =========================
  // PARTY
  // =========================
  document.getElementById("party").innerHTML = (data.party || [])
    .map(p => `
      <div class="card">
        <strong>${p.name} (Lvl ${p.level})</strong>
        <div>${p.equipment.join(", ")}</div>
      </div>
    `)
    .join("");

  // =========================
  // ACHIEVEMENTS
  // =========================
  document.getElementById("achievements").innerHTML =
    (data.achievements || [])
      .map(a => {
        const icon = a.icon || DEFAULT_ACHIEVEMENT_ICON;

        return `
          <div class="achievement">
            <img src="${icon}" 
                onerror="this.src='${DEFAULT_ACHIEVEMENT_ICON}'">
            <div>
              <strong>${a.title}</strong>
              <p>${a.description}</p>
              <span>${a.score} pts</span>
            </div>
          </div>
        `;
      })
      .join("");
}

// =========================
// COPY PROFILE LINK
// =========================
function copyProfileLink() {
  const username = document.getElementById("username").textContent;

  const url = `${window.location.origin}${BASE_PATH}/profile/?user=${username}`;

  navigator.clipboard.writeText(url);
  alert("Profile link copied!");
}