/*:
 * @plugindesc Show if skills are ready for each actor below TP
 * @target MZ
 * @help SkillReady.js
 * 
 * Show if skills are ready for each actor below TP
 */
//=============================================================================
// RPG Maker MZ - Display Skills in Battle Status Window
//=============================================================================

(() => {
    // Constantes de position pour les icônes
    const ICON_X_OFFSET = 32; // Décalage X par rapport au côté droit de la fenêtre
    const ICON_Y_OFFSET = -22; // Décalage Y par rapport au bas de la fenêtre
    const ICON_SPACING = 33; // Espacement fixe entre les icônes en pixels

    // Surcharge de la méthode drawItem pour ajouter l'affichage des compétences
    const _Window_BattleStatus_drawItem = Window_BattleStatus.prototype.drawItem;
    Window_BattleStatus.prototype.drawItem = function(index) {
        _Window_BattleStatus_drawItem.call(this, index); // Appel de la méthode originale
        this.drawSkills(index); // Ajout de l'affichage des compétences
    };

    // Méthode pour dessiner les icônes des compétences
    Window_BattleStatus.prototype.drawSkills = function(index) {
        const actor = $gameParty.battleMembers()[index];
        // Filtrer les compétences pour n'inclure que celles de type 1
        const skills = actor.skills().filter(skill => skill.stypeId === 1);
        const rect = this.itemRectWithPadding(index);
        const iconX = rect.x + ICON_SPACING + ICON_X_OFFSET;
        let iconY = rect.y + rect.height + ICON_Y_OFFSET;
        
        skills.forEach((skill, i) => {
            // Charger l'image appropriée en fonction de la disponibilité de la compétence
            const iconBitmap = ImageManager.loadSystem(actor.canUse(skill) ? 'skillReady' : 'skillNotReady');
            const iconIndex = i;
            // Dessiner l'icône de la compétence
            this.contents.blt(iconBitmap, 0, 0, iconBitmap.width, iconBitmap.height, iconX + iconIndex * ICON_SPACING, iconY);
        });
    };

    // Méthode pour rafraîchir les icônes de compétences pour tous les acteurs
    Window_BattleStatus.prototype.refreshSkills = function() {
        for (let i = 0; i < this.maxItems(); i++) {
            this.refreshSkillIcons(i);
        }
    };

    // Méthode pour rafraîchir les icônes de compétences pour un acteur spécifique
    Window_BattleStatus.prototype.refreshSkillIcons = function(index) {
        const actor = $gameParty.battleMembers()[index];
        const skills = actor.skills().filter(skill => skill.stypeId === 1);
        const rect = this.itemRectWithPadding(index);
        const iconX = rect.x + ICON_SPACING + ICON_X_OFFSET;
        let iconY = rect.y + rect.height + ICON_Y_OFFSET;

        skills.forEach((skill, i) => {
            // Charger l'image appropriée en fonction de la disponibilité de la compétence
            const iconBitmap = ImageManager.loadSystem(actor.canUse(skill) ? 'skillReady' : 'skillNotReady');
            const iconIndex = i;
            // Effacer l'icône précédente et dessiner la nouvelle
            this.contents.clearRect(iconX + iconIndex * ICON_SPACING, iconY, iconBitmap.width, iconBitmap.height);
            this.contents.blt(iconBitmap, 0, 0, iconBitmap.width, iconBitmap.height, iconX + iconIndex * ICON_SPACING, iconY);
        });
    };

    // Surcharge de la méthode startTurn de BattleManager pour rafraîchir les icônes au début de chaque tour
    const _BattleManager_startTurn = BattleManager.startTurn;
    BattleManager.startTurn = function() {
        _BattleManager_startTurn.call(this); // Appel de la méthode originale
        SceneManager._scene._statusWindow.refreshSkills(); // Rafraîchir les icônes des compétences
    };

    // Surcharge de la méthode endAction de BattleManager pour rafraîchir les icônes après chaque action
    const _BattleManager_endAction = BattleManager.endAction;
    BattleManager.endAction = function() {
        _BattleManager_endAction.call(this); // Appel de la méthode originale
        SceneManager._scene._statusWindow.refreshSkills(); // Rafraîchir les icônes des compétences après chaque action
    };

    // Surcharge de la méthode apply de Game_Action pour rafraîchir les icônes après l'utilisation d'une compétence de type 1
    const _Game_Action_apply = Game_Action.prototype.apply;
    Game_Action.prototype.apply = function(target) {
        _Game_Action_apply.call(this, target); // Appel de la méthode originale
        if (this.isSkill() && this.item().stypeId === 1) { // Vérifier si l'action est une compétence de type 1
            SceneManager._scene._statusWindow.refreshSkillIcons(this.subject().index()); // Rafraîchir les icônes pour l'acteur
        }
    };

    // Surcharge de la méthode update de Game_Battler pour vérifier et rafraîchir les compétences après chaque mise à jour
    const _Game_Battler_updateCooldowns = Game_Battler.prototype.updateCooldowns;
    Game_Battler.prototype.updateCooldowns = function() {
        _Game_Battler_updateCooldowns.call(this); // Appel de la méthode originale
        SceneManager._scene._statusWindow.refreshSkills(); // Rafraîchir les icônes des compétences après mise à jour des temps de rechargement
    };

})();