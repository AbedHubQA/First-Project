function init() {

  const grid = document.querySelector('.grid')
  // const allCells = document.querySelectorAll('.cell')
  const startBtn = document.querySelector('.start-button')
  const audioBtn = document.querySelector('.audio-button')
  const currScore = document.querySelector('.score-value')
  const highScoreText = document.querySelector('.highscore-value')
  const currLives = document.querySelector('.current-lives')

  const width = 19
  const height = 20
  const cellCount = width * height
  const cells = []
  let score = 0
  let highscore = localStorage.getItem('highscore')
  highScoreText.innerText = highscore
  let lives = 3
  let bombDropInterval
  let shipInterval
  let collisionInterval 
  const userStartingPosition = 370
  let userCurrentPosition = userStartingPosition
  let leftToRight = true
  let missileActive = false
  let shipArray = [41, 42, 43, 45, 47, 48, 49, 51, 52, 53, 60, 64, 66, 70, 72, 79, 80, 83, 85, 86, 89, 90, 91, 98, 102, 104, 108, 110, 117, 121, 123, 127, 129]

  createGame()

  // TODO Goalkeepers
  // TODO Animations (particularly for the meeting-in-the-middle problem)
  // TODO Audio
  // TODO Level difficulty progression (speed/bomb frequency/goalkeepers being perm vs. destroyable)
  // TODO Adding goals
  // TODO Consider refactoring to make use of Classes for Projectiles (=> Bomb/=> Missile), Ship, and User

  function startGame() {
    startBtn.disabled = true
    moveShip()
    startBombing()
    collisionChecker()
    document.addEventListener('keydown', userAction)
    currLives.innerText = '❤️'.repeat(lives)
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

    shipInterval = setTimeout(moveShip, 750)




    removeShip()
    // To determine if any of the array values appear in the rightmost column
    let rightEdge = shipArray.filter(ship => ship % width === width - 1)
    // To determine if any of the array values appear in the leftmost column
    let leftEdge = shipArray.filter(ship => ship % width === 0)

    if (leftToRight) {
      if (rightEdge.length < 1) {
        shipArray = shipArray.map(ship => ship = ship + 1)
      } else {
        shipArray = shipArray.map(ship => ship = ship + width + 1)
        leftToRight = false
        // To determine if any of the array values appear in the user rows
        let lowestRow = shipArray.filter(ship => ship >= (cellCount - (2 * width)))
        console.log(lowestRow)

        if (lowestRow.length > 0) {
          // clearInterval(shipInterval)
          endGameDefeat()
          // return
        }
      }
    }
    if (!leftToRight) {
      if (leftEdge.length < 1) {
        shipArray = shipArray.map(ship => ship = ship - 1)
      } else {
        shipArray = shipArray.map(ship => ship = ship + width)
        leftToRight = true
        // To determine if any of the array values appear in the user rows
        let lowestRow = shipArray.filter(ship => ship >= (cellCount - (2 * width)))
        console.log(lowestRow)
        if (lowestRow.length > 0) {
          // clearInterval(shipInterval)
          endGameDefeat()
          // return
        }
      }
    }
    addShip()

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

  function startBombing() {
    bombDropInterval = setInterval(() => {
      if (shipArray.length > 0) {
        dropBomb()
      }
    }, 1500)
  }

  function dropBomb() {
    let realisticBombers = []
    let shipColumns = {}
    shipArray.forEach(ship => {
      for (let i = 0; i < width; i++) {
        if (ship % width === i) {
          shipColumns[`Column${i}`] = []
          shipColumns[`Column${i}`].push(ship)
        }
      }
    })
    for (const key in shipColumns) {
      let tempArr = shipColumns[key]
      realisticBombers.push(tempArr[0])
    }
    let bombPosition = realisticBombers[Math.floor(Math.random() * realisticBombers.length)] + width
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
    cells[bombPosition].removeAttribute('bomb-interval-id')
  }

  function fireMissile() {
    if (missileActive) {
      console.log('missile blocked')
      return
    }
    missileActive = true
    console.log('missile okay')
    setTimeout(() => {
      missileActive = false
    }, 300)
    // Initially had the below as a global variable, but this was clashing with each 'fire'
    let missilePosition = userCurrentPosition - width
    // Initially had the below as a global variable, but this was clashing with each 'fire'
    const missileInterval = setInterval(() => {
      if (missilePosition || missilePosition === 0) {
        removeMissile(missilePosition)
      }
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
    cells[missilePosition].removeAttribute('missile-interval-id')
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

    collisionInterval = setInterval(() => {

      const allCells = document.querySelectorAll('.cell')

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
          cell.classList.remove('ship')
          clearInterval(cell.getAttribute('missile-interval-id'))
          removeMissile(getRemoveIndex)
          score += 100
          currScore.innerText = score
          if (shipArray.length === 0) {
            endGameVictory()
          }
        }
        // Missile and bombs clashing mid-flight — same cell
        if ((cell.classList.contains('missile')) && (cell.classList.contains('bomb'))) {
          // Find the cell where the collision occurred
          let getRemoveIndex = cell.getAttribute('data-index')
          clearInterval(cell.getAttribute('missile-interval-id'))
          clearInterval(cell.getAttribute('bomb-interval-id'))
          removeMissile(getRemoveIndex)
          removeBomb(getRemoveIndex)
          score += 50
          currScore.innerText = score
          console.log('first spot!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
        }
        // Missile and bombs clashing mid-flight — one cell apart
        if (currentCellDataIndex >= width) {
          if ((cell.classList.contains('missile')) && (aboveCell.classList.contains('bomb'))) {
            // Find the cell where the collision occurred
            let getRemoveIndex = cell.getAttribute('data-index')
            // ! Perhaps a timeout here to delay the impact?
            // ! Animation on middle cell
            clearInterval(cell.getAttribute('missile-interval-id'))
            clearInterval(aboveCell.getAttribute('bomb-interval-id'))
            removeMissile(getRemoveIndex)
            removeBomb(aboveCellDataIndex)
            score += 50
            currScore.innerText = score
            console.log('second spot!')
          }
        }
        // Bomb hit on user
        if ((cell.classList.contains('bomb')) && ((cell.classList.contains('modric-top')) || (cell.classList.contains('modric-bottom')))) {
          // Find the cell where the collision occurred
          let getRemoveIndex = cell.getAttribute('data-index')
          clearInterval(cell.getAttribute('bomb-interval-id'))
          removeBomb(getRemoveIndex)
          lives--
          currLives.innerText = lives ? '❤️'.repeat(lives) : '💔'
          if (lives === 0) {
            endGameDefeat()
          }
        }
      })
    }, 10)
  }

  function endGameDefeat() {
    console.log('Game over!')
    document.removeEventListener('keydown', userAction)
    // console.log(shipInterval)
    // console.log(bombDropInterval)
    clearTimeout(shipInterval)
    clearInterval(bombDropInterval)
    const allCells = document.querySelectorAll('.cell')
    allCells.forEach(cell => {
      if (cell.getAttribute('missile-interval-id')) {
        clearInterval(cell.getAttribute('missile-interval-id'))
      }
      if (cell.getAttribute('bomb-interval-id')) {
        clearInterval(cell.getAttribute('bomb-interval-id'))
      }
    })
  }

  function endGameVictory() {
    document.removeEventListener('keydown', userAction)
    // console.log(shipInterval)
    // console.log(bombDropInterval)
    clearTimeout(shipInterval)
    clearInterval(bombDropInterval)
    const allCells = document.querySelectorAll('.cell')
    allCells.forEach(cell => {
      if (cell.getAttribute('missile-interval-id')) {
        clearInterval(cell.getAttribute('missile-interval-id'))
      }
      if (cell.getAttribute('bomb-interval-id')) {
        clearInterval(cell.getAttribute('bomb-interval-id'))
      }
    })
    if (score > highscore) {
      highscore = console.log
      localStorage.setItem('highscore', score)
      highscore.innerText = localStorage.getItem('highscore')
    }

  }

  startBtn.addEventListener('click', startGame)

}

window.addEventListener('DOMContentLoaded', init)