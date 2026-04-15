const API_BASE = "https://abyssawakening-backend.onrender.com";
const BASE_PATH = "/elrias-lab/abyssawakening/";

const DEFAULT_AVATAR = BASE_PATH + "img/avatars/default.png";
const DEFAULT_ACHIEVEMENT_ICON = BASE_PATH + "img/achievements/default.png";
let ACTORS_DB = [];
let SKILLS_DB = [];
let WEAPONS_DB = [];
let ARMORS_DB = [];

fetch(`${BASE_PATH}data/Actors.json`)
  .then(r => r.json())
  .then(data => {
    ACTORS_DB = data.filter(Boolean);
  });

Promise.all([
  fetch(`${BASE_PATH}data/Skills.json`).then(r => r.json()),
  fetch(`${BASE_PATH}data/Weapons.json`).then(r => r.json()),
  fetch(`${BASE_PATH}data/Armors.json`).then(r => r.json())
]).then(([skills, weapons, armors]) => {
  SKILLS_DB = skills.filter(Boolean);
  WEAPONS_DB = weapons.filter(Boolean);
  ARMORS_DB = armors.filter(Boolean);
});

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

function findByName(name, db) {
  return db.find(e => 
    e.name.toLowerCase().trim() === name.toLowerCase().trim()
  );
}

function getEquipmentData(name) {
  return (
    findByName(name, WEAPONS_DB) ||
    findByName(name, ARMORS_DB)
  );
}

function getSkillData(name) {
  return findByName(name, SKILLS_DB);
}

function getIconStyle(iconIndex) {
  const size = 32;
  const cols = 16;

  const x = -(iconIndex % cols) * size;
  const y = -Math.floor(iconIndex / cols) * size;

  return `
    background-image: url('${BASE_PATH}img/system/IconSet.png');
    background-position: ${x}px ${y}px;
    width: 32px;
    height: 32px;
    display: inline-block;
    vertical-align: middle;
    margin-right: 6px;
  `;
}

function getActorByName(name) {
  if (!name) return null;

  const actor = ACTORS_DB.find(a => a.name === name);

  if (!actor) {
    console.warn("Actor not found for name:", name);
  }

  return actor;
}

function getFaceStyleFromName(name) {
  const actor = getActorByName(name);

  if (!actor) return "";

  const faceName = actor.faceName;
  const faceIndex = actor.faceIndex;

  const scale = 0.5; // 50%

  const x = -(faceIndex % 4) * 144 * scale;
  const y = -Math.floor(faceIndex / 4) * 144 * scale;

  return `
    background-image: url('${BASE_PATH}img/faces/${faceName}.png');
    background-size: ${576 * scale}px ${288 * scale}px;
    background-position: ${x}px ${y}px;
    background-repeat: no-repeat;
  `;
}

function getFaceStyle(faceName, faceIndex) {
  const x = -(faceIndex % 4) * 144;
  const y = -Math.floor(faceIndex / 4) * 144;

  return `
    background-image: url('${BASE_PATH}img/faces/${faceName}.png');
    background-position: ${x}px ${y}px;
  `;
}

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
  
  console.log("FULL DATA:", data);
  console.log("MAIN CHARACTER:", data.mainCharacter);
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
  if (data.user.active_title && !titles.includes(data.user.active_title)) {
    titles.push(data.user.active_title);
  }

  // remplir dropdown
  select.innerHTML = "";

  titles
  .filter(Boolean)
  .forEach(title => {
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
      <h2>Current Party</h2>

      <div class="card">
        <div class="character-header">
          <div class="character-face" style="${getFaceStyleFromName(main.name)}"></div>

          <h3>${main.name} (Lvl ${main.level})</h3>
        </div>

        <div class="main-grid">
          <div>
            <p><strong>Skills:</strong></p>
            <ul>
              ${(main.skills || [])
                .filter(s => s !== "Weapon Mastery")
                  .map(s => {
                    const skill = getSkillData(s);

                    if (!skill) return `<li>${s}</li>`;

                    return `
                      <li>
                        <span style="${getIconStyle(skill.iconIndex)}"></span>
                        ${s}
                      </li>
                    `;
                  })
                .join("")}
            </ul>
          </div>

          <div>
            <p><strong>Equipment:</strong></p>
            <ul>
              ${(main.equipment || [])
                .map(e => {
                  const eq = getEquipmentData(e);

                  if (!eq) return `<li>${e}</li>`;

                  return `
                    <li>
                      <span style="${getIconStyle(eq.iconIndex)}"></span>
                      ${e}
                    </li>
                  `;
                }).join("")}
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  // =========================
  // PARTY
  // =========================
  const party = (data.party || []).slice(0, 3);

  document.getElementById("party-members").innerHTML = party
    .map(p => `
      <div class="card party-card">
        <div class="character-header">
          <div class="character-face" style="${getFaceStyleFromName(p.name)}"></div>

          <strong>${p.name} (Lvl ${p.level})</strong>
        </div>

        <p><strong>Equipment:</strong></p>
        <ul>
          ${(p.equipment || [])
            .map(e => {
              const eq = getEquipmentData(e);

              if (!eq) return `<li>${e}</li>`;

              return `
                <li>
                  <span style="${getIconStyle(eq.iconIndex)}"></span>
                  ${e}
                </li>
              `;
            })
            .join("")}
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
            <img src="${icon}" onerror="this.src='${DEFAULT_ACHIEVEMENT_ICON}'">

            <div class="achievement-info">
              <strong>${a.title}</strong>
              <p>${a.description}</p>
            </div>

            <div class="achievement-score">
              ${a.score} pts
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