const patience = {
	piles: [],		// There are seven piles which we draw from.
	drawn: [],		// This is the pile we draw from the deck onto, three cards at a time.
	suits: {},		// These are the piles for each suit which end the game when they're complete.
	dragData: {},	// Used to record data for drag-n-drop operations.

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
					elem.setAttribute( 'draggable', 'true' )
					elem.setAttribute( 'ondragstart','patience.drag(event)' )
					elem.setAttribute( 'ondrop','patience.dropOnPile(event)' )
					elem.setAttribute( 'data-drag', p )
					elem.setAttribute( 'id', 'drag'+p )
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
			let pile = patience.piles[parseInt(src)]
			patience.dragData.card = pile[pile.length-1]
			patience.dragData.source = pile
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
	},

	/**
	 * Noddy debug method. Dumps the cards in the various piles.
	 */
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
