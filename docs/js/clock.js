const game = {
	/**
	 * Starts a new game, shuffles a deck.
	 */
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
			let pile = dealer.newEmptyPile( name )
			if ( name === 'drop-king' ) {
				pile.stackingMethod = dealer.stackingMethods.RIGHT
			}
		}
	},

	/**
	 * Respond to requests for interactivity.
	 */
	canClickOrDragFromPileAtXY: ( pile, x, y ) => {
		if ( pile.name === game.nextPile && pile.cards.length > 0  && cardUI.xyIsInBounds( x, y, pile.elem ) ) {
			// Face down cards can be clicked, Face up can be dragged.
			let topCard = dealer.peekTopOfPile( pile.name )
			return { 
				outcome: table.outcomes.CARD_IS_INTERACTIVE, 
				card: topCard.name, 
				type: topCard.isFaceUp ? table.interactionTypes.DRAG : table.interactionTypes.CLICK
			}
		}

		return { outcome: table.outcomes.NONE }
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
	 * Respond to a request for dropping a card on a pile. You can only do this if the
	 * pile number matches the card number e.g. A,1,2,3,4,5,6,7,8,9,10,J,Q,K
	 */
	canDropCardAtXYOnPile: ( card, x, y, pile ) => {
		if ( cardUI.xyIsInBounds( x, y, pile.elem ) ) {
			let num = card.name.split('_')
			if ( pile.name.startsWith( 'drop' ) && pile.name.endsWith( num[0] ) ) {
				if ( pile.cards.length === 0 ) {
					return table.outcomes.PILE_IS_INTERACTIVE
				}
				return table.outcomes.CARD_IS_INTERACTIVE
			}
		}
		
		return table.outcomes.NONE
	},

	/**
	 * Called in response to a card drop. Works out where the name card must be drawn from.
	 */
	dropHappened: ( drag ) => {
		let num = drag.card.name.split('_')
		game.nextPile = 'clock-' + num[0]

		// If we're auto-turning the next card, now would be the time.
		if ( localStorage['clock.autoTurnNextCard'] ) {
			let topCard = dealer.peekTopOfPile( game.nextPile )
			if ( topCard ) {
				topCard.isFaceUp = true
				cardUI.decorate( topCard )
			}
		}
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
	},

	/**
	 * Detect the game over state and return an appropriate constant to represent it.
	 */
	hasFinished: () => {
		// We're finished when the drop-king pile has four cards.
		let pile = dealer.piles['drop-king']
		if ( pile.cards.length === 4 ) {
			// If all the drop piles have four cards then this is a win! So if we find
			// any with less than 4 it's a lose!
			for ( const [name,pile] of Object.entries( dealer.piles ) ) {
				if ( pile.name.startsWith( 'drop-' ) && pile.cards.length !== 4 ) {
					return { state: table.gameOverStates.PLAYER_LOSES }
				}
			}
			return { state: table.gameOverStates.PLAYER_WINS }
		}

		return { state: table.gameOverStates.KEEP_PLAYING }
	}
}