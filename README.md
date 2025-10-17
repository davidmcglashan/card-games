# card-games
A bunch of single player card games for playing in web browers.

## v1.5.2
* Scorpion now has a setting allowing any card to be dropped onto a space.
* Made text on the banner a bit more legible with a heavy blur and text shadow in addition to the opacity.

## v1.5.1
* Fixed a bug in Scorpion's game end detection where Kings at the top of piles kept the game going.
* Certain Scorpion card symbols moved to make it clear what suit a covered card is.
* Appearance tweaks to the list of games page and navbar buttons.

## v1.5
* New game: Scorpion

## v1.4.5
* Accordion has end game messages and scores.
* Fixed an issue where Accordion games wouldn't end yet there were no legal moves.
* Tweaks to animations to stop moving cards going under dealt ones!

## v1.4.4
* Added helpful pile labels to some of the games.
* Added setting in Clock to automatically turn the next card.
* The Home icon in the navbar is now red when a red suit is chosen.
* Fixed an issue where Streets and alleys with strict let you drag from one spare pile to the other.
* Fine grainy gradient texture added to table.

## v1.4.3
* Appearance tweaks to the new list of games page.
* Games have a subtitle and a description.
* There's a home link in the masthead to go back to the list of games.

## v1.4.2
* Improved list of games page with a snazzy design.

## v1.4.1
* Improved handling of animations to prevent stray click and "concurrency" issues.
* Added github.com link to the About section in the settings tray.

## v1.4
* Improved card faces that look like the classic design. Picture cards use the chess king and queen unicode symbols.
* Changed certain hyperlink buttons from linking to "#" because it caused issues with browser history.
* Fixed an issue where hidden games didn't show text in the banner.

## v1.3.6
Various improvements to Aces Up ...
* Added a setting to drag any card into a space, not just an ace.
* Set a maximum size for cards so they don't get too big.
* Made the banner lower so you can see the end game cards.

## v1.3.5
* Added a new game: Flower Garden.

## v1.3.4
* Streets and Alleys now has two optional temporary storage piles for putting a single card in. This makes a difficult game slightly easier.

## v1.3.3
* Switched the hosting domain to cardgames.mcglashan.net

## v1.3.2
* Animation method for snapping piles now receives an {object} rather than lots of parameters.

## v1.3.1
* Added the affordances back into Accordion consistent with the other games.
* Removed the affordances setting in Accordion in line with the above.
* Tracks a game in progress to disable interactions when a banner is being displayed.
* Improved the game over detection for Aces Up.

## v1.3
* Added a new game: Aces Up.
* Games can now be hidden until they're ready.
* The two test games have been hidden.
* Button radius increased a little bit.
* Games can return custom game over messages e.g. depending on how well the player did.

## v1.2.1
* Suits show _under_ the card numbers on Streets & Alleys so they can be seen when cards are stacking to the left or right.
* Some code improvements concerning constants.
* Clock patience cards are now arranged in a circle.

## v1.2
* Added a new game: Streets & Alleys.
* Cards can stack to the left and right now.

## v1.1.4
* Animations in Accordion and Patience.

## v1.1.3
* Switched the hosting domain to cardgames.dvdmcglshn.net

## v1.1.2
* Fixed a bug where Patience was reversing the deck twice after each re-deal.
* Decorated the Patience empty suit piles with big symbols.
* Fixed some bugs around dropping and snapping.

## v1.1.1
* Increased stabiilty around right-clicks and dragging cards out of the frame.
* Improved the 'snap' animations that occur when more than one card is drag-and-dropped.

## v1.1
* Accordion and Patience now support a handful of game settings. These are remembered in your browser from game to game.
* Various cosmetic and gameplay fixes.

## v1.0
A version of patience/solitaire, a version of clock patience, and two test games for finding bugs and checking the graphics.
