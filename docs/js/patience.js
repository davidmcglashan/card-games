const patience = {
	restart: () => {
		let elems = document.getElementsByClassName( 'pile' )
		for ( elem of elems ) {
			elem.innerHTML = ''
		}
		patience.play()
	},

	/**
	 * Let's play patience!
	 */
	play: () => {
		// Start the game by removing the banner.
		let elem = document.getElementById('banner')
		elem.classList.add( 'hidden' )

		// Tell the pile UI code to invoke this object's functions when things happen
		pileUI.setListener( patience )

		// Get the deck ready.
		patience.deck = pileOfCards.newFaceDownPile( 'deck', deckOfCards.newShuffled() )
		patience.drawn = pileOfCards.emptyPile( 'drawn' )

		// And the suits 
		for ( let i=0; i<4; i++ ) {
			patience['suit'+i] = pileOfCards.emptyPile( 'suit'+i )
		}

		// Build each tower up.
		for ( let t = 0; t < 7; t++ ) {
			patience['tower'+t] = pileOfCards.newTopFacePile('tower'+t, pileOfCards.draw( patience.deck, t+1 )  )
		}

		patience.debug()
	},

	pileReadied: ( pile ) => {
		if ( pile.name.startsWith( 'suit' ) ) {
			let pileElem = document.getElementById( pile.name )

			pileElem.setAttribute( 'ondrop',' patience.dropOnSuit(event)' )
			pileElem.setAttribute( 'ondragover', 'patience.dragOver(event)' )
			pileElem.setAttribute( 'ondragenter', 'patience.dragEnterSuit(event)' )
		}
	},

	/**
	 * Called when a pile gets rebuilt.
	 */
	pileRebuilt: ( pile ) => {
		// Can we find a patience function that's the pile name with Rebuilt on the end?
		let fn = patience[pile.name+'Rebuilt']
		if ( fn ) {
			fn( pile )
		} else {
			// Try removing the last char - it might be a number e.g. tower3 for which we can call towerRebuilt 
			let len = pile.name.length-1
			fn = patience[pile.name.substr(0,len) +'Rebuilt']
			if ( fn ) {
				fn( pile )
			}
		}
	},

	deckRebuilt: ( pile ) => {
		// Let the top card listen to a mouse click
		let card = pileOfCards.top( pile )
		if ( card ) {
			let cardElem = document.getElementById( card.name )
			cardElem.setAttribute( 'onclick', 'patience.deal(event)' )	
			cardElem.classList.add( 'interactive' )	
		}

		let pileElem = document.getElementById( pile.name )
		pileElem.removeAttribute( 'onclick' )	
		pileElem.classList.remove( 'interactive' )	
	},

	drawnRebuilt: ( pile ) => {
		// Let the top card listen to a mouse click
		let card = pileOfCards.top( pile )
		if ( card ) {
			let cardElem = document.getElementById( card.name )
			cardElem.setAttribute( 'draggable', 'true' )	
			cardElem.setAttribute( 'ondragstart', 'patience.drag(event,\'' + pile.name + '\')' )	
			cardElem.classList.add( 'interactive' )	
		}
	},

	towerRebuilt: ( pile ) => {
		// Let the top card listen to a mouse click
		let card = pileOfCards.top( pile )
		if ( card ) {
			let cardElem = document.getElementById( card.name )
			cardElem.classList.add( 'interactive' )
			if ( card.isFaceUp ) {
				cardElem.setAttribute( 'draggable', 'true' )	
				cardElem.setAttribute( 'ondragstart', 'patience.drag(event,\'' + pile.name + '\',\'' + card.name + '\')' )		
				cardElem.setAttribute( 'ondragend', 'patience.restoreAfterDrag(event)' )		
			} else {
				cardElem.setAttribute( 'onclick', 'patience.reveal(event,\'' + pile.name + '\')' )		
			}
		}
	},

	suitRebuilt: ( pile ) => {
		let card = pileOfCards.top( pile )
		if ( card ) {
			let cardElem = document.getElementById( card.name )
			cardElem.setAttribute( 'data-suit', pile.name )	
		}
	},

	/**
	 * Called when a pile has all of its cards removed.
	 */
	pileEmptied: ( pile ) => {
		if ( pile.name === 'deck' ) {
			let pileElem = document.getElementById( pile.name )
			pileElem.setAttribute( 'onclick', 'patience.redeal(event)' )	
			pileElem.classList.add( 'interactive' )	
		}
	},

	reveal: ( event, pileName ) => {
		pileOfCards.reveal( patience[pileName] )
		event.stopPropagation()
		patience.debug()
	},

	/**
	 * Turns upto three cards over at the top of the deck.
	 */
	deal: ( event ) => {
		// Otherwise, draw up to 3 cards and put them face up on the drawn pile	
		let cards = pileOfCards.draw( patience.deck, 3 )
		for ( let card of cards ) {
			card.isFaceUp = true
			pileOfCards.placeOnTop( patience.drawn, card )
		}

		event.stopPropagation()
		patience.debug()
	},

	/**
	 * Returns the dealt cards to the deck and we start over.
	 */
	redeal: ( event ) => {
		// Take everything from the drawn pile and empty it
		let cards = pileOfCards.drawAll( patience.drawn )

		// Push everything back onto the deck, face down.
		for ( let card of cards ) {
			card.isFaceUp = false
		}
		pileOfCards.placeAllOnTop( patience.deck, cards )
		patience.debug()
	},

	/**
	 * Starts a drag from a face up card.
	 */
	drag: ( evnt, pileName, cardName ) => {
		patience.dragData = {}		
		patience.dragData.permitted = false
		
		// Find the card object in the pile
		let pile = patience[pileName]
		let card = null
		for ( let c of pile.cards ) {
			if ( c.name === cardName ) {
				card = c
				break
			}
		}

		// Store pile and card in the drag data. This will make it easier to perform the drag.
		patience.dragData.card = card
		patience.dragData.pile = pile

		evnt.target.classList.add( 'dragged' )
	},

	/**
	 * A drag has entered a suit pile. Evaluate if a drop is permitted.
	 */
	dragEnterSuit: (evnt ) => {
		let suit = null

		// What is the current state of the dropped-on suit?
		let id = evnt.target.getAttribute( 'data-suit' )
		if ( id ) {
			suit = patience[id]
		} else {
			suit = patience[evnt.target.id]
		}

		// If the suit is empty or null then the dropped card needs to be an ace!
		if ( suit.cards.length === 0 && patience.dragData.card.value === 0 ) {
			patience.dragData.suit = suit
			patience.dragData.permitted = true
			evnt.preventDefault();
			return
		}

		// If there are cards in the suit already, then the next card has to match, and has to be the next one
		if ( suit.cards.length > 0 ) {
			let suitCard = pileOfCards.top( suit )
			if ( suitCard.suit === patience.dragData.card.suit && suitCard.value === patience.dragData.card.value-1 ) {
				patience.dragData.suit = suit
				patience.dragData.permitted = true
				evnt.preventDefault();
				return					
			}	
		}
	},

	/**
	 * User is dragging over something. Checks the precalculated permitted flag to allow a drop or not.
	 */
	dragOver: ( evnt ) => {
		if ( patience.dragData.permitted === true ) {
			evnt.preventDefault();
		}
	},

	restoreAfterDrag: ( evnt ) => {
		evnt.target.classList.remove( 'dragged' )
	},

	/**
	 * Drop a dragged card onto one of the suit piles. This is only called if dragOverSuit evaluated that
	 * it would succeed.
	 */
	dropOnSuit: ( evnt ) => {
		evnt.preventDefault();

		// The travelling card now belongs to this suit pile
		let card = pileOfCards.take( patience.dragData.pile )
		card.isFaceUp = true
		pileOfCards.placeOnTop( patience.dragData.suit, card )

		patience.debug()
	},

	/**
	 * Noddy debug method. Dumps the cards in the various piles.
	 */
	debug: () => {
		let str = ''

		for ( let card of patience.deck.cards ) {
			str = str + card.name + ' ' + card.isFaceUp + '\n'
		}
		str = str +'\n'

		for ( let card of patience.drawn.cards ) {
			str = str + card.name + ' ' + card.isFaceUp + '\n'
		}

		for ( let p = 0; p < 4; p++ ) {
			for ( let i = 0; i < patience['suit'+p].cards.length; i++ ) {
				str = str + patience['suit'+p].cards[i].name + ' ' + patience['suit'+p].cards[i].isFaceUp + '\n'
			}
			str = str +'\n'
		}

		for ( let p = 0; p < 7; p++ ) {
			for ( let i = 0; i < patience['tower'+p].cards.length; i++ ) {
				str = str + patience['tower'+p].cards[i].name + ' ' + patience['tower'+p].cards[i].isFaceUp + '\n'
			}
			str = str +'\n'
		}

		let elem = document.getElementById('debug')
		elem.innerHTML = str
	},
};
