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
		return 0
	},

	/**
	 * Returns 0 if the game isn't finished, 1 if the player loses, 2 if the player wins!
	 */
	hasFinished: () => {
		return 0
	}};
