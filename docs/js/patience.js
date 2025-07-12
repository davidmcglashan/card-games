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
					return 2
				}

				// Do we need to reset the deck and put the drawn cards back?
				else if ( pile.cards.length === 0 && dealer.piles['drawn'].cards.length > 0 && cardUI.xyIsInBounds( x, y, pile.elem ) ) {
					return 1
				} 
			} 
			
			// Nothing to do with the deck.
			else {
				return 0
			}
		}

		// The draw pile is always interactive, if it has cards.
		if ( pile.name === 'drawn' ) {
			if ( pile.cards.length > 0 ) {
				let topCard = dealer.peekTopOfPile( pile.name )
				if ( cardUI.xyIsInBounds( x, y, topCard.elem ) ) {
					return 2
				}
			} else {
				return 0
			}
		}

		// Towers can be clicked if their top card is face down, so you can turn it over.
		if ( pile.name.startsWith( 'tower-' ) ) {
			// Disallow clicks on empty pile
			if ( pile.cards.length === 0 && cardUI.xyIsInBounds( x, y, pile.elem ) ) {
				return 0
			}

			let topCard = dealer.peekTopOfPile( pile.name )
			if ( topCard && cardUI.xyIsInBounds( x, y, topCard.elem ) ) {
				return 2
			}
		}

		return 0
	},

	/**
	 * Respond to clicks on cards  ... 
	 *  - On the deck's top card this deals three cards.
	 */
	clickOnCard: ( cardName, pileName ) => {
		// Deal three if there's cards in the deck.
		if ( pileName === 'deck' ) {
			if ( dealer.piles['deck'].cards.length > 0 ) {
				let hand = dealer.drawFromPile( 'deck', 3 )
				for ( let card of hand ) {
					card.isFaceUp = true
					cardUI.decorate( card )
					dealer.placeOnPile( 'drawn', card )
				}
				cardUI.snapPile( dealer.piles['drawn'] )
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
				
				// Place them back onto the deck
				for ( let card of cards ) {
					card.isFaceUp = false
					cardUI.decorate( card )
					dealer.placeOnPile( 'deck', card )
				}

				cardUI.snapPile( dealer.piles['deck'] )
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
				return 1
			}

			// Dropping the next card onto a pile with cards already.
			if ( pile.cards.length > 0 ) {
				let topCard = dealer.peekTopOfPile( pile.name )
				if ( cardUI.xyIsInBounds( x, y, topCard.elem ) ) {
					return 2
				}
			}

		}

		// Dropping on a tower ...
		if ( pile.name.startsWith( 'tower-' ) ) {
			// ... can be done following the "red 7 on black 8" rule.
			if ( pile.cards.length > 0 ) {
				let topCard = dealer.peekTopOfPile( pile.name )
				if ( topCard.isRed !== card.isRed && topCard.ordValue === card.ordValue + 1 && cardUI.xyIsInBounds( x, y, topCard.elem ) ) {
					return 2
				}
			}

			// ... or by letting a king drop into a space.
			else if ( card.ordValue === 12 && cardUI.xyIsInBounds( x, y, pile.elem ) ) {
				return 1
			}
		}

		return 0
	},

	/**
	 * Returns 0 if the game isn't finished, 1 if the player loses, 2 if the player wins!
	 */
	hasFinished: () => {
		return 0
	}
};
