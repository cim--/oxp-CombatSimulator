this.name = "Combat Simulator Attack AI";


this.aiStarted = function() {
	var ai = new worldScripts["oolite-libPriorityAI"].PriorityAIController(this.ship);

	ai.setCommunicationsRole("_combatSimulator");

	ai.setPriorities([
		/* Fight */
		{
			condition: ai.conditionInCombat,
			behaviour: ai.behaviourDestroyCurrentTarget,
			reconsider: 60
		},
		{
			condition: ai.conditionPlayerNearby,
			configuration: ai.configurationAcquirePlayerAsTarget,
			behaviour: ai.behaviourDestroyCurrentTarget,
			reconsider: 5
		},
		{
			configuration: function()
			{
				this.ship.destination = worldScripts["Combat Simulator"].$simpos;
				this.ship.desiredRange = 2000;
				this.ship.desiredSpeed = 200;
			},
			behaviour: ai.behaviourApproachDestination,
			reconsider: 5
		}
	]);
}