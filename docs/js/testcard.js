const game = {
	/**
	 * This game maintains a deck to deal from when the suit changes.
	 */
	start: () => {
		game.deck = dealer.newCardArray()
	},

	/**
	 * Called to set up a pile. Deals the next card from the game's deck onto it.
	 */
	newPile: ( name ) => {
		let cards = []
		cards.push( game.deck.pop() )
		dealer.newTopFacePile( name, cards )
		cardUI.snapPile( dealer.piles[name] )
	},
	
	/**
	 * Respond to request for interactions with a pile at (x,y)
	 * This returns true for card interactions if the (x,y) is within any card.
	 */
	canClickOrDragFromPileAtXY: ( pile, x, y ) => {
		// Empty piles can't be interacted with
		if ( pile.cards.length > 0 ) {
			let topCard = dealer.peekTopOfPile( pile.name )
			let rect = topCard.elem.getBoundingClientRect()

			if ( x > rect.x && x < rect.x + rect.width && y > rect.y && y < rect.y + rect.height ) {
				return 2
			}
		}

		return 0
	},

	/**
	 * Respond to clicks on the deck to deal out the next suit.
	 */
	clickOnCard: ( c, p ) => {
		let cards = document.getElementById( 'cards' )
		cards.innerHTML = ''

		// if there are no cards left in the deck then it's time for a new deck!
		if ( game.deck.length === 0 ) {
			game.deck = dealer.newCardArray()
		}

		// Tell the game about the piles we find in the DOM.
		let piles = document.getElementsByClassName( 'pile' )
		for ( let pile of piles ) {
			game.newPile( pile.getAttribute( 'id' ) )
		}
		return true
	},

	/**
	 * This game never ends. Sorry!
	 */
	hasFinished: () => {
		return 0
	}
}