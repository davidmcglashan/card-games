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
	 * Draws _n_ cards from the top of the deck
	 */
	draw: ( n ) => {
		let ret = []
		for ( let i = 0; i < n; i++ ) {
			ret.push( deck.cards.pop() )
		}
		return ret
	}
};