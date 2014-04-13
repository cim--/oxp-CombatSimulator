this.name = "Combat Arena Buoy shipscript";

this.shipBeingAttacked = function(whom) {
		if (whom.isPlayer) {
				if (player.alertCondition == 1) {
						worldScripts["Combat Arena"]._setUpFight();
				} else {
						this.ship.commsMessage("Must be at condition green to set up a fight");
				}
		}
}

