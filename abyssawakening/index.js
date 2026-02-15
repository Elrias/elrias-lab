// -------- Constants --------
const API_BASE = "https://abyssawakening-backend.onrender.com";
const TOKEN_KEY = "cloudsave_token";
const FLASH_KEY = "flash_message";

// -------- Elements --------
const panel = document.getElementById("sidePanel");
const toggle = document.getElementById("menuToggle");
const menuIcon = document.getElementById("menuIcon");
const menuLabel = document.getElementById("menuLabel");
const discordBtn = document.getElementById("discordBtn");

const fsBtn = document.getElementById("fullscreenBtn");

// Auth UI
const authTitle = document.getElementById("authTitle");
const authForm = document.getElementById("authForm");
const emailEl = document.getElementById("authEmail");
const passEl = document.getElementById("authPassword");
const submitBtn = document.getElementById("authSubmitBtn");
const logoutBtn = document.getElementById("authLogoutBtn");
const toggleModeBtn = document.getElementById("authToggleModeBtn");
const forgotBtn = document.getElementById("authForgotBtn");
const authLinksRow = document.getElementById("authLinksRow");

// Retirer le focus après clic (évite contours via clavier ensuite)
toggle?.addEventListener("pointerdown", () => toggle.blur());
fsBtn?.addEventListener("pointerdown", () => fsBtn.blur());

// Empêche le form de submit (Enter) => on gère nous-même
authForm?.addEventListener("submit", (e) => e.preventDefault());

// -------- Flash message after reload --------
(function showFlash() {
  const msg = sessionStorage.getItem(FLASH_KEY);
  if (!msg) return;
  sessionStorage.removeItem(FLASH_KEY);
  alert(msg);
})();

function flash(msg) {
  sessionStorage.setItem(FLASH_KEY, msg);
}

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
  if (discordBtn) discordBtn.style.display = inFs ? "none" : "inline-flex";

  // si on entre en fullscreen, fermer le menu
  if (inFs) closeMenu();
}
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

// -------- Auth helpers --------
function getToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}
function isLoggedIn() {
  return !!getToken();
}

async function api(path, { method = "GET", body = null } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(API_BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "api_error");
  return data;
}

// -------- Auth UI state --------
let mode = "login"; // "login" | "register"

function setMode(nextMode) {
  mode = nextMode;

  const logged = isLoggedIn();
  if (logged) return; // mode inutile si connecté

  if (authTitle) authTitle.textContent = mode === "login" ? "Login" : "Register";
  if (submitBtn) submitBtn.textContent = mode === "login" ? "Login" : "Create account";
  if (toggleModeBtn) toggleModeBtn.textContent = mode === "login" ? "Register" : "Login instead";
}

function updateAuthUI() {
  const logged = isLoggedIn();

  if (authTitle) authTitle.textContent = logged ? "Account" : (mode === "login" ? "Login" : "Register");
  if (submitBtn) submitBtn.style.display = logged ? "none" : "inline-flex";
  if (logoutBtn) logoutBtn.style.display = logged ? "inline-flex" : "none";

  // cache les liens register/forgot quand connecté
  if (authLinksRow) authLinksRow.style.display = logged ? "none" : "flex";

  // petit confort: si connecté, on vide les champs
  if (logged) {
    if (emailEl) emailEl.value = "";
    if (passEl) passEl.value = "";
  }
}

// Toggle mode login/register
toggleModeBtn?.addEventListener("click", () => {
  if (isLoggedIn()) return;
  setMode(mode === "login" ? "register" : "login");
});

// Forgot password (V1: non implémenté)
forgotBtn?.addEventListener("click", () => {
  alert("V1: Forgot password is not implemented yet.");
});

// Login/Register submit
submitBtn?.addEventListener("click", async () => {
  const email = (emailEl?.value || "").trim().toLowerCase();
  const password = (passEl?.value || "").trim();

  if (!email || !password) {
    alert("Please enter email and password.");
    return;
  }

  try {
    const route = mode === "login" ? "/auth/login" : "/auth/register";
    const data = await api(route, { method: "POST", body: { email, password } });

    localStorage.setItem(TOKEN_KEY, data.token);

    flash("Logged in. Syncing cloud saves and restarting the game…");
    location.reload();
  } catch (err) {
    const msg = (err && err.message) ? err.message : "unknown_error";
    // messages possibles: email_taken, invalid_credentials, bad_input...
    alert("Authentication failed: " + msg);
  }
});

// Logout
logoutBtn?.addEventListener("click", () => {
  const ok = confirm(
    "Logging out will restart the game.\nAny unsaved progress will be lost.\n\nContinue?"
  );
  if (!ok) return;

  localStorage.removeItem(TOKEN_KEY);
  flash("Logged out. Guest mode enabled.");
  location.reload();
});

// Initial auth UI
setMode("login");
updateAuthUI();
