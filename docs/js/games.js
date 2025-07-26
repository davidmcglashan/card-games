const games = {
	version: "1.1.4",

	allGames: [ 
		{ 	
			name: 'Accordion', 
			description: 'Reduce the number of piles to one by matching neighbouring suits and numbers', 
			url: 'accordion.html',
			settings: [
				{
					key: 'accordion.mouseEffects',
					label: 'Mouse effects',
					description: 'Makes the game easier by highlighting possible moves with the mouse'
				}
			]
		 },

		{ name: 'Clock', description: 'Tick tock!', url: 'clock-patience.html' },
		{ 
			name: 'Patience', 
			description: 'The classic Solitaire', 
			url: 'patience.html',
			settings: [
				{
					key: 'patience.anyCardOnASpace',
					label: 'Any card can be moved to a space',
					description: 'When not checked only a King can be placed on an empty pile'
				},{
					key: 'patience.shuffleAfterDeal',
					label: 'Shuffle when returning to deck',
					description: 'Performs a shuffle when all the dealt cards are returned to the main deck'
				},{
					key: 'patience.oneAtATime',
					label: 'Deal cards one at a time',
					description: 'Cards are dealt from the main deck one at a time instead of three at once'
				}
			]
		},
		{ name: 'Test1', description: 'Nothing here matters', url: 'table.html' },
		{ name: 'Test2', description: 'Look at the pretty cards', url: 'testcard.html' },
	],

	/**
	 * Stuffs a list of the available games into a <ul> on index.html
	 */
	listOfGames: () => {
		// Put a <ul> in the masthead.
		let ul = document.getElementById( 'listOfGames' )

		// Put an <li> for each available game.
		for ( let gg of games.allGames ) {
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
	},

	/**
	 * Builds the settings UI.
	 */
	buildSettings: ( thisGame ) => {
		let tray = document.getElementById( 'tray' )
		let section = document.createElement( 'div' )
		section.setAttribute( 'class', 'header' )
		tray.appendChild( section )

		// Settings header
		let elem = document.createElement( 'h1' )
		elem.innerHTML = 'Settings'
		section.appendChild( elem )

		// Close button
		elem = document.createElement( 'a' )
		elem.innerHTML = '&times;'
		elem.setAttribute( 'class', 'close' )
		elem.setAttribute( 'onclick', 'games.settings();' )
		elem.setAttribute( 'href', '#' )
		section.appendChild( elem )

		// New section for the settings controls.
		section = document.createElement( 'div' )
		section.setAttribute( 'class', 'settings' )
		tray.appendChild( section )

		if ( thisGame.settings ) {
			for ( let setting of thisGame.settings ) {
				let label = document.createElement( 'label' )
				
				let check = document.createElement( 'input' )
				check.setAttribute( 'type', 'checkbox' )
				check.setAttribute( 'value', 'true' )
				check.setAttribute( 'name', setting.key )
				check.setAttribute( 'id', 'setting_' + setting.key )

				// We can set the settings UI and the game settings state at the same time.
				if ( localStorage[check.name] ) {
					check.setAttribute( 'checked', 'true' )
					if ( game.settingChanged ) {
						game.settingChanged( check.name, true )
					} 
				} else if ( game.settingChanged ) {
					game.settingChanged( check.name, false )
				}

				label.appendChild( check )
				label.insertAdjacentHTML( 'beforeend', '<strong>' + setting.label + '</strong><br>' + setting.description )
				section.appendChild( label )
			}

			elem = document.createElement( 'a' )
			elem.setAttribute( 'href', '#' )
			elem.setAttribute( 'onclick', 'games.saveSettings()' )
			elem.setAttribute( 'class', 'btn' )
			elem.innerHTML = 'Save settings'
			section.appendChild( elem )
		} else {
			elem = document.createElement( 'p' )
			elem.innerHTML = 'This game has no settings.'
			section.appendChild( elem )
		}

		// New section for About.
		section = document.createElement( 'div' )
		section.setAttribute( 'class', 'about' )
		tray.appendChild( section )

		elem = document.createElement( 'h1' )
		elem.innerHTML = 'About'
		section.appendChild( elem )

		// New section for the About details.
		section = document.createElement( 'div' )
		tray.appendChild( section )

		elem = document.createElement( 'p' )
		elem.innerHTML = 'v' + games.version + '<br>&copy 2025 David McGlashan<br><a href="https://cardgames.dvdmcglshn.com">https://cardgames.dvdmcglshn.com</a>'
		section.appendChild( elem )
	},

	/**
	 * Called when the save settings button is pressed in the UI. Informs the game of any changes and persists
	 * settings in localstorage.
	 */
	saveSettings: () => {
		let checks = document.querySelectorAll( "#tray input[type='checkbox']" )
		for ( let check of checks ) {
			// Inform the game of the new settings.
			if ( game.settingChanged ) {
				game.settingChanged( check.name, check.checked )
			}
			
			// Set the new values into localstorage for recall later.
			if ( check.checked ) {
				localStorage[check.name] = true
			} else {
				localStorage.removeItem( check.name )
			}
		}

		// Reset the UI.
		games.settings()
		table.restart()
	},

	/**
	 * Toggles the slide-in tray so the user can access the settings.
	 */
	settings: () => {
		document.getElementById('lightbox').classList.toggle('show')
		
		// The tray starts with neither an open or closed class since this triggers an animation. First time
		// through simply set an open class on it. Subsequent goes can then toggle open and closed classes.
		let tray = document.getElementById('tray')
		if ( tray.classList.length === 0 ) {
			tray.classList.add('open')
		} else {
			tray.classList.toggle('closed')
			tray.classList.toggle('open')
		}
	},

	/**
	 * Prepare the table for playing. This also sets up various bits of UI. Only call this
	 * once from the loading page.
	 */
	readyTable: () => {
		// Put a <ul> in the masthead.
		let masthead = document.getElementById( 'masthead' )
		let ul = document.createElement( 'ul' )
		masthead.append( ul )

		// Put an <li> for each available game.
		for ( let gg of games.allGames ) {
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

				// Also build the settings pane while we have the current game at hand.
				games.buildSettings( gg )
			}
		}

		masthead.insertAdjacentHTML( 'beforeend', '<div><a href="#" onclick="table.restart();">Restart</a><a href="#" onclick="games.settings();">Settings</a> </div>' )

		// Have the glass listen to mouse events
		let glass = document.getElementById( 'glass' )
		glass.addEventListener( 'mouseup', table.mouseReleased )
		glass.addEventListener( 'mousemove', table.mouseMoved )
		glass.addEventListener( 'mousedown', table.mousePressed )

		glass.addEventListener( 'mouseleave', table.mouseOut )
		window.addEventListener("resize", table.windowResized );		
	},
}