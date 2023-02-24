function init() {

  const grid = document.querySelector('.grid')
  const gridWrapper = document.querySelector('.grid-wrapper')
  const startBtn = document.querySelector('.start-button')
  const audioBtn = document.querySelector('.audio-button')
  const currScore = document.querySelector('.score-value')
  const highScoreText = document.querySelector('.highscore-value')
  const currLives = document.querySelector('.current-lives')
  const goalFlash = document.querySelector('.goal-holder')
  const body = document.querySelector('body')
  const controlsAndScores = document.querySelector('.controls-and-scores')
  const game = document.querySelector('.game')

  const width = 19
  const height = 20
  const cellCount = width * height
  let cells = []
  let score = 0
  let highscore = localStorage.getItem('highscore')
  highScoreText.innerText = Number(highscore).toLocaleString()
  let lives = 5
  let bombDropInterval
  let shipInterval
  let collisionInterval
  const userStartingPosition = 370
  let userCurrentPosition = userStartingPosition
  let leftToRight = true
  let missileActive = false
  let shipArray = [22, 23, 24, 26, 28, 29, 30, 32, 33, 34, 41, 45, 47, 51, 53, 60, 61, 64, 66, 67, 70, 71, 72, 79, 83, 85, 89, 91, 98, 102, 104, 108, 110]
  let level = 1
  let listIntervals = []
  let apartScorer = false
  let overlapScorer = false
  let goalScored = false
  let shakeTimeout

  function startGame() {
    startSlider()
    startBtn.style.display = "none"
    startBtn.disabled = true
    createGame()
    if (level === 1) {
      // moveShip(1000)
      score = 0
      currScore.innerText = Number(score).toLocaleString()
      startBombing(1500)
    } else if (level === 2) {
      moveShip(750)
      startBombing(1250)
    } else if (level > 2) {
      moveShip(50)
      startBombing(75)
    }
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

  function moveShip(intTime) {
    shipInterval = setInterval(() => {
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
          let lowestRow = shipArray.filter(ship => ship > (cellCount - (2 * width)))
          if (lowestRow.length > 0) {
            endGameDefeat()
            return
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
          if (lowestRow.length > 0) {
            endGameDefeat()
            return
          }
        }
      }
      addShip()
      listIntervals.push(shipInterval)
    }, intTime)
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

  function startBombing(intTime) {
    bombDropInterval = setInterval(() => {
      if (shipArray.length > 0) {
        dropBomb()
      }
    }, intTime)
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
    console.log(shipColumns)
    for (const key in shipColumns) {
      let tempArr = shipColumns[key]
      realisticBombers.push(tempArr[0])
    }
    let bombPosition = realisticBombers[Math.floor(Math.random() * realisticBombers.length)]
    // addBomb(bombPosition)
    const bombMoveInterval = setInterval(() => {
      removeBomb(bombPosition)
      bombPosition += width
      if (bombPosition < cellCount) {
        addBomb(bombPosition, bombMoveInterval)
        listIntervals.push(bombMoveInterval)
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
      return
    }
    missileActive = true
    setTimeout(() => {
      missileActive = false
    }, 450)
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
        listIntervals.push(missileInterval)
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

  function shakeBody() {
    body.classList.add('shake')
    clearTimeout(shakeTimeout)
    shakeTimeout = setTimeout(() => {
      body.classList.remove('shake')
    }, 1500)
  }

  function goalAnimation() {
    if (!goalFlash.classList.contains('goal')) {
      goalFlash.classList.remove('goal')
      goalFlash.classList.add('goal')
      setTimeout(() => {
        goalFlash.classList.remove('goal')
      }, 3000)
    }
  }

  function collisionChecker() {
    collisionInterval = setInterval(() => {
      if (shipArray.length === 0) {
        endGameVictory()
        return
      }
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
          currScore.innerText = Number(score).toLocaleString()
          cell.classList.add('shipHit')
          setTimeout(() => {
            cell.classList.remove('shipHit')
          }, 1000)
        }
        // Missile and bombs clashing mid-flight — same cell
        if ((cell.classList.contains('missile')) && (cell.classList.contains('bomb')) && !overlapScorer) {
          overlapScorer = true
          // Find the cell where the collision occurred
          let getRemoveIndex = cell.getAttribute('data-index')
          clearInterval(cell.getAttribute('missile-interval-id'))
          clearInterval(cell.getAttribute('bomb-interval-id'))
          removeMissile(getRemoveIndex)
          cell.classList.add('bombHit')
          setTimeout(() => {
            removeBomb(getRemoveIndex)
            cell.classList.remove('bombHit')
            score += 50
            currScore.innerText = Number(score).toLocaleString()
            overlapScorer = false
          }, 190)
        }
        // Missile and bombs clashing mid-flight — one cell apart
        if (currentCellDataIndex >= width) {
          if ((cell.classList.contains('missile')) && (aboveCell.classList.contains('bomb')) && !apartScorer) {
            apartScorer = true
            // Find the cell where the collision occurred
            let getRemoveIndex = cell.getAttribute('data-index')
            clearInterval(cell.getAttribute('missile-interval-id'))
            clearInterval(aboveCell.getAttribute('bomb-interval-id'))
            setTimeout(() => {
              removeMissile(getRemoveIndex)
              aboveCell.classList.add('bombHit')
            }, 100)
            setTimeout(() => {
              removeBomb(getRemoveIndex - width)
              aboveCell.classList.remove('bombHit')
              score += 50
              currScore.innerText = Number(score).toLocaleString()
              apartScorer = false
            }, 290)
          }
        }
        // Bomb hit on user
        if ((cell.classList.contains('bomb')) && ((cell.classList.contains('modric-top')) || (cell.classList.contains('modric-bottom')))) {
          // Find the cell where the collision occurred
          let getRemoveIndex = cell.getAttribute('data-index')
          clearInterval(cell.getAttribute('bomb-interval-id'))
          removeBomb(getRemoveIndex)
          lives--
          shakeBody()
          currLives.innerText = lives ? '❤️'.repeat(lives) : '💔'
          if (lives === 0) {
            endGameDefeat()
            return
          }
        }
        if (cell.classList.contains('missile') && (currentCellDataIndex > 7 && currentCellDataIndex < 11) && !goalScored) {
          goalScored = true
          goalAnimation()
          score += 25
          currScore.innerText = Number(score).toLocaleString()
          setTimeout(() => {
            cell.classList.remove('missile')
            goalScored = false
          }, 150)
        }
      })
    }, 10)
  }

  function endGame() {
    document.removeEventListener('keydown', userAction)
    clearTimeout(shipInterval)
    clearInterval(bombDropInterval)
    clearInterval(collisionInterval)
    goalFlash.classList.remove('goal')
    body.classList.remove('shake')
    const allCells = document.querySelectorAll('.cell')
    allCells.forEach(cell => {
      cell.remove()
    })
    startBtn.disabled = false
    cells = []
    lives = 5
    leftToRight = true
    missileActive = false
    shipArray = [22, 23, 24, 26, 28, 29, 30, 32, 33, 34, 41, 45, 47, 51, 53, 60, 61, 64, 66, 67, 70, 71, 72, 79, 83, 85, 89, 91, 98, 102, 104, 108, 110]
    userCurrentPosition = userStartingPosition
    // Brute-force way of clearing all intervals (assuming less than 999 have been created)
    for (let i = 0; i < 999; i++) {
      clearInterval(i)
    }
    listIntervals = []
  }

  function playLuka() {
    gridWrapper.classList.add('modric-gif')
    setTimeout(() => {
      gridWrapper.classList.remove('modric-gif')
      startBtn.innerText = 'Next!'
      startBtn.style.display = "block"
      endSlider()
    }, 4500)
  }

  function playVAR() {
    gridWrapper.classList.add('var-gif')
    setTimeout(() => {
      gridWrapper.classList.remove('var-gif')
      startBtn.innerText = 'Start!'
      startBtn.style.width = '100px'
      startBtn.style.display = 'block'
      endSlider()
    }, 3800)
    level = 1
  }

  function startSlider() {
    setTimeout(() => {
      controlsAndScores.classList.add('slide-out-controls')
      controlsAndScores.classList.remove('slide-in-controls')
    }, 10) 
    setTimeout(() => {
      game.classList.add('slide-out-game')
      game.classList.remove('slide-in-game')
    }, 10)
  }

  function endSlider() {
    setTimeout(() => {
      controlsAndScores.classList.add('slide-in-controls')
      controlsAndScores.classList.remove('slide-out-controls')
    }, 10) 
    setTimeout(() => {
      game.classList.add('slide-in-game')
      game.classList.remove('slide-out-game')
    }, 10)
  }

  function endGameDefeat() {
    score = 0
    endGame()
    playVAR()
  }

  function endGameVictory() {
    if (score > highscore) {
      localStorage.setItem('highscore', score)
      highScoreText.innerText = Number(score).toLocaleString()
    }
    endGame()
    level++
    playLuka()
  }

  function toggleMute() {
    if (audioBtn.classList.contains('audio-button-mute')) {
      audioBtn.classList.remove('audio-button-mute')
      audioBtn.classList.add('audio-button-playing')
    } else {
      audioBtn.classList.remove('audio-button-playing')
      audioBtn.classList.add('audio-button-mute')
    }
  }

  startBtn.addEventListener('click', startGame)
  audioBtn.addEventListener('click', toggleMute)

}

window.addEventListener('DOMContentLoaded', init)