const game = {
	/**
	 * A new game starts with a new shuffled deck.
	 */
	start: () => {
		game.deck = dealer.newShuffledCardArray()

		// If we're starting with the aces then extract them before dealing
		if ( localStorage['streets.startWithAces'] ) {
			game.aces = []
			
			// Find the aces
			for ( let card of game.deck ) {
				if ( card.ordValue === 0 ) {
					game.aces.push( card )
				}
			}
			game.deck = game.deck.filter( card => !game.aces.includes( card ) )	
		}
	},

	/**
	 * Sets up the new piles. There is a deck, a pile to deal onto, four suits and seven towers.
	 */
	newPile: ( name ) => {
		// Towers require cards to be drawn from the deck
		if ( name.startsWith( 'pile' ) ) {
			let acesOut = localStorage['streets.startWithAces']
			let pileNo = parseInt( name.split('-')[1] ) 

			// Deal from the pack
			let amount = 6
			if ( !acesOut ) {
				amount = parseInt( name.slice(-1) ) % 2 === 1 ? 7 : 6
			}

			let hand = []
			for ( let i=0; i<amount; i++ ) {
				hand.push( game.deck.pop() )
			}
			let pile = dealer.newFaceUpPile( name, hand )
			pile.stackingMethod = pileNo % 2 === 0 ? dealer.stackingMethods.RIGHT : dealer.stackingMethods.LEFT
			cardUI.snapPile( pile )
		} 
		
		// everything else is an empty pile. The deck will be set up in cardsDealt()
		else {
			let pile = dealer.newEmptyPile( name )
		}
	},

	/**
	 * Called when dealing is complete to set up the suit piles.
	 */
	cardsDealt: () => {
		if ( localStorage['streets.startWithAces'] ) {
			for ( card of game.aces ) {
				card.isFaceUp = true
				dealer.placeOnPile( 'suit-' + card.suit, card )
				cardUI.snapPile( dealer.piles['suit-' + card.suit] )
			}
		}
	},

	/**
	 * Is the pile in question currently interactive?
	 */
	canClickOrDragFromPileAtXY: ( pile, x, y ) => {
		// Interactions with piles ...
		if ( pile.name.startsWith( 'pile-' ) ) {
			// Disallow interactions with empty piles.
			if ( pile.cards.length === 0 && cardUI.xyIsInBounds( x, y, pile.elem ) ) {
				return { outcome: table.outcomes.NONE }
			}
			
			// Only the top card can be interacted with, to drag it away somewhere else.
			let topCard = dealer.peekTopOfPile( pile.name )
			if ( topCard && cardUI.xyIsInBounds( x, y, topCard.elem ) ) {
				return { 
					outcome: table.outcomes.CARD_IS_INTERACTIVE, 
					card:topCard.name, 
					type: table.interactionTypes.DRAG
				}
			}
		}

		// You can only drag from on suits and spares.
		return { outcome: table.outcomes.NONE }
	},

	/**
	 * You can drag from anything, as long as there's a card there ...
	 */
	canStartDrag: ( cardName, pileName ) => {
		if ( dealer.peekTopOfPile( pileName ) ) {
			return true
		}

		return false
	},

	/**
	 * Respond to a request for dropping a card on a pile. 
	 */
	canDropCardAtXYOnPile: ( card, x, y, pile ) => {
		let fromPile = card.elem.getAttribute('data-pile')

		// Dropping a card onto one of the spares ...
		if ( pile.name.startsWith( 'spare-' ) ) {
			// If we doing strict storage we we can only drop onto the spare at the
			// same side of the table as where the drag started.
			if ( localStorage['streets.strictStorage'] ) {
				if ( pile.name === 'spare-streets' ) {
					if ( fromPile === 'pile-2' || fromPile === 'pile-4' || fromPile === 'pile-6' || fromPile === 'pile-8' ) {
						return table.outcomes.NONE	
					}
				} else if ( pile.name === 'spare-alleys' ) {
					if ( fromPile === 'pile-1' || fromPile === 'pile-3' || fromPile === 'pile-5' || fromPile === 'pile-7' ) {
						return table.outcomes.NONE	
					}
				}

				// Forbid dragging from one spare pile to the other
				if ( fromPile.startsWith( 'spare-' ) ) {
					return table.outcomes.NONE
				}
			}
			
			// You can drop on a spare as long as it's empty.
			if ( pile.cards.length === 0 && cardUI.xyIsInBounds( x, y, pile.elem ) ) {
				return table.outcomes.PILE_IS_INTERACTIVE
			}
		}

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

		// Dropping on a tower
		if ( pile.name.startsWith( 'pile-' ) ) {
			// If we came from a spare we can only drop onto the piles at that side of the table.
			if ( localStorage['streets.strictStorage'] ) {
				if ( fromPile === 'spare-streets' ) {
					if ( pile.name === 'pile-2' || pile.name === 'pile-4' || pile.name === 'pile-6' || pile.name === 'pile-8' ) {
						return table.outcomes.NONE	
					}
				}

				if ( fromPile === 'spare-alleys' ) {
					if ( pile.name === 'pile-1' || pile.name === 'pile-3' || pile.name === 'pile-5' || pile.name === 'pile-7' ) {
						return table.outcomes.NONE	
					}
				}
			}

			// Drops can be done following the descending numbers rule.
			if ( pile.cards.length > 0 ) {
				let topCard = dealer.peekTopOfPile( pile.name )
				if ( topCard.ordValue === card.ordValue + 1 && cardUI.xyIsInBounds( x, y, topCard.elem ) ) {
					return table.outcomes.CARD_IS_INTERACTIVE
				}
			}

			// ... or by building a new pile in an empty space
			else if ( cardUI.xyIsInBounds( x, y, pile.elem ) ) {
				return table.outcomes.PILE_IS_INTERACTIVE
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

	/**
	 * Called when a setting has changed. It is the game's job to change itself accordingly.
	 */
	settingChanged: ( setting, active ) => { 
		if ( setting === 'streets.storage' ) {
			if ( active ) {
				let elem = document.getElementById( 'spare-streets' )
				elem.classList.remove( 'hidden' )
				elem = document.getElementById( 'spare-alleys' )
				elem.classList.remove( 'hidden' )
			} else {
				let elem = document.getElementById( 'spare-streets' )
				elem.classList.add( 'hidden' )
				elem = document.getElementById( 'spare-alleys' )
				elem.classList.add( 'hidden' )
			}
		}
	},
};
