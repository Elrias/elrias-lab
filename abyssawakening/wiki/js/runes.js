let allRunes = [];

async function loadEquipments() {

    const armors = await fetch("../../data/Armors.json")
        .then(r => r.json());

    // ===== RUNES I / II / III =====
    allRunes = armors
        .filter(a =>
            a &&
            a.id >= 1 &&
            a.id <= 237 &&
            /( I| II| III)$/.test(a.name)
        )
        .sort((a, b) => a.name.localeCompare(b.name));

    renderRunes(allRunes);

    // ===== CHARACTER SPECIFIC =====
    const characterRunes = armors
        .filter(a =>
            a &&
            a.id >= 41 &&
            a.id <= 55
        )
        .sort((a, b) => a.name.localeCompare(b.name));

    renderCharacterRunes(characterRunes);

    // ===== SEARCH =====
    const searchInput = document.getElementById("runeSearch");

    searchInput.addEventListener("input", () => {
        const value = searchInput.value.toLowerCase();

        const filtered = allRunes.filter(r =>
            r.name.toLowerCase().includes(value)
        );

        renderRunes(filtered);
    });
}

function renderRunes(list) {

    const container = document.getElementById("runesList");

    container.innerHTML = list.map(armor => {

        const iconX = (armor.iconIndex % 16) * 32;
        const iconY = Math.floor(armor.iconIndex / 16) * 32;

        const description = cleanDescription(armor.description || armor.note || "");

        return `
            <div class="equipment-card">
                <div class="equipment-header">
                    <div class="equipment-icon"
                        style="
                            background-image: url('../../img/system/IconSet.png');
                            background-position: -${iconX}px -${iconY}px;
                        ">
                    </div>
                    <h3>${armor.name}</h3>
                </div>
                <p class="equipment-description">
                    ${description}
                </p>
            </div>
        `;
    }).join("");
}

function renderCharacterRunes(list) {

    const container = document.getElementById("characterRunesList");

    container.innerHTML = list.map(armor => {

        const iconX = (armor.iconIndex % 16) * 32;
        const iconY = Math.floor(armor.iconIndex / 16) * 32;

        const description = cleanDescription(armor.description || armor.note || "");

        return `
            <div class="equipment-card">
                <div class="equipment-header">
                    <div class="equipment-icon"
                        style="
                            background-image: url('../../img/system/IconSet.png');
                            background-position: -${iconX}px -${iconY}px;
                        ">
                    </div>
                    <h3>${armor.name}</h3>
                </div>
                <p class="equipment-description">
                    ${description}
                </p>
            </div>
        `;
    }).join("");
}

loadEquipments();