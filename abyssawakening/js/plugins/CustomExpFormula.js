/*:
 * @target MZ
 * @plugindesc Remplace la formule d'expérience par une version personnalisée.
 * @author Toi
 * 
 * @help
 * Ce plugin surcharge la méthode expForLevel pour appliquer une formule
 * d'expérience personnalisée.
 */

/*:
 * @target MZ
 * @plugindesc Remplace la formule d'expérience par une version fixe par tranche de niveau personnalisée.
 * @author Toi
 *
 * @help
 * Cette version applique une formule d'EXP par tranche :
 * - Niv 1 à 19  : 50 * niveau
 * - Niv 20 à 34 : 200 * niveau
 * - Niv 35 à 49 : 800 * niveau
 * - Niv 50 à 74 : 3200 * niveau
 * - Niv 75 à 97 : 12800 * niveau
 * - Niv 98 à 99 : 50000 * niveau
 */

(() => {
  Game_Actor.prototype.expForLevel = function(level) {
    if (level < 2) return 0;

    // Fonction pour déterminer le coût d’un niveau donné
    const expFor = (lvl) => {
      if (lvl <= 19) return 50 * lvl;
      if (lvl <= 34) return 200 * lvl;
      if (lvl <= 49) return 800 * lvl;
      if (lvl <= 74) return 3200 * lvl;
      if (lvl <= 97) return 12800 * lvl;
      return 50000 * lvl;
    };

    // Cumuler l'EXP requise pour tous les niveaux précédents
    let totalExp = 0;
    for (let i = 2; i <= level; i++) {
      totalExp += expFor(i);
    }
    return totalExp;
  };
})();