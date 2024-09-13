const canvas = document.getElementById('tetrisCanvas')
const context = canvas.getContext('2d')
const scoree = document.getElementById('score')

const scale = 40
const columns = canvas.width / scale
const rows = canvas.height / scale
const dropInterval = 1000
const colors = ['blue', 'red', 'green', 'yellow', 'purple']

let board
let currentPiece
let lastDropTime = 0
let isGamePlaying = false
let isGameOver = false
let score = 0

function createPiece() {
  const color = Math.floor(Math.random() * colors.length) + 1

  const pieces = [
    [
      [color, color],
      [color, color],
    ],
    [[color], [color], [color], [color]],
    [
      [color, 0],
      [color, 0],
      [color, color],
    ],
    [
      [color, color, color],
      [0, 0, color],
    ],
    [
      [0, color],
      [0, color],
      [color, color],
    ],
  ]

  return {
    shape: pieces[Math.floor(Math.random() * pieces.length)],
    x: Math.floor(columns / 2) - 1,
    y: 0,
  }
}

function checkCollision(offsetX = 0, offsetY = 0) {
  return currentPiece.shape.some((row, y) => {
    return row.some((value, x) => {
      if (value !== 0) {
        const newX = currentPiece.x + x + offsetX
        const newY = currentPiece.y + y + offsetY

        if (newX < 0 || newX >= columns || newY >= rows) {
          return true
        }

        if (newY >= 0 && board[newY][newX] !== 0) {
          return true
        }
      }
      return false
    })
  })
}

function movePiece(direction) {
  if (direction === 'left') {
    if (!checkCollision(-1, 0)) currentPiece.x--
    return
  }

  if (direction === 'right') {
    if (!checkCollision(1, 0)) currentPiece.x++
    return
  }

  currentPiece.y++

  const hasCollision = currentPiece.shape.some((row, y) => {
    return row.some((value, x) => {
      if (value) {
        let boardY = y + currentPiece.y
        let boardX = x + currentPiece.x
        return (
          boardY >= rows ||
          boardX < 0 ||
          boardX >= columns ||
          (boardY >= 0 && board[boardY][boardX])
        )
      }
      return false
    })
  })

  if (!hasCollision) return

  currentPiece.y--

  let sound = 'sawtooth'
  let frequency = 400

  currentPiece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (!value) return
      board[y + currentPiece.y][x + currentPiece.x] = value
    })
  })

  board.forEach((row, y) => {
    if (row.every(value => value === row[0] && value !== 0)) {
      board.splice(y, 1)
      board.unshift(Array(columns).fill(0))
      score++
      scoree.innerHTML = score
      sound = 'square'
      frequency = 500
    }
  })

  playSound(sound, frequency)
  currentPiece = createPiece()
}

function rotatePiece() {
  const oldShape = currentPiece.shape

  const transposedShape = currentPiece.shape[0].map((_, colIndex) => {
    return currentPiece.shape.map(row => row[colIndex])
  })

  const rotatedShape = transposedShape.map(row => row.reverse())
  currentPiece.shape = rotatedShape

  if (currentPiece.x + currentPiece.shape[0].length > columns) {
    currentPiece.x = columns - currentPiece.shape[0].length
  }

  if (checkCollision(0, 0)) {
    currentPiece.shape = oldShape
  }
}

function slamPiece() {
  while (!checkCollision(0, 1)) {
    currentPiece.y++
  }
  movePiece('down')
}

function gameLoop(timestamp) {
  if (checkCollision(0, 0)) {
    isGameOver = true
    isGamePlaying = false
    alert('Game Over')
    document.getElementById('startButton').innerHTML = 'Start'
  }

  if (!isGamePlaying || isGameOver) return

  context.clearRect(0, 0, canvas.width, canvas.height)

  if (timestamp - lastDropTime > dropInterval) {
    movePiece('down')
    lastDropTime = timestamp
  }

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      if (board[y][x]) {
        context.fillStyle = colors[board[y][x] - 1]
        context.fillRect(x * scale, y * scale, scale, scale)
        context.strokeStyle = '#fefefe'
        context.strokeRect(x * scale, y * scale, scale, scale)
      }
    }
  }

  currentPiece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (!value) return

      const drawX = currentPiece.x + x
      const drawY = currentPiece.y + y
      context.fillStyle = colors[value - 1]
      // context.fillStyle = 'pink'
      context.fillRect(drawX * scale, drawY * scale, scale, scale)
      context.strokeStyle = '#fefefe'
      context.strokeRect(drawX * scale, drawY * scale, scale, scale)
    })
  })

  requestAnimationFrame(gameLoop)
}

function resetGame() {
  this.blur()

  isGameOver = false
  score = 0
  lastDropTime = 0
  board = Array.from({ length: rows }, () => Array(columns).fill(0))
  currentPiece = createPiece()
  requestAnimationFrame(gameLoop)
}

function startGame() {
  this.blur()

  if (isGamePlaying) {
    this.innerHTML = 'start'
    isGamePlaying = false
    return
  }

  isGamePlaying = true
  this.innerHTML = 'stop'

  if (!board || isGameOver) resetGame()

  requestAnimationFrame(gameLoop)
}

document.getElementById('startButton').addEventListener('click', startGame)
document.getElementById('resetButton').addEventListener('click', resetGame)

document.addEventListener('keydown', function (event) {
  if (event.key === 'ArrowLeft' || event.key === 'h') {
    movePiece('left')
  } else if (event.key === 'ArrowRight' || event.key === 'l') {
    movePiece('right')
  } else if (event.key === 'ArrowDown' || event.key === 'k') {
    movePiece('down')
  } else if (event.key === 'ArrowUp' || event.key === 'j') {
    rotatePiece()
  } else if (event.key === ' ') {
    slamPiece()
  } else if (event.key === 'Enter') {
    startGame()
  } else if (event.key === 'r') {
    resetGame()
  }
})

function playSound(sound = 'sawtooth', frequency = 400) {
  const audioContext = new AudioContext()
  const oscillator = audioContext.createOscillator()
  oscillator.type = sound
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
  oscillator.connect(audioContext.destination)

  oscillator.start()
  oscillator.stop(audioContext.currentTime + 0.1)
}
