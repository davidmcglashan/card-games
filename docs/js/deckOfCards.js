const deckOfCards = {
	suits: ['spades','hearts','clubs','diamonds'],
	symbols: [ '&spadesuit;','&heartsuit;','&clubsuit;','&diamondsuit;'],
	values: ['ace','2','3','4','5','6','7','8','9','10','jack','queen','king'],
	labels: ['A','2','3','4','5','6','7','8','9','10','J','Q','K'],

	/**
	 * Prepares the deck by creating all the cards therein. Newly init'd decks are
	 * unshuffled. Returns an array of cards.
	 */
	new: () => {
		// The cards are a simple array that we'll stuff with objects
		cards = []

		// Rebuild the deck.
		for ( let suit = 0; suit < 4; suit++ ) {
			for ( let value = 0; value < 13; value++ ) {
				let card = {}
				card.suit = deckOfCards.suits[suit];
				card.value = value;
				card.isRed = suit % 2 === 1
				card.name = deckOfCards.values[value] + '_of_' + deckOfCards.suits[suit]
				card.label = deckOfCards.labels[value] + deckOfCards.symbols[suit]
				card.isFaceUp = false

				cards.push( card )
			}	
		}

		return cards
	},

	/**
	 * Prepares a new deck of cards and shuffles them. Returns an array of cards.
	 */
	newShuffled: () => {
		return deckOfCards.shuffle( deckOfCards.new() )
	},

	/**
	 * Prepares a new deck of cards and shuffles them. Returns an array of cards.
	 */
	shuffle: ( cards ) => {
		return cards
			.map(value => ({ value, sort: Math.random() }))
			.sort((a, b) => a.sort - b.sort)
			.map(({ value }) => value)
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