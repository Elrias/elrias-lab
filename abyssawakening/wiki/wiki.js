const toggle = document.getElementById("themeToggle");

const savedTheme = localStorage.getItem("wikiTheme");

if (savedTheme) {
    document.body.className = savedTheme;
} else {
    document.body.className = "theme-light";
}

toggle.addEventListener("click", () => {
    if (document.body.classList.contains("theme-dark")) {
        document.body.className = "theme-light";
        localStorage.setItem("wikiTheme", "theme-light");
    } else {
        document.body.className = "theme-dark";
        localStorage.setItem("wikiTheme", "theme-dark");
    }
});s