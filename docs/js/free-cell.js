const game = {
	name: 'freeCell',			// Required for persisting game state
	supportsStartAgain: true, 	// Free Cell games can be started over with the same shuffled deck.
	stacking: {
		'tower-1': dealer.stackingMethods.VERTICAL,
		'tower-2': dealer.stackingMethods.VERTICAL,
		'tower-3': dealer.stackingMethods.VERTICAL,
		'tower-4': dealer.stackingMethods.VERTICAL,
		'tower-5': dealer.stackingMethods.VERTICAL,
		'tower-6': dealer.stackingMethods.VERTICAL,
		'tower-7': dealer.stackingMethods.VERTICAL
	},

	/**
	 * A new game starts with a new shuffled deck.
	 */
	start: ( startOver = false ) => {
		// If we're not starting over then shuffle a new deck.
		if ( !startOver ) {
			game.deck = dealer.newShuffledCardArray()
			game.restartDeck = structuredClone( game.deck )
		} 
		
		// Otherwise we ARE starting over and the deck should be the one we used last time,
		// if it exists ...
		else {
			if ( game.restartDeck ) {
				game.deck = structuredClone( game.restartDeck )
			} else {
				game.deck = dealer.newShuffledCardArray()
				game.restartDeck = structuredClone( game.deck )
			}
		}
	},

	/**
	 * Sets up the new piles: eight towers, four foundations, and four free cells
	 */
	newPile: ( name ) => {
		// Towers require cards to be drawn from the deck
		if ( name.startsWith( 'tower' ) ) {
			let hand = []
			
			// Each pile is seven or eight cards.
			let l = parseInt( name.slice(-1) ) < 5 ? 7 : 6
			for ( let i=0; i<l ; i++ ) {
				hand.push( game.deck.pop() )
			}
			
			let pile = dealer.newFaceUpPile( name, hand )
			cardUI.snapPile( pile )
		} 
		
		// everything else is an empty pile. The deck will be set up in cardsDealt()
		else {
			dealer.newEmptyPile( name )
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

		// Interactions with towers require the top card ...
		if ( pile.name.startsWith( 'tower-' ) || pile.name.startsWith( 'suit-' ) ) {
			let topCard = dealer.peekTopOfPile( pile.name )
			if ( topCard && cardUI.xyIsInBounds( x, y, topCard.elem ) ) {
				return { 
					outcome: table.outcomes.CARD_IS_INTERACTIVE, 
					card:topCard.name, 
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
		// You can drag from anywhere as long as there's a top card.
		let card = dealer.peekTopOfPile( pileName )
		if ( card && card.name === cardName ) {
			return true
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

		// Dropping on a tower ...
		else if ( pile.name.startsWith( 'tower-' ) ) {
			// ... can be done if the tower is showing the dropped cards' parent
			if ( pile.cards.length > 0 ) {
				let topCard = dealer.peekTopOfPile( pile.name )
				if ( topCard.isRed !== card.isRed && topCard.ordValue === card.ordValue + 1 && cardUI.xyIsInBounds( x, y, topCard.elem ) ) {
					return table.outcomes.CARD_IS_INTERACTIVE
				}
			}

			// ... or by placing any card on an empty pile
			else if ( cardUI.xyIsInBounds( x, y, pile.elem ) ) {
				return table.outcomes.PILE_IS_INTERACTIVE
			}
		}

		// Dropping on a free cell can only be done if it's empty ...
		else if ( pile.name.startsWith( 'free-' ) ) {
			if ( pile.cards.length === 0 && cardUI.xyIsInBounds( x, y, pile.elem ) ) {
				return table.outcomes.PILE_IS_INTERACTIVE
			}
		}

		return table.outcomes.NONE
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
