document.addEventListener("DOMContentLoaded", loadGlyphSkills);

async function loadGlyphSkills() {
    const response = await fetch("../../../data/Skills.json");
    const skills = await response.json();

    const list = document.getElementById("glyphSkillList");

    const filtered = skills
        .filter(skill =>
            skill &&
            skill.note &&
            skill.note.includes("<GlyphSkill>")
        )
        .sort((a, b) => a.name.localeCompare(b.name));

    renderGlyphSkills(filtered);
}

function renderGlyphSkills(skills) {
    const list = document.getElementById("glyphSkillList");
    list.innerHTML = "";

    skills.forEach(skill => {
        const card = document.createElement("div");
        card.classList.add("wiki-card");

        card.innerHTML = `
            <div class="card-header">
                <img src="../../../img/icons/${getIconName(skill.iconIndex)}.png" class="skill-icon">
                <h3>${skill.name}</h3>
            </div>
            <p>${cleanDescription(skill.description)}</p>
        `;

        list.appendChild(card);
    });
}

/* Même fonction que characters.js */
function cleanDescription(text) {
    if (!text) return "";
    return text.replace(/\\C\[\d+\]/g, "")
               .replace(/\\I\[\d+\]/g, "")
               .replace(/\\{|\}/g, "");
}

/* Adapter selon ton système d’icônes */
function getIconName(index) {
    return index; // si tu utilises iconIndex direct
}