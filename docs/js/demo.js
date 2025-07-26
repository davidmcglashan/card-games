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
			let pile = dealer.newEmptyPile( name )
			pile.stackingMethod = dealer.stackingMethods.UNTIDY
		}
	},

	/**
	 * Returns the interactivity of a pile or card at event (x,y)
	 * - 0 Nothing to interact with
	 * - 1 Pile can be interacted with
	 * - 2 Card can be interacted with - must also include the card name!
	 */
	canClickOrDragFromPileAtXY: ( pile, x, y ) => {		
		// Empty piles can't be interacted with
		if ( pile.cards.length === 0 ) {
			return { outcome: table.outcomes.NONE }
		}

		// Any other card can be interacted with if the pointer is in its bounds.
		let topCard = dealer.peekTopOfPile( pile.name )
		if ( cardUI.xyIsInBounds( x, y, topCard.elem ) ) {
			// Face down cards can be clicked, Face up can be dragged.
			return { 
				outcome: table.outcomes.CARD_IS_INTERACTIVE, 
				card: topCard.name, 
				type: topCard.isFaceUp ? table.interactionTypes.DRAG : table.interactionTypes.CLICK 
			}
		}

		return { outcome: table.outcomes.NONE }
	},

	/**
	 * If the card being dragged is from lower down a tower we need to tell the 
	 * game that the higher cards are getting moved too.
	 */
	embellishDrag: ( drag, cardName, pileName ) => {
		// Not a tower? Don't care ...
		if ( !pileName.startsWith( 'pile-' ) ) {
			return
		}

		// Don't do anything if we're only dragging the top card.
		let topCard = dealer.peekTopOfPile( pileName )
		if ( topCard.name === cardName ) {
			return
		}

		// Add the cards above the dragged card into the drag object.
		let adding = false
		for ( let card of dealer.piles[pileName].cards ) {
			if ( card.name === cardName ) {
				adding = true
			} else if ( adding ) {
				drag.otherCards.push( card )
			}
		}
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
		}

		return true
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
			return table.outcomes.NONE
		}

		// We can safely drop on empty piles
		if ( cardUI.xyIsInBounds( x, y, pile.elem ) ) {
			if ( pile.cards.length === 0 ) {
				return table.outcomes.PILE_IS_INTERACTIVE
			}
		}
	
		// Can only drop on cards with matching suits.
		let topCard = dealer.peekTopOfPile( pile.name )
		if ( topCard ) {
			if ( card.name !== topCard.name && /*card.suit === topCard.suit && */cardUI.xyIsInBounds( x, y, topCard.elem ) ) {
				return table.outcomes.CARD_IS_INTERACTIVE
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
	 * Detect the game over state and return an appropriate constant to represent it.
	 */
	hasFinished: () => {
		// If all the drop piles have four cards then this is a win!
		if ( dealer.piles['pile-deck'].cards.length === 0 ) {
			return table.gameOverStates.PLAYER_WINS
		}

		return table.gameOverStates.KEEP_PLAYING
	}
}