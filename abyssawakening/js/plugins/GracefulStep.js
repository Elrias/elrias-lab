/*:
 * @target MZ
 * @plugindesc v1.4.1 Applique un état à toute l'équipe quand un acteur "esquive" (evade ou miss selon réglages).
 * @help
 * Placez ce plugin sous VisuStella. 
 * Réglez les constantes ci-dessous.
 */
(() => {
  // ===== Réglages =====
  const ACTOR_ID          = 0;     // 0 = n'importe quel acteur ; sinon ID précis
  const STATE_GATE_ID     = 167;    // 0 = ignoré ; requis (actif OU passif via states()) sinon
  const TEAM_STATE_ID     = 168;    // état appliqué à l'équipe

  // Que considérer comme "dodge" ?
  const TRIGGER_ON_EVADE  = true;  // result().evaded === true
  const TRIGGER_ON_MISS   = true;  // result().missed === true

  // Filtre par type d'action
  const ALLOW_PHYSICAL    = true;
  const ALLOW_MAGICAL     = true;
  const ALLOW_CERTAINHIT  = false;

  const INCLUDE_SELF      = true;
  const ONLY_ALIVE        = true;
  const ONCE_PER_TURN     = false;
  const REFRESH_DURATION  = true;

  const hasStateAny = (b, id) => id > 0 && b.states && b.states().includes($dataStates[id]);

  function canTrigger(b) {
    if (!b?.isActor?.()) return false;
    if (ACTOR_ID > 0 && b.actorId() !== ACTOR_ID) return false;
    if (STATE_GATE_ID > 0 && !hasStateAny(b, STATE_GATE_ID)) return false;
    return true;
  }

  function applyTeamStateFrom(b) {
    if (!canTrigger(b)) return;

    if (ONCE_PER_TURN) {
      b._lastDodgeTurn ??= -9999;
      const t = $gameTroop.turnCount();
      if (t === b._lastDodgeTurn) return;
      b._lastDodgeTurn = t;
    }

    const unit = b.friendsUnit();
    const targets = ONLY_ALIVE ? unit.aliveMembers() : unit.members();

    for (const a of targets) {
      if (!INCLUDE_SELF && a === b) continue;
      const had = a.isStateAffected?.(TEAM_STATE_ID);
      a.addState(TEAM_STATE_ID);
      if (REFRESH_DURATION && had && a.resetStateCounts) a.resetStateCounts(TEAM_STATE_ID);
    }
  }

  function onDodge(b) {
    const stamp = Graphics?.frameCount ?? Date.now();
    if (b._dtsLastStamp === stamp) return;
    b._dtsLastStamp = stamp;
    applyTeamStateFrom(b);
  }

  const _performEvasion = Game_Battler.prototype.performEvasion;
  Game_Battler.prototype.performEvasion = function() {
    _performEvasion.call(this);
    onDodge(this);
  };
  const _performMagicEvasion = Game_Battler.prototype.performMagicEvasion;
  Game_Battler.prototype.performMagicEvasion = function() {
    _performMagicEvasion.call(this);
    onDodge(this);
  };

  const _apply = Game_Action.prototype.apply;
  Game_Action.prototype.apply = function(target) {
    _apply.call(this, target);
    const res = target?.result?.();
    const wasEvade = !!res?.evaded;
    const wasMiss  = !!res?.missed;
    const isPhys = this.isPhysical?.();
    const isMag  = this.isMagical?.();
    const isCert = this.isCertainHit?.() ?? this.isCertainHit?.();
    const typeOk = (isPhys && ALLOW_PHYSICAL) || (isMag && ALLOW_MAGICAL) || (isCert && ALLOW_CERTAINHIT);
    const flagOk = (TRIGGER_ON_EVADE && wasEvade) || (TRIGGER_ON_MISS && wasMiss);
    if (target?.isActor?.() && typeOk && flagOk) onDodge(target);
  };
})();
