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