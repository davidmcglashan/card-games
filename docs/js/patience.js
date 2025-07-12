const game = {
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
	canClickOrDragFromPile: ( pile ) => {
		// The deck is always interactive, if it has cards.
		if ( pile.name === 'deck' ) {
			if ( dealer.piles['deck'].cards.length + dealer.piles['drawn'].cards.length > 0 ) {
				return true
			} else {
				return false
			}
		}

		// Towers can be clicked if their top card is face down. 
		if ( pile.name.startsWith( 'tower-' ) ) {
			if ( pile.cards.length === 0 ) {
				return false
			}

			let topCard = dealer.peekTopOfPile( pile.name )
			if ( !topCard.isFaceUp ) {
				return true
			}

			return false
		}

		return false
	},

	/**
	 * Respond to clicks on the various piles
	 */
	clickOnCard: ( cardName, pileName ) => {
		if ( pileName === 'deck' ) {
			// Deal three if there's cards in the deck.
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
		return false
	},

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

	canDrop: ( card, pile ) => {
		// Permit the building of suits onto the suit piles 
		if ( pile.name === ( 'suit-' + card.suit ) && pile.cards.length === card.ordValue ) {
			return true
		}
		return false
	},

	/**
	 * Called in response to a card drop. This game is fine with the default behaviour.
	 */
	dropHappened: ( card, startPileName, endPileName ) => {
		//
	},
};
