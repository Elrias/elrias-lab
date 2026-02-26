document.addEventListener("DOMContentLoaded", initEnemyPage);

async function initEnemyPage() {

    const params = new URLSearchParams(window.location.search);
    const enemyName = params.get("name");

    if (!enemyName) return;

    const enemies = await fetch("../../../data/Enemies.json")
        .then(r => r.json());

    const enemy = enemies.find(e => e && e.name === enemyName);

    if (!enemy) {
        document.getElementById("enemyName").textContent = "Enemy not found";
        return;
    }

    renderEnemyHeader(enemy);
    renderParameters(enemy);
}

function renderEnemyHeader(enemy) {

    const nameEl = document.getElementById("enemyName");
    const imgEl = document.getElementById("enemyImage");

    nameEl.textContent = enemy.name;

    // RPG Maker MZ battlerName
    const battler = enemy.battlerName;

    imgEl.src = `../../../img/sv_enemies/${battler}.png`;

    imgEl.onerror = function() {
        this.onerror = null;
    };
}

function renderParameters(enemy) {

    const container = document.getElementById("enemyParams");
    container.innerHTML = "";

    const p = enemy.params;

    addParam("Max HP", p[0]);
    addParam("ATK", p[2]);
    addParam("MAT", p[4]);
    addParam("DEF", p[3]);
    addParam("MDF", p[5]);
    addParam("EXP", enemy.exp);

    // === SP (TPSphereCount) ===
    const spMatch = enemy.note.match(/<TPSphereCount:\s*(\d+)>/);

    if (spMatch) {
        const count = Number(spMatch[1]);

        if (count > 0) {

            const div = document.createElement("div");
            div.className = "param-line";

            const orbs = Array.from({length: count})
                .map(() => `<div class="sp-orb"></div>`)
                .join("");

            div.innerHTML = `
                <span>SP</span>
                <span class="sp-spheres">${orbs}</span>
            `;

            container.appendChild(div);
        }
    }

    function addParam(name, value) {
        const div = document.createElement("div");
        div.className = "param-line";
        div.innerHTML = `
            <span>${name}</span>
            <span>${value}</span>
        `;
        container.appendChild(div);
    }
}