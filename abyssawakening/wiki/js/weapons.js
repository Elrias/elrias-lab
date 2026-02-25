let allWeapons = [];

async function loadWeapons() {

    const weapons = await fetch("../../../data/Weapons.json")
        .then(r => r.json());

    allWeapons = weapons
        .filter(w =>
            w &&
            w.note &&
            w.note.includes("<WikiWeapon>") &&
            !w.note.includes("<EmberheartSeries>")
        )
        .sort((a, b) => a.name.localeCompare(b.name));

    renderWeapons(allWeapons);

    const searchInput = document.getElementById("weaponSearch");

    searchInput.addEventListener("input", () => {
        const value = searchInput.value.toLowerCase();

        const filtered = allWeapons.filter(w =>
            w.name.toLowerCase().includes(value)
        );

        renderWeapons(filtered);
    });
}

function renderWeapons(list) {

    const container = document.getElementById("weaponsList");

    container.innerHTML = list.map(weapon => {

        const iconX = (weapon.iconIndex % 16) * 32;
        const iconY = Math.floor(weapon.iconIndex / 16) * 32;

        const description = cleanDescription(weapon.description || "");

        const params = weapon.params;

        return `
            <div class="wiki-card">

                <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
                    <div style="
                        width:32px;
                        height:32px;
                        background-image:url('../../../img/system/IconSet.png');
                        background-position:-${iconX}px -${iconY}px;
                        background-repeat:no-repeat;">
                    </div>
                    <h3>${weapon.name}</h3>
                </div>

                <p>${description}</p>

                <div class="weapon-params">
                    ${params[2] ? `<div><strong>ATK:</strong> ${params[2]}</div>` : ""}
                    ${params[3] ? `<div><strong>DEF:</strong> ${params[3]}</div>` : ""}
                    ${params[4] ? `<div><strong>MAT:</strong> ${params[4]}</div>` : ""}
                    ${params[5] ? `<div><strong>MDF:</strong> ${params[5]}</div>` : ""}
                    ${params[6] ? `<div><strong>AGI:</strong> ${params[6]}</div>` : ""}
                    ${params[7] ? `<div><strong>LUK:</strong> ${params[7]}</div>` : ""}
                </div>

            </div>
        `;
    }).join("");
}

function setupToggle() {

    const toggle = document.getElementById("basicWeaponsToggle");
    const section = document.getElementById("basicWeaponsSection");

    toggle.addEventListener("click", () => {

        section.classList.toggle("hidden");
        toggle.classList.toggle("active");

    });
}

setupToggle();
loadWeapons();