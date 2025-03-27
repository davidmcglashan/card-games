const deck = {
	// The cards are a simple array that we'll stuff with objects
	cards: [],
	suits: ['spades','hearts','clubs','diamonds'],
	symbols: [ '&spadesuit;','&heartsuit;','&clubsuit;','&diamondsuit;'],
	values: ['ace','2','3','4','5','6','7','8','9','10','jack','queen','king'],
	labels: ['A','2','3','4','5','6','7','8','9','10','J','Q','K'],

	/**
	 * Prepares the deck by creating all the cards therein. Newly init'd decks are
	 * unshuffled.
	 */
	new: () => {
		// Empty any previous state.
		deck.cards = []

		// Rebuild the deck.
		for ( let suit = 0; suit < 4; suit++ ) {
			for ( let value = 0; value < 13; value++ ) {
				let card = {}
				card.suit = deck.suits[suit];
				card.value = value;
				card.isRed = suit % 2 === 1
				card.name = deck.values[value] + '_of_' + deck.suits[suit]
				card.label = deck.labels[value] + deck.symbols[suit]
				card.isFaceUp = false

				deck.cards.push( card )
			}	
		}
	},

	/**
	 * Shuffles the deck. Better shuffles may be available.
	 */
	shuffle: () => {
		let shuffled = deck.cards
			.map(value => ({ value, sort: Math.random() }))
			.sort((a, b) => a.sort - b.sort)
    		.map(({ value }) => value)
		deck.cards = shuffled
	},

	/**
	 * Draws upto _n_ cards from the top of the deck
	 */
	draw: ( n ) => {
		let ret = []
		let nn = Math.min(n,deck.cards.length)
		for ( let i = 0; i < nn; i++ ) {
			ret.push( deck.cards.pop() )
		}
		return ret
	},

	/**
	 * Decorate the DOM element based on the supplied card's face.
	 */
	decorateFace: ( elem, card ) => {
		if ( card.isFaceUp ) {
			elem.setAttribute( 'class', 'card ' + card.suit )
			elem.innerHTML = '<div class="label">'+card.label+'</div><div class="bottomlabel">'+card.label+'</div>'
		} else {
			elem.setAttribute( 'class', 'card faceDown' )
		}
	},

	/**
	 * Decorate the DOM element as if it were a pile of cards
	 */
	decoratePile: ( elem, pile ) => {
		// An empty pile is hidden
		if ( pile.length === 0 ) {
			elem.classList.add( 'hidden' )
			return
		}

		// Otherwise, decorate the top card and add a shadow based on its length
		deck.decorateFace( elem, pile[pile.length-1] )
		let stack = 'stack'
		if ( pile.length > 14 ) {
			stack = stack + '4'
		} else if ( pile.length > 10 ) {
			stack = stack + '3'
		} else if ( pile.length > 6 ) {
			stack = stack + '2'
		} else if ( pile.length > 2 ) {
			stack = stack + '1'
		}
		elem.classList.add( stack )
	}
};