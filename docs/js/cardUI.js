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

	getTransform: ( pile, card ) => {
		switch ( pile.stackingMethod ) {
			case dealer.stackingMethods.UNTIDY:
				let a = Math.floor(Math.random() * 8) - 4;
				return 'rotate('+a+'deg)'
		}
		return 'none'
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
	 * Add an affordance CSS classnames to the pile's top card.
	 */
	enableCardAffordances: ( pile ) => {
		let card = dealer.peekTopOfPile( pile.name )
		if ( card ) {
			card.elem.classList.add( 'interactive' )
			return card.elem
		}
		return null
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