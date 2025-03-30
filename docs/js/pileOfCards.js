const pileOfCards = {

	emptyPile: ( name ) => {
		let pile = {}

		pile.name = name
		pile.offset = { x:0, y:1 }
		pile.cards = []

		pileUI.readyPile( pile )
		return pile
	},

	/**
	 * Creates a new pile object from an array of cards
	 */
	newFaceDownPile: ( name, cards ) => {
		let pile = pileOfCards.emptyPile( name )

		pile.cards = cards
		for ( let card of cards ) {
			card.isFaceUp = false
		}

		pileUI.rebuildPile( pile )
		return pile
	},

	/**
	 * Top-faces an array of cards: all cards are face-down except the top one
	 */
	newTopFacePile: ( name, cards ) => {
		let pile = pileOfCards.newFaceDownPile( name, cards )
		cards[cards.length-1].isFaceUp = true
		pileUI.rebuildPile( pile )
		
		return pile
	},

	/**
	 * Shuffles the cards of the passed-in pile.
	 */
	shuffle: ( pile ) => {
		pile.cards = deckOfCards.shuffle( pile.cards )
		pileUI.rebuildPile( pile )
	},

	/**
	 * Takes the top card from the top of the pile.
	 */
	take: ( pile ) => {
		if ( pile.cards.length === 0 ) {
			return null
		}
		let card = pile.cards.pop()
		pileUI.rebuildPile( pile )
		return card
	},

	/**
	 * Draws upto _n_ cards from the top of the pile, returning them as an array of cards.
	 */
	draw: ( pile, n ) => {
		let ret = []
		let nn = Math.min( n, pile.cards.length )

		for ( let i = 0; i < nn; i++ ) {
			ret.push( pile.cards.pop() )
		}

		pileUI.rebuildPile( pile )
		return ret
	},

	/**
	 * Take all the cards from the top of the pile, returning them as an array of cards.
	 */
	drawAll: ( pile, n ) => {
		let ret = pile.cards
		pile.cards = []
		pileUI.rebuildPile( pile )
		return ret
	},

	/**
	 * Places a card on the top of a pile
	 */
	placeOnTop: ( pile, card ) => {
		pile.cards.push( card )
		pileUI.rebuildPile( pile )
	},

	/**
	 * Places a card on the top of a pile
	 */
	placeAllOnTop: ( pile, cards ) => {
		pile.cards = cards
		pileUI.rebuildPile( pile )
	},

	/**
	 * Places a card on the top of a pile
	 */
	reveal: ( pile ) => {
		let card = pileOfCards.top( pile )
		if ( card ) {
			card.isFaceUp = true
			pileUI.rebuildPile( pile )
		}
	},

	/**
	 * Returns the card on the top of the pile without removing it
	 */
	top: ( pile ) => {
		if ( pile.cards.length === 0 ) {
			return null
		}
		return pile.cards[pile.cards.length-1]
	},
};