const games = {
	version: "1.5.2",

	allGames: [ 
		{ 
			name: 'Aces Up', 
			sub: 'Reduce the deck to only the aces',
			description: 'If you can see two of a suit discard the lowest one (aces are high) until all that\'s left are the aces.', 
			url: 'aces-up.html',
			settings: [
				{
					key: 'acesUp.anyCardOnASpace',
					label: 'Any card can be moved to an empty pile',
					description: 'When not checked only aces can be placed on empty piles'
				}
			]
		},{ 	
			name: 'Accordion', 
			sub: 'Match until there\'s one card left',
			description: 'Deal one at a time. Cards on the table can be moved on top of their upward or leftward neighbour if they match suit or number.', 
			url: 'accordion.html'
		},{
			name: 'Clock',
			sub: 'Tick tock!',
			description: 'Place the overturned card into its position around the clock face. Will you end with a King?',
			url: 'clock-patience.html',
			settings: [
				{
					key: 'clock.autoTurnNextCard',
					label: 'Automatically turn the next card',
					description: 'When a card is placed the next one will automatically be turned over'
				}
			] 
		},{
			name: 'Flower Garden',
			sub: 'Tidy the beds and plant the bouquet',
			description: 'Sort the deck into suits, aces first. Deal from the bouquet onto one of the six beds in descending numbers.',
			url: 'flower-garden.html'
		},{ 
			name: 'Patience', 
			sub: 'The classic Solitaire', 
			description: 'Sort the deck into suits, aces first. Deal onto the towers, subsequent cards must change colour and decrease in number.',
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
		},{
			name: 'Scorpion',
			sub: 'Beware the sting in its tail',
			description: 'Make descending runs of each suit. Get a king-to-ace run and it will be removed. Remove everything to win',
			url: 'scorpion.html',
			settings: [
				{
					key: 'scorpion.anyCardOnASpace',
					label: 'Any card can be moved to a space',
					description: 'When not checked only a King can be placed on an empty pile'
				}
			]
		},{ 
			name: 'Streets &amp; Alleys', 
			sub: 'Don\'t get lost', 
			description: 'Sort the deck into suits, aces first. Swap cards between the piles, placing a card only on another with a number one higher',
			url: 'streets.html',
			settings: [
				{
					key: 'streets.startWithAces',
					label: 'Start with the aces',
					description: 'Make the game a bit easier by starting with all four aces already dealt'
				},{
					key: 'streets.storage',
					label: 'Use temporary storage',
					description: 'Add two extra piles for temporarily placing a single card'
				},{
					key: 'streets.strictStorage',
					label: 'Strict storage',
					description: 'Cards can only be placed and drawn from storage on their side of the table'
				}
			]
		},

		{ name: 'Test1', description: 'Nothing here matters', url: 'test1.html', hidden: true },
		{ name: 'Test2', description: 'Look at the pretty cards', url: 'test2.html', hidden: true },
	],

	/**
	 * Stuffs a list of the available games into a <ul> on index.html
	 */
	listOfGames: () => {
		// Put a <ul> in the masthead.
		let ul = document.getElementById( 'listOfGames' )
		let symbols = [ '&#9824;', '&#9827;', '&#9829;', '&#9830;' ]

		// Put an <li> for each available game.
		for ( let gg of games.allGames ) {
			if ( gg.hidden ) {
				continue
			}

			// Card
			let li = document.createElement( 'li' )
			ul.appendChild( li )

			// Icon of one of the suit glyphs
			let a = document.createElement( 'a' )
			li.appendChild( a )
			a.setAttribute( 'href', gg.url )
			let sym = Math.floor(4*Math.random())
			a.setAttribute( 'class', 'icon ' + (sym>1 ? 'red' : 'black') )
			a.innerHTML = '<span>'+symbols[sym]+'</span>'

			// Game name
			a = document.createElement( 'a' )
			li.appendChild( a )
			a.setAttribute( 'href', gg.url )
			a.innerHTML = gg.name

			// Game sub-title
			let span = document.createElement( 'span' )
			span.setAttribute( 'class', 'sub' )
			span.innerHTML = gg.sub
			a.appendChild( span )

			// If this is the current game then also update the banner.
			if ( document.URL.indexOf( '/' + gg.url ) !== -1 ) {
				let banner = document.getElementById( 'headline' )
				banner.innerHTML = gg.name
				let message = document.getElementById( 'message' )
				message.innerHTML = gg.description
			}
		}

		// Put the credits on here as well.
		let elem = document.getElementById( 'credits' )
		elem.appendChild( games.credits() )
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
		elem.setAttribute( 'role', 'button' )
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
			elem.setAttribute( 'role', 'button' )
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
		section.appendChild( games.credits() )
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

	credits: () => {
		let	elem = document.createElement( 'p' )
		elem.innerHTML 
			= 'v' + games.version 
			+ '<br>&copy 2025 David McGlashan<br>'
			+ '<a href="https://cardgames.mcglashan.net">https://cardgames.mcglashan.net</a>'
			+ '<p>Source code on <a href="https://github.com/davidmcglashan/card-games">github.com</a></p>'
		
		return elem
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

		// Put an <li> for the "home" link
		let li = document.createElement( 'li' )
		li.setAttribute( 'class', 'home' )
		ul.appendChild( li )

		let symbols = [ '&#9824;', '&#9827;', '&#9829;', '&#9830;' ]
		let a = document.createElement( 'a' )
		a.setAttribute( 'href', 'index.html')
		let sym = Math.floor(4*Math.random())
		a.setAttribute( 'class', (sym>1 ? 'red' : 'black') )
		a.innerHTML = '<span>'+symbols[sym]+'</span>'
		li.appendChild( a )

		// Put an <li> for each available game.
		for ( let gg of games.allGames ) {
			// Display the current game detials in the banner
			if ( document.URL.indexOf( '/' + gg.url ) !== -1 ) {
				let banner = document.getElementById( 'headline' )
				banner.innerHTML = gg.name
				let message = document.getElementById( 'message' )
				message.innerHTML = gg.description
			}

			// If the game is hidden don't do any more.
			if ( gg.hidden ) {
				continue
			}

			li = document.createElement( 'li' )
			ul.appendChild( li )

			a = document.createElement( 'a' )
			a.setAttribute( 'href', gg.url )
			a.innerHTML = gg.name
			li.appendChild( a )

			// If this is the current game then select the <li> and build the settings pane.
			if ( document.URL.indexOf( '/' + gg.url ) !== -1 ) {
				a.setAttribute( 'class', 'selected' )
				games.buildSettings( gg )
			}
		}

		masthead.insertAdjacentHTML( 'beforeend', '<div><a role="button" onclick="table.restart();">Restart</a><a role="button" onclick="games.settings();">Settings</a> </div>' )

		// Have the glass listen to mouse events
		let glass = document.getElementById( 'glass' )
		glass.addEventListener( 'mouseup', table.mouseReleased )
		glass.addEventListener( 'mousemove', table.mouseMoved )
		glass.addEventListener( 'mousedown', table.mousePressed )

		glass.addEventListener( 'mouseleave', table.mouseOut )
		window.addEventListener("resize", table.windowResized );		
	},
}