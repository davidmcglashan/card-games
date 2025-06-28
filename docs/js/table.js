const table = {
	clickOnGlass: (event ) => {
		let elem = cardUI.getCardAtXY( event.clientX, event.clientY )
		if ( elem ) {
			let clickId = elem.getAttribute('id')

			// Was the clicked card the one at the top of the deck pile?
			let topCard = dealer.peekTopOfPile( 'pile-deck' )
			if ( !topCard.isFaceUp && topCard.name === clickId ) {
				topCard.isFaceUp = true
				cardUI.decorate( topCard )
			}
		}
	},
	
	pressOnDeck: ( event ) => {
		let elem = cardUI.getCardAtXY( event.clientX, event.clientY )
		if ( elem ) {
			let clickId = elem.getAttribute('id')
			let topCard = dealer.peekTopOfPile( 'pile-deck' )

			if ( !topCard.isFaceUp ) {
				return
			}

			table.drag = {}
			table.drag.elem = elem
			table.drag.sourcePile = 'pile-deck'
			table.drag.origin = {left:elem.style.left, top:elem.style.top}

			let xdiff = event.x - event.offsetX
			let ydiff = event.y - event.offsetY
			table.drag.offsetX = event.x - elem.getBoundingClientRect().x + xdiff
			table.drag.offsetY = event.y - elem.getBoundingClientRect().y + ydiff
		}
	},
	
	releaseDeck: ( event ) => {
		// Abort quickly if we're not dragging anything.
		if ( table.drag === undefined ) {
			return
		}

		// Did we drop over a pile?
		for (const [name, pile] of Object.entries(dealer.piles)) {
			if ( pile.elem.classList.contains( 'hover' ) ) {
				// Move the dropped card to just after the DOM element it's being dropped onto. This will maintain the
				// correct z-order in the DOM.
				let destination = dealer.peekTopOfPile( name )
				if ( destination === null ) {
					let cards = document.getElementById( 'cards' )
					cards.insertBefore( table.drag.elem, cards.firstChild )
				} else {
					destination = document.getElementById( destination.name )
					destination.after( table.drag.elem )
				}

				// Snap the card neatly onto the pile.
				let rect = pile.elem.getBoundingClientRect()
				table.drag.elem.style.top = pile.elem.offsetTop + 'px'
				table.drag.elem.style.left = pile.elem.offsetLeft + 'px'

				// Update the models.
				let card = dealer.takeFromPile( table.drag.sourcePile )
				dealer.placeOnPile( name, card )

				// Tidy up.
				pile.elem.classList.remove( 'hover' )
				table.drag = undefined
				return
			}
		}

		// Snap the card back to where it came from.
		table.drag.elem.style.top = table.drag.origin.top
		table.drag.elem.style.left = table.drag.origin.left

		table.drag = undefined
	},
	
	moveOverDeck: ( event ) => {
		// Abort quickly if we're not dragging anything.
		if ( table.drag === undefined ) {
			return
		}

		// Are we dragging over a pile? Provide a drop affordance.
		for (const [name, pile] of Object.entries(dealer.piles)) {
			let rect = pile.elem.getBoundingClientRect()
			if ( event.x > rect.x && event.x < rect.x + rect.width && event.y > rect.y && event.y < rect.y + rect.height ) {
				pile.elem.classList.add( 'hover' )
			} else {
				pile.elem.classList.remove( 'hover' )
			}
		}

		// Move the card to where the mouse is.
		table.drag.elem.style.left = Math.max( 0, (event.clientX-table.drag.offsetX) ) + 'px' 
		table.drag.elem.style.top = Math.max( 0, (event.clientY-table.drag.offsetY) ) + 'px'
	},

	/**
	 * Let's begin!
	 */
	restart: () => {
		// Start the game by removing the banner.
		let elem = document.getElementById('banner')
		elem.classList.add( 'hidden' )

		// Have the glass listen to mouse events
		let glass = document.getElementById( 'glass' )
		glass.addEventListener( 'click', table.clickOnGlass )
		glass.addEventListener( 'mouseup', table.releaseDeck )
		glass.addEventListener( 'mousemove', table.moveOverDeck )
		glass.addEventListener( 'mousedown', table.pressOnDeck )

		// Have the dealer shuffle a new deck of cards, and place them face down in a pile.
		dealer.newFaceDownPile( 'pile-deck', dealer.newShuffledCardArray() )
		cardUI.snapPile( dealer.piles['pile-deck'] )

		// Also there's an empty pile.
		dealer.newEmptyPile( 'pile-one' )
		dealer.newEmptyPile( 'pile-two' )
		dealer.newEmptyPile( 'pile-three' )
	}
}