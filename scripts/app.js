function init() {

  const grid = document.querySelector('.grid')
  const startBtn = document.querySelector('.start')
  const width = 15
  const height = 20
  const cellCount = width * height
  const cells = []
  let score = 0
  let lives = 3
  let bombDropInterval // ! Why does it claim this? See ln 36.
  let shipInterval
  let collisionInterval // ! Why does it claim this? See ln 172.
  const userStartingPosition = 292
  let userCurrentPosition = userStartingPosition
  const shipStartingPosition = 37
  let shipCurrentPosition = shipStartingPosition
  let leftToRight = true
  let shipArray = [31, 32, 33, 35, 37, 38, 39, 41, 42, 43, 46, 50, 52, 56, 58, 61, 62, 65, 67, 68, 71, 72, 73, 76, 80, 82, 86, 88, 91, 95, 97, 101, 103]

  createGame()

  // TODO Ship moving to bottom causing game over
  // TODO Lives
  // TODO Bombs only dropping from lowermost cell of ship column
  // TODO Goalkeepers
  // TODO Animations (particularly for the meeting-in-the-middle problem)
  // TODO Audio
  // TODO Level difficulty progression (speed/bomb frequency/goalkeepers being perm vs. destroyable)
  // TODO Adding goals
  // TODO Consider refactoring to make use of Classes for Projectiles (=> Bomb/=> Missile), Ship, and User

  function startGame() {
    startBtn.disabled = true
    moveShip()
    bombDropInterval = setInterval(() => {
      if (shipArray.length  > 0) {
      dropBomb()
      }
    }, 1000)
    collisionChecker()
    document.addEventListener('keydown', userAction)
  }

  function createGame() {
    createGrid()
    addUser()
    addShip()
  }

  function createGrid() {
    for (let i = 0; i < cellCount; i++) {
      const cell = document.createElement('div')
      cell.dataset.index = i
      cell.classList.add('cell')
      grid.appendChild(cell)
      cells.push(cell)
    }
  }

  function moveShip() {
    removeShip()
    // To determine if any of the array values appear in the rightmost column
    let rightEdge = shipArray.filter(ship => ship % width === width - 1)
    // To determine if any of the array values appear in the leftmost column
    let leftEdge = shipArray.filter(ship => ship % width === 0)
    if (leftToRight) {
      if (rightEdge.length < 1) {
        shipArray = shipArray.map(ship => ship = ship + 1)
        // console.log(shipArray)
      } else {
        shipArray = shipArray.map(ship => ship = ship + width + 1)
        leftToRight = false
      }
    }
    if (!leftToRight) {
      if (leftEdge.length < 1) {
        shipArray = shipArray.map(ship => ship = ship - 1)
      } else {
        shipArray = shipArray.map(ship => ship = ship + width)
        leftToRight = true
      }
    }
    addShip()
    // console.log(shipArray)
    shipInterval = setTimeout(moveShip, 500)
  }


  function addShip() {
    shipArray.forEach(ship => {
      cells[ship].classList.add('ship')
    })
  }

  function removeShip() {
    shipArray.forEach(ship => {
      cells[ship].classList.remove('ship')
    })
  }

  function dropBomb() {
    let bombPosition = shipArray[Math.floor(Math.random() * shipArray.length)] + width
    addBomb(bombPosition)
    const bombMoveInterval = setInterval(() => {
      removeBomb(bombPosition)
      bombPosition += width
      if (bombPosition < cellCount) {
        addBomb(bombPosition, bombMoveInterval)
      } else {
        clearInterval(bombMoveInterval)
      }
    }, 200)
  }

  function addBomb(bombPosition, bombMoveInterval) {
    cells[bombPosition].classList.add('bomb')
    cells[bombPosition].setAttribute('bomb-interval-id', bombMoveInterval)
  }

  function removeBomb(bombPosition) {
    cells[bombPosition].classList.remove('bomb')
    cells[bombPosition].classList.remove('bomb-interval-id')
  }

  function fireMissile() {
    // Initially had the below as a global variable, but this was clashing with each 'fire'
    let missilePosition = userCurrentPosition - 2 * width
    addMissile(missilePosition)
    // Initially had the below as a global variable, but this was clashing with each 'fire'
    const missileInterval = setInterval(() => {
      removeMissile(missilePosition)
      missilePosition = missilePosition - width
      if (missilePosition >= 0) {
        addMissile(missilePosition, missileInterval)
      } else {
        clearInterval(missileInterval)
      }
    }, 200)
  }

  function addMissile(missilePosition, missileInterval) {
    cells[missilePosition].classList.add('missile')
    cells[missilePosition].setAttribute('missile-interval-id', missileInterval)
  }

  function removeMissile(missilePosition) {
    cells[missilePosition].classList.remove('missile')
    cells[missilePosition].classList.remove('missile-interval-id')
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

  function collisionChecker() {
    const allCells = document.querySelectorAll('.cell')
    collisionInterval = setInterval(() => {

      allCells.forEach(cell => {
        currentCellDataIndex = parseInt(cell.getAttribute('data-index'))
        aboveCellDataIndex = currentCellDataIndex - width
        const aboveCell = document.querySelector(`[data-index="${aboveCellDataIndex}"]`)
        // Missile hit on ship
        if ((cell.classList.contains('ship')) && (cell.classList.contains('missile'))) {
          // Find the cell where the collision occurred
          let getRemoveIndex = cell.getAttribute('data-index')
          // Store the index number of the cell that corresponds to the ship array
          let removeIndex = shipArray.indexOf(Number(getRemoveIndex))
          // Remove the element from the ship array that has been hit
          shipArray.splice(removeIndex, 1)
          // ! Need to refactor this -> clearInterval(bombDropInterval)
          cell.classList.remove('ship')
          cell.classList.remove('missile')
          clearInterval(cell.getAttribute('missile-interval-id'))
          score += 100
          console.log('Score ->', score)
          clearInterval(shipInterval)
          // ! Need to consider end level where ship array is empty
        }
        // Missile and bombs clashing mid-flight — same cell
        if ((cell.classList.contains('missile')) && (cell.classList.contains('bomb'))) {
          cell.classList.remove('bomb')
          cell.classList.remove('missile')
          clearInterval(cell.getAttribute('missile-interval-id'))
          clearInterval(cell.getAttribute('bomb-interval-id'))
          score += 50
          console.log('Score ->', score)
          console.log('first spot!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
        }
        // Missile and bombs clashing mid-flight — one cell apart
        if (currentCellDataIndex >= width) {
          if ((cell.classList.contains('missile')) && (aboveCell.classList.contains('bomb'))) {
            aboveCell.classList.remove('bomb')
            cell.classList.remove('missile')
            clearInterval(cell.getAttribute('missile-interval-id'))
            clearInterval(aboveCell.getAttribute('bomb-interval-id'))
            score += 50
            console.log('Score ->', score)
            console.log('second spot!')
          }
        }
        // Bomb hit on user
        if ((cell.classList.contains('bomb')) && ((cell.classList.contains('modric-top')) || (cell.classList.contains('modric-top')))) {
          cell.classList.remove('bomb')
          clearInterval(cell.getAttribute('bomb-interval-id'))
          lives--
          console.log('Lives ->', lives)
        }
      })
    }, 10)
  }

  startBtn.addEventListener('click', startGame)

}

window.addEventListener('DOMContentLoaded', init)