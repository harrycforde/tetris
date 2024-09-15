const canvas = document.getElementById('tetrisCanvas')
const context = canvas.getContext('2d')
const scoree = document.getElementById('score')

const scale = 40
const columns = canvas.width / scale
const rows = canvas.height / scale
const emojis = [
  '💩',
  '🤪',
  '😂',
  '🤦‍♂️',
  '🤨',
  '🗑️',
  '🫠',
  '🫥',
  '💀',
  '🫦',
  '🌈',
  '🌚',
  '🔫',
  '🫡',
  '☹️',
  '☺️',
  '🥶',
  '🥵',
  '🖕',
  '💅',
  '🫃',
  '👨‍❤️‍👨',
  '🦀',
]

let board
let currentPiece
let score = 0
let lastDropTime = 0
let dropInterval = 1000
let isGamePlaying = false
let isGameOver = false
let soundVolume = 1

function playSound(sound = 'sawtooth', frequency = 400) {
  const audioContext = new AudioContext()
  const oscillator = audioContext.createOscillator()
  const gain = audioContext.createGain()

  oscillator.type = sound
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
  oscillator.frequency.linearRampToValueAtTime(500, audioContext.currentTime + 0.05)

  gain.gain.setValueAtTime(soundVolume, audioContext.currentTime)
  gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.1)

  oscillator.connect(gain)
  gain.connect(audioContext.destination)

  oscillator.start()
  oscillator.stop(audioContext.currentTime + 0.1)
}

function createPiece() {
  const color = Math.floor(Math.random() * emojis.length) + 1

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
    if (row.every(value => value)) {
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
    context.fillStyle = '#0e0e0e'
    context.fillRect(canvas.width / 2 - 160, canvas.height / 2 - 40, 320, 120)
    context.fillStyle = 'white'
    context.font = '30px monospace'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText('game over 😭', canvas.width / 2, canvas.height / 2)
    context.font = '20px monospace'
    context.fillText('press enter to restart', canvas.width / 2, canvas.height / 2 + 40)
  }

  if (!isGamePlaying || isGameOver) return

  context.clearRect(0, 0, canvas.width, canvas.height)

  if (timestamp - lastDropTime > dropInterval) {
    if (!downKeyPressed) movePiece('down')
    lastDropTime = timestamp
    dropInterval -= 1
  }

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      if (board[y][x]) {
        context.font = '40px monospace'
        context.fillText(emojis[board[y][x] - 1], x * scale + scale / 2, y * scale + 2 + scale / 2)
      }
    }
  }

  currentPiece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (!value) return
      const drawX = currentPiece.x + x
      const drawY = currentPiece.y + y
      context.font = '40px monospace'
      context.fillText(emojis[value - 1], drawX * scale + scale / 2, drawY * scale + 2 + scale / 2)
    })
  })

  requestAnimationFrame(gameLoop)
}

function startGame() {
  isGamePlaying = true
  isGameOver = false
  score = 0
  lastDropTime = 0
  dropInterval = 1000
  board = Array.from({ length: rows }, () => Array(columns).fill(0))
  currentPiece = createPiece()
  this.innerHTML = 'restart'
  requestAnimationFrame(gameLoop)
}

function toggleMute() {
  soundVolume = soundVolume ? 0 : 1
}

document.addEventListener('keydown', function (event) {
  if (event.key === 'Enter' && !isGamePlaying) {
    startGame()
    return
  }

  if (!isGamePlaying || isGameOver) return

  if (event.key === 'ArrowLeft' || event.key === 'h') {
    movePiece('left')
  } else if (event.key === 'ArrowRight' || event.key === 'l') {
    movePiece('right')
  } else if (event.key === 'ArrowDown' || event.key === 'k') {
    if (!downKeyPressed) {
      downKeyPressed = true
      movePiece('down')
      downKeyInterval = setInterval(() => {
        movePiece('down')
      }, 100)
    }
    movePiece('down')
  } else if (event.key === 'ArrowUp' || event.key === 'j') {
    rotatePiece()
  } else if (event.key === ' ') {
    movePiece('slam')
  } else if (event.key === 'm') {
    toggleMute()
  }
})

let downKeyPressed = false
let downKeyInterval = null

document.addEventListener('DOMContentLoaded', function () {
  context.fillStyle = 'white'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.font = '30px monospace'
  context.fillText('trash tetris 🚮', canvas.width / 2, canvas.height / 2 - 50)
  context.font = '20px monospace'
  context.fillText('press enter to start', canvas.width / 2, canvas.height / 2)
  context.font = '20px monospace'
  context.fillText('m to mute', canvas.width / 2, canvas.height / 2 + 35)
})

document.addEventListener('keyup', function (event) {
  if (event.key === 'ArrowDown' || event.key === 'k') {
    downKeyPressed = false
    if (downKeyInterval) {
      clearInterval(downKeyInterval)
      downKeyInterval = null
    }
  }
})
