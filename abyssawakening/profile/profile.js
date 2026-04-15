const API_BASE = "https://abyssawakening-backend.onrender.com";
const BASE_PATH = "/elrias-lab/abyssawakening/";

const DEFAULT_AVATAR = BASE_PATH + "img/avatars/default.png";
const DEFAULT_ACHIEVEMENT_ICON = BASE_PATH + "img/achievements/default.png";

const ACHIEVEMENT_CONFIG = {
  DEFEAT_GREAT_RAGEWOLF: {
    icon: "msq",
    rarity: "bronze"
  },
  DEFEAT_SCORVYRM: {
    icon: "msq",
    rarity: "silver"
  },
  DEFEAT_BLAZEWING: {
    icon: "msq",
    rarity: "silver"
  },
  DEFEAT_NOCTYR: {
    icon: "msq",
    rarity: "silver"
  },
  DEFEAT_HOLLOW_SENTINEL: {
    icon: "msq",
    rarity: "gold"
  },
  DEFEAT_AUTOMATED_SENTRY: {
    icon: "msq",
    rarity: "gold"
  },
  DEFEAT_CORRUPTED_ALRIC: {
    icon: "msq",
    rarity: "gold"
  },
  DEFEAT_GIANT_SNAKE: {
    icon: "sq",
    rarity: "bronze"
  },
  DEFEAT_ORECLAD: {
    icon: "sq",
    rarity: "bronze"
  },
  DEFEAT_THUNDERWING: {
    icon: "sq",
    rarity: "silver"
  },
  DEFEAT_HYDROCARNUM: {
    icon: "sq",
    rarity: "bronze"
  },
  DEFEAT_GLACIAL_SERPENT: {
    icon: "sq",
    rarity: "bronze"
  },
  DEFEAT_LEVIATHAN: {
    icon: "sq",
    rarity: "silver"
  },
  DEFEAT_CRIMSON_DRAGON: {
    icon: "sq",
    rarity: "bronze"
  },
  DEFEAT_IFRIT: {
    icon: "sq",
    rarity: "bronze"
  },
  DEFEAT_EMBERHEART: {
    icon: "sq",
    rarity: "silver"
  },
  KILL_100: {
    icon: "battle",
    rarity: "bronze"
  },
  KILL_500: {
    icon: "battle",
    rarity: "silver"
  },
  KILL_1000: {
    icon: "battle",
    rarity: "gold"
  },
  HIRO_50: {
    icon: "character",
    rarity: "silver"
  },
  DAN_50: {
    icon: "character",
    rarity: "silver"
  },
  ERIKA_50: {
    icon: "character",
    rarity: "silver"
  },
  JASMINE_50: {
    icon: "character",
    rarity: "silver"
  },
  LESLIE_50: {
    icon: "character",
    rarity: "silver"
  },
  REYAN_50: {
    icon: "character",
    rarity: "silver"
  },
  EMI_50: {
    icon: "character",
    rarity: "silver"
  },
  KAI_50: {
    icon: "character",
    rarity: "silver"
  },
  VALERYA_50: {
    icon: "character",
    rarity: "silver"
  },
  LEO_50: {
    icon: "character",
    rarity: "silver"
  },
  GALAD_50: {
    icon: "character",
    rarity: "silver"
  },
  VALENTINE_50: {
    icon: "character",
    rarity: "silver"
  },
  SHELON_50: {
    icon: "character",
    rarity: "silver"
  },
  THYME_50: {
    icon: "character",
    rarity: "silver"
  },
  CLAW_50: {
    icon: "character",
    rarity: "silver"
  },
  GOLD_20000: {
    icon: "gold",
    rarity: "bronze"
  },
  GOLD_100000: {
    icon: "gold",
    rarity: "silver"
  },
  GOLD_500000: {
    icon: "gold",
    rarity: "gold"
  },
  PLAYTIME_600: {
    icon: "time",
    rarity: "bronze"
  },
  PLAYTIME_3000: {
    icon: "time",
    rarity: "silver"
  },
  PLAYTIME_6000: {
    icon: "time",
    rarity: "gold"
  },
  SPEED_THUNDERWING: {
    icon: "time",
    rarity: "gold"
  },
  SPEED_LEVIATHAN: {
    icon: "time",
    rarity: "gold"
  },
  SPEED_EMBERHEART: {
    icon: "time",
    rarity: "gold"
  },
  BURST_THUNDERWING: {
    icon: "burst",
    rarity: "gold"
  },
  BURST_LEVIATHAN: {
    icon: "burst",
    rarity: "gold"
  },
  BURST_EMBERHEART: {
    icon: "burst",
    rarity: "gold"
  },
  BACKUP_50: {
    icon: "backup",
    rarity: "bronze"
  },
  BACKUP_100: {
    icon: "backup",
    rarity: "silver"
  },
  BACKUP_500: {
    icon: "backup",
    rarity: "gold"
  },
  RECRUIT_1: {
    icon: "backup",
    rarity: "bronze"
  },
  RECRUIT_5: {
    icon: "backup",
    rarity: "silver"
  },
  RECRUIT_ALL: {
    icon: "backup",
    rarity: "gold"
  },
  WEAPON_EMBER_9: {
    icon: "battle",
    rarity: "silver"
  },
  WEAPON_EMBER_10: {
    icon: "battle",
    rarity: "gold"
  },
};

const TITLE_RULES = [
  {
    title: "Beast Slayer",
    achievements: ["KILL_1000"]
  },
  {
    title: "Ultimate Speedrunner",
    achievements: ["SPEED_THUNDERWING", "SPEED_LEVIATHAN", "SPEED_EMBERHEART"]
  },
  {
    title: "Maximum Firepower",
    achievements: ["WEAPON_EMBER_10"]
  },
  {
    title: "The Collector",
    achievements: ["RECRUIT_ALL"]
  },
  {
    title: "Master Supplier",
    achievements: ["BACKUP_500"]
  },
  {
    title: "Nuclear",
    achievements: ["BURST_THUNDERWING", "BURST_LEVIATHAN", "BURST_EMBERHEART"]
  },  
  {
    title: "Absolute Addict",
    achievements: ["PLAYTIME_6000"]
  },
  {
    title: "Golden Sovereign",
    achievements: ["GOLD_500000"]
  },
  {
    title: "One man army",
    achievements: ["HIRO_50", "DAN_50", "ERIKA_50", "JASMINE_50", "THYME_50", "SHELON_50", "EMI_50", "REYAN_50", "LESLIE_50", "KAI_50", "VALERYA_50", "CLAW_50", "VALENTINE_50", "GALAD_50", "LEO_50"]
  },
  {
    title: "Seasoned Adventurer",
    achievements: ["DEFEAT_EMBERHEART"]
  },
  {
    title: "The Green Devil",
    achievements: ["DEFEAT_CORRUPTED_ALRIC"]
  },
];

function getUnlockedTitles(achievements) {
  const unlocked = ["Rookie"];

  const userAchievementIds = achievements.map(a => a.achievement_id);

  TITLE_RULES.forEach(rule => {
    const hasAll = rule.achievements.every(id =>
      userAchievementIds.includes(id)
    );

    if (hasAll && !unlocked.includes(rule.title)) {
      unlocked.push(rule.title);
    }
  });

  return unlocked;
}

function getAchievementIcon(achievementId) {
  const config = ACHIEVEMENT_CONFIG[achievementId];

  if (!config) {
    console.warn("Missing config for", achievementId);
    return `${BASE_PATH}img/achievements/default.png`;
  }

  return `${BASE_PATH}img/achievements/${config.rarity}_${config.icon}.png`;
}

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

  console.log("MAIN:", data.mainCharacter);
  console.log("PARTY:", data.party);

  // HEADER
  const avatarImg = document.getElementById("avatar");

  avatarImg.src = data.user.avatar || DEFAULT_AVATAR;

  avatarImg.onerror = () => {
    avatarImg.src = DEFAULT_AVATAR;
  };

  document.getElementById("username").textContent =
    data.user.username;

  const titleSpan = document.getElementById("active-title");
  const select = document.getElementById("title-select");

  // titre actuel
  titleSpan.textContent = data.user.active_title || "Rookie";

  // titres débloqués
  const titles = getUnlockedTitles(data.achievements);

  // sécurité : ajouter le titre actif même si pas dans les règles
  if (!titles.includes(data.user.active_title)) {
    titles.push(data.user.active_title);
  }

  // remplir dropdown
  select.innerHTML = "";

  titles.forEach(title => {
    const option = document.createElement("option");
    option.value = title;
    option.textContent = title;

    if (title === data.user.active_title) {
      option.selected = true;
    }

    select.appendChild(option);
  });

  select.onchange = () => {
    const newTitle = select.value;

    titleSpan.textContent = newTitle;

    // TODO backend
    console.log("New title:", newTitle);
  };

  if (!isOwner) {
    select.style.display = "none";
  }

  document.getElementById("score").textContent =
    "Achievements score :  " + data.user.score + " pts";

  // OWNER BUTTON
  if (isOwner) {
    document.getElementById("header").insertAdjacentHTML("beforeend", `
      <button class="icon-btn" onclick="copyProfileLink()">🔗</button>
    `);
  }

  if (isOwner) {
    const btn = document.getElementById("edit-username-btn");

    btn.onclick = () => {
      const newName = prompt("Enter new username:");

      if (!newName) return;

      // TODO: envoyer au backend plus tard
      document.getElementById("username").textContent = newName;
    };
  } else {
    document.getElementById("edit-username-btn").style.display = "none";
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
  const party = (data.party || []).slice(0, 3);

  document.getElementById("party").innerHTML = party
    .map(p => `
      <div class="card">
        <strong>${p.name} (Lvl ${p.level})</strong>

        <div><strong>Equipment:</strong></div>
        <ul>
          ${(p.equipment || []).map(e => `<li>${e}</li>`).join("")}
        </ul>
      </div>
    `)
    .join("");

  // =========================
  // ACHIEVEMENTS
  // =========================
  document.getElementById("achievements").innerHTML =
    (data.achievements || [])
      .map(a => {
        const achievementId = a.achievement_id || a.id;

        const icon = getAchievementIcon(achievementId);

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