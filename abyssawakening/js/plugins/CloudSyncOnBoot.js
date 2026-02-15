/*:
 * @target MZ
 * @plugindesc Cloud Sync on Boot (imports cloud global + saves, rebuilds global info for Title)
 *
 * @param ApiBaseUrl
 * @type string
 *
 * @param GameId
 * @type string
 * @default abyssawakening
 *
 * @param TokenKey
 * @type string
 * @default cloudsave_token
 */

(() => {
  const p = PluginManager.parameters("CloudSyncOnBoot");
  const API = String(p.ApiBaseUrl || "").replace(/\/$/, "");
  const GAME_ID = String(p.GameId || "abyssawakening");
  const TOKEN_KEY = String(p.TokenKey || "cloudsave_token");
  const SYNC_FLAG = "cloudsync_in_progress";

  function token() {
    try { return localStorage.getItem(TOKEN_KEY) || ""; } catch { return ""; }
  }
  function setSyncing(v) {
    try { sessionStorage.setItem(SYNC_FLAG, v ? "1" : "0"); } catch {}
  }

  async function apiGet(path) {
    const t = token();
    const res = await fetch(`${API}${path}`, {
      headers: { Authorization: `Bearer ${t}` }
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || "api_error");
    return data;
  }

  async function importCloudToLocal() {
    const t = token();
    if (!t || !API) {
      console.log("[CloudSync] No token or API, skipping.");
      return;
    }

    const list = await apiGet(`/saves?game_id=${encodeURIComponent(GAME_ID)}`);
    const saves = Array.isArray(list.saves) ? list.saves : [];

    setSyncing(true);
    try {
      // global first (slot 0)
      if (saves.some(s => Number(s.slot) === 0)) {
        const g = await apiGet(`/saves/0?game_id=${encodeURIComponent(GAME_ID)}`);
        if (g?.payload) {
          await StorageManager.saveObject("global", JSON.parse(g.payload));
          console.log("[CloudSync] Global imported");
        }
      }

      // then file slots
      for (const s of saves) {
        const slot = Number(s.slot);
        if (!Number.isInteger(slot) || slot <= 0) continue;

        const r = await apiGet(`/saves/${slot}?game_id=${encodeURIComponent(GAME_ID)}`);
        if (!r?.payload) continue;

        await StorageManager.saveObject(`file${slot}`, JSON.parse(r.payload));
        console.log(`[CloudSync] Slot ${slot} imported`);
      }
    } finally {
      setSyncing(false);
    }
  }

function pad2(n) { return String(n).padStart(2, "0"); }

function formatPlaytimeFromSeconds(sec) {
  sec = Math.max(0, Math.floor(sec || 0));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
}

async function buildSavefileInfoFromFile(slotId) {
  try {
    const contents = await StorageManager.loadObject(`file${slotId}`);
    if (!contents) return null;

    const system = contents.system || {};
    const party = contents.party || {};

    // Playtime string (must be a STRING)
    let playtime = "";
    if (typeof system.playtimeText === "string") {
      playtime = system.playtimeText;
    } else if (typeof system.playtime === "number") {
      // playtime in frames in MZ (60 fps)
      playtime = formatPlaytimeFromSeconds(system.playtime / 60);
    } else {
      playtime = "00:00:00";
    }

    return {
      globalId: DataManager._globalId || "RPG Maker",
      title: $dataSystem ? $dataSystem.gameTitle : document.title,
      characters: Array.isArray(party.characters) ? party.characters : [],
      faces: Array.isArray(party.faces) ? party.faces : [],
      playtime,              // <-- string
      timestamp: system.saveCount ? Date.now() : Date.now()
    };
  } catch (e) {
    return null;
  }
}


async function rebuildGlobalInfoFromLocal() {
  const max = DataManager.maxSavefiles ? DataManager.maxSavefiles() : 20;
  const info = [];
  info.length = max + 1;

  for (let i = 1; i <= max; i++) {
    const sfi = await buildSavefileInfoFromFile(i);
    if (sfi) info[i] = sfi;
  }

  DataManager._globalInfo = info;

  // Écrit aussi "global" pour que tout soit cohérent côté moteur
  try {
    await StorageManager.saveObject("global", info);
  } catch {}

  console.log("[CloudSync] GlobalInfo rebuilt from file contents");
}

  const _isReady = Scene_Boot.prototype.isReady;
  Scene_Boot.prototype.isReady = function() {
    if (!this._cloudSyncPromise) {
      this._cloudSyncDone = false;
      this._cloudSyncPromise = (async () => {
        try {
          await importCloudToLocal();
          await rebuildGlobalInfoFromLocal();
        } catch (e) {
          console.warn("[CloudSync] Sync failed:", e);
        } finally {
          this._cloudSyncDone = true;
        }
      })();
    }
    return _isReady.call(this) && this._cloudSyncDone;
  };

    // Force le Title à re-checker les saves au moment où il démarre
  const _Scene_Title_create = Scene_Title.prototype.create;
  Scene_Title.prototype.create = function() {
    _Scene_Title_create.call(this);
    // Re-check globalInfo (Continue button)
    this._commandWindow?.refresh?.();
  };
  console.log("[CloudSync] Plugin loaded.");
})();
