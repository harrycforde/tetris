const canvas = document.getElementById('tetrisCanvas')
const context = canvas.getContext('2d')
const scoree = document.getElementById('score')

const scale = 40
const columns = canvas.width / scale
const rows = canvas.height / scale
const colors = ['#0000ff', '#a10000', 'green', '#e0e000', '#97009f']
const lightColors = ['#0062ff', '#ff0000', '#00e022', '#ffff00', '#ee00fa']

let board
let currentPiece
let score = 0
let lastDropTime = 0
let dropInterval = 1000
let isGamePlaying = false
let isGameOver = false

function playSound(sound = 'sawtooth', frequency = 400) {
  const audioContext = new AudioContext()
  const oscillator = audioContext.createOscillator()
  const gain = audioContext.createGain()

  oscillator.type = sound
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
  oscillator.frequency.linearRampToValueAtTime(500, audioContext.currentTime + 0.05)

  gain.gain.setValueAtTime(1, audioContext.currentTime)
  gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.1)

  oscillator.connect(gain)
  gain.connect(audioContext.destination)

  oscillator.start()
  oscillator.stop(audioContext.currentTime + 0.1)
}

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
    [
      [0, color, color],
      [color, color, 0],
    ],
    [
      [color, color, 0],
      [0, color, color],
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

  let sound = 'sawtooth'
  let frequency = 200

  if (direction === 'slam') {
    frequency = 100
    while (!checkCollision(0, 1)) {
      currentPiece.y++
    }
  }

  currentPiece.y++

  if (!checkCollision()) return

  currentPiece.y--

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
      frequency = 700
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

function gameLoop(timestamp) {
  if (checkCollision(0, 0)) {
    isGameOver = true
    isGamePlaying = false
    playSound('sine', 20)
    context.fillStyle = 'white'
    context.font = '30px monospace'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText('game over 🫡', canvas.width / 2, canvas.height / 2)
    document.getElementById('startButton').innerHTML = 'start'
  }

  if (!isGamePlaying || isGameOver) return

  context.clearRect(0, 0, canvas.width, canvas.height)

  if (timestamp - lastDropTime > dropInterval) {
    movePiece('down')
    lastDropTime = timestamp
    dropInterval -= 5
  }

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      if (board[y][x]) {
        context.fillStyle = colors[board[y][x] - 1]
        context.fillRect(x * scale, y * scale, scale, scale)
        context.strokeStyle = lightColors[board[y][x] - 1]
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
      context.fillRect(drawX * scale, drawY * scale, scale, scale)
      context.strokeStyle = lightColors[value - 1]
      context.strokeRect(drawX * scale, drawY * scale, scale, scale)
    })
  })

  console.log(dropInterval)

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
  if (event.key === 'Enter') {
    startGame()
  }

  if (!isGamePlaying || isGameOver) return

  if (event.key === 'ArrowLeft' || event.key === 'h') {
    movePiece('left')
  } else if (event.key === 'ArrowRight' || event.key === 'l') {
    movePiece('right')
  } else if (event.key === 'ArrowDown' || event.key === 'k') {
    movePiece('down')
  } else if (event.key === 'ArrowUp' || event.key === 'j') {
    rotatePiece()
  } else if (event.key === ' ') {
    movePiece('slam')
  } else if (event.key === 'r') {
    resetGame()
  }
})
