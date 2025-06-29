const game = {
	// This game doesn't need a start method.
	start: () => {},

	/**
	 * Sets up the new piles. One is a deck, the others are all empty.
	 */
	newPile: ( name ) => {
		if ( name === 'pile-deck' ) {
			// Have the dealer shuffle a new deck of cards, and place them face down in a pile.
			dealer.newFaceDownPile( name, dealer.newShuffledCardArray() )
			cardUI.snapPile( dealer.piles[name] )
		} else {
			dealer.newEmptyPile( name )
		}
	},

	canClickOrDragFromPile: ( pile ) => {
		if ( pile.cards.length > 0 ) {
			return true
		}

		return false
	},

	/**
	 * Respond to clicks on the deck to turn the top card if it's face down.
	 */
	clickOnCard: ( card, pile ) => {
		// Was the clicked card the one at the top of the deck pile?
		let topCard = dealer.peekTopOfPile( pile )
		if ( !topCard.isFaceUp && topCard.name === card ) {
			topCard.isFaceUp = true
			cardUI.decorate( topCard )
			return true
		}

		return false
	},

	/**
	 * Return true if card can be dropped on pile. There are simple rules ...
	 *  - no to the deck
	 *  - yes to an empty pile
	 *  - yes to a pile if its suit matches the card
	 */
	canDrop: ( card, pile ) => {
		// Can't drop on the deck ...
		if ( pile.name === 'pile-deck' ) {
			return false
		}

		// Can drop on empty piles
		if ( pile.cards.length === 0 ) {
			return true
		}
	
		// Can only drop on matching suits.
		let topCard = dealer.peekTopOfPile( pile.name )
		return card.suit === topCard.suit
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
		let topCard = dealer.peekTopOfPile( pile )
		if ( !topCard.isFaceUp && topCard.name === card ) {
			return false;
		}

		return true
	}
}