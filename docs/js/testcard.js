const game = {
	/**
	 * This game doesn't require a start callback.
	 */
	start: () => {
		game.deck = dealer.newCardArray()
	},

	/**
	 * Sets up the new piles. One is a deck, the others are all empty.
	 */
	newPile: ( name ) => {
		let cards = []
		cards.push( game.deck.pop() )
		dealer.newTopFacePile( name, cards )
		cardUI.snapPile( dealer.piles[name] )
	},
	
	/**
	 * This game doesn't require a cardsDealt callback.
	 */
	cardsDealt: () => {},

	canClickOrDragFromPile: ( pile ) => {
		return true
	},

	/**
	 * Respond to clicks on the deck to turn the top card if it's face down.
	 */
	clickOnCard: ( c, p ) => {
		let cards = document.getElementById( 'cards' )
		cards.innerHTML = ''

		// Tell the game about the piles we find in the DOM.
		let piles = document.getElementsByClassName( 'pile' )
		for ( let pile of piles ) {
			game.newPile( pile.getAttribute( 'id' ) )
		}
		return true
	},

	/**
	 * Return true if card can be dropped on pile. There are simple rules ...
	 *  - no to the deck
	 *  - yes to an empty pile
	 *  - yes to a pile if its suit matches the card
	 */
	canDrop: ( card, pile ) => {
		return false
	},

	/**
	 * Called in response to a card drop. This game is fine with the default behaviour.
	 */
	dropHappened: ( card, startPileName, endPileName ) => {
		//
	},

	/**
	 * Not used.
	 */
	clickOnPile: ( pile ) => {
		return false
	},

	/**
	 * Can a drag be started from the pile in question using card?
	 */
	canStartDrag: ( card, pile ) => {
		return false;
	},

	/**
	 * Returns 0 if the game isn't finished, 1 if the player loses, 2 if the player wins!
	 */
	hasFinished: () => {
		return 0
	}
}