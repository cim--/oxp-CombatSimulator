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

this.startUpComplete = function()
{

	worldScripts["oolite-libPriorityAI"]._setCommunication("_combatSimulator","generic","oolite_beginningAttack","[combatSimulator_beginningAttack]");
	worldScripts["oolite-libPriorityAI"]._setCommunication("_combatSimulator","generic","oolite_hitTarget","[combatSimulator_hitTarget]");
	worldScripts["oolite-libPriorityAI"]._setCommunication("_combatSimulator","generic","oolite_attackLowEnergy","[combatSimulator_attackLowEnergy]");
	worldScripts["oolite-libPriorityAI"]._setCommunication("_combatSimulator","generic","oolite_incomingMissile","[combatSimulator_incomingMissile]");
}


this._setUpFight = function() {
		this.$fight = new Object;
		
		mission.runScreen({"titleKey":"CombatSimulator_Stage1_Header",
											 "messageKey":"CombatSimulator_Text",
											 "choicesKey":"CombatSimulator_Stage1_Choice"},
											function(choice) {
													this.$fight.role = choice;
		mission.runScreen({"titleKey":"CombatSimulator_Stage2_Header",
											 "messageKey":"CombatSimulator_Text",
											 "choicesKey":"CombatSimulator_Stage2_Choice"},
											function(choice) {
													this.$fight.skill = parseInt(choice.slice(4));
		mission.runScreen({"titleKey":"CombatSimulator_Stage3_Header",
											 "messageKey":"CombatSimulator_Text",
											 "choicesKey":"CombatSimulator_Stage3_Choice"},
											function(choice) {
													this.$fight.number = parseInt(choice);
													this._startFight();
											},this)},this)},this);
}

this._startFight = function() {
		worldScripts["Ship_Storage_Helper.js"].disableTCATPBNSFunc();
		this.$shipState = worldScripts["Ship_Storage_Helper.js"].storeCurrentShip();
		this._setUpHandlers();
		this._setUpEnvironment();
		player.ship.removeEquipment("EQ_ESCAPE_POD");
		player.ship.launch();
}

this._endFight = function() {
		system.mainStation.dockPlayer();
		this._removeHandlers();
		this._removeEnvironment();
}


this._setUpHandlers = function() {
		this.shipTakingDamage = function(amount,whom,type) {
				if (amount >= player.ship.energy - 2) {
						player.ship.energy = player.ship.maxEnergy;
						this._endFight();
				}
		};
		this.shipWillLaunchFromStation = function(station) {
				player.ship.position = this.$simpos.add([3E3,0,0]);
		};
		this.shipLaunchedFromStation = function(station) {
				for (var i=0;i<this.$simulator.ships.length;i++) {
						var s = this.$simulator.ships[i];
						s.target = player.ship;
						s.accuracy = this.$fight.skill;
						for (var j=0;j<s.subEntities.length;j++) {
								s.subEntities[j].forwardWeapon = "EQ_WEAPON_NONE";
						}
				}
				player.ship.forwardShield = player.ship.maxForwardShield;
				player.ship.aftShield = player.ship.maxAftShield;
				player.ship.energy = player.ship.maxEnergy;
		};
		// should never get to this step
		this.shipWillEnterWitchspace = function() {
				this._removeHandlers();
		}
		this.shipDockedWithStation = function() {
				worldScripts["Ship_Storage_Helper.js"].restoreStoredShip(this.$shipState);
				worldScripts["Ship_Storage_Helper.js"].enableTCATPBNSFunc();
				delete this.shipDockedWithStation;
		}
		this.playerStartedJumpCountdown = function() {
				this.$cancel = new Timer(this,function() { player.ship.cancelHyperspaceCountdown(); },2);
		}
		this.$checkFight = new Timer(this, function() {
				if (!this.$simulator || this.$simulator.count == 0 || !this.$buoy.isValid || player.ship.position.distanceTo(this.$buoy.position) > 26E3) {
						this._endFight();
				}
		}, 5, 5);
}

this._setUpEnvironment = function() {
		this.$simpos = system.sun.position.cross(system.mainPlanet.position).direction().multiply(4E9).subtract(system.mainPlanet.position);
		
		this.$buoy = system.addShips("combatsimulator-buoy",1,this.$simpos,0)[0];
		this.$simulator = system.addGroup(this.$fight.role,this.$fight.number,this.$simpos,12E3);
}

this._removeEnvironment = function() {
		if (this.$buoy.isValid) {
				this.$buoy.remove(true);
		}
		for (var i=this.$simulator.count-1;i>=0;i--) {
				this.$simulator.ships[i].remove(true);
		}
}

this._removeHandlers = function() {
		if (this.$checkFight) {
				this.$checkFight.stop();
				delete this.$checkFight;
		}
		delete this.shipTakingDamage;
		delete this.shipWillLaunchFromStation;
		delete this.shipLaunchedFromStation;
		delete this.shipWillEnterWitchspace;
		delete this.playerStartedJumpCountdown;
}



