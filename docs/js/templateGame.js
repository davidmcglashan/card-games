const game = {
	/**
	 * A new game starts with a new shuffled deck.
	 */
	start: () => {
	},

	/**
	 * Sets up the new piles. There is a deck, a pile to deal onto, four suits and seven towers.
	 */
	newPile: ( name ) => {
	},

	/**
	 * Finalises the deck from the remaining undealt cards.
	 */
	cardsDealt: () => {
	},

	/**
	 * Is the pile in question currently interactive?
	 */
	canClickOrDragFromPileAtXY: ( pile, x, y ) => {		
		return { outcome: table.outcomes.NONE }
	},

	/**
	 * If the card being dragged is from lower down a tower we need to tell the 
	 * game that the higher cards are getting moved too.
	 */
	embellishDrag: ( drag, cardName, pileName ) => {
	},

	/**
	 * Respond to clicks on cards ... 
	 */
	clickOnCard: ( cardName, pileName ) => {
		return false
	},

	/**
	 * Respond to clicks on piles ... 
	 */
	clickOnPile: ( pileName ) => {
		return false
	},

	/**
	 * Can a drag be started from the pile in question using card?
	 */
	canStartDrag: ( cardName, pileName ) => {
		return false
	},

	/**
	 * Respond to a request for dropping a card on a pile. 
	 */
	canDropCardAtXYOnPile: ( card, x, y, pile ) => {
		return table.outcomes.NONE
	},

	/**
	 * Called in response to a card drop. Works out where the name card must be drawn from.
	 */
	dropHappened: ( drag ) => {
	},

	/**
	 * Called in response to a snapback animation, usually from a failed drop. 
	 */
	snapBackHappened: ( pileName ) => {
	},

	/**
	 * Detect the game over state and return an appropriate object to represent it.
	 * Usually this will just contain the 'keep playing' state, but if the game has
	 * finished it'll be a bit richer.
	 */
	hasFinished: () => {
		return { state: table.gameOverStates.KEEP_PLAYING }
	},

	/**
	 * Called when a setting has changed. It is the game's job to change itself accordingly.
	 */
	settingChanged: ( setting, active ) => { 
	},

	/**
	 * True when the game can be started over with the same shuffled deck.
	 */
	supportsStartAgain: false,
};
