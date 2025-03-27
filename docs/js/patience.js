const patience = {
	// There are seven piles which we draw from.
	piles: [],
	drawn: [],

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

			let pile = document.getElementById( 'pile'+p )
			for ( let i = 0; i < patience.piles[p].length; i++ ) {
				let card = patience.piles[p][i]
				let elem = document.createElement( 'div' )

				if ( i === patience.piles[p].length-1 ) {
					card.isFaceUp = true
				}
				deck.decorateFace( elem, card )
				elem.setAttribute( 'style', 'z-index:'+i+';top:'+i+'em;')
				pile.appendChild( elem )
			}
		}

		// Put the deck on the table.
		let elem = document.getElementById('deck')
		deck.decoratePile( elem, deck.cards )
		elem.setAttribute( 'onclick', 'patience.deal()' )

		// Start the game by removing the banner.
		elem = document.getElementById('banner')
		elem.classList.add( 'hidden' )
	},

	/**
	 * Turns upto three cards over at the top of the deck
	 */
	deal: () => {
		// No cards, left to draw, so redeal!
		if ( deck.cards.length === 0 ) {
			for ( card of patience.drawn ) {
				card.isFaceUp = false
				deck.cards.push( card )
			}
			patience.drawn = []
		} else {
			// Otherwise, draw up to 3 cards and put them face up on the drawn pile	
			let cards = deck.draw( 3 )
			for ( let card of cards ) {
				card.isFaceUp = true
				patience.drawn.push( card )
			}
		}

		let elem = document.getElementById( 'drawn' )
		deck.decoratePile( elem, patience.drawn )

		elem = document.getElementById( 'deck' )
		deck.decoratePile( elem, deck.cards )

		patience.debug()
	},

	debug: () => {
		let str = ''

		for ( let p = 0; p < 7; p++ ) {
			for ( let i = 0; i < patience.piles[p].length; i++ ) {
				str = str + patience.piles[p][i].name + '\n'
			}
			str = str +'\n'
		}

		for ( let card of deck.cards ) {
			str = str + card.name + '\n'
		}
		str = str +'\n'

		for ( let card of patience.drawn ) {
			str = str + card.name + '\n'
		}

		let elem = document.getElementById('debug')
		elem.innerHTML = str
	},
};
