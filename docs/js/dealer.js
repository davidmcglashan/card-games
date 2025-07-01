const dealer = {
	deckmeta: {
		suits: ['spades','hearts','clubs','diamonds'],
		symbols: [ '&spadesuit;','&heartsuit;','&clubsuit;','&diamondsuit;'],
		values: ['ace','2','3','4','5','6','7','8','9','10','jack','queen','king'],
		labels: ['A','2','3','4','5','6','7','8','9','10','J','Q','K'],
	},

	// All the piles will be stashed in here by their name.
	piles: {},

	/**
	 * Prepares the deck by creating all the cards therein. Newly init'd decks are
	 * unshuffled. Returns an array of cards.
	 */
	newCardArray: () => {
		// The cards are a simple array that we'll stuff with objects
		cards = []

		// Rebuild the deck.
		for ( let suit = 0; suit < 4; suit++ ) {
			for ( let value = 0; value < 13; value++ ) {
				let card = {}
				card.suit = dealer.deckmeta.suits[suit];
				card.value = 'v'+dealer.deckmeta.values[value];
				card.ordValue = value
				card.isRed = suit % 2 === 1
				card.name = dealer.deckmeta.values[value] + '_of_' + dealer.deckmeta.suits[suit]
				card.label = dealer.deckmeta.labels[value] + dealer.deckmeta.symbols[suit]
				card.isFaceUp = false

				cards.push( card )
			}	
		}

		return cards
	},

	/**
	 * Prepares a new deck of cards and shuffles them. Returns an array of cards.
	 */
	newShuffledCardArray: () => {
		return dealer.shuffle( dealer.newCardArray() )
	},

	/**
	 * Takes an array of cards and shuffles them.
	 */
	shuffle: ( cards ) => {
		return cards
			.map(value => ({ value, sort: Math.random() }))
			.sort((a, b) => a.sort - b.sort)
			.map(({ value }) => value)
	},

	/**
	 * Creates a new empty pile for putting cards onto.
	 */
	newEmptyPile: ( name ) => {
		let pile = {}

		pile.name = name
		pile.cards = []
		pile.elem = document.getElementById( pile.name )

		dealer.piles[name] = pile
		return pile
	},

	/**
	 * Creates a new pile object from an array of cards
	 */
	newFaceDownPile: ( name, cards ) => {
		let pile = dealer.newEmptyPile( name )
		pile.cards = cards

		for ( let card of cards ) {
			card.isFaceUp = false
			card.pile = pile
		}
		return pile
	},

	/**
	 * Top-faces an array of cards: all cards are face-down except the top one
	 */
	newTopFacePile: ( name, cards ) => {
		let pile = dealer.newFaceDownPile( name, cards )
		cards[cards.length-1].isFaceUp = true
		
		return pile
	},

	/**
	 * Takes the top card from the top of the pile.
	 */
	takeFromPile: ( name ) => {
		let pile = dealer.piles[name]
		if ( pile ) {
			if ( pile.cards.length === 0 ) {
				return null
			}
			let card = pile.cards.pop()
			card.pile = null
			return card
		}
		return null
	},

	/**
	 * Draws upto _n_ cards from the top of the pile, returning them as an array of cards.
	 */
	xdrawFromPile: ( pile, n ) => {
		let ret = []
		let nn = Math.min( n, pile.cards.length )

		for ( let i = 0; i < nn; i++ ) {
			ret.push( pile.cards.pop() )
		}
		return ret
	},

	/**
	 * Take all the cards from the top of the pile, returning them as an array of cards.
	 */
	xdrawAllFromPile: ( pile, n ) => {
		let ret = pile.cards
		pile.cards = []
		return ret
	},

	/**
	 * Places a card on the top of a pile
	 */
	placeOnPile: ( name, card ) => {
		let pile = dealer.piles[name]
		if ( pile ) {
			pile.cards.push( card )
			card.pile = name
		}
	},

	/**
	 * Places a card on the top of a pile
	 */
	xplaceAllOnPile: ( pile, cards ) => {
		pile.cards = cards
	},

	/**
	 * Turns the top card on a pile over to reveal its face
	 */
	xrevealTopOfPile: ( pile ) => {
		let card = pileOfCards.top( pile )
		if ( card ) {
			card.isFaceUp = true
		}
		return card
	},

	/**
	 * Returns the card on the top of the pile without removing it
	 */
	peekTopOfPile: ( name ) => {
		let pile = dealer.piles[name]
		if ( pile ) {
			if ( pile.cards.length === 0 ) {
				return null
			}
			return pile.cards[pile.cards.length-1]
		}
		return null
	},
};