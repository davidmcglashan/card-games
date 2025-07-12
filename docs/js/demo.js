const game = {
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

	/**
	 * Returns the interactivity of a pile or card at event (x,y)
	 * - 0 Nothing to interact with
	 * - 1 Pile can be interacted with
	 * - 2 Card can be interacted with
	 */
	canClickOrDragFromPileAtXY: ( pile, x, y ) => {		
		// Empty piles can't be interacted with
		if ( pile.cards.length > 0 ) {
			let topCard = dealer.peekTopOfPile( pile.name )
			let rect = topCard.elem.getBoundingClientRect()

			if ( x > rect.x && x < rect.x + rect.width && y > rect.y && y < rect.y + rect.height ) {
				return 2
			}
		}

		return 0
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
	 * Work out if a card can be dropped onto a pile at (x,y). Returns ...
	 * - 0 if no drop can be performed.
	 * - 1 if a drop will be accepted onto the pile.
	 * - 2 if a drop will be accepted onto the top card of the pile.
	 */
	canDropCardAtXYOnPile( card, x, y, pile ) {
		// Can't drop on the deck ...
		if ( pile.name === 'pile-deck' ) {
			return 0
		}

		// Is the (x,y) within the bounds of the checking pile?
		let rect = pile.elem.getBoundingClientRect()
		if ( x > rect.x && x < rect.x + rect.width && y > rect.y && y < rect.y + rect.height ) {
			// Can drop on empty piles
			if ( pile.cards.length === 0 ) {
				return 1
			}
		}
	
		// Can only drop on matching suits.
		let topCard = dealer.peekTopOfPile( pile.name )
		if ( topCard ) {
			rect = topCard.elem.getBoundingClientRect()
			if ( x > rect.x && x < rect.x + rect.width && y > rect.y && y < rect.y + rect.height ) {
				if ( card.suit === topCard.suit ) {
					return 2
				}
			}
		}

		return 0
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
	},

	/**
	 * Returns 0 if the game isn't finished, 1 if the player loses, 2 if the player wins!
	 */
	hasFinished: () => {
		// If all the drop piles have four cards then this is a win!
		if ( dealer.piles['pile-deck'].cards.length === 0 ) {
			return 2
		}
		return 0
	}
}