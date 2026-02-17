/*:
 * @target MZ
 * @plugindesc Underwater rules (Breath via states 239-249, Agitation 255) - Activation via Plugin Command - Breath + immediately on heal (max +1 per turn, includes lifesteal/regen via gainHp) + Drown DoT once per turn + stype count via startAction (VisuStella-safe)
 * @author You
 *
 * @param stypeId1
 * @text Skill Type ID: Type 1
 * @type number
 * @default 1
 *
 * @param stypeId2
 * @text Skill Type ID: Type 2
 * @type number
 * @default 2
 *
 * @param dotPercentAtBreath0
 * @text DoT % Max HP at Breath 0
 * @type number
 * @min 0
 * @max 100
 * @default 25
 *
 * @param breathGainCapPerTurn
 * @text Breath gain cap per turn
 * @type number
 * @min 0
 * @default 1
 * @desc Nombre maximum de +Breath par tour via gains de HP (soins/regen/lifesteal).
 *
 * @command Enable
 * @text Enable Underwater Rules
 * @desc Active les règles underwater pour ce combat (jusqu'à la fin du combat).
 *
 * @command Disable
 * @text Disable Underwater Rules
 * @desc Désactive les règles underwater (sécurité).
 *
 * @help
 * IDs FIXES :
 * - Agitation: 255
 * - Breath10: 239 ... Breath0: 249
 *
 * Activation :
 * - Event de troupe (tour 0): Plugin Command -> Enable
 *
 * Breath :
 * - Breath baisse en fin de tour (voir règles plus bas)
 * - Breath augmente IMMEDIATEMENT à chaque gain de HP (heal/lifesteal/regen),
 *   limité à +N par tour et par acteur (param breathGainCapPerTurn).
 *
 * Fin de tour :
 * - Breath -1 sauf si Guard utilisé ce tour
 * - -1 supplémentaire si Agitation
 * - Si Breath == 0 : DoT % max HP (verrouillé à 1 fois par tour)
 *
 * Agitation :
 * - 2+ skills Type 1 dans le même tour => Agitation (dès la 2e)
 * - 1 skill Type 2 utilisée => Agitation immédiate
 *
 * Guard n’atténue plus les dégâts pendant ce combat (si activé).
 */

(() => {
  "use strict";

  const pluginName = document.currentScript.src.match(/([^/]+)\.js$/)[1];
  const P = PluginManager.parameters(pluginName);

  const STYPE_1 = Number(P.stypeId1 || 1);
  const STYPE_2 = Number(P.stypeId2 || 2);
  const DOT_PERCENT = Number(P.dotPercentAtBreath0 || 25);
  const HEAL_BREATH_CAP = Number(P.breathGainCapPerTurn || 1);

  // === TES IDS ===
  const STATE_AGITATION = 255;

  // Breath10 = 239 ... Breath0 = 249
  const BREATH_STATE_10 = 239;
  const BREATH_STATE_0  = 249;
  const BREATH_MAX = 10;

  // -----------------------------
  // Plugin Commands
  // -----------------------------
  PluginManager.registerCommand(pluginName, "Enable", () => {
    BattleManager._underwaterBattle = true;
  });

  PluginManager.registerCommand(pluginName, "Disable", () => {
    BattleManager._underwaterBattle = false;
  });

  // -----------------------------
  // Breath mapping helpers
  // -----------------------------
  function breathValueToState(value) {
    const v = Math.max(0, Math.min(BREATH_MAX, Math.floor(value)));
    return BREATH_STATE_0 - v; // 249-10=239
  }

  function stateToBreathValue(stateId) {
    return BREATH_STATE_0 - stateId;
  }

  function actorHasBreath(actor) {
    for (let id = BREATH_STATE_10; id <= BREATH_STATE_0; id++) {
      if (actor.isStateAffected(id)) return true;
    }
    return false;
  }

  function getBreath(actor) {
    for (let id = BREATH_STATE_10; id <= BREATH_STATE_0; id++) {
      if (actor.isStateAffected(id)) return stateToBreathValue(id);
    }
    return null;
  }

  function clearBreath(actor) {
    for (let id = BREATH_STATE_10; id <= BREATH_STATE_0; id++) {
      actor.removeState(id);
    }
  }

  function setBreath(actor, value) {
    const v = Math.max(0, Math.min(BREATH_MAX, Math.floor(value)));
    const desired = breathValueToState(v);
    if (actor.isStateAffected(desired)) return;
    clearBreath(actor);
    actor.addState(desired);
  }

  function addBreath(actor, delta) {
    const current = getBreath(actor);
    if (current === null) return;
    setBreath(actor, current + delta);
  }

  // -----------------------------
  // Battle gating + per-turn data
  // -----------------------------
  BattleManager.isUnderwater = function() {
    return !!this._underwaterBattle;
  };

  BattleManager._uwInitTurnData = function() {
    this._uw = {
      guarded: new Set(),          // actorId
      stype1Count: new Map(),      // actorId -> count
      healBreathCount: new Map(),  // actorId -> how many +Breath already granted this turn
    };
  };

  const _BM_setup = BattleManager.setup;
  BattleManager.setup = function(troopId, canEscape, canLose) {
    _BM_setup.call(this, troopId, canEscape, canLose);
    this._underwaterBattle = false; // ON uniquement via Plugin Command
    this._uwInitTurnData();
  };

  const _BM_startTurn = BattleManager.startTurn;
  BattleManager.startTurn = function() {
    _BM_startTurn.call(this);
    this._uwInitTurnData(); // reset cap / tour + compteurs
  };

  const _BM_endBattle = BattleManager.endBattle;
  BattleManager.endBattle = function(result) {
    _BM_endBattle.call(this, result);
    this._underwaterBattle = false;
    this._uw = null;
  };

  // -----------------------------
  // Guard does NOT reduce damage (only if underwater enabled)
  // -----------------------------
  const _GA_applyGuard = Game_Action.prototype.applyGuard;
  Game_Action.prototype.applyGuard = function(damage, target) {
    if (BattleManager.isUnderwater()) return damage;
    return _GA_applyGuard.call(this, damage, target);
  };

  // -----------------------------
  // FIX: Count Type1/Type2 + detect Guard in startAction
  // This is VisuStella-safe (works even if apply() isn't used normally)
  // -----------------------------
  const _BM_startAction = BattleManager.startAction;
  BattleManager.startAction = function() {
    _BM_startAction.call(this);

    if (!this.isUnderwater()) return;

    const subject = this._subject;
    if (!subject || !subject.isActor || !subject.isActor()) return;

    // current action
    const action = subject.currentAction ? subject.currentAction() : null;
    if (!action) return;

    if (!this._uw) this._uwInitTurnData();

    // Guard used this turn
    if (action.isGuard && action.isGuard()) {
      this._uw.guarded.add(subject.actorId());
      return; // pas de stype à compter pour Guard
    }

    const item = action.item ? action.item() : null;
    if (!item || !DataManager.isSkill(item)) return;

    // Count only once per action
    if (action._uwCounted) return;
    action._uwCounted = true;

    const stypeId = item.stypeId;

    if (stypeId === STYPE_1) {
      const id = subject.actorId();
      const prev = this._uw.stype1Count.get(id) || 0;
      const next = prev + 1;
      this._uw.stype1Count.set(id, next);
      if (next >= 2) subject.addState(STATE_AGITATION);
    }

    if (stypeId === STYPE_2) {
      subject.addState(STATE_AGITATION);
    }
  };

  // -----------------------------
  // Keep Game_Action.apply hook ONLY if you still need something there.
  // Here we leave it untouched (no stype counting) to avoid double count.
  // -----------------------------
  // (No override needed)

  // -----------------------------
  // IMMEDIATE Breath gain on ANY HP gain (heal/lifesteal/regen/scripts...)
  // Limited to +N per actor per turn (default 1)
  // -----------------------------
  const _GB_gainHp = Game_Battler.prototype.gainHp;
  Game_Battler.prototype.gainHp = function(value) {
    _GB_gainHp.call(this, value);

    if (!BattleManager.isUnderwater()) return;
    if (value <= 0) return;                 // only HP gains
    if (!this.isActor || !this.isActor()) return;

    const actor = this;
    if (!actorHasBreath(actor)) return;     // only after Breath is applied by the boss

    if (!BattleManager._uw) BattleManager._uwInitTurnData?.call(BattleManager);

    const id = actor.actorId();
    const prev = BattleManager._uw.healBreathCount.get(id) || 0;
    if (prev >= HEAL_BREATH_CAP) return;

    BattleManager._uw.healBreathCount.set(id, prev + 1);
    addBreath(actor, +1);                   // immediate increment
  };

  // -----------------------------
  // End turn: Breath decreases + DoT at Breath 0
  // DoT is LOCKED to once per troop turn per actor (prevents multi-proc under STB)
  // -----------------------------
  const _BM_endTurn = BattleManager.endTurn;
  BattleManager.endTurn = function() {
    const underwater = this.isUnderwater();

    _BM_endTurn.call(this);

    if (underwater) {
      const currentTurn = ($gameTroop && $gameTroop.turnCount) ? $gameTroop.turnCount() : 0;

      $gameParty.battleMembers().forEach(actor => {
        if (!actorHasBreath(actor)) return;

        const id = actor.actorId();

        if (!this._uw.guarded.has(id)) addBreath(actor, -1);
        if (actor.isStateAffected(STATE_AGITATION)) addBreath(actor, -1);

        const b = getBreath(actor);
        if (b !== null && b <= 0 && DOT_PERCENT > 0) {
          // Anti multi-proc : 1 fois par "turnCount" de troop
          actor._uwLastDrownTurn = actor._uwLastDrownTurn ?? -999999;
          if (actor._uwLastDrownTurn !== currentTurn) {
            actor._uwLastDrownTurn = currentTurn;

            const dmg = Math.floor(actor.mhp * DOT_PERCENT / 100);
            if (dmg > 0) {
              actor.gainHp(-dmg);
              actor.onDamage(dmg);
            }
          }
        }
      });
    }
  };

})();
