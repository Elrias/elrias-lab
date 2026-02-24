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
    let weaponType = "Unknown";
    const weaponTrait = classData.traits.find(t => t.code === 51);
    if (weaponTrait) {
        weaponType = system.weaponTypes[weaponTrait.dataId];
    }

    // Face positioning
    const x = -(actor.faceIndex % 4) * 144;
    const y = -Math.floor(actor.faceIndex / 4) * 144;

    // Stats table 
    const paramMap = [
    { name: "HP", index: 0 },
    { name: "ATK", index: 2 },
    { name: "MAT", index: 4 },
    { name: "AGI", index: 6 },
    { name: "LUK", index: 7 }
    ];
    let statRows = "";

    const lukLv1 = classData.params[7][1];
    const lukLv50 = classData.params[7][50];

    const critLv1 = 5 + Math.floor(lukLv1 / 20);
    const critLv50 = 5 + Math.floor(lukLv50 / 20);

    paramMap.forEach(param => {
        statRows += `
            <tr>
                <td>${param.name}</td>
                <td>${classData.params[param.index][1]}</td>
                <td>${classData.params[param.index][50]}</td>
                <td>${classData.params[param.index][99]}</td>
            </tr>
        `;
    });

    statRows += `
        <tr>
            <td>Crit Rate</td>
            <td>${critLv1}%</td>
            <td>${critLv50}%</td>
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
    <div class="character-top-layout">

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

                <div class="meta-simple">
                    <p><strong>Type:</strong> ${classType}</p>
                    <p><strong>Weapon:</strong> ${weaponType}</p>
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

    </div>

    <div class="skills-section">
        <h2>Skills</h2>
        ${skillsHTML}
    </div>
`;
}

loadCharacter();
console.log("Prefix:", prefix);
console.log("Skills:", skills.filter(s => s && s.note));