const game = {
	/**
	 * A new game starts with a new shuffled deck.
	 */
	start: () => {
		game.deck = dealer.newShuffledCardArray()
	},

	/**
	 * Sets up the new piles. There is a deck, and the first three piles each get one card ...
	 */
	newPile: ( name ) => {
		// We deal one card from the deck onto piles 1, 2, and 3.
		if ( name.endsWith( '-1' ) || name.endsWith( '-2' ) || name.endsWith( '-3' ) ) {
			// Deal from the pack
			let hand = []
			hand.push( game.deck.pop() )

			let pile = dealer.newTopFacePile( name, hand )
			pile.stackingMethod = dealer.stackingMethods.UNTIDY
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
		if ( pile.name === 'deck' ) {
			let topCard = dealer.peekTopOfPile( pile.name )
			if ( topCard && cardUI.xyIsInBounds( x, y, topCard.elem ) ) {
				for ( let p=1; p++; p<18 ) {
					let next = 'pile-' + p
					if ( dealer.piles[next].cards.length === 0 ) {
						return { 
							outcome: table.outcomes.CARD_IS_INTERACTIVE, 
							card: topCard.name, 
							type: table.interactionTypes.CLICK 
						}
					}
				}
			}

			return { outcome: table.outcomes.NONE }
		}

		let fromCard = dealer.peekTopOfPile( pile.name )
		if ( fromCard && cardUI.xyIsInBounds( x, y, fromCard.elem ) ) {
			// Piles can be dragged if there are suit or number matches on the next pile down.
			let outcome = game.getDragOutcome( fromCard, pile.name, 1 )

			// ... or if it matches the next row across.
			if ( !outcome ) {
				outcome = game.getDragOutcome( fromCard, pile.name, 3 )
			}

			if ( outcome ) { 
				return outcome
			}
		}

		return { outcome: table.outcomes.NONE }
	},

	getDragOutcome: ( fromCard, fromPileName, distance ) => {
		let toPileName = 'pile-' + ( parseInt( fromPileName.split('-')[1] ) - distance )
		let toCard = dealer.peekTopOfPile( toPileName )
		
		if ( toCard ) {
			if ( fromCard.suit === toCard.suit || fromCard.ordValue === toCard.ordValue ) {
				return {
					outcome: table.outcomes.CARD_IS_INTERACTIVE,
					card: fromCard.name,
					type: table.interactionTypes.DRAG
				}
			}
		}
	},

	/**
	 * Respond to clicks on cards ... 
	 */
	clickOnCard: ( cardName, pileName ) => {
		// The deck can always be clicked, if it has cards in it.
		if ( pileName === 'deck' ) {
			if ( dealer.piles['deck'].cards.length > 0 ) {
				// Find the first pile with no cards.
				for ( let p=1; p++; p<18 ) {
					let next = 'pile-' + p
					if ( dealer.piles[next].cards.length === 0 ) {
						// Flip the card and place it on the next pile.
						let card = dealer.takeFromPile( 'deck' )
						card.isFaceUp = true
						cardUI.decorate( card )
						dealer.placeOnPile( next, card )
						cardUI.snapPile( dealer.piles[next] )

						return true
					}
				}
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
		let fromCard = dealer.peekTopOfPile( pileName )
		let outcome = game.getDragOutcome( fromCard, pileName, 1 )

		// ... or if it matches the next row across.
		if ( !outcome ) {
			outcome = game.getDragOutcome( fromCard, pileName, 3 )
		}

		if ( outcome ) { 
			return true
		}	

		return false
	},

	/**
	 * Respond to a request for dropping a card on a pile. 
	 */
	canDropCardAtXYOnPile: ( fromCard, x, y, toPile ) => {
		let toCard = dealer.peekTopOfPile( toPile.name )
		if ( toCard && cardUI.xyIsInBounds( x, y, toCard.elem ) ) {
			if ( fromCard.name !== toCard.name && ( fromCard.suit === toCard.suit || fromCard.ordValue === toCard.ordValue ) ) {
				return 2
			}
		}

		return 0
	},

	/**
	 * Called in response to a card drop. Works out where the name card must be drawn from.
	 */
	dropHappened: ( drag ) => {
		// The dropped card should simply replace the card it's dropping onto
		let pile = dealer.piles[drag.destination.getAttribute('data-pile')]
		let keep = dealer.takeFromPile( pile.name )

		for ( let card of pile.cards ) {
			card.elem.remove()
		}
		pile.cards = [keep]

		// Tidy up the empty piles.
		for ( let i = 1; i<18; i++ ) {
			let thisPile = 'pile-' + i
			let nextPile = 'pile-' + (i+1)

			if ( dealer.piles[thisPile].cards.length === 0 ) {
				let hand = dealer.drawAllFromPile( nextPile )
				dealer.addCardsToPile( thisPile, hand )
				cardUI.snapPile( dealer.piles[thisPile] )
			}
		}
	},

	/**
	 * Returns 0 if the game isn't finished, 1 if the player loses, 2 if the player wins!
	 */
	hasFinished: () => {
		// Can't win until we've dealt all the cards.
		if ( dealer.piles['deck'].cards.length > 0 ) {
			return 0
		}

		// Are there any legal moves left?
		// Tidy up the empty piles.
		for ( let i = 1; i<18; i++ ) {
			let pileName = 'pile-' + i
			let fromCard = dealer.peekTopOfPile( pileName )
			if ( fromCard ) {
				let outcome = game.getDragOutcome( fromCard, pileName, 1 )
				if ( !outcome ) {
					outcome = game.getDragOutcome( fromCard, pileName, 3 )
				}

				// Any outcome here means a move can be made so return 0
				if ( outcome ) { 
					return 0
				}
			}
		}

		// A "winning" game is having one pile left so check the number of pards on pile 2.
		if ( dealer.piles['pile-2'].cards.length === 0 ) {
			return 2
		} else {
			return 1
		}
	}
};
