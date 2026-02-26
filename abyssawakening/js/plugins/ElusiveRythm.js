(() => {

  const STATE_ID = 178;

  const _xparam = Game_BattlerBase.prototype.xparam;
  Game_BattlerBase.prototype.xparam = function(xparamId) {
    let value = _xparam.call(this, xparamId);

    if (xparamId === 1 && this.isStateAffected(STATE_ID)) {
      value += this.xparam(2);
    }

    return value;
  };

})();