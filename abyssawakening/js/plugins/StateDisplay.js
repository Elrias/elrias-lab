/*:
 * @target MZ
 * @plugindesc (VisuStella HUD compatible) Affiche toutes les icônes d'états/buffs en 2 colonnes (5 lignes) sur les panels acteurs. Désactive l'icône alternée. Compatible StateTooltips.
 * @author You
 *
 * @param rows
 * @text Rows
 * @type number
 * @min 1
 * @default 5
 *
 * @param cols
 * @text Columns
 * @type number
 * @min 1
 * @default 2
 *
 * @param iconSize
 * @text Icon Size
 * @type number
 * @min 16
 * @default 32
 *
 * @param colGap
 * @text Column Gap
 * @type number
 * @min 0
 * @default 2
 *
 * @param rowGap
 * @text Row Gap
 * @type number
 * @min 0
 * @default 2
 *
 * @param iconOffsetX
 * @text Icon Offset X
 * @type number
 * @default 6
 *
 * @param iconOffsetY
 * @text Icon Offset Y
 * @type number
 * @default 6
 *
 * @param contentShiftX
 * @text Shift panel content X
 * @type number
 * @min 0
 * @default 70
 *
 * @param showOverflow
 * @text Show +N overflow
 * @type boolean
 * @default true
 *
 * @help
 * - Place ce plugin tout en bas (après tous les VisuStella).
 * - Affiche actor.allIcons() (states + buffs/debuffs) en grille COLS x ROWS.
 * - Cache l'icône alternée (Sprite_StateIcon) pour les ACTEURS uniquement.
 * - N'altère pas les states => StateTooltips continue de fonctionner.
 */

(() => {
  "use strict";

  const pluginName = document.currentScript.src.match(/([^/]+)\.js$/)[1];
  const P = PluginManager.parameters(pluginName);

  const ROWS = Number(P.rows || 5);
  const COLS = Number(P.cols || 2);
  const ICON_SIZE = Number(P.iconSize || 32);
  const COL_GAP = Number(P.colGap || 2);
  const ROW_GAP = Number(P.rowGap || 2);
  const ICON_OX = Number(P.iconOffsetX || 6);
  const ICON_OY = Number(P.iconOffsetY || 6);
  const SHIFT_X = Number(P.contentShiftX || 70);
  const SHOW_OVERFLOW = String(P.showOverflow || "true") === "true";

  const MAX_VISIBLE = ROWS * COLS;

  // ------------------------------------------------------------
  // 1) Désactiver l'icône alternée (Sprite_StateIcon) pour ACTEURS
  //    => laisse les ennemis inchangés.
  // ------------------------------------------------------------
  const _SSI_update = Sprite_StateIcon.prototype.update;
  Sprite_StateIcon.prototype.update = function() {
    _SSI_update.call(this);
    const battler = this._battler;
    if (battler && battler.isActor && battler.isActor()) {
      // Cache l'icône alternée sur les panels acteurs (VisuStella)
      this.visible = false;
    }
  };

  // ------------------------------------------------------------
  // 2) Sprite container: affiche une grille d'icônes (actor.allIcons)
  // ------------------------------------------------------------
  class Sprite_StackedStateIcons extends Sprite {
    constructor() {
      super();
      this._actor = null;
      this._icons = [];
      this._iconSprites = [];
      this._overflowSprite = null;
      this._lastKey = "";
      this._bitmap = ImageManager.loadSystem("IconSet");
    }

    setActor(actor) {
      this._actor = actor;
      this._lastKey = "";
      this.refresh();
    }

    // clé simple pour refresh seulement si changement
    _makeKey() {
      if (!this._actor) return "";
      // allIcons() retourne des indexes; on stringify
      const arr = this._actor.allIcons();
      return arr.join(",");
    }

    refresh() {
      if (!this._actor) return;
      const key = this._makeKey();
      if (key === this._lastKey) return;
      this._lastKey = key;

      this._icons = this._actor.allIcons().slice();
      this._ensureSprites();
      this._applyFrames();
      this._applyOverflow();
    }

    _ensureSprites() {
      const need = Math.min(MAX_VISIBLE, this._icons.length);
      while (this._iconSprites.length < need) {
        const s = new Sprite(this._bitmap);
        s.scale.x = ICON_SIZE / ImageManager.iconWidth;
        s.scale.y = ICON_SIZE / ImageManager.iconHeight;
        this._iconSprites.push(s);
        this.addChild(s);
      }
      while (this._iconSprites.length > need) {
        const s = this._iconSprites.pop();
        this.removeChild(s);
      }
    }

    _applyFrames() {
      const w = ImageManager.iconWidth;
      const h = ImageManager.iconHeight;
      const cols = 16; // IconSet standard

      const shown = Math.min(MAX_VISIBLE, this._icons.length);
      for (let i = 0; i < shown; i++) {
        const iconIndex = this._icons[i];
        const sx = (iconIndex % cols) * w;
        const sy = Math.floor(iconIndex / cols) * h;
        const spr = this._iconSprites[i];

        const col = Math.floor(i / ROWS);
        const row = i % ROWS;
        spr.x = col * (ICON_SIZE + COL_GAP);
        spr.y = row * (ICON_SIZE + ROW_GAP);
        spr.setFrame(sx, sy, w, h);
        spr.visible = true;
      }
    }

    _applyOverflow() {
      if (!SHOW_OVERFLOW) {
        if (this._overflowSprite) this._overflowSprite.visible = false;
        return;
      }

      const extra = this._icons.length - MAX_VISIBLE;
      if (extra <= 0) {
        if (this._overflowSprite) this._overflowSprite.visible = false;
        return;
      }

      if (!this._overflowSprite) {
        // petit texte via Bitmap
        const b = new Bitmap(ICON_SIZE, 18);
        const s = new Sprite(b);
        this._overflowSprite = s;
        this.addChild(s);
      }

      const lastCol = COLS - 1;
      const lastRow = ROWS - 1;
      const px = lastCol * (ICON_SIZE + COL_GAP);
      const py = lastRow * (ICON_SIZE + ROW_GAP) + (ICON_SIZE - 18);

      const b = this._overflowSprite.bitmap;
      b.clear();
      b.fontSize = 16;
      b.drawText(`+${extra}`, 0, 0, ICON_SIZE, 18, "right");

      this._overflowSprite.x = px;
      this._overflowSprite.y = py;
      this._overflowSprite.visible = true;
    }
  }

  // ------------------------------------------------------------
  // 3) Décaler le contenu du panneau acteur (comme avant)
  //    + Attacher nos sprites au Window_BattleStatus
  // ------------------------------------------------------------
  const _itemRect = Window_BattleStatus.prototype.itemRect;
  const _itemRectWithPadding = Window_BattleStatus.prototype.itemRectWithPadding;

  Window_BattleStatus.prototype._vsStack_baseItemRectWithPadding = function(index) {
    return _itemRectWithPadding.call(this, index);
  };

  Window_BattleStatus.prototype.itemRect = function(index) {
    const rect = _itemRect.call(this, index);
    if (this._vsStack_shiftActive) {
      rect.x += SHIFT_X;
      rect.width = Math.max(0, rect.width - SHIFT_X);
    }
    return rect;
  };

  Window_BattleStatus.prototype.itemRectWithPadding = function(index) {
    const rect = _itemRectWithPadding.call(this, index);
    if (this._vsStack_shiftActive) {
      rect.x += SHIFT_X;
      rect.width = Math.max(0, rect.width - SHIFT_X);
    }
    return rect;
  };

  // Crée / met à jour les sprites icônes pour chaque actor slot
  Window_BattleStatus.prototype._vsStack_ensureIconSprites = function() {
    if (this._vsStack_iconSprites) return;
    this._vsStack_iconSprites = [];

    // addInnerChild existe en MZ : ajoute dans la zone client (avec padding)
    const add = this.addInnerChild ? this.addInnerChild.bind(this) : this.addChild.bind(this);

    for (let i = 0; i < this.maxItems(); i++) {
      const spr = new Sprite_StackedStateIcons();
      spr.visible = false;
      this._vsStack_iconSprites.push(spr);
      add(spr);
    }
  };

  Window_BattleStatus.prototype._vsStack_updateIconSprites = function() {
    this._vsStack_ensureIconSprites();

    for (let i = 0; i < this.maxItems(); i++) {
      const actor = this.actor(i);
      const spr = this._vsStack_iconSprites[i];
      if (!actor) {
        spr.visible = false;
        continue;
      }
      const r = this._vsStack_baseItemRectWithPadding(i);
      const blockW = (COLS * ICON_SIZE) + ((COLS - 1) * COL_GAP);
      spr.x = r.x + r.width - blockW - ICON_OX;
      spr.y = r.y + ICON_OY;
      spr.visible = true;
      spr.setActor(actor);
      spr.refresh();
    }
  };

  // Hook drawItem: laisse VisuStella dessiner (shift ON), puis update nos sprites
  const _drawItem = Window_BattleStatus.prototype.drawItem;
  Window_BattleStatus.prototype.drawItem = function(index) {
    this._vsStack_shiftActive = true;
    _drawItem.call(this, index);
    this._vsStack_shiftActive = false;
    this._vsStack_updateIconSprites();
  };

  // sécurité : update régulier (si states changent sans refresh complet)
  const _WB_update = Window_BattleStatus.prototype.update;
  Window_BattleStatus.prototype.update = function() {
    _WB_update.call(this);
    if (this.visible) this._vsStack_updateIconSprites();
  };

})();
