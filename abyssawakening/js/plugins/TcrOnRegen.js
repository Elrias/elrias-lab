/*:
 * @target MZ
 * @plugindesc TRG × TCR seulement aux ticks de tour (évite le TP gratuit au tour 0 / battle start).
 * @author you
 * @help Réglez les options ci-dessous selon votre système (TB/ATB/CTB).
 */
(() => {
  // --- Réglages ------------------------------------------------------------
  const APPLY_AT_TURN_START = false; // true si votre système régénère au début de tour
  const APPLY_AT_TURN_END   = true;  // true si régénère en fin de tour (vanilla)
  const SKIP_MULT_ON_TURN0  = true;  // ne pas multiplier au tour 0
  const BLOCK_TURN0_REGEN_ACTORS = true; // bloque TOUTE régén TP des ACTEURS au tour 0
  // ------------------------------------------------------------------------

  // Marqueurs de contexte (start/end) pendant l'appel de regenerateTp
  const _onTurnStart = Game_Battler.prototype.onTurnStart;
  Game_Battler.prototype.onTurnStart = function() {
    this._tcrRegenPulse = "start";
    _onTurnStart.call(this);
    this._tcrRegenPulse = null;
  };

  const _onTurnEnd = Game_Battler.prototype.onTurnEnd;
  Game_Battler.prototype.onTurnEnd = function() {
    this._tcrRegenPulse = "end";
    _onTurnEnd.call(this);
    this._tcrRegenPulse = null;
  };

  const _regenerateTp = Game_Battler.prototype.regenerateTp;
  Game_Battler.prototype.regenerateTp = function() {
    const turn = ($gameTroop?.turnCount?.() ?? 0);

    // Option : bloquer toute régén TP tour 0 pour les ACTEURS (laisse les ennemis)
    if (BLOCK_TURN0_REGEN_ACTORS && turn === 0 && this.isActor?.()) {
      return; // pas de régén TP au tour 0 pour les acteurs
    }

    const before = this.tp;
    _regenerateTp.call(this); // laisse la formule de base (et autres plugins) agir
    const gained = this.tp - before;
    if (gained <= 0) return;

    const pulse = this._tcrRegenPulse; // "start" | "end" | undefined
    const okPulse =
      (pulse === "start" && APPLY_AT_TURN_START) ||
      (pulse === "end"   && APPLY_AT_TURN_END);

    if (!okPulse) return;                       // ignore hors tick de tour
    if (SKIP_MULT_ON_TURN0 && turn === 0) return; // option : pas de ×TCR au tour 0

    const extra = Math.floor(gained * (this.tcr - 1));
    if (extra !== 0) this.gainSilentTp(extra);
  };
})();