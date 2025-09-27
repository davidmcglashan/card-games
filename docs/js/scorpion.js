const game = {
	/**
	 * A new game starts with a new shuffled deck.
	 */
	start: () => {
		game.deck = dealer.newCardArray().reverse()//dealer.newShuffledCardArray()
	},

	/**
	 * Sets up the new piles. There is a deck, a pile to deal onto, four suits and seven towers.
	 */
	newPile: ( name ) => {
		// Towers require cards to be drawn from the deck
		if ( name.startsWith( 'tower' ) ) {
			let hand = []
			let hasCovered = parseInt( name.slice(-1) ) < 5
			let pile = null

			// Each pile is seven cards.
			for ( let i=0; i<7; i++ ) {
				hand.push( game.deck.pop() )
			}

			// The first four piles have their first three cards face down.
			if ( hasCovered ) {
				pile = dealer.newPile( name, hand )
				for ( let i=3; i<7; i++ ) {
					hand[i].isFaceUp = true
				}
			} else {
				pile = dealer.newFaceUpPile( name, hand )
			}

			pile.stackingMethod = dealer.stackingMethods.VERTICAL
			cardUI.snapPile( pile )
		} 
		
		// everything else is an empty pile. The deck will be set up in cardsDealt()
		else {
			let pile = dealer.newEmptyPile( name )
			if ( name === 'sting' ) {
				pile.stackingMethod = dealer.stackingMethods.RIGHT
			}
		}
	},

	/**
	 * Finalises the sting from the remaining undealt cards.
	 */
	cardsDealt: () => {
		dealer.addCardsToPile( 'sting', game.deck )
		cardUI.snapPile( dealer.piles['sting'] )
	},

	/**
	 * Is the pile in question currently interactive?
	 */
	canClickOrDragFromPileAtXY: ( pile, x, y ) => {		
		// The sting is always interactive, if it has cards.
		if ( pile.name === 'sting' ) {
			if ( pile.cards.length > 0 ) {
				// If there's a card on top it can be dealt to the towers.
				let topCard = dealer.peekTopOfPile( pile.name )
				if ( topCard && cardUI.xyIsInBounds( x, y, topCard.elem ) ) {
					return { 
						outcome: table.outcomes.PILE_IS_INTERACTIVE
					}
				}
			} 
			
			// Nothing to do with the sting.
			else {
				return { outcome: table.outcomes.NONE }
			}
		}

		// Interactions with towers.
		if ( pile.name.startsWith( 'tower-' ) ) {
			// Disallow clicks on empty tower
			if ( pile.cards.length === 0 && cardUI.xyIsInBounds( x, y, pile.elem ) ) {
				return { outcome: table.outcomes.NONE }
			}
			
			// The face-down top card of a tower can be interacted with to turn it over.
			let topCard = dealer.peekTopOfPile( pile.name )
			if ( topCard && !topCard.isFaceUp && cardUI.xyIsInBounds( x, y, topCard.elem ) ) {
				return { 
					outcome: table.outcomes.CARD_IS_INTERACTIVE, 
					card:topCard.name, 
					type: table.interactionTypes.CLICK
				}
			}
			
			// Any other face up card in a tower is interactive for dragging
			let topMost = null
			for ( let card of pile.cards ) {
				if ( card.isFaceUp && cardUI.xyIsInBounds( x, y, card.elem ) ) {
					topMost = card
				}
			}
			if ( topMost ) {
				return { 
					outcome: table.outcomes.CARD_IS_INTERACTIVE,
					card: topMost.name, 
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
		// Not a tower? Don't care ...
		if ( !pileName.startsWith( 'tower-' ) ) {
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
	 * Respond to clicks on cards  ... 
	 */
	clickOnCard: ( cardName, pileName ) => {
		// Turn over face down cards at the top of towers.
		if ( pileName.startsWith( 'tower-' ) ) {
			let card = dealer.peekTopOfPile( pileName )
			if ( card ) {
				card.isFaceUp = true
				cardUI.decorate( card )
			}
		}

		return false
	},

	/**
	 * Respond to clicks on piles  ... 
	*/
	clickOnPile: ( pileName ) => {
		// On the sting this deals the remaining cards onto the first three towers.
		if ( pileName === 'sting' ) {
			if ( dealer.piles['sting'].cards.length > 0 ) {
				// Take all the cards from the sting.
				let cards = dealer.piles['sting'].cards
				dealer.piles['sting'].cards = []
				
				let tower = 1
				for ( let card of cards ) {
					card.isFaceUp = true
					cardUI.decorate( card )
					dealer.placeOnPile( 'tower-' + tower, card )
					cardUI.snapPileWithAnimation( dealer.piles['tower-' + tower], { delay:5 } )
					tower += 1
				}

				return true
			}
		}

		return false
	},

	/**
	 * Can a drag be started from the pile in question using card?
	 */
	canStartDrag: ( cardName, pileName ) => {
		let card = dealer.findCardInPile( cardName, pileName )
		if ( card && card.isFaceUp ) {
			return true
		}

		return false
	},

	/**
	 * Respond to a request for dropping a card on a pile. For scorpion you can drop on a tower when its number and suit correspond
	 */
	canDropCardAtXYOnPile: ( card, x, y, pile ) => {
		// Dropping on a tower ...
		if ( pile.name.startsWith( 'tower-' ) ) {
			// ... can be done if the tower is showing the dropped cards' parent
			if ( pile.cards.length > 0 ) {
				let topCard = dealer.peekTopOfPile( pile.name )
				if ( topCard.suit === card.suit && topCard.ordValue === card.ordValue + 1 && cardUI.xyIsInBounds( x, y, topCard.elem ) ) {
					return table.outcomes.CARD_IS_INTERACTIVE
				}
			}

			// ... or by placing a king on an empty pile
			else if ( cardUI.xyIsInBounds( x, y, pile.elem ) ) {
				if ( card.ordValue === 12 ) {
					return table.outcomes.PILE_IS_INTERACTIVE
				}
			}
		}

		return table.outcomes.NONE
	},

	/**
	 * Called in response to a card drop. Works out if the dropped tower can be removed because
	 * it contains one whole suit.
	 */
	dropHappened: ( drag ) => {
		let pile = dealer.piles[drag.destination.getAttribute('data-pile')]
		if ( !pile ) {
			pile = dealer.piles[drag.destination.id]
		}

		let testSuit = null
		let test = 12
		let score = 0
		let start = 0
		let index = 0

		for ( let card of pile.cards ) {
			// What suit are we testing for?
			if ( testSuit === null ) {
				testSuit = card.suitOrd
			}

			// If this is the next card increase the score
			if ( card.ordValue === test && card.suitOrd === testSuit ) {
				test -=1 
				score += 1
			} 
			
			// .. otherwise start testing again from this card
			else {
				test = 11
				score = 1
				testSuit = card.suitOrd
				start = index
			}

			// Can we match 13 decreasing cards in a row? This means a full suit run!
			if ( score === 13 ) {
				// Take all the cards from the tower.
				let movingCards = pile.cards.slice(start,start+13)
				pile.cards.splice( start, 13 )
				cardUI.snapPileWithAnimation( pile, { duration:500, delay:5 } )

				let suitPileName = 'suit-' + dealer.deckmeta.suits[testSuit]
				for ( let movingCard of movingCards ) {
					dealer.placeOnPile( suitPileName, movingCard )
				}
				cardUI.snapPileWithAnimation( dealer.piles[suitPileName], { duration:500, delay:5 } )
				cardUI.removeAffordances( dealer.piles[suitPileName] )

				// We can abort the method at this point.
				return true
			}

			index += 1
		}
	},

	/**
	 * Detect the game over state and return an appropriate constant to represent it.
	 */
	hasFinished: () => {
		// We're finished when the four suit piles each have 13 cards.
		let suit = 0
		for ( const [name,pile] of Object.entries( dealer.piles ) ) {
			if ( pile.name.startsWith( 'suit-' ) && pile.cards.length === 13 ) {
				suit++
				if ( suit === 4 ) {
					return { state: table.gameOverStates.PLAYER_WINS }
				}
			}
		}

		// If there's cards in the sting we can keep going ...
		if ( dealer.piles['sting'].cards.length > 0 ) {
			return { state: table.gameOverStates.KEEP_PLAYING }
		}

		// Detect if there are no moves amongst the cards in the towers.
		for ( let i=1; i<8; i++ ) {
			// Get the top card of the pile, move on if there isn't one or if it's an ace.
			let topCard = dealer.peekTopOfPile( 'tower-'+i )
			if ( !topCard || topCard.ordValue === 0 ) {
				continue
			}

			// If the top card is face down then we carry on playing ...
			if ( !topCard.isFaceUp ) {
				return { state: table.gameOverStates.KEEP_PLAYING }
			}

			let nextName = dealer.deckmeta.values[topCard.ordValue-1] + '_of_' + dealer.deckmeta.suits[topCard.suitOrd]

			// Try and find this card's subsequent, face up in the other piles.
			for ( let j=1; j<8; j++ ) {
				// Don't look in the same pile.
				if ( i === j ) {
					continue
				}

				let search = dealer.findCardInPile( nextName, 'tower-'+j )
				if ( search && search.isFaceUp ) {
					return { state: table.gameOverStates.KEEP_PLAYING }
				}
			}
		}

		// Are there any empty piles? If so, search again for any mid-tower kings.
		for ( let i=1; i<8; i++ ) {
			if ( dealer.piles[ 'tower-'+i ].cards.length === 0 ) {
				for ( let j=1; j<8; j++ ) {
					if ( i === j ) { 
						continue 
					}
					for ( card of dealer.piles['tower-'+j].cards ) {
						if ( card.ordValue === 12 && card.isFaceUp ) {
							return { state: table.gameOverStates.KEEP_PLAYING }
						}
					}
				}
			}
		}

		// We didn't find a reason to continue, so we must stop
		return {
			state: table.gameOverStates.PLAYER_LOSES,
			message: `There are no more possible moves. Why not try again?`
		}
	},
};
