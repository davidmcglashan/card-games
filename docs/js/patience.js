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

			let pile = document.getElementById( 'pile'+p )
			for ( let i = 0; i < patience.piles[p].length; i++ ) {
				let card = patience.piles[p][i]
				let elem = document.createElement( 'div' )

				if ( i === patience.piles[p].length-1 ) {
					card.isFaceUp = true
				}

				if ( card.isFaceUp ) {
					elem.setAttribute( 'class', 'card ' + card.suit )
					elem.innerHTML = '<div class="label">'+card.label+'</div><div class="bottomlabel">'+card.label+'</div>'
				} else {
					elem.setAttribute( 'class', 'card faceDown' )
				}
				elem.setAttribute( 'style', 'z-index:'+i+';top:'+i+'em;')
				pile.appendChild( elem )
			}
		}

		// Put the deck on the table
		let pile = document.getElementById('deck')
		let elem = document.createElement('div')

		let stack = 'stack'
		if ( deck.cards.length > 14 ) {
			stack = stack + '4'
		} else if ( deck.cards.length > 10 ) {
			stack = stack + '3'
		} else if ( deck.cards.length > 6 ) {
			stack = stack + '2'
		} else if ( deck.cards.length > 2 ) {
			stack = stack + '1'
		}
		elem.setAttribute( 'class', 'card faceDown ' + stack )
		pile.appendChild( elem )

		// Start the game by removing the banner.
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
