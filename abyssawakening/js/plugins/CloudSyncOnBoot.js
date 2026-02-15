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

  async function rebuildGlobalInfoFromLocal() {
    // Rebuild DataManager._globalInfo so Title/Continue sees the saves
    const max = DataManager.maxSavefiles ? DataManager.maxSavefiles() : 20;
    const info = [];
    info.length = max + 1; // index 0 unused

    for (let i = 1; i <= max; i++) {
      try {
        // loads the SavefileInfo from local storage (does not load full save)
        // in MZ, this is async.
        const sfi = await DataManager.loadSavefileInfo(i);
        if (sfi) info[i] = sfi;
      } catch (_) {
        // ignore per-slot errors
      }
    }

    DataManager._globalInfo = info;
    console.log("[CloudSync] GlobalInfo rebuilt from local slots");
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

  console.log("[CloudSync] Plugin loaded.");
})();
