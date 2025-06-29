const table = {
	games: [ 
		{ name: 'Clock', url: 'clock-patience.html' },
		{ name: 'Patience', url: 'patience.html' },
		{ name: 'Test', url: 'table.html' },
	],

	/**
	 * A mouse click happened on the glass. This function detects which element
	 * (card,pile) was under the click and asks the game object to handle the click
	 */
	clickOnGlass: ( event ) => {
		// Was the click on a card?
		let elem = cardUI.getCardAtXY( event.clientX, event.clientY )
		if ( elem ) {
			if ( game.clickOnCard( elem.getAttribute('id'), elem.getAttribute('data-pile') ) ) {
				return
			}
		}

		// Was the click on a pile?
		elem = cardUI.getPileAtXY( event.clientX, event.clientY )
		if ( elem ) {
			if ( game.clickOnPile( elem.getAttribute('id') ) ) {
				return
			}
		}
	},
	
	/**
	 * A mouse press happened on the glass, usually the prelude to a drag/drop operation. 
	 * This function detects which element (card,pile) was under the press and asks the
	 * game object if a drag is appropriate. If true, it begins ...
	 */
	pressOnGlass: ( event ) => {
		let elem = cardUI.getCardAtXY( event.clientX, event.clientY )
		if ( elem ) {
			if ( game.canStartDrag( elem.getAttribute( 'id' ), elem.getAttribute( 'data-pile' ) ) ) {
				table.drag = {}
				table.drag.elem = elem
				table.drag.sourcePile = elem.getAttribute( 'data-pile' )
				table.drag.origin = {left:elem.style.left, top:elem.style.top}
				table.drag.card = dealer.peekTopOfPile(table.drag.sourcePile)
				
				let xdiff = event.x - event.offsetX
				let ydiff = event.y - event.offsetY
				table.drag.offsetX = event.x - elem.getBoundingClientRect().x + xdiff
				table.drag.offsetY = event.y - elem.getBoundingClientRect().y + ydiff

				// Move the dragged card to the #glass element so that it's above everything else
				let glass = document.getElementById( 'glass' )
				glass.appendChild( elem )
			}
		}
	},
	
	/**
	 * The mouse was released. This function provides the default behaviour of placing the
	 * dragged card on top of the destination drop pile
	 */
	releaseGlass: ( event ) => {
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
				table.drag.elem.style.top = rect.top + 'px'
				table.drag.elem.style.left = rect.left + 'px'

				// Update the models.
				let card = dealer.takeFromPile( table.drag.sourcePile )
				dealer.placeOnPile( name, card )
				table.drag.elem.setAttribute( 'data-pile', name )
				game.dropHappened( card, table.drag.sourcePile, name )

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
	
	/**
	 * Called as a mouse is dragged over the game. If a drag/drop operation is active the game
	 * is called to assess if a drop can be performed when the cursor is over a pile.
	 */
	moveOverGlass: ( event ) => {
		// Abort quickly if we're not dragging anything.
		if ( table.drag === undefined ) {
			table.checkForClicks( event )
			return
		}

		// Are we dragging over a pile? Provide a drop affordance.
		for (const [name, pile] of Object.entries(dealer.piles)) {
			let rect = pile.elem.getBoundingClientRect()
			if ( 
				event.x > rect.x && event.x < rect.x + rect.width && event.y > rect.y && event.y < rect.y + rect.height 
				&& game.canDrop( table.drag.card, pile ) 
			) {
				pile.elem.classList.add( 'hover' )
			} else {
				pile.elem.classList.remove( 'hover' )
			}
		}

		// Move the card to where the mouse is.
		table.drag.elem.style.left = Math.max( 0, (event.clientX-table.drag.offsetX) ) + 'px' 
		table.drag.elem.style.top = Math.max( 0, (event.clientY-table.drag.offsetY) ) + 'px'
	},

	checkForClicks: ( event ) => {
		for (const [name, pile] of Object.entries(dealer.piles)) {
			let rect = pile.elem.getBoundingClientRect()
			if ( 
				event.x > rect.x && event.x < rect.x + rect.width && event.y > rect.y && event.y < rect.y + rect.height 
				&& game.canClickOrDragFromPile( pile ) 
			) {
				pile.elem.classList.add( 'hover' )
			} else {
				pile.elem.classList.remove( 'hover' )
			}
		}
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
		glass.addEventListener( 'mouseup', table.releaseGlass )
		glass.addEventListener( 'mousemove', table.moveOverGlass )
		glass.addEventListener( 'mousedown', table.pressOnGlass )

		// Tell the game we're about to start.
		game.start()

		// Tell the game about the piles we find in the DOM.
		let piles = document.getElementsByClassName( 'pile' )
		for ( let pile of piles ) {
			game.newPile( pile.getAttribute( 'id' ) )
		}
	},

	links: () => {
		let foot = document.getElementById( 'foot' )
		let ul = document.createElement( 'ul' )
		foot.append( ul )

		for ( let gg of table.games ) {
			let li = document.createElement( 'li' )
			ul.appendChild( li )

			let a = document.createElement( 'a' )
			a.setAttribute( 'href', gg.url )
			a.innerHTML = gg.name
			if ( document.URL.indexOf( '/' + gg.url ) !== -1 ) {
				a.setAttribute( 'class', 'selected' )
			}
			li.appendChild( a )
		}

		foot.insertAdjacentHTML( 'beforeend', '<strong>v1.0</strong> &copy; 2025 David McGlashan' )
	}
}