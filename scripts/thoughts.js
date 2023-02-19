// ! Challenges

// How do I get the ship to hold formation?

// ? Have the ship represented as an array containing all the cells it represents
// ? Run a .map on the array to remove the class representing the ship from all the elements in the array at the end of interval
// ? Run a .map on the array to change the elements of the ship based on the direction of travel
// ? Run a .map on the array to add the class representing the ship to all elements in the array at the start of a new interval

// How do I tackle collision?

// ? User hits:
// ?  if bomb currentPos contains class representing user => userCollision()
// ? userCollision() {
// ? run animation on clashing cell
// ? remove life from user
// ? remove the bomb, and clear its interval
// ? }

// ? Ship hits:
// ?  if missile currentPos contains class representing ship => shipCollision(impactedCell)

// ? shipCollision(cell) {
// ? run animation on cell
// ? remove ship style class on cell
// ? splice the cell representing the ship in the ship array
// ? remove the missile, and clear its interval
// ? }

// ? Bomb/missile collision:
// ?  if (missile currentPos || missile currentPos - (2 * width + 1)) contains class representing bomb => bombCollision(impactedCell)

// ? bombCollision(cell) {
// ? if already clashing
// ?    run animation on clashing cell
// ?    remove the missile, and clear its interval
// ?    remove the bomb, and clear its interval
// ? if distance is 2 vertical cells
// ?    run animation on the cell between them on next move
// ?    remove the missile, and clear its interval
// ?    remove the bomb, and clear its interval
// ? }

// How do I generate missile/bombs?

// ? Class for Projectiles, extended to a class for Missiles, and a class for Bombs
// ? Each instantiation has an associated timer, which is wiped upon the end of the bomb/missiles life
// ? Need to read up on this more, and practice with the concepts
// ? This will likely be the way to instantiate the user character, and the ship, too

// How do I scan for proximity prior to a collision?

// ? Either a listener (see below) on each 'change', or a function run on each movement to scan proximity of objects close to a missile/bomb

// ! Variables

// ? Ship timer for when the game ends, and this needs resetting
// ? Missile/bomb timers, although not sure how to make these global if they don't exist until a missile/bomb is generated after start
// ? Current score
// ? High score
// ? Lives

// ! Listeners

// ? All cells in grid, using querySelectorAll — perhaps constantly monitoring 'changes' to run functions that check missile/bomb proximity to user/ship/each other
// ? Keyboard controls, for user movement and missile firing
// ? Clicks for interacting with controls (start, reset, etc.)