async function loadCharacters() {
    const actors = await fetch("../data/Actors.json").then(r => r.json());
    const classes = await fetch("../data/Classes.json").then(r => r.json());

    const container = document.getElementById("charactersGrid");

    actors.forEach(actor => {
        if (!actor) return;

        const className = classes[actor.classId]?.name || "Unknown";

        const slug = actor.name.toLowerCase().replace(/\s+/g, "-");

        const card = document.createElement("a");
        card.className = "character-card";
        card.href = `characters/${slug}.html`;

        card.innerHTML = `
            <h3>${actor.name}</h3>
            <p>${className}</p>
        `;

        container.appendChild(card);
    });
}

loadCharacters();