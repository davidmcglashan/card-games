const table = {
	outcomes: {
		NONE: 0,
		PILE_IS_INTERACTIVE: 1,
		CARD_IS_INTERACTIVE: 2
	},

	interactionTypes: {
		CLICK: 0,
		DRAG: 1
	},

	gameOverStates: {
		KEEP_PLAYING: 0,
		PLAYER_LOSES: 1,
		PLAYER_WINS: 2
	},

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
		try {
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
		} finally {
			// Check the game hasn't finished
			let result = game.hasFinished()
			if ( result.state !== table.gameOverStates.KEEP_PLAYING ) {
				table.finishGame( result )
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
		if ( event.which !== 1 || !game.canStartDrag ) {
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
		if ( table.drag === undefined || !table.drag.hasMoved ) {
			table.mouseClicked( event )
			
			if ( table.drag === undefined ) {
				return
			}
		}

		try {
			// If the drag hasn't moved then abort. We don't abort above so we can
			// take advantage of the finally{} block below.
			if ( !table.drag.hasMoved ) {
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
				if ( result.state !== table.gameOverStates.KEEP_PLAYING ) {
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
		} finally {	
			// Tidy up. Put the cards all back on the cards layer.
			if ( table.drag ) {
				let cards = document.getElementById( 'cards' )
				cards.appendChild( table.drag.card.elem )
				for ( let card of table.drag.otherCards ) {
					cards.appendChild( card.elem )
				}
			}
			
			// Terminate the drag object.
			table.drag = undefined
		}
	},
	
	/**
	 * The mouse left the window element, which means it left the table. If it was dragging
	 * we invoke a drop here.
	 */
	mouseOut: ( event ) => {
		// If we're dragging something it's time to drop it!
		if ( table.drag !== undefined ) {
			table.mouseReleased( event )
		}
	},

	/**
	 * Animates a card dropping nicely onto its new pile home after a drag and drop operation.
	 */
	playDropAnimation: ( pile, elem, offset = 0 ) => {
		let destXY = cardUI.getDestinationXY( pile, table.drag.destination )			

		// Work out how far the card needs to travel.
		let distX = elem.getBoundingClientRect().left - destXY.x
		let distY = elem.getBoundingClientRect().top - destXY.y - offset
			
		// Position the card on the destination pile, where we want it to finish ...
		elem.style.top = offset + destXY.y + 'px'
		elem.style.left = destXY.x + 'px'
			
		// ... then apply a transform to translate it back to where it was dropped.
		elem.style.transform = `translate(${distX}px,${distY}px)`

		// Now apply an animation to remove the translation again.
		let rotation = cardUI.getRotationTransform( pile, elem )
		let anim = elem.animate([{transform: `${rotation}`}],{duration:250, easing: 'ease-in-out', delay:offset/2});

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
		let y = elem.getBoundingClientRect().top - table.drag.origin.top - offset
		elem.style.top = offset + table.drag.origin.top + 'px'
		elem.style.left = table.drag.origin.left + 'px'
		elem.style.transform = `translate(${x}px,${y}px)`

		// Now apply an animation to remove the translation again.
		let anim = elem.animate([{transform: 'translate(0px,0px)'}],{duration:250, easing: 'ease-in-out', delay:offset/2});
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
				case table.outcomes.NONE:
					cardUI.removeAffordances( pile )
					break

				case table.outcomes.PILE_IS_INTERACTIVE:
					destElem = cardUI.enablePileAffordances( pile )
					if ( destElem ) {
						table.drag.destination = destElem
					}
					break
				
				case table.outcomes.CARD_IS_INTERACTIVE:
					destElem = cardUI.enableCardAffordances( pile )
					if ( destElem ) {
						table.drag.destination = destElem
					}
			}
		}

		// Move the card to where the mouse is.
		let distX = Math.max( 0, (event.clientX-table.drag.offsetX) )
		let distY = Math.max( 0, (event.clientY-table.drag.offsetY) )
		if ( distX > 0 || distY > 0 ) {
			table.drag.hasMoved = true
		}

		table.drag.card.elem.style.left = distX + 'px' 
		table.drag.card.elem.style.top = distY + 'px'

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
				case table.outcomes.NONE:
					cardUI.removeAffordances( pile )
					break

				case table.outcomes.PILE_IS_INTERACTIVE:
					cardUI.enablePileAffordances( pile )
					addToGlass = 'canClick'
					break
				
				case table.outcomes.CARD_IS_INTERACTIVE:
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
		// Tear down the pages a little
		document.getElementById( 'cards' ).innerHTML = ''
		document.getElementById( 'glass' ).innerHTML = ''

		// Start the game by removing the banner.
		document.getElementById('banner').classList.add( 'hidden' )

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
	finishGame: ( gameOver ) => {
		// Finish the game by displaying the banner.
		let elem = document.getElementById('banner')
		elem.classList.remove( 'hidden' )

		// Display a result-appropriate message ...
		let banner = document.getElementById( 'headline' )
		let message = document.getElementById( 'message' )
		
		if ( gameOver.state === table.gameOverStates.PLAYER_LOSES ) {
			banner.innerHTML = 'Game over!'
			message.innerHTML = gameOver.message ? gameOver.message : 'Better luck next time ...'
		} else {
			banner.innerHTML = 'Congratulations!'
			message.innerHTML = gameOver.message ? gameOver.message : 'Why not try and do that again?'
		}

		elem = document.getElementById( 'play-button' )
		elem.innerHTML = 'Play again'
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
}