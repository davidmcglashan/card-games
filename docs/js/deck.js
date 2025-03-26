const cohort = {
	init: () => {
		// Listen for selection changes ...
		despatch.addListener( selection.listenerEvents.selectionChanged, cohort.selectionChanged )
		despatch.addListener( people.listenerEvents.populationChanged, cohort.updateBars )
	},

    /**
     * Listener method for when the user changes their selection.
     */
	selectionChanged: ( sel ) => {
		if ( selection.isActivePerson() && sel.loc === selection.loc ) {
			cohort.updateNavbar()
		}
	},

	/**
	 * Update the navbar
	 */
	updateNavbar: () => {
		let div = document.getElementById( 'person-inventory' )
		div.innerHTML = ''

		// Abort if there's no person selection.
		if ( !selection.person ) {
			return
		}

		// Label the inventory
		let elem = document.createElement( 'div' )
		div.appendChild( elem )
		elem.setAttribute( 'class', 'label ')
		elem.innerHTML = language.get( 'label_inventory' )

		// Now iterate the inventory held by the selected person, adding an icon for each item held
		let c = 0
		Object.entries( selection.person.inventory ).forEach(
			([k,v]) => {
				let icon = document.createElement( 'div' )
				div.appendChild( icon )
				icon.setAttribute( 'class', 'panel ' + k )
				
				let counter = document.createElement( 'div' )
				icon.appendChild( counter )
				counter.setAttribute( 'class', 'counter' )
				counter.innerHTML = v

				c++
			}
		)

		// Make up any empty slots up to three to keep the UI a consistent size.
		while ( c < 3 ) {
			let icon = document.createElement( 'div' )
			div.appendChild( icon )
			icon.setAttribute( 'class', 'panel' )
			c++
		}

		cohort.updateBars()

		// Put in a 'go home' button
		elem = document.getElementById( 'person-commands' )
		elem.innerHTML = ''
		let btn = document.createElement( 'a' )
		elem.appendChild( btn )
		btn.setAttribute( 'href', '#' )
		btn.setAttribute( 'onclick', 'cohort.goHomeAtSelection() ')
		btn.innerHTML = language.get( 'go_home' )
	},

	/**
	 * Update the nav UI for the population of a cohort
	 */
	updateBars: () => {		
		// Update the praise and population bars, globally ...
		elem = document.getElementById( 'person-gpopl-bar' )
		elem.style.width = 1+(world.getGlobalPopulation()) + 'px'

		// ... and for the current person
		if ( selection.person ) {
			elem = document.getElementById( 'person-popl-bar' )
			elem.style.width = 1+(selection.person.population) + 'px'
		}
	},

	goHomeAtSelection: () => {
		people.personReturnToOrigin( selection.person )
	}
};

cohort.init();