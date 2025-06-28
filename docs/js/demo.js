const game = {
	newPile: ( name ) => {
		if ( name === 'pile-deck' ) {
			// Have the dealer shuffle a new deck of cards, and place them face down in a pile.
			dealer.newFaceDownPile( name, dealer.newShuffledCardArray() )
			cardUI.snapPile( dealer.piles[name] )
		} else {
			dealer.newEmptyPile( name )
		}
	},

	clickOnCard: ( card, pile ) => {
		// Was the clicked card the one at the top of the deck pile?
		let topCard = dealer.peekTopOfPile( pile )
		if ( !topCard.isFaceUp && topCard.name === card ) {
			topCard.isFaceUp = true
			cardUI.decorate( topCard )
			return true
		}

		return false
	},

	canDrop: ( card, pile ) => {
		// Can't drop on the deck ...
		if ( pile.name === 'pile-deck' ) {
			return false
		}

		// Can drop on empty piles
		if ( pile.cards.length === 0 ) {
			return true
		}
	
		// Can only drop on matching suits.
		let topCard = dealer.peekTopOfPile( pile.name )
		return card.suit === topCard.suit
	},

	clickOnPile: ( pile ) => {
		return false
	},

	pressOnCard: ( card, pile ) => {
		let topCard = dealer.peekTopOfPile( pile )
		if ( !topCard.isFaceUp && topCard.name === card ) {
			return false;
		}

		return true
	}
}