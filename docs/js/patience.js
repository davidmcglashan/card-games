const patience = {
	// There are seven piles which we draw from.
	piles: [],

	/**
	 * Let's play patience!
	 */
	play: () => {
		// Get the deck ready.
		deck.new()
		deck.shuffle()

		// Build each pile up.
		for ( let p = 0; p < 7; p++ ) {
			patience.piles[p] = deck.draw( p+1 )
		}

		elem = document.getElementById('banner')
		elem.classList.add( 'hidden' )
	},

	debug: () => {
		let str = ''

		for ( let p = 0; p < 7; p++ ) {
			for ( let i = 0; i < patience.piles[p].length; i++ ) {
				str = str + patience.piles[p][i].name + '\n'
			}
		}

		for ( let card of deck.cards ) {
			str = str + card.name + '\n'
		}

		let elem = document.getElementById('debug')
		elem.innerHTML = str
	},
};
