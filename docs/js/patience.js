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
			dealer.newTopFacePile( name, hand )
			cardUI.snapPile( dealer.piles[name] )
		} 
		
		// everything else is an empty pile. The deck will be set up in cardsDealt()
		else {
			dealer.newEmptyPile( name )
		}
	},

	cardsDealt: () => {
		dealer.addCardsToPile( 'deck', game.deck )
		cardUI.snapPile( dealer.piles['deck'] )
	}
};
