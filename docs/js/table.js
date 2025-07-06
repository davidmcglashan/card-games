const table = {
	games: [ 
		{ name: 'Clock', description: 'Tick tock!', url: 'clock-patience.html' },
		{ name: 'Patience', description: 'a.k.a. Solitaire', url: 'patience.html' },
		{ name: 'Test1', description: 'Nothing here matters', url: 'table.html' },
		{ name: 'Test2', description: 'Look at the pretty cards', url: 'testcard.html' },
	],

	/**
	 * A mouse click happened on the glass. This function detects which element
	 * (card,pile) was under the click and asks the game object to handle the click
	 */
	clickOnGlass: ( event ) => {
		// Abort quickly if we're dragging something.
		if ( table.drag !== undefined ) {
			return
		}
		
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
				table.drag.origin = elem.getBoundingClientRect()
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
			table.clickOnGlass( event )
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

				// Snap the card neatly onto the pile. First we place the card on the pile, but apply a transform to
				// translate it back to where it was dropped.
				const snappingCard = table.drag.elem
				let rect = pile.elem.getBoundingClientRect()
				let x = snappingCard.getBoundingClientRect().left - rect.left
				let y = snappingCard.getBoundingClientRect().top - rect.top
				let transform = cardUI.getTransform( pile, snappingCard )
				snappingCard.style.top = rect.top + 'px'
				snappingCard.style.left = rect.left + 'px'
				snappingCard.style.transform = `translate(${x}px,${y}px)`

				// Now apply an animation to remove the translation again.
				let anim = snappingCard.animate([{transform: `translate(0px,0px) ${transform}`}],{duration:125, easing: 'ease-in-out'});
				anim.pause()
				anim.onfinish = () => {
					snappingCard.style.transform = transform
				}
				anim.play()

				// Update the models.
				let card = dealer.takeFromPile( table.drag.sourcePile )
				dealer.placeOnPile( name, card )
				table.drag.elem.setAttribute( 'data-pile', name )
				game.dropHappened( card, table.drag.sourcePile, name )

				// Tidy up.
				pile.elem.classList.remove( 'hover' )
				table.drag = undefined

				// Check the game hasn't finished
				let result = game.hasFinished()
				if ( result > 0 ) {
					table.finishGame( result )
				}
				return
			}
		}

		// Snap the card back to where it came from. First we put it at the end, with a transform which
		// translates to where it was dropped.
		const snappingCard = table.drag.elem
		let x = snappingCard.getBoundingClientRect().left - table.drag.origin.left
		let y = snappingCard.getBoundingClientRect().top - table.drag.origin.top
		snappingCard.style.top = table.drag.origin.top + 'px'
		snappingCard.style.left = table.drag.origin.left + 'px'
		snappingCard.style.transform = `translate(${x}px,${y}px)`

		// Now apply an animation to remove the translation again.
		let anim = snappingCard.animate([{transform: 'translate(0px,0px)'}],{duration:250, easing: 'ease-in-out'});
		anim.pause()
		anim.onfinish = () => {
			snappingCard.style.transform = 'none'
		}
		anim.play()

		let cards = document.getElementById( 'cards' )
		cards.appendChild( table.drag.elem )

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
				pile.elem.classList.remove( 'interactive' )
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
				pile.elem.classList.add( 'interactive' )
			} else {
				pile.elem.classList.remove( 'interactive' )
			}
		}
	},

	/**
	 * Let's begin!
	 */
	restart: () => {
		let cards = document.getElementById( 'cards' )
		cards.innerHTML = ''

		// Start the game by removing the banner.
		let elem = document.getElementById('banner')
		elem.classList.add( 'hidden' )

		// Tell the game we're about to start.
		game.start()

		// Tell the game about the piles we find in the DOM.
		let piles = document.getElementsByClassName( 'pile' )
		for ( let pile of piles ) {
			game.newPile( pile.getAttribute( 'id' ) )
		}
		game.cardsDealt()
	},

	/** 
	 * Finishes the current game.
	 */
	finishGame: ( result ) => {
		// Finish the game by displaying the banner.
		let elem = document.getElementById('banner')
		elem.classList.remove( 'hidden' )

		// Display a result-appropriate message ...
		let banner = document.getElementById( 'headline' )
		let message = document.getElementById( 'message' )
		if ( result === 1 ) {
			banner.innerHTML = 'Game over!'
			message.innerHTML = 'Better luck next time ...'
		} else {
			banner.innerHTML = 'Congratulations!'
			message.innerHTML = 'Why not try and do that again?'
		}
	},

	/**
	 * Called when the window is resized. Tries to make sure the cards are all properly
	 * positioned.
	 */
	windowResized: (event ) => {
		for ( const [name,pile] of Object.entries( dealer.piles ) ) {
			if ( pile.cards.length > 0 ) {
				cardUI.snapPile( pile )
			}
		}
	},

	/**
	 * Prepare the table for playing. This also sets up various bits of UI. Only call this
	 * once from the loading page.
	 */
	ready: () => {
		// Put a <ul> in the foot.
		let foot = document.getElementById( 'foot' )
		let ul = document.createElement( 'ul' )
		foot.append( ul )

		// Put an <li> for each available game.
		for ( let gg of table.games ) {
			let li = document.createElement( 'li' )
			ul.appendChild( li )

			let a = document.createElement( 'a' )
			a.setAttribute( 'href', gg.url )
			a.innerHTML = gg.name
			li.appendChild( a )

			// If this is the current game then select the <li> and update the banner.
			if ( document.URL.indexOf( '/' + gg.url ) !== -1 ) {
				a.setAttribute( 'class', 'selected' )

				let banner = document.getElementById( 'headline' )
				banner.innerHTML = gg.name
				let message = document.getElementById( 'message' )
				message.innerHTML = gg.description
			}
		}

		foot.insertAdjacentHTML( 'beforeend', '<strong>v1.0</strong> &copy; 2025 David McGlashan' )

		// Have the glass listen to mouse events
		let glass = document.getElementById( 'glass' )
		glass.addEventListener( 'mouseup', table.releaseGlass )
		glass.addEventListener( 'mousemove', table.moveOverGlass )
		glass.addEventListener( 'mousedown', table.pressOnGlass )

		window.addEventListener("resize", table.windowResized );
	}
}