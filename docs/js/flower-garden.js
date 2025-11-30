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
		// Beds require cards to be drawn from the deck
		if ( name.startsWith( 'bed-' ) ) {
			// Deal from the pack
			let hand = []
			for ( let i=0; i<6; i++ ) {
				hand.push( game.deck.pop() )
			}

			let pile = dealer.newFaceUpPile( name, hand )
			pile.stackingMethod = dealer.stackingMethods.VERTICAL
			cardUI.snapPile( pile )
		} 
		
		// The bouquet is a single pile with special properties.
		else if ( name === 'bouquet' ) {
			// Deal from the pack
			let hand = []
			for ( let i=0; i<16; i++ ) {
				hand.push( game.deck.pop() )
			}

			let pile = dealer.newFaceUpPile( name, hand )
			pile.stackingMethod = dealer.stackingMethods.HORIZONTAL
			pile.removalMethod = dealer.removalMethods.FREE

			dealer.sort( pile )
			cardUI.snapPile( pile )
		} 
		
		// everything else is an empty pile. The deck will be set up in cardsDealt()
		else {
			let pile = dealer.newEmptyPile( name )
		}	
	},

	/**
	 * Is the pile in question currently interactive?
	 */
	canClickOrDragFromPileAtXY: ( pile, x, y ) => {		
		// Disallow interactions with empty piles.
		if ( pile.cards.length === 0 && cardUI.xyIsInBounds( x, y, pile.elem ) ) {
			return { outcome: table.outcomes.NONE }
		}

		// Interactions with beds require the top card ...
		if ( pile.name.startsWith( 'bed-' ) || pile.name.startsWith( 'suit-' ) ) {
			let topCard = dealer.peekTopOfPile( pile.name )
			if ( topCard && cardUI.xyIsInBounds( x, y, topCard.elem ) ) {
				return { 
					outcome: table.outcomes.CARD_IS_INTERACTIVE, 
					card:topCard.name, 
					type: table.interactionTypes.DRAG
				}
			}
		}

		// All cards in the bouquet are interactive for dragging
		else if ( pile.name === 'bouquet' ) {
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
	 * Can a drag be started from the pile in question using card?
	 */
	canStartDrag: ( cardName, pileName ) => {
		// You can drag from a bed as long as there's a top card.
		if ( pileName.startsWith( 'bed-' ) || pileName.startsWith( 'suit-' ) ) {
			let card = dealer.peekTopOfPile( pileName )
			if ( card && card.name === cardName ) {
				return true
			}
		}

		// You can drag from the bouquet as long the card is in there.
		if ( pileName === 'bouquet' ) {
			for ( let card of dealer.piles[pileName].cards ) {
				if ( card.name === cardName ) {
					return true
				}
			}
 		}

		return false
	},

	/**
	 * Respond to a request for dropping a card on a pile. 
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

		// Drops can be done on beds following the descending numbers rule.
		if ( pile.name.startsWith( 'bed-' ) ) {
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
	 * Called in response to a card drop. Keeps the bouquet looking nice
	 */
	dropHappened: ( drag ) => {
		cardUI.snapPileWithAnimation( dealer.piles['bouquet'] )
	},

	/**
	 * Called in response to a snapback animation, usually from a failed drop. 
	 */
	snapBackHappened: ( pileName ) => {
		cardUI.snapPileWithAnimation( dealer.piles[pileName] )
	},

	/**
	 * Detect the game over state and return an appropriate object to represent it.
	 * Usually this will just contain the 'keep playing' state, but if the game has
	 * finished it'll be a bit richer.
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
