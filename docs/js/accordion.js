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
				for ( let p=1; p<=18; p++ ) {
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

		// Can always drag from a pile, apart from pile-1
		if ( pile.name === 'pile-1' ) {
			return { outcome: table.outcomes.NONE }
		}

		let topCard = dealer.peekTopOfPile( pile.name )
		if ( topCard && cardUI.xyIsInBounds( x, y, topCard.elem ) ) {
			return { 
				outcome: table.outcomes.CARD_IS_INTERACTIVE, 
				card: topCard.name, 
				type: table.interactionTypes.DRAG 
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
					type: table.interactionTypes.DRAG,
					pile: toPileName
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
				for ( let p=1; p<=18; p++ ) {
					let next = 'pile-' + p
					if ( dealer.piles[next].cards.length === 0 ) {
						// Flip the card and place it on the next pile.
						let card = dealer.takeFromPile( 'deck' )
						card.isFaceUp = true
						cardUI.decorate( card )
						dealer.placeOnPile( next, card )
						cardUI.snapPileWithAnimation( dealer.piles[next] )

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
		if ( pileName === 'pile-1' || pileName === 'deck' ) {
			return false
		}
		
		return true
	},

	/**
	 * Respond to a request for dropping a card on a pile. 
	 */
	canDropCardAtXYOnPile: ( fromCard, x, y, toPile ) => {
		// Can only drop on the neighbouring cards
		let fromPile = fromCard.elem.getAttribute('data-pile')

		let outcome = game.getDragOutcome( fromCard, fromPile, 1 )		
		if ( outcome && toPile.name === outcome.pile ) {
			let toCard = dealer.peekTopOfPile( toPile.name )
			if ( toCard && cardUI.xyIsInBounds( x, y, toCard.elem ) ) {
				return table.outcomes.CARD_IS_INTERACTIVE
			}
		}

		outcome = game.getDragOutcome( fromCard, fromPile, 3 )
		if ( outcome && toPile.name === outcome.pile ) {
			let toCard = dealer.peekTopOfPile( toPile.name )
			if ( toCard && cardUI.xyIsInBounds( x, y, toCard.elem ) ) {
				return table.outcomes.CARD_IS_INTERACTIVE
			}
		}

		return table.outcomes.NONE
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
				cardUI.snapPileWithAnimation( dealer.piles[thisPile], { delay: i*10 } )
			}
		}
	},

	/**
	 * Detect the game over state and return an appropriate object to represent it.
	 */
	hasFinished: () => {		
		// This loop has two purposes: 1. count the piles with cards on, 2. check for legal moves.
		// If we detect any legal move then the game is not finished ...
		let pileCount = 0
		for ( let i = 1; i<=18; i++ ) {
			let pileName = 'pile-' + i
			let fromCard = dealer.peekTopOfPile( pileName )
			
			if ( fromCard ) {
				pileCount += 1

				let outcome = game.getDragOutcome( fromCard, pileName, 1 )
				if ( !outcome ) {
					outcome = game.getDragOutcome( fromCard, pileName, 3 )
				}
				
				// Any outcome here means a move can be made so keep playing.
				if ( outcome ) { 
					return { state: table.gameOverStates.KEEP_PLAYING }
				}
			}
		}

		// You can lose with every pile full and no legal moves.
		if ( pileCount === 18 ) {
			return {
				state: table.gameOverStates.PLAYER_LOSES,
				message: `No legal moves left. Try again ... !`
			}
		}

		// Can't win until we've dealt all the cards.
		if ( dealer.piles['deck'].cards.length > 0 ) {
			return { state: table.gameOverStates.KEEP_PLAYING }
		}
	
		// No legal moves and no cards left to deal is the end of the game. The player won if there is but one pile left ...
		if ( pileCount === 1 ) {
			return { 
				state: table.gameOverStates.PLAYER_WINS,
				message: `A perfect game!`
			}
		} else if ( pileCount < 4 ) {
			return {
				state: table.gameOverStates.PLAYER_LOSES,
				message: `So close! Only ${pileCount} cards left. Why not try again?`
			}
		} else if ( pileCount > 3 && pileCount < 8 ) {
			return {
				state: table.gameOverStates.PLAYER_LOSES,
				message: `You scored ${pileCount} - Almost there. Have another go.`
			}
		} else {
			return {
				state: table.gameOverStates.PLAYER_LOSES,
				message: `You scored ${pileCount} - Better luck next time!`
			}
		} 
	},
};
