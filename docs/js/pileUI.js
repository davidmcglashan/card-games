const pileUI = {
	listener: {},

	setListener: ( listener ) => {
		pileUI.listener = listener
	},

	despatch: ( method, pile ) => {
		let fn = pileUI.listener[method]
		if ( fn ) {
			fn( pile )
		}
	},

	/**
	 * Builds a pile of card <div>s in the elemID element
	 */
	rebuildPile: ( pile, card ) => {
		let pileElem = document.getElementById( pile.name )
		pileElem.innerHTML = ''

		let i = 0;
		for ( let card of pile.cards ) {
			let cardElem = document.createElement( 'div' )
			pileElem.appendChild( cardElem )
			cardElem.setAttribute( 'id', card.name )
	//		cardElem.setAttribute( 'data-drag', p )

			if ( card.isFaceUp ) {
				cardElem.setAttribute( 'class', 'card' )
				pileUI.decorateFace( card )
					
				//cardElem.setAttribute( 'draggable', 'true' )
				//cardElem.setAttribute( 'ondragstart','patience.drag(event)' )
				//cardElem.setAttribute( 'ondrop','patience.dropOnPile(event)' )
			} else {
				cardElem.setAttribute( 'class', 'card faceDown' )
			}

			cardElem.setAttribute( 'style', 'z-index:'+i+';' )
			i++
		}

		if ( pile.cards.length === 0 ) {
			pileUI.despatch( 'pileEmptied', pile )
		} else {
			pileUI.despatch( 'pileRebuilt', pile )
		}
	},

	/**
	 * Decorate the DOM element based on the supplied card's face.
	 */
	decorateFace: ( card ) => {
		let elem = document.getElementById( card.name )

		if ( card.isFaceUp ) {
			elem.setAttribute( 'class', 'card ' + card.suit )
			elem.innerHTML = '<div class="label">'+card.label+'</div><div class="bottomlabel">'+card.label+'</div>'
		} else {
			elem.setAttribute( 'class', 'card faceDown' )
		}
	},
};