const table = {
	version: "1.0",
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
	mouseClicked: ( event ) => {
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
		if ( game.clickOnPile ) {
			elem = cardUI.getPileAtXY( event.clientX, event.clientY )
			if ( elem ) {
				if ( game.clickOnPile( elem.getAttribute('id') ) ) {
					return
				}
			}
		}
	},
	
	/**
	 * A mouse press happened on the glass, usually the prelude to a drag/drop operation. 
	 * This function detects which element (card,pile) was under the press and asks the
	 * game object if a drag is appropriate. If true, it begins ...
	 */
	mousePressed: ( event ) => {
		// If the game doesn't support dragging we can leave early ...
		if ( !game.canStartDrag ) {
			return
		}

		// Work out if there's a card under the pointer.
		let elem = cardUI.getCardAtXY( event.clientX, event.clientY )
		if ( elem ) {
			if ( game.canStartDrag( elem.getAttribute( 'id' ), elem.getAttribute( 'data-pile' ) ) ) {
				table.drag = {}
				table.drag.sourcePile = elem.getAttribute( 'data-pile' )
				table.drag.origin = elem.getBoundingClientRect()
				table.drag.card = dealer.findCardInPile( elem.getAttribute( 'id' ), table.drag.sourcePile )
				table.drag.otherCards = []

				if ( game.embellishDrag ) {
					game.embellishDrag( table.drag, elem.getAttribute( 'id' ), table.drag.sourcePile )
				}
				
				let xdiff = event.x - event.offsetX
				let ydiff = event.y - event.offsetY
				table.drag.offsetX = event.x - elem.getBoundingClientRect().x + xdiff
				table.drag.offsetY = event.y - elem.getBoundingClientRect().y + ydiff

				// Move the dragged card(s) to the #glass element so that it's above everything else
				let glass = document.getElementById( 'glass' )
				glass.appendChild( elem )
				for ( let card of table.drag.otherCards ) {
					glass.appendChild( card.elem )
				}
			}
		}
	},
	
	/**
	 * The mouse was released. This function provides the default behaviour of placing the
	 * dragged card on top of the destination drop pile
	 */
	mouseReleased: ( event ) => {
		// Abort quickly if we're not dragging anything.
		if ( table.drag === undefined ) {
			table.mouseClicked( event )
			return
		}

		// Did we drop over a somewhere accepting? We'll have a table.drag.destination if we did ...
		if ( table.drag.destination ) {
			let pile = dealer.piles[table.drag.destination.getAttribute('id')]

			// Move the dropped card to just after the DOM element it's being dropped onto. This will maintain the
			// correct z-order in the DOM.
			if ( table.drag.destination.classList.contains( 'pile' ) ) {
				let cards = document.getElementById( 'cards' )
				cards.insertBefore( table.drag.card.elem, cards.firstChild )
				let previous = table.drag.card.elem
				for ( let card of table.drag.otherCards ) {
					cards.insertBefore( card.elem, previous.nextSibling )
					previous = card.elem
				}
			} else {
				table.drag.destination.after( table.drag.card.elem )
				let cards = document.getElementById( 'cards' )
				let previous = table.drag.card.elem
				for ( let card of table.drag.otherCards ) {
					cards.insertBefore( card.elem, previous.nextSibling )
					previous = card.elem
				}

				pile = dealer.piles[table.drag.destination.getAttribute('data-pile')]
			}

			// Snap the card(s) neatly onto the pile.
			table.playDropAnimation( pile, table.drag.card.elem )
			let offset = 24
			for ( let card of table.drag.otherCards ) {
				table.playDropAnimation( pile, card.elem, offset )
				offset += 24
			}

			// Update the models.
			let cards = dealer.drawFromPile( table.drag.sourcePile, 1+table.drag.otherCards.length )
			cards.reverse()
			dealer.placeAllOnPile( pile.name, cards )
			if ( game.dropHappened ) {
				game.dropHappened( table.drag )
			}

			// Tidy up.
			cardUI.removeAffordances( pile )
			table.drag = undefined

			// Check the game hasn't finished
			let result = game.hasFinished()
			if ( result > 0 ) {
				table.finishGame( result )
			}
			return
		}

		// Snap the card back to where it came from. First we put it at the end, with a transform which
		// translates to where it was dropped.
		table.playSnapBackAnimation( table.drag.card.elem )
		let offset = 24
		for ( let card of table.drag.otherCards ) {
			table.playSnapBackAnimation( card.elem, offset )
			offset += 24
		}

		// Tidy up. Put the cards all back on the cards layer.
		let cards = document.getElementById( 'cards' )
		cards.appendChild( table.drag.card.elem )
		for ( let card of table.drag.otherCards ) {
			cards.appendChild( card.elem )
		}

		// Terminate the drag object.
		table.drag = undefined
	},
	
	/**
	 * Animates a card dropping nicely onto its new pile home after a drag and drop operation.
	 */
	playDropAnimation: ( pile, elem, offset = 0 ) => {
		let destXY = cardUI.getDestinationXY( pile, table.drag.destination )			

		// Work out how far the card needs to travel.
		let distX = elem.getBoundingClientRect().left - destXY.x
		let distY = elem.getBoundingClientRect().top - destXY.y
			
		// Position the card on the destination pile, where we want it to finish ...
		elem.style.top = offset + destXY.y + 'px'
		elem.style.left = destXY.x + 'px'
			
		// ... then apply a transform to translate it back to where it was dropped.
		elem.style.transform = `translate(${distX}px,${distY}px)`

		// Now apply an animation to remove the translation again.
		let rotation = cardUI.getRotationTransform( pile, elem )
		let anim = elem.animate([{transform: `${rotation}`}],{duration:250, easing: 'ease-in-out'});

		anim.pause()
		anim.onfinish = () => {
			elem.style.transform = rotation
		}
		anim.play()
	},

	/**
	 * Animates a card snapping back to its starting point after a failed
	 * drag and drop operation.
	 */
	playSnapBackAnimation: ( elem, offset = 0 ) => {
		let x = elem.getBoundingClientRect().left - table.drag.origin.left
		let y = elem.getBoundingClientRect().top - table.drag.origin.top
		elem.style.top = offset + table.drag.origin.top + 'px'
		elem.style.left = table.drag.origin.left + 'px'
		elem.style.transform = `translate(${x}px,${y}px)`

		// Now apply an animation to remove the translation again.
		let anim = elem.animate([{transform: 'translate(0px,0px)'}],{duration:250, easing: 'ease-in-out'});
		anim.pause()
		anim.onfinish = () => {
			elem.style.transform = 'none'
		}
		anim.play()
	},

	/**
	 * Called as a mouse is dragged over the game to check for affordances that might need
	 * enabling. If a drag/drop operation is active this method will assess if a drop
	 * can be performed.
	 */
	mouseMoved: ( event ) => {
		// If we're not dragging anything we only need to check for piles we can interact with.
		if ( table.drag === undefined ) {
			table.checkForInteractions( event.x, event.y )
			return
		}

		// Are we dragging over a pile? We can set this as the drag destination and
		// set a nice drop affordance.
		table.drag.destination = null
		for ( const [name, pile] of Object.entries(dealer.piles) ) {
			let outcome = game.canDropCardAtXYOnPile( table.drag.card, event.x, event.y, pile )
			let destElem = null

			switch ( outcome ) {
				case 0: // Nothing to interact with
					cardUI.removeAffordances( pile )
					break

				case 1: // Pile can be interacted with
					destElem = cardUI.enablePileAffordances( pile )
					if ( destElem ) {
						table.drag.destination = destElem
					}
					break
				
				case 2: // Card can be interacted with
					destElem = cardUI.enableCardAffordances( pile )
					if ( destElem ) {
						table.drag.destination = destElem
					}
			}
		}

		// Move the card to where the mouse is.
		table.drag.card.elem.style.left = Math.max( 0, (event.clientX-table.drag.offsetX) ) + 'px' 
		table.drag.card.elem.style.top = Math.max( 0, (event.clientY-table.drag.offsetY) ) + 'px'

		let offset = 24;
		for ( let card of table.drag.otherCards ) {
			card.elem.style.left = Math.max( 0, (event.clientX-table.drag.offsetX) ) + 'px' 
			card.elem.style.top = Math.max( 0, offset + (event.clientY-table.drag.offsetY) ) + 'px'
			offset += 24
		}
	},

	/**
	 * Can the pile or card at (x,y) be interacted with?
	 */
	checkForInteractions: ( x, y ) => {
		let addToGlass = null;
		for ( const [name, pile] of Object.entries(dealer.piles) ) {
			let interactive = game.canClickOrDragFromPileAtXY( pile, x, y )

			switch ( interactive.outcome ) {
				case 0: // Nothing to interact with
					cardUI.removeAffordances( pile )
					break

				case 1: // Pile can be interacted with
					cardUI.enablePileAffordances( pile )
					addToGlass = 'canClick'
					break
				
				case 2: // Card can be interacted with
					cardUI.enableCardAffordances( pile, interactive.card )
					addToGlass = interactive.type === 0 ? 'canClick' : 'canDrag'
					didAdd = true
			}
		}

		// If we added an interactive element then we can click on the glass
		let glass = document.getElementById( 'glass' )
		if ( addToGlass ) {
			glass.setAttribute( 'class', addToGlass )
		} else {
			glass.setAttribute( 'class', '' )
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
		if ( game.start ) {
			game.start()
		}

		// Tell the game about the piles we find in the DOM.
		let piles = document.getElementsByClassName( 'pile' )
		for ( let pile of piles ) {
			game.newPile( pile.getAttribute( 'id' ) )
		}
		if ( game.cardsDealt ) {
			game.cardsDealt()
		}
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
		// Put a <ul> in the masthead.
		let masthead = document.getElementById( 'masthead' )
		let ul = document.createElement( 'ul' )
		masthead.append( ul )

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

		masthead.insertAdjacentHTML( 'beforeend', '<strong>v' + table.version + '</strong>&nbsp;| &copy; 2025 David McGlashan' )

		// Have the glass listen to mouse events
		let glass = document.getElementById( 'glass' )
		glass.addEventListener( 'mouseup', table.mouseReleased )
		glass.addEventListener( 'mousemove', table.mouseMoved )
		glass.addEventListener( 'mousedown', table.mousePressed )

		window.addEventListener("resize", table.windowResized );
	},

	/**
	 * Stuffs a list of the available games into a <ul> on index.html
	 */
	listOfGames: () => {
		// Put a <ul> in the masthead.
		let ul = document.getElementById( 'listOfGames' )

		// Put an <li> for each available game.
		for ( let gg of table.games ) {
			let li = document.createElement( 'li' )
			ul.appendChild( li )

			let a = document.createElement( 'a' )
			a.setAttribute( 'href', gg.url )
			a.innerHTML = gg.name
			li.appendChild( a )
			li.appendChild( document.createTextNode( gg.description ) )

			// If this is the current game then select the <li> and update the banner.
			if ( document.URL.indexOf( '/' + gg.url ) !== -1 ) {
				a.setAttribute( 'class', 'selected' )

				let banner = document.getElementById( 'headline' )
				banner.innerHTML = gg.name
				let message = document.getElementById( 'message' )
				message.innerHTML = gg.description
			}
		}
	}
}