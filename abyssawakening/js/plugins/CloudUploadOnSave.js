/*:
 * @target MZ
 * @plugindesc Cloud Upload on Save (robust: hooks StorageManager.saveObject)
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

  async function uploadSlot(slotId, obj) {
    const t = token();
    if (!t) {
      console.warn("[CloudUpload] No token found, skipping upload.");
      return;
    }
    if (!API) {
      console.warn("[CloudUpload] ApiBaseUrl is empty, skipping upload.");
      return;
    }

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

  // Anti-spam: évite d’uploader 2 fois le même slot en rafale
  const lastUploadAt = new Map();
  function shouldUpload(slotId) {
    const now = Date.now();
    const last = lastUploadAt.get(slotId) || 0;
    if (now - last < 500) return false;
    lastUploadAt.set(slotId, now);
    return true;
  }

  const _saveObject = StorageManager.saveObject;
  StorageManager.saveObject = async function(saveName, object) {
    const result = await _saveObject.call(this, saveName, object);

    // Les saves MZ sont sous "file1", "file2", etc.
    const m = /^file(\d+)$/.exec(saveName);
    if (m) {
      const slotId = Number(m[1]);
      if (Number.isInteger(slotId) && slotId > 0 && shouldUpload(slotId)) {
        uploadSlot(slotId, object)
          .then(() => console.log(`[CloudUpload] Uploaded slot ${slotId}`))
          .catch((e) => console.warn(`[CloudUpload] Upload failed for slot ${slotId}:`, e));
      }
    }

    return result;
  };

  console.log("[CloudUpload] Plugin loaded (StorageManager hook).");
})();
