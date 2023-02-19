function init() {

  const grid = document.querySelector('.grid')
  const width = 15
  const height = 20
  const cellCount = width * height
  const cells = []
  let score = 0
  let lives = 3
  let missileInterval
  let bombMoveInterval
  let bombDropInterval
  let shipInterval
  const userStartingPosition = 292
  let userCurrentPosition = userStartingPosition
  const shipStartingPosition = 16
  let shipCurrentPosition = shipStartingPosition
  let movingRight = true
  const shipArray = []
  const missileArray = []
  const bombArray = []
  let missilePosition
  let bombPosition
  let missileIn = []

  createGame()
  moveShip()
  bombDropInterval = setInterval(() => {
    dropBomb()
  }, 5000);


  function createGame() {
    createGrid()
    addUser()
    addShip()
  }

  function createGrid() {
    for (let i = 0; i < cellCount; i++) {
      const cell = document.createElement('div')
      cell.dataset.index = i
      grid.appendChild(cell)
      cells.push(cell)
    }
  }

  function addUser(newPosition) {
    if (!newPosition) {
      cells[userStartingPosition - width].classList.add('modric-top')
      cells[userStartingPosition].classList.add('modric-bottom')
    } else {
      cells[newPosition - width].classList.add('modric-top')
      cells[newPosition].classList.add('modric-bottom')
    }
  }

  function removeUser() {
    cells[userCurrentPosition - width].classList.remove('modric-top')
    cells[userCurrentPosition].classList.remove('modric-bottom')
  }

  function removeShip() {
    cells[shipCurrentPosition].classList.remove('ship')
  }

  function addShip() {
    cells[shipCurrentPosition].classList.add('ship')
  }

  function moveShip() {
    removeShip()
    if (movingRight) {
      if (shipCurrentPosition % width !== width - 1) {
        shipCurrentPosition++
      } else {
        movingRight = false
      }
    }
    if (!movingRight) {
      if (shipCurrentPosition % width !== 0) {
        shipCurrentPosition--
      } else {
        shipCurrentPosition++
        movingRight = true
      }
    }
    addShip()
    shipInterval = setTimeout(moveShip, 100)
  }

  function dropBomb() {
    bombPosition = shipCurrentPosition + width
    addBomb()
    bombMoveInterval = setInterval(() => {
      removeBomb()
      bombPosition += width
      addBomb()
    }, 200);
  }

  function addBomb() {
    cells[bombPosition].classList.add('bomb')
  }

  function removeBomb() {
    cells[bombPosition].classList.remove('bomb')
  }

  function addMissile(missilePosition) {
    cells[missilePosition].classList.add('missile')
  }

  function removeMissile(missilePosition) {
    cells[missilePosition].classList.remove('missile')
  }

  function fireMissile() {
    missilePosition = userCurrentPosition - 2 * width
    addMissile(missilePosition)
    missileInterval = setInterval(() => {
      removeMissile(missilePosition)
      missileIn.push(missileInterval)
      missilePosition = missilePosition - width
      if (missilePosition >= 0) {
        addMissile(missilePosition)
      } else {
        clearInterval(missileInterval)
      }
      console.log(missileIn)
    }, 1000);
  }

  function userAction(e) {
    const right = 39
    const left = 37
    const space = 32

    removeUser()

    if (e.keyCode === right && userCurrentPosition % width !== width - 1) {
      userCurrentPosition++
    } else if (e.keyCode === left && userCurrentPosition % width !== 0) {
      userCurrentPosition--
    } else if (e.keyCode === space) {
      fireMissile()
    }
    addUser(userCurrentPosition)
  }

  document.addEventListener('keydown', userAction)

}

window.addEventListener('DOMContentLoaded', init)