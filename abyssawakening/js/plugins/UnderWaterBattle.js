/*:
 * @target MZ
 * @plugindesc Underwater rules (Breath via states 239-249, Agitation 255) - Activation via Plugin Command - Heals include regen/lifesteal (gainHp hook)
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
 * @command Enable
 * @text Enable Underwater Rules
 * @desc Active les règles underwater pour ce combat (jusqu'à la fin du combat).
 *
 * @command Disable
 * @text Disable Underwater Rules
 * @desc Désactive les règles underwater (sécurité).
 *
 * @help
 * IDs FIXES (dans ce plugin) :
 * - Agitation: 255
 * - Breath 10: 239
 * - Breath 9 : 240
 * ...
 * - Breath 0 : 249
 *
 * Activation :
 * - Dans l'event de troupe (tour 0): Plugin Command -> Enable
 * - Le boss applique Breath 10 via une compétence.
 *
 * Règles fin de tour (APRÈS regen) :
 * - Breath -1 sauf si Guard utilisé ce tour
 * - -1 supplémentaire si Agitation
 * - +1 si l'acteur a gagné des HP pendant le tour (toutes sources: heal, regen, lifesteal/drain, scripts...)
 * - Si Breath == 0 : DoT % max HP
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

  // === TES IDS ===
  const STATE_AGITATION = 255;

  // Breath states range:
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
  // value 10 -> 239
  // value  0 -> 249
  // -----------------------------
  function breathValueToState(value) {
    const v = Math.max(0, Math.min(BREATH_MAX, Math.floor(value)));
    return BREATH_STATE_0 - v; // 249-10=239
  }

  function stateToBreathValue(stateId) {
    // 239 -> 10 ; 249 -> 0
    return BREATH_STATE_0 - stateId;
  }

  function isBreathState(stateId) {
    return stateId >= BREATH_STATE_10 && stateId <= BREATH_STATE_0;
  }

  function actorHasBreath(actor) {
    // plus robuste que actor.states() quand VisuStella manipule des caches
    for (let id = BREATH_STATE_10; id <= BREATH_STATE_0; id++) {
      if (actor.isStateAffected(id)) return true;
    }
    return false;
  }

  function getBreath(actor) {
    for (let id = BREATH_STATE_10; id <= BREATH_STATE_0; id++) {
      if (actor.isStateAffected(id)) return stateToBreathValue(id);
    }
    return null; // pas de Breath
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
      guarded: new Set(),     // actorId
      healed: new Set(),      // actorId that gained HP (any source)
      stype1Count: new Map(), // actorId -> count
    };
  };

  const _BM_setup = BattleManager.setup;
  BattleManager.setup = function(troopId, canEscape, canLose) {
    _BM_setup.call(this, troopId, canEscape, canLose);
    // OFF par défaut, tu actives via Plugin Command
    this._underwaterBattle = false;
    this._uwInitTurnData();
  };

  const _BM_startTurn = BattleManager.startTurn;
  BattleManager.startTurn = function() {
    _BM_startTurn.call(this);
    this._uwInitTurnData();
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
  // Track actions: guard / stype usage
  // (healing is tracked via gainHp hook now)
  // -----------------------------
  const _GA_apply = Game_Action.prototype.apply;
  Game_Action.prototype.apply = function(target) {
    _GA_apply.call(this, target);

    if (!BattleManager.isUnderwater()) return;

    const subject = this.subject();
    if (!subject || !subject.isActor || !subject.isActor()) return;

    // Guard used this turn
    if (this.isGuard && this.isGuard()) {
      BattleManager._uw.guarded.add(subject.actorId());
    }

    // Skill type checks (only skills) — COUNT ONCE PER ACTION, not per target
    const item = this.item();
    if (DataManager.isSkill(item)) {
      if (!this._uwCounted) {
        this._uwCounted = true; // prevents multi-target from counting multiple times

        const stypeId = item.stypeId;

        // Type 1: count per turn, agitation on 2nd use (immediate)
        if (stypeId === STYPE_1) {
          const id = subject.actorId();
          const prev = BattleManager._uw.stype1Count.get(id) || 0;
          const next = prev + 1;
          BattleManager._uw.stype1Count.set(id, next);
          if (next >= 2) subject.addState(STATE_AGITATION);
        }

        // Type 2: agitation immediately (once)
        if (stypeId === STYPE_2) {
          subject.addState(STATE_AGITATION);
        }
      }
    }
  };

  // -----------------------------
  // Track ANY healing source: regen, lifesteal/drain, scripts, items...
  // If gainHp(value>0) happens during underwater battle, mark actor as healed this turn.
  // -----------------------------
  const _GB_gainHp = Game_Battler.prototype.gainHp;
  Game_Battler.prototype.gainHp = function(value) {
    _GB_gainHp.call(this, value);

    if (!BattleManager.isUnderwater()) return;
    if (value <= 0) return;
    if (!this.isActor || !this.isActor()) return;

    // Ensure structure exists
    if (!BattleManager._uw) BattleManager._uwInitTurnData?.call(BattleManager);
    if (BattleManager._uw && BattleManager._uw.healed) {
      BattleManager._uw.healed.add(this.actorId());
    }
  };

  // -----------------------------
  // End turn: Apply Breath AFTER vanilla endTurn (so regen is included)
  // -----------------------------
  const _BM_endTurn = BattleManager.endTurn;
  BattleManager.endTurn = function() {
    const underwater = this.isUnderwater();

    // 1) Let vanilla/VisuStella end-turn run first (regen, slip damage, etc.)
    _BM_endTurn.call(this);

    // 2) Then apply Breath logic using healed flags recorded via gainHp
    if (underwater) {
      $gameParty.battleMembers().forEach(actor => {
        if (!actorHasBreath(actor)) return;

        const id = actor.actorId();

        // Breath -1 unless guarded
        if (!this._uw.guarded.has(id)) addBreath(actor, -1);

        // Extra -1 if agitation
        if (actor.isStateAffected(STATE_AGITATION)) addBreath(actor, -1);

        // +1 if gained HP during the turn (any source)
        if (this._uw.healed.has(id)) addBreath(actor, +1);

        // DoT if Breath == 0
        if (getBreath(actor) !== null && getBreath(actor) <= 0 && DOT_PERCENT > 0) {
          const dmg = Math.floor(actor.mhp * DOT_PERCENT / 100);
          if (dmg > 0) {
            actor.gainHp(-dmg);
            actor.onDamage(dmg);
          }
        }
      });
    }
  };

})();
