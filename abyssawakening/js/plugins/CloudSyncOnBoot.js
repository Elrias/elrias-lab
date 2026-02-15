/*:
 * @target MZ
 * @plugindesc Cloud Sync on Boot (imports cloud saves to local storage at startup)
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

  function token() {
    try { return localStorage.getItem(TOKEN_KEY) || ""; } catch { return ""; }
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
    if (!t) return;

    const list = await apiGet(`/saves?game_id=${encodeURIComponent(GAME_ID)}`);
    const saves = Array.isArray(list.saves) ? list.saves : [];

    for (const s of saves) {
      const slot = Number(s.slot);
      if (!Number.isInteger(slot) || slot <= 0) continue;

      const r = await apiGet(`/saves/${slot}?game_id=${encodeURIComponent(GAME_ID)}`);
      if (!r?.payload) continue;

      const obj = JSON.parse(r.payload);
      await StorageManager.saveObject(`file${slot}`, obj);
    }
  }

  // Bloquant: le jeu n'arrive à l'écran titre qu'une fois la sync faite (fiable)
  const _isReady = Scene_Boot.prototype.isReady;
  Scene_Boot.prototype.isReady = function() {
    if (!this._cloudSyncPromise) {
      this._cloudSyncDone = false;
      this._cloudSyncPromise = (async () => {
        try {
          await syncCloudToLocal();
        } catch (e) {
          console.warn("Cloud sync failed:", e);
        } finally {
          this._cloudSyncDone = true;
        }
      })();
    }
    return _isReady.call(this) && this._cloudSyncDone;
  };
})();
