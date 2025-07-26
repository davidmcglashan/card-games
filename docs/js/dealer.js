const dealer = {
	deckmeta: {
		suits: ['spades','hearts','clubs','diamonds'],
		symbols: [ '&spadesuit;','&heartsuit;','&clubsuit;','&diamondsuit;'],
		values: ['ace','2','3','4','5','6','7','8','9','10','jack','queen','king'],
		labels: ['A','2','3','4','5','6','7','8','9','10','J','Q','K'],
	},

	stackingMethods: {
		TIGHT: 0,
		DIAGONAL: 1,
		VERTICAL: 2,
		UNTIDY: 3,
		LEFT: 4,
		RIGHT: 5
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
				card.shortValue = dealer.deckmeta.labels[value];
				card.symbol = dealer.deckmeta.symbols[suit]
				card.ordValue = value
				card.css = 'css'+dealer.deckmeta.values[value];

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
		pile.stackingMethod = dealer.stackingMethods.UNTIDY
		dealer.piles[name] = pile
		return pile
	},

	/**
	 * Creates a new pile object from an array of cards
	 */
	newPile: ( name, cards, faceUp = false ) => {
		let pile = dealer.newEmptyPile( name )
		pile.cards = cards
		pile.stackingMethod = dealer.stackingMethods.DIAGONAL

		for ( let card of cards ) {
			card.isFaceUp = faceUp
			card.pile = pile
		}
		return pile
	},

	/**
	 * Creates a new pile object from an array of cards
	 */
	newFaceDownPile: ( name, cards ) => {
		return dealer.newPile( name, cards, false )
	},

	/**
	 * Creates a new pile object from an array of cards
	 */
	newFaceUpPile: ( name, cards ) => {
		return dealer.newPile( name, cards, true )
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
	drawFromPile: ( name, n ) => {
		let ret = []
		let pile = dealer.piles[name]
		if ( pile ) {
			let nn = Math.min( n, pile.cards.length )
	
			for ( let i = 0; i < nn; i++ ) {
				ret.push( pile.cards.pop() )
			}
		}

		return ret
	},

	/**
	 * Take all the cards from the top of the pile, returning them as an array of cards.
	 */
	drawAllFromPile: ( pileName ) => {
		let pile = dealer.piles[pileName]
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
			if ( card.elem ) {
				card.elem.setAttribute( 'data-pile', pile.name )
			}
		}
	},

	/**
	 * Places all the passed in cards on the top of a pile. Cards are dealt one-by-one: the first
	 * card in cards goes on the pile, then the second goes on top of it, and so on.
	 */
	placeAllOnPile: ( name, cards ) => {
		for ( let card of cards ) {
			dealer.placeOnPile( name, card )
		}
	},

	/**
	 * Places the passed in cards on top of the pile in one operation. The added pile is subsequently
	 * order-unchanged on top of the existing pile.
	 */
	addCardsToPile: ( name, cards ) => {
		let pile = dealer.piles[name]
		if ( pile ) {
			pile.cards = cards.concat( pile.cards )
			for ( let card of cards ) {
				card.pile = name
				if ( card.elem ) {
					card.elem.setAttribute( 'data-pile', pile.name )
				}
			}
		}
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

	findCardInPile: ( cardName, pileName ) => {
		for ( let card of dealer.piles[pileName].cards ) {
			if ( card.name === cardName ) {
				return card
			}
		}
		return null
	}
};