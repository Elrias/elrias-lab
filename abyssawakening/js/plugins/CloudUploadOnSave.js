/*:
 * @target MZ
 * @plugindesc Cloud Upload on Save (uploads the saved slot to backend after saving)
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
  const p = PluginManager.parameters("CloudUploadOnSave");
  const API = String(p.ApiBaseUrl || "").replace(/\/$/, "");
  const GAME_ID = String(p.GameId || "abyssawakening");
  const TOKEN_KEY = String(p.TokenKey || "cloudsave_token");

  function token() {
    try { return localStorage.getItem(TOKEN_KEY) || ""; } catch { return ""; }
  }

  async function uploadSlot(slotId) {
    const t = token();
    if (!t) return;

    const obj = await StorageManager.loadObject(`file${slotId}`);
    const payload = JSON.stringify(obj);

    const res = await fetch(`${API}/saves/${slotId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${t}`,
      },
      body: JSON.stringify({ game_id: GAME_ID, payload }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.error || "save_upload_failed");
    }
  }

  const _saveGame = DataManager.saveGame;
  DataManager.saveGame = async function(savefileId) {
    const ok = await _saveGame.call(this, savefileId);
    if (ok) uploadSlot(savefileId).catch(e => console.warn("Cloud upload failed:", e));
    return ok;
  };
})();
