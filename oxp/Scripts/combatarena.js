this.name = "Combat Simulator";
this.description = "Combat Simulator";


this.startUp = this.shipWillExitWitchspace = function() {
		if (!worldScripts["Ship_Storage_Helper.js"]) {
				log(this.name,"Combat Simulator requires Ship Storage Helper, which has not been installed.");
				player.commsMessage("OXP Startup error - check your logs!",10);
				delete this.startUp;
				delete this.shipWillExitWitchspace;
				return;
		}

		if (!system.isInterstellarSpace && system.mainStation && (system.ID == 7 || system.info.techlevel >= 9)) {
				system.mainStation.setInterface(this.name,{
						title: "Combat Simulator",
						category: "Training",
						summary: "Combat simulation system to allow pilots to practice fights against a range of opponents",
						callback: this._setUpFight.bind(this)
				});
		}
}


this._setUpFight = function() {
		this.$fight = new Object;
		
		mission.runScreen({"titleKey":"CombatArena_Stage1_Header",
											 "messageKey":"CombatArena_Text",
											 "choicesKey":"CombatArena_Stage1_Choice"},
											function(choice) {
													this.$fight.role = choice;
		mission.runScreen({"titleKey":"CombatArena_Stage2_Header",
											 "messageKey":"CombatArena_Text",
											 "choicesKey":"CombatArena_Stage2_Choice"},
											function(choice) {
													this.$fight.skill = parseInt(choice.slice(4));
		mission.runScreen({"titleKey":"CombatArena_Stage3_Header",
											 "messageKey":"CombatArena_Text",
											 "choicesKey":"CombatArena_Stage3_Choice"},
											function(choice) {
													this.$fight.number = parseInt(choice);
													this._startFight();
											},this)},this)},this);
}

this._startFight = function() {
		var arena = system.addGroup(this.$fight.role,this.$fight.number,player.ship.position,10E3).ships;
		for (var i=0;i<arena.length;i++) {
				var s = arena[i];
				s.target = player.ship;
				s.accuracy = this.$fight.skill;
				s.setAI("interceptAI.plist");
				s.displayName = "Arena Fighter";
				for (var j=0;j<s.subEntities.length;j++) {
						s.subEntities[j].forwardWeapon = "EQ_WEAPON_NONE";
				}
		}
		player.ship.forwardShield = player.ship.maxForwardShield;
		player.ship.aftShield = player.ship.maxAftShield;
		player.ship.energy = player.ship.maxEnergy;
}

