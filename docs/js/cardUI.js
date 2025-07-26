const cardUI = {
	snapPile: ( pile ) => {
		let pileElem = document.getElementById( pile.name )
		let bounds = pileElem.getBoundingClientRect()
		let prev = null;

		let i = 0;
		for ( let card of pile.cards ) {
			if ( !card.elem ) {
				card.elem = document.createElement( "div" )
				card.elem.setAttribute( 'id', card.name )
				let table = document.getElementById( 'cards' )
				table.appendChild( card.elem )
				cardUI.decorate( card )
			}

			switch ( pile.stackingMethod ) {
				case dealer.stackingMethods.TIGHT:
				case dealer.stackingMethods.UNTIDY:
				case dealer.stackingMethods.DIAGONAL:
					card.elem.style.left = i/2 + bounds.x + 'px'
					card.elem.style.top = i/2 + bounds.y + 'px'
					break
				case dealer.stackingMethods.VERTICAL:
					card.elem.style.left = bounds.x + 'px'
					card.elem.style.top = i*24 + bounds.y + 'px'
					break
			}

			card.elem.style.width = bounds.width + 'px'
			card.elem.style.height = bounds.height + 'px'
			card.elem.setAttribute( 'data-pile', pile.name )
			
			if ( prev ) {
				prev.after( card.elem )
			}
			prev = card.elem
			i++;
		}
	},

	/**
	 * Animates the snapping of a card pile.
	 */
	snapPileWithAnimation: ( pile, delay=0, reverse=false ) => {
		// Read the original card positions and store them in an object.
		let orig = {}
		for ( let card of pile.cards ) {
			if ( card.elem ) {
				let pos = {}
				pos.top = parseInt( card.elem.style.top.slice(0,-2) )
				pos.left = parseInt( card.elem.style.left.slice(0,-2) )
				pos.elem = card.elem
				orig[card.name] = pos
			}
		}

		// Let snapPile do its thing.
		cardUI.snapPile( pile )

		// Now grab a hold of all the cards that moved and install an animation
		let offset = 1
		let iterable = Object.entries( orig )
		if ( reverse ) {
			iterable = iterable.reverse()
		}
		
		for ( const[name,pos] of iterable ) {
			let elem = pos.card

			// Has the card actually moved?
			let left = pos.left - parseInt( pos.elem.style.left.slice(0,-2) )
			let top = pos.top - parseInt( pos.elem.style.top.slice(0,-2) )			
			if ( left+top !== 0 ) {
				// Apply a transform to the card that's the difference of where it started
				// from to where it now is.
				pos.elem.style.transform = `translate(${left}px,${top}px)`

				// Now apply an animation to remove the translation again.
				let anim = pos.elem.animate([{transform: 'translate(0px,0px)'}],{duration:250, easing: 'ease-in-out', delay: delay*offset});
				anim.pause()
				anim.onfinish = () => {
					pos.elem.style.transform = 'none'
				}
				anim.play()
				offset++
			}
		}
	},

	getCardAtXY: ( x, y ) => {
		let elems = document.elementsFromPoint( x, y )
		for ( let elem of elems ) {
			if ( elem.classList.contains( 'card' ) ) {
				return elem
			}
		}
		return null
	},

	getPileAtXY: ( x, y ) => {
		let elems = document.elementsFromPoint( x, y )
		for ( let elem of elems ) {
			if ( elem.classList.contains( 'pile' ) ) {
				return elem
			}
		}
		return null
	},

	getRotationTransform: ( pile, card ) => {
		switch ( pile.stackingMethod ) {

			case dealer.stackingMethods.UNTIDY:
				let a = Math.floor(Math.random() * 8) - 4;
				return 'rotate('+a+'deg)'
			
		}
		return 'none'
	},

	/**
	 * Apply a translation for a dropped card depending on the pile's stacking method.
	 * Empty piles don't apply a translation. The first card always sits on the pile neatly.
	 */
	getDestinationXY: ( pile, elem ) => {
		// Empty piles don't apply a translation. The first card always sits on the pile neatly.
		if ( pile.cards.length === 0 ) {
			let rect = elem.getBoundingClientRect()
			return { x: rect.left, y: rect.top }
		}

		// We must be dealing with a card. Cards might have rotations, but should have top: and left:
		let point = {}
		point.x = parseInt( elem.style.left.slice(0,-2) )
		point.y = parseInt( elem.style.top.slice(0,-2) )

		switch ( pile.stackingMethod ) {
			// Verticals get shunted down nicely.
			case dealer.stackingMethods.VERTICAL:
				point.y = point.y + 24
				break

			// Diagonals get a tiny x,y offset applied.
			case dealer.stackingMethods.DIAGONAL:
				point.x = point.x + 0.5
				point.y = point.y + 0.5
		}
		
		return point
	},

	/**
	 * Decorate the DOM element based on the supplied card's face.
	 */
	decorate: ( card ) => {
		if ( card.isFaceUp ) {
			card.elem.setAttribute( 'class', 'card faceUp ' + card.suit + ' ' + card.css )
			let s = '<div class="label">'+card.label+'</div><div class="bottomlabel">'+card.label+'</div><div class="suit">'+card.symbol+'</div><div class="value">'+card.shortValue+'</div>'
			card.elem.innerHTML = s
		} else {
			card.elem.innerHTML = ''
			card.elem.setAttribute( 'class', 'card faceDown' )
		}
	},

	/**
	 * Removes any affordance CSS classnames from a pile and its cards.
	 */
	removeAffordances: ( pile ) => {
		pile.elem.classList.remove( 'interactive' )
		for ( let card of pile.cards ) {
			card.elem.classList.remove( 'interactive' )
		}
		return null
	},

	/**
	 * Add an affordance CSS classnames to the pile.
	 */
	enablePileAffordances: ( pile ) => {
		pile.elem.classList.add( 'interactive' )
		return pile.elem
	},
	
	/**
	 * Add an affordance CSS classnames to the named card or the pile's top card.
	 */
	enableCardAffordances: ( pile, cardName = null ) => {
		// Empty piles get no processing.
		if ( pile.cards.length === 0 ) {
			return
		}

		// No card name? Default to the top of the pile.
		if ( cardName === null ) {
			cardName = dealer.peekTopOfPile( pile.name ).name
		}

		let ret = null
		for ( let card of pile.cards ) {
			if ( card.name === cardName ) {
				card.elem.classList.add( 'interactive' )
				ret = card.elem
			} else {
				card.elem.classList.remove( 'interactive' )
			}
		}

		return ret
	},

	/**
	 * Convenience check for (x,y) being within the bounding client rect of the passed in 
	 * elem. Returns the bounding client rect if it is, otherwise null.
	 */
	xyIsInBounds: ( x, y, elem ) => {
		let rect = elem.getBoundingClientRect()

		if ( x > rect.x && x < rect.x + rect.width && y > rect.y && y < rect.y + rect.height ) {
			return rect
		}

		return null
	}
}