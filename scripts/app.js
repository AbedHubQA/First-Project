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
  let movingRight = true
  const shipArray = []

  createGame()

  // TODO Lives
  // TODO Ship formation as an array
  // TODO Ship moving down
  // TODO Ship moving to bottom causing game over
  // TODO Bombs only dropping from lowermost cell of ship column
  // TODO Goalkeepers
  // TODO Audio
  // TODO Level difficulty progression (speed/bomb frequency/goalkeepers being perm vs. destroyable)
  // TODO Adding goals

  function startGame() {
    startBtn.disabled = true
    moveShip()
    bombDropInterval = setInterval(() => {
      dropBomb()
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
    shipInterval = setTimeout(moveShip, 200)
  }

  function addShip() {
    cells[shipCurrentPosition].classList.add('ship')
  }

  function removeShip() {
    cells[shipCurrentPosition].classList.remove('ship')
  }

  function dropBomb() {
    let bombPosition = shipCurrentPosition + width
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
        // if ((cell.classList.contains('ship')) && (cell.classList.contains('missile'))) {
        //   clearInterval(shipInterval)
        //   clearInterval(bombDropInterval)
        //   cell.classList.remove('ship')
        //   cell.classList.remove('missile')
        //   clearInterval(cell.getAttribute('missile-interval-id'))
        //   score += 100
        //   console.log('Score ->', score)
        // }
        // Missile and bombs clashing mid-flight
        if ((cell.classList.contains('missile')) && (cell.classList.contains('bomb'))) {
          cell.classList.remove('bomb')
          cell.classList.remove('missile')
          clearInterval(cell.getAttribute('missile-interval-id'))
          clearInterval(cell.getAttribute('bomb-interval-id'))
          score += 50
          console.log('Score ->', score)
          console.log('first spot!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
        } 
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