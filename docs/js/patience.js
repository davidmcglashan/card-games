const game = {
	/**
	 * A new game starts with a new shuffled deck.
	 */
	start: () => {
		game.deck = dealer.newShuffledCardArray()
	},

	/**
	 * Sets up the new piles. There is a deck, a pile to deal onto, four suits and seven towers.
	 */
	newPile: ( name ) => {
		// Towers require cards to be drawn from the deck
		if ( name.startsWith( 'tower' ) ) {
			// Deal from the pack
			let amount = parseInt( name.slice(-1) )
			let hand = []
			for ( let i=0; i<amount; i++ ) {
				hand.push( game.deck.pop() )
			}
			let pile = dealer.newTopFacePile( name, hand )
			pile.stackingMethod = dealer.stackingMethods.VERTICAL
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
		// The deck is always interactive, if it has cards.
		if ( pile.name === 'deck' ) {
			if ( pile.cards.length + dealer.piles['drawn'].cards.length > 0 ) {
				// If there's a card on top it can be dealt to the drawn pile.
				let topCard = dealer.peekTopOfPile( pile.name )
				if ( topCard && cardUI.xyIsInBounds( x, y, topCard.elem ) ) {
					return { 
						outcome: table.outcomes.CARD_IS_INTERACTIVE, 
						card:topCard.name, 
						type: table.interactionTypes.CLICK
					}
				}

				// Do we need to reset the deck and put the drawn cards back?
				else if ( pile.cards.length === 0 && dealer.piles['drawn'].cards.length > 0 && cardUI.xyIsInBounds( x, y, pile.elem ) ) {
					return { outcome: table.outcomes.PILE_IS_INTERACTIVE }
				} 
			} 
			
			// Nothing to do with the deck.
			else {
				return { outcome: table.outcomes.NONE }
			}
		}

		// The draw pile is always interactive, if it has cards.
		if ( pile.name === 'drawn' ) {
			if ( pile.cards.length > 0 ) {
				let topCard = dealer.peekTopOfPile( pile.name )
				if ( cardUI.xyIsInBounds( x, y, topCard.elem ) ) {
					return { 
						outcome: table.outcomes.CARD_IS_INTERACTIVE,
						card: topCard.name, 
						type: table.interactionTypes.DRAG 
					}
				}
			} else {
				return {outcome:0}
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
	 *  - On the deck's top card this deals three cards.
	 */
	clickOnCard: ( cardName, pileName ) => {
		// Deal three if there's cards in the deck.
		if ( pileName === 'deck' ) {
			if ( dealer.piles['deck'].cards.length > 0 ) {
				let hand = dealer.drawFromPile( 'deck', localStorage['patience.oneAtATime'] ? 1 : 3 )
				for ( let card of hand ) {
					card.isFaceUp = true
					cardUI.decorate( card )
					dealer.placeOnPile( 'drawn', card )
				}
				cardUI.snapPileWithAnimation( dealer.piles['drawn'], { delay:50, reverse:true, glass:false } )
				return true
			}
		}

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
	 *  - On the empty deck this resets the deck to start dealing again.
	 */
	clickOnPile: ( pileName ) => {
		if ( pileName === 'deck' ) {
			// If the deck is empty we return everything drawn back to it.
			if ( dealer.piles['deck'].cards.length === 0 ) {
				// Take all the cards from the drawn pile.
				let cards = dealer.piles['drawn'].cards.reverse()
				dealer.piles['drawn'].cards = []
				
				// Are we shuffling or simply flipping around?
				if ( localStorage['patience.shuffleAfterDeal'] ) {
					cards = dealer.shuffle( cards )
				}

				// Place them back onto the deck
				for ( let card of cards ) {
					card.isFaceUp = false
					cardUI.decorate( card )
					dealer.placeOnPile( 'deck', card )
				}

				cardUI.snapPileWithAnimation( dealer.piles['deck'], { delay:5 } )
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
	 * Respond to a request for dropping a card on a pile. For patience this means ...
	 *  - you can drop onto a suit pile if it's the next card - 2 follows 1, follows A
	 *  - you can drop on a tower when it number and value correspond: "red 7 on black 8"
	 */
	canDropCardAtXYOnPile: ( card, x, y, pile ) => {
		// Permit the building of suits onto the suit piles 
		if ( pile.name === ( 'suit-' + card.suit ) && pile.cards.length === card.ordValue ) {
			// Dropping an ace on an empty pile.
			if ( pile.cards.length === 0 && cardUI.xyIsInBounds( x, y, pile.elem ) ) {
				return table.outcomes.PILE_IS_INTERACTIVE
			}

			// Dropping the next card onto a pile with cards already.
			if ( pile.cards.length > 0 ) {
				let topCard = dealer.peekTopOfPile( pile.name )
				if ( cardUI.xyIsInBounds( x, y, topCard.elem ) ) {
					return table.outcomes.CARD_IS_INTERACTIVE
				}
			}
		}

		// Dropping on a tower ...
		if ( pile.name.startsWith( 'tower-' ) ) {
			// ... can be done following the "red 7 on black 8" rule.
			if ( pile.cards.length > 0 ) {
				let topCard = dealer.peekTopOfPile( pile.name )
				if ( topCard.isRed !== card.isRed && topCard.ordValue === card.ordValue + 1 && cardUI.xyIsInBounds( x, y, topCard.elem ) ) {
					return table.outcomes.CARD_IS_INTERACTIVE
				}
			}

			// ... or by building a new tower on an empty pile
			else if ( cardUI.xyIsInBounds( x, y, pile.elem ) ) {
				// Needs the anyCardOnASpace setting or to be a king ...
				if ( localStorage['patience.anyCardOnASpace'] || card.ordValue === 12 ) {
					return table.outcomes.PILE_IS_INTERACTIVE
				}
			}
		}

		return table.outcomes.NONE
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

		return { state: table.gameOverStates.KEEP_PLAYING }
	},
};
