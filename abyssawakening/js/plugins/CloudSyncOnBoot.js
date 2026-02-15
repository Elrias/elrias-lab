/*:
 * @target MZ
 * @plugindesc Cloud Sync on Boot (imports cloud global + saves to local before Title)
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

  async function syncCloudToLocal() {
    const t = token();
    if (!t || !API) return;

    const list = await apiGet(`/saves?game_id=${encodeURIComponent(GAME_ID)}`);
    const saves = Array.isArray(list.saves) ? list.saves : [];

    // IMPORTANT: éviter que CloudUpload ré-uploade ce qu'on écrit pendant la sync
    setSyncing(true);

    try {
      // 1) Télécharger global (slot 0) en premier si présent
      const hasGlobal = saves.some(s => Number(s.slot) === 0);
      if (hasGlobal) {
        const g = await apiGet(`/saves/0?game_id=${encodeURIComponent(GAME_ID)}`);
        if (g?.payload) {
          const obj = JSON.parse(g.payload);
          await StorageManager.saveObject("global", obj);
          console.log("[CloudSync] Global imported");
        }
      }

      // 2) Télécharger les slots fileX
      for (const s of saves) {
        const slot = Number(s.slot);
        if (!Number.isInteger(slot) || slot <= 0) continue;

        const r = await apiGet(`/saves/${slot}?game_id=${encodeURIComponent(GAME_ID)}`);
        if (!r?.payload) continue;

        const obj = JSON.parse(r.payload);
        await StorageManager.saveObject(`file${slot}`, obj);
        console.log(`[CloudSync] Slot ${slot} imported`);
      }
    } finally {
      setSyncing(false);
    }
  }

  // Bloquer le boot tant que la sync n'est pas finie
  const _isReady = Scene_Boot.prototype.isReady;
  Scene_Boot.prototype.isReady = function() {
    if (!this._cloudSyncPromise) {
      this._cloudSyncDone = false;
      this._cloudSyncPromise = (async () => {
        try {
          await syncCloudToLocal();
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
