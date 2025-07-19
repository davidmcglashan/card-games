const game = {
	/**
	 * A new game starts with a new shuffled deck.
	 */
	start: () => {
		game.deck = dealer.newShuffledCardArray()
		table.nextPile = 4
	},

	/**
	 * Sets up the new piles. There is a deck, and the first three piles each get one card ...
	 */
	newPile: ( name ) => {
		// Towers require cards to be drawn from the deck
		if ( name.endsWith( '-1' ) || name.endsWith( '-2' ) || name.endsWith( '-3' ) ) {
			// Deal from the pack
			let hand = []
			hand.push( game.deck.pop() )

			let pile = dealer.newTopFacePile( name, hand )
			pile.stackingMethod = dealer.stackingMethods.UNTIDY
			cardUI.snapPile( pile )
		} 
		
		// everything else is an empty pile. The deck will be set up in cardsDealt()
		else {
			let pile = dealer.newEmptyPile( name )
			if ( name === 'deck' ) {
				pile.stackingMethod = dealer.stackingMethods.DIAGONAL
			}
		}
	},

	/**
	 * Finalises the deck from the remaining undealt cards.
	 */
	cardsDealt: () => {
		dealer.addCardsToPile( 'deck', game.deck )
		cardUI.snapPile( dealer.piles['deck'] )
	},

	/**
	 * Is the pile in question currently interactive?
	 */
	canClickOrDragFromPileAtXY: ( pile, x, y ) => {
		// The deck can always be clicked, if it has cards in it.
		if ( pile.name === 'deck' ) {
			let topCard = dealer.peekTopOfPile( pile.name )
			if ( topCard && cardUI.xyIsInBounds( x, y, topCard.elem ) ) {
				return { 
					outcome: table.outcomes.CARD_IS_INTERACTIVE, 
					card:topCard.name, 
					type: table.interactionTypes.CLICK 
				}
			}
		}

		return { outcome: table.outcomes.NONE }
	},

	/**
	 * Respond to clicks on cards ... 
	 */
	clickOnCard: ( cardName, pileName ) => {
		// The deck can always be clicked, if it has cards in it.
		if ( pileName === 'deck' ) {
			if ( dealer.piles['deck'].cards.length > 0 ) {
				let card = dealer.takeFromPile( 'deck' )
				card.isFaceUp = true
				cardUI.decorate( card )

				let next = 'pile-' + table.nextPile
				dealer.placeOnPile( next, card )
				cardUI.snapPile( dealer.piles[next] )

				table.nextPile++
				return true
			}
		}

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
