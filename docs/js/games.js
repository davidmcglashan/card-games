const games = {
	version: "1.0",

	allGames: [ 
		{ name: 'Accordion', description: 'Tick tock!', url: 'accordion.html' },
		{ name: 'Clock', description: 'Tick tock!', url: 'clock-patience.html' },
		{ name: 'Patience', description: 'a.k.a. Solitaire', url: 'patience.html' },
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
		elem.innerHTML = 'v' + table.version + '<br>&copy 2025 David McGlashan<br><a href="https://cards.dvdmcglshn.com">https://cards.dvdmcglshn.com</a>'
		section.appendChild( elem )
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

		// Something here to stop the game from working.
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

		window.addEventListener("resize", table.windowResized );
	},
}