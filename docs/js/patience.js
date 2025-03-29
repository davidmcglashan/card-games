const patience = {
	deck: null,		// The pack of cards we are using
	drawn: null,		// This is the pile we draw from the deck onto, three cards at a time.
	suits: {},		// These are the piles for each suit which end the game when they're complete.
	towers: [],		// There are seven towers which are dealt out at the start of the game..

	dragData: null,	// Used to record data for drag-n-drop operations.

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

		// Build each tower up.
		for ( let t = 0; t < 7; t++ ) {
			patience.towers[t] = pileOfCards.newTopFacePile('tower'+t, pileOfCards.draw( patience.deck, t+1 )  )
		}
	},

	/**
	 * Called when a pile gets rebuilt.
	 */
	pileRebuilt: ( pile ) => {
		if ( pile.name === 'deck' ) {
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
	drag: ( evnt ) => {
		let src = evnt.target.getAttribute('data-drag')

		patience.dragData = {}		
		patience.dragData.permitted = false
		patience.dragData.sourceElem = evnt.target.id

		if ( patience.dragData.source === 'drawn' ) {
			patience.dragData.card = patience.drawn[patience.drawn.length-1]
			patience.dragData.source = patience.drawn
		} else {
			let tower = patience.towers[parseInt(src)]
			patience.dragData.card = tower[tower.length-1]
			patience.dragData.source = tower
		}
	},

	/**
	 * A drag has entered a suit pile. Evaluate if a drop is permitted.
	 */
	dragEnterSuit: (evnt ) => {
		// What is the current state of the dropped-on suit?
		let suit = patience.suits[evnt.target.id]

		// If the suit is empty or null then the dropped card needs to be an ace!
		if ( suit === undefined && patience.dragData.card.value !== 0 ) {
			return
		}		

		// We can accept this drop so stop the browser handling the drag/drop event.
		patience.dragData.permitted = true
		evnt.preventDefault();
	},

	/**
	 * User is dragging over something. Checks the precalculated permitted flag to allow a drop or not.
	 */
	dragOver: ( evnt ) => {
		if ( patience.dragData.permitted === true ) {
			evnt.preventDefault();
		}
	},

	/**
	 * Drop a dragged card onto one of the suit piles. This is only called if dragOverSuit evaluated that
	 * it would succeed.
	 */
	dropOnSuit: ( evnt ) => {
		evnt.preventDefault();

		// The travelling card now belongs to this suit pile
		let suit = patience.suits[evnt.target.id]
		if ( suit === undefined ) {
			suit = []
			patience.suits[evnt.target.id] = suit
		}
		suit.push( patience.dragData.card )
		
		let elem = document.getElementById( evnt.target.id )
		deck.decoratePile( elem, suit )

		// Remove it from the place it came from
		patience.dragData.source.pop()
		elem = document.getElementById( patience.dragData.sourceElem )
		elem.remove()

		// The next card along, if there is one, can now be revealed
		let next = patience.dragData.source[ patience.dragData.source.length-1 ]
		if ( next ) {
			next.isFaceUp = true
			elem = document.getElementById( next.name )
			deck.decorateFace( elem, next )
			elem.setAttribute( 'draggable', 'true' )
			elem.setAttribute( 'ondragstart','patience.drag(event)' )
			elem.setAttribute( 'ondrop','patience.dropOnPile(event)' )
		}
	},

	/**
	 * Noddy debug method. Dumps the cards in the various piles.
	 */
	debug: () => {
		let str = ''

		for ( let p = 0; p < 7; p++ ) {
			for ( let i = 0; i < patience.towers[p].cards.length; i++ ) {
				str = str + patience.towers[p].cards[i].name + ' ' + patience.towers[p].cards[i].isFaceUp + '\n'
			}
			str = str +'\n'
		}

		for ( let card of patience.deck.cards ) {
			str = str + card.name + ' ' + card.isFaceUp + '\n'
		}
		str = str +'\n'

		for ( let card of patience.drawn.cards ) {
			str = str + card.name + ' ' + card.isFaceUp + '\n'
		}

		let elem = document.getElementById('debug')
		elem.innerHTML = str
	},
};
