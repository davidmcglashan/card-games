const game = {
	/**
	 * A new game starts with a new shuffled deck.
	 */
	start: () => {
		game.deck = dealer.newShuffledCardArray()
	},

	/**
	 * Sets up the new piles. There is a deck, and the first four piles each get one card ...
	 */
	newPile: ( name ) => {
		// We deal one card from the deck onto piles 1, 2, and 3.
		if ( name.indexOf( '-' ) !== -1 ) {
			// Deal from the pack
			let hand = []
			hand.push( game.deck.pop() )

			let pile = dealer.newTopFacePile( name, hand )
			pile.stackingMethod = dealer.stackingMethods.VERTICAL
			cardUI.snapPile( pile )
		} 
		
		// Everything else is an empty pile. The deck will be set up in cardsDealt()
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
		// The deck can be clicked if it has cards in it and at least one pile is empty.
		if ( pile.name === 'deck' && pile.cards.length !== 0 ) {
			let topCard = dealer.peekTopOfPile( pile.name )
			if ( topCard && cardUI.xyIsInBounds( x, y, topCard.elem ) ) {
				return { 
					outcome: table.outcomes.CARD_IS_INTERACTIVE, 
					card: topCard.name, 
					type: table.interactionTypes.CLICK 
				}
			}
		}

		// You can always drag from the towers if they have cards
		if ( pile.name.indexOf( 'tower-' ) !== -1 && pile.cards.length !== 0 ) {
			let topCard = dealer.peekTopOfPile( pile.name )
			if ( topCard && cardUI.xyIsInBounds( x, y, topCard.elem ) ) {
				return { 
					outcome: table.outcomes.CARD_IS_INTERACTIVE, 
					card: topCard.name, 
					type: table.interactionTypes.DRAG
				}
			}
		}

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
		// The deck can always be clicked, if it has cards in it.
		if ( pileName === 'deck' ) {
			if ( dealer.piles['deck'].cards.length > 0 ) {
				// Find the first pile with no cards.
				for ( let t=1; t<=4; t++ ) {
					let next = 'tower-' + t

					// Flip the card and place it on the next pile.
					let card = dealer.takeFromPile( 'deck' )
					card.isFaceUp = true
					cardUI.decorate( card )
					dealer.placeOnPile( next, card )
					cardUI.snapPileWithAnimation( dealer.piles[next], t*50, true )
				}
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
		if ( pileName !== 'deck' ) {
			let topCard = dealer.peekTopOfPile( pileName )
			return topCard && cardName === topCard.name
		}
		return false
	},

	/**
	 * Respond to a request for dropping a card on a pile. 
	 */
	canDropCardAtXYOnPile: ( card, x, y, pile ) => {
		// Can only drop on the discard pile.
		if ( pile.name === 'discard' && cardUI.xyIsInBounds( x, y, pile.elem ) ) {
			// Can't drop aces on the discard pile.
			if ( card.ordValue === 0 ) {
				return table.outcomes.NONE
			}

			// Can only do this drop if the card is the lowest visible value of that suit.
			for ( let t=1; t<=4; t++ ) {
				let topCard = dealer.peekTopOfPile( 'tower-'+t )
				if ( topCard && topCard.suit === card.suit && (topCard.ordValue > card.ordValue || (topCard.ordValue === 0 && card.ordValue !== 0)) ) {
					return table.outcomes.PILE_IS_INTERACTIVE
				}
			}
		}

		// Can drop on an ace on an empty tower.
		if ( card.ordValue === 0 && pile.name.startsWith( 'tower-' ) && cardUI.xyIsInBounds( x, y, pile.elem ) ) {
			if ( pile.cards.length === 0 ) {
				return table.outcomes.PILE_IS_INTERACTIVE
			}
		}

		return table.outcomes.NONE
	},

	/**
	 * Called in response to a card drop. Works out where the name card must be drawn from.
	 */
	dropHappened: ( drag ) => {
		// The dropped card should simply replace the card it's dropping onto
		let pile = dealer.piles[drag.destination.getAttribute('id')]
		if ( pile.name === 'discard' ) {
			// Play a little animation rather than simply disappear the cartd.
			let anim = drag.card.elem.animate([{transform: 'scale(0)'}],{duration:250, easing: 'ease-in-out'});
			anim.pause()

			// All the tidy up takes place when the animation finishes.
			anim.onfinish = () => {
				dealer.takeFromPile( pile.name )
				drag.card.elem.remove()
			}

			anim.play()
		}
	},

	/**
	 * Returns 0 if the game isn't finished, 1 if the player loses, 2 if the player wins!
	 */
	hasFinished: () => {
		// Can't win until we've dealt all the cards.
		if ( dealer.piles['deck'].cards.length > 0 ) {
			return { state: table.gameOverStates.KEEP_PLAYING }
		}

		// There are moves left if we can't find all four suits from the top cards.
		let result = {}
		for ( let t=1; t<=4; t++ ) {
			let topCard = dealer.peekTopOfPile('tower-'+t)
			if ( topCard ) {
				result[topCard.suit] = 'true'
			}
		}

		// Are there four keys for the four suits?
		if ( Object.keys(result).length === 4 ) {
			return { state: table.gameOverStates.PLAYER_LOSES }
		}

		// There's still a move in there ...
		return { state: table.gameOverStates.KEEP_PLAYING }
	},

	/**
	 * Called when a setting has changed. It is the game's job to change itself accordingly.
	 */
	settingChanged: ( setting, active ) => { 
	},
};
