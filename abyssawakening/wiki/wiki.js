const toggle = document.getElementById("wikiMenuToggle");
const sidebar = document.getElementById("wikiSidebar");

if (toggle) {
    toggle.addEventListener("click", () => {
        sidebar.classList.toggle("open");
    });
}