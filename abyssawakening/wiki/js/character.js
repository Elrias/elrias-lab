async function loadCharacter() {
    const params = new URLSearchParams(window.location.search);
    const nameParam = params.get("name");
    if (!nameParam) return;

    const actors = await fetch("../../../data/Actors.json").then(r => r.json());
    const classes = await fetch("../../../data/Classes.json").then(r => r.json());
    const skills = await fetch("../../../data/Skills.json").then(r => r.json());
    const system = await fetch("../../../data/System.json").then(r => r.json());

    const actor = actors.find(a =>
        a && a.name.toLowerCase().replace(/\s+/g, "-") === nameParam
    );

    if (!actor) return;

    const classData = classes[actor.classId];
    const className = classData.name;

    // Ignore Mercenary for now
    if (className === "Mercenary") return;

    // Type mapping
    const classTypeMap = {
        "Knight": "Physical",
        "Priest": "Magical",
        "Sorceress": "Magical",
        "Dark Knight": "Hybrid",
        "Paladin": "Hybrid",
        "Whisperer": "Magical",
        "Alchemist": "Hybrid",
        "Magical Girl": "Hybrid",
        "Ranger": "Magical",
        "Occultist": "Magical",
        "Samurai": "Physical",
        "Berserker": "Physical",
        "Rogue": "Physical",
        "Dancer": "Physical"
    };

    const classType = classTypeMap[className] || "Unknown";

    // Weapon type
    const weaponTypeId = classData.equipWeaponTypes[0];
    const weaponType = system.weaponTypes[weaponTypeId];

    // Face positioning
    const x = -(actor.faceIndex % 4) * 144;
    const y = -Math.floor(actor.faceIndex / 4) * 144;

    // Stats table
    const paramNames = ["HP","MP","ATK","DEF","MAT","MDF","AGI","LUK"];
    let statRows = "";

    for (let i = 0; i < 8; i++) {
        statRows += `
            <tr>
                <td>${paramNames[i]}</td>
                <td>${actor.params[i][1]}</td>
                <td>${actor.params[i][50]}</td>
            </tr>
        `;
    }

    statRows += `
        <tr>
            <td>Crit Rate</td>
            <td>5%</td>
            <td>5%</td>
        </tr>
    `;

    // Prefix system
    function getPrefix(name) {
        if (name === "Dark Knight") return "DK";
        if (name === "Magical Girl") return "MG";
        return name;
    }

    const prefix = getPrefix(className);
    const order = ["Passive","EX","S1","S2","S3","S4"];

    let skillsHTML = "";

    order.forEach(type => {
        const tag = `<${prefix}${type}>`;

        const skill = skills.find(s =>
            s && s.note && s.note.includes(tag)
        );

        if (skill) {
            skillsHTML += `
                <div class="skill-card">
                    <h3>${type} — ${skill.name}</h3>
                    <p>${skill.description}</p>
                </div>
            `;
        }
    });

    const container = document.getElementById("characterContent");

    container.innerHTML = `
        <div class="character-header-card">
            <div class="character-face"
                style="
                    background-image: url('../../../img/faces/${actor.faceName}.png');
                    background-position: ${x}px ${y}px;
                ">
            </div>
            <div class="character-header-info">
                <h1>${actor.name}</h1>
                <h2>${className}</h2>
                <p class="role">${actor.nickname}</p>
                <div class="meta">
                    <span>${classType}</span>
                    <span>${weaponType}</span>
                </div>
            </div>
        </div>

        <div class="stats-section">
            <h2>Base Stats</h2>
            <table class="stats-table">
                <tr>
                    <th>Param</th>
                    <th>Lv 1</th>
                    <th>Lv 50</th>
                </tr>
                ${statRows}
            </table>
        </div>

        <div class="skills-section">
            <h2>Skills</h2>
            ${skillsHTML}
        </div>
    `;
}

loadCharacter();