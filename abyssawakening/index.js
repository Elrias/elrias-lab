// -------- Elements --------
const panel = document.getElementById("sidePanel");
const toggle = document.getElementById("menuToggle");
const menuIcon = document.getElementById("menuIcon");
const discordBtn = document.getElementById("discordBtn");
const menuLabel = document.getElementById("menuLabel");

const fsBtn = document.getElementById("fullscreenBtn");
const authCloseBtn = document.getElementById("authCloseBtn");

// Retirer le focus après clic (évite contours via clavier ensuite)
toggle?.addEventListener("pointerdown", () => toggle.blur());
fsBtn?.addEventListener("pointerdown", () => fsBtn.blur());
authCloseBtn?.addEventListener("pointerdown", () => authCloseBtn.blur());

// -------- Menu toggle state --------
function setToggleState(isOpen) {
  if (!toggle) return;
  toggle.setAttribute("aria-expanded", String(isOpen));
  if (menuIcon) menuIcon.textContent = isOpen ? "✕" : "☰";
  if (menuLabel) menuLabel.textContent = isOpen ? "Close" : "Menu";
}

function closeMenu() {
  panel?.classList.remove("open");
  setToggleState(false);
}

function openMenu() {
  panel?.classList.add("open");
  setToggleState(true);
}

toggle?.addEventListener("click", () => {
  if (!panel) return;
  panel.classList.contains("open") ? closeMenu() : openMenu();
});

// Bouton X dans le bloc Login
authCloseBtn?.addEventListener("click", closeMenu);

// état initial
setToggleState(false);

// -------- Fullscreen --------
function goFullscreen() {
  const elem = document.documentElement;
  if (elem.requestFullscreen) elem.requestFullscreen();
  else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
  else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
}
fsBtn?.addEventListener("click", goFullscreen);

function isFullscreen() {
  return !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    // F11 : souvent détectable via la taille de la fenêtre
    (window.innerHeight === screen.height && window.innerWidth === screen.width)
  );
}

function onFsChange() {
  const inFs = isFullscreen();

  // cacher fullscreen button et menu toggle en fullscreen
  if (fsBtn) fsBtn.style.display = inFs ? "none" : "block";
  if (toggle) toggle.style.display = inFs ? "none" : "inline-flex";

  // si on entre en fullscreen, fermer le menu
  if (inFs) closeMenu();
}
if (discordBtn) discordBtn.style.display = inFs ? "none" : "flex";
document.addEventListener("fullscreenchange", onFsChange);
document.addEventListener("webkitfullscreenchange", onFsChange);
window.addEventListener("resize", onFsChange);

// -------- Calcul des bandes noires --------
function computeSideSpace() {
  const canvas = document.querySelector("canvas");
  if (!canvas) return;

  const cw = canvas.getBoundingClientRect().width || 0;
  const ww = window.innerWidth || 0;

  const side = Math.max(0, Math.floor((ww - cw) / 2));
  document.documentElement.style.setProperty("--sideSpace", side + "px");

  if (side < 140) document.body.classList.add("overlay-menu");
  else document.body.classList.remove("overlay-menu");
}

// attendre que le canvas existe (créé après main.js)
const waitCanvas = setInterval(() => {
  const canvas = document.querySelector("canvas");
  if (canvas) {
    clearInterval(waitCanvas);
    computeSideSpace();
    window.addEventListener("resize", computeSideSpace);
  }
}, 100);

// appliquer l'état fullscreen au chargement
onFsChange();