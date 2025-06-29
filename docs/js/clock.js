const game = {
	// This game doesn't need a start method.
	start: () => {
		game.deck = dealer.newShuffledCardArray()
		game.nextPile = 'clock-king'
	},

	/**
	 * Sets up the new piles. There are twelve 'clock' piles and twelve 'drop' piles
	 */
	newPile: ( name ) => {
		if ( name.startsWith( 'clock' ) ) {
			// Deal four from the pack
			let pile = []
			for ( let i=0; i<4; i++ ) {
				pile.push( game.deck.pop() )
			}

			// Put them on the wee pile
			if ( name === 'clock-king' ) {
				dealer.newTopFacePile( name, pile )
			} else {
				dealer.newFaceDownPile( name, pile )
			}
			cardUI.snapPile( dealer.piles[name] )
		} else {
			dealer.newEmptyPile( name )
		}
	},

	canClickOrDragFromPile: ( pile ) => {
		return pile.name === game.nextPile
	},

	/**
	 * Respond to clicks on the deck to turn the top card if it's face down.
	 */
	clickOnCard: ( card, pile ) => {
		if ( pile === game.nextPile ) {
			// Was the clicked card the one at the top of the deck pile?
			let topCard = dealer.peekTopOfPile( pile )
			if ( !topCard.isFaceUp && topCard.name === card ) {
				topCard.isFaceUp = true
				cardUI.decorate( topCard )
				return true
			}
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
		let num = card.name.split('_')
		return pile.name.startsWith( 'drop' ) && pile.name.endsWith( num[0] )
	},

	/**
	 * Called in response to a card drop. This game is fine with the default behaviour.
	 */
	dropHappened: ( card, startPileName, endPileName ) => {
		let num = card.name.split('_')
		game.nextPile = 'clock-' + num[0]
		console.log( game.nextPile )
	},

	/**
	 * Not used.
	 */
	clickOnPile: ( pile ) => {
		if ( pile === game.nextPile ) {
			// Was the clicked card the one at the top of the deck pile?
			let topCard = dealer.peekTopOfPile( pile )
			if ( !topCard.isFaceUp && topCard.name === card ) {
				topCard.isFaceUp = true
				cardUI.decorate( topCard )
				return true
			}
		}
		return false
	},

	/**
	 * Can a drag be started from the pile in question using card?
	 */
	canStartDrag: ( card, pile ) => {
		if ( pile === game.nextPile ) {
			// Was the clicked card the one at the top of the deck pile?
			let topCard = dealer.peekTopOfPile( pile )
			if ( topCard.isFaceUp && topCard.name === card ) {
				return true
			}
		}
		return false
	}
}