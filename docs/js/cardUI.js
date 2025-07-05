const cardUI = {
	snapPile: ( pile ) => {
		let pileElem = document.getElementById( pile.name )
		let bounds = pileElem.getBoundingClientRect()

		let i = 0;
		for ( let card of pile.cards ) {
			let elem = document.getElementById( card.name )
			if ( !elem ) {
				elem = document.createElement( "div" )
				elem.setAttribute( 'id', card.name )
				elem.setAttribute( 'data-pile', pile.name )


				let table = document.getElementById( 'cards' )
				table.appendChild( elem )

				cardUI.decorate( card )
			}

			elem.style.left = i/2 + bounds.x + 'px'
			elem.style.top = i/2 + bounds.y + 'px'
			elem.style.width = bounds.width + 'px'
			elem.style.height = bounds.height + 'px'

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
		let elem = document.getElementById( card.name )

		if ( card.isFaceUp ) {
			elem.setAttribute( 'class', 'card faceUp ' + card.suit + ' ' + card.css )
			let s = '<div class="label">'+card.label+'</div><div class="bottomlabel">'+card.label+'</div><div class="suit">'+card.symbol+'</div><div class="value">'+card.shortValue+'</div>'
			elem.innerHTML = s
		} else {
			elem.setAttribute( 'class', 'card faceDown' )
		}
	}
}