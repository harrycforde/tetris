let isGamePlaying = false
const canvas = document.getElementById('tetrisCanvas')
const context = canvas.getContext('2d')
const scale = 40
const columns = canvas.width / scale
const rows = canvas.height / scale
const dropInterval = 1000
const colors = ['blue', 'red', 'green', 'yellow']
let lastDropTime = 0
let board
let currentPiece

function createBoard(columns, rows) {
	return Array.from({ length: rows}, () => Array(columns).fill(0))
}

function createPiece() {
	const color = Math.floor(Math.random() * colors.length) + 1

	const pieces = [
		[
			[color, color],
			[color, color]
		],
		[
			[color, 0, 0, 0],
			[color, 0, 0, 0],
			[color, 0, 0, 0],
			[color, 0, 0, 0]
		],
		[
			[color, 0, 0],
			[color, 0, 0],
			[color, color, 0],
		],
		[
			[0, 0, color],
			[0, 0, color],
			[0, color, color],
		]
	]

	return {
		shape: pieces[Math.floor(Math.random() * pieces.length)],
		x: Math.floor(columns / 2) - 1,
		y: 0,
	}
}

function drawBoard() {
	for (let y = 0; y < rows; y++) {
		for (let x = 0; x < columns; x++) {
			if (board[y][x]) {
				context.fillStyle = colors[board[y][x] - 1]
				context.fillRect(x * scale, y * scale, scale, scale)
				context.strokeStyle = 'black'
				context.strokeRect(x * scale, y * scale, scale, scale)
			}
		}
	}
}

function drawBlock(x, y, value) {
	context.fillStyle = colors[value - 1]
	context.fillRect(x * scale, y * scale, scale, scale)
	context.strokeStyle = 'black'
	context.strokeRect(x * scale, y * scale, scale, scale)
}

function drawPiece() {
	currentPiece.shape.forEach((row, y) => {
		row.forEach((value, x) => {
			if (value) {
				drawBlock(currentPiece.x + x, currentPiece.y + y, value)
			}
		})
	})
}

function mergePiece() {
	currentPiece.shape.forEach((row, y) => {
		row.forEach((value, x) => {
			if (value) {
				board[y + currentPiece.y][x + currentPiece.x] = value
			}
		})
	})

	board.forEach((row, y) => {
		if (row.every(value => value === row[0])) {
			board.splice(y, 1)
			board.unshift(Array(columns).fill(0))
		}
	})
}

function hasCollision() {
	return currentPiece.shape.some((row, y) => {
		return row.some((value, x) => {
			if (value) {
				let boardY = y + currentPiece.y
				let boardX = x + currentPiece.x
				return boardY >= rows || boardX < 0 || boardX >= columns || (boardY >= 0 && board[boardY][boardX])
			}
			return false
		})
	})
}

function movePieceLeft() {
	currentPiece.x--
	if (hasCollision()) {
		currentPiece.x++
		mergePiece()
		currentPiece = createPiece()
	}
}

function movePieceRight() {
	currentPiece.x++
	if (hasCollision()) {
		currentPiece.x--
		mergePiece()
		currentPiece = createPiece()
	}
}

function movePieceDown() {
	currentPiece.y++
	if (hasCollision()) {
		currentPiece.y--
		mergePiece()
		currentPiece = createPiece()
	}
}

function rotatePiece() {
	const shapeRows = currentPiece.shape.length
	const shapeColumns = currentPiece.shape[0].length
	const rotated = Array(shapeColumns).fill().map(() => Array(shapeRows).fill(0))
	
	for (let r = 0; r < shapeRows; r++) {
		for (let c = 0; c < shapeColumns; c++) {
			rotated[c][shapeColumns - 1 - r] = currentPiece.shape[r][c]
		}
	}
	
	currentPiece.shape = rotated
}

function updateGame(timestamp) {
	if (timestamp - lastDropTime > dropInterval) {
		movePieceDown()
		lastDropTime = timestamp
	}
}

function gameLoop(timestamp) {
	context.clearRect(0, 0, canvas.width, canvas.height)
	// updateGame(timestamp)
	drawBoard()
	drawPiece()

	if (isGamePlaying) {
		requestAnimationFrame(gameLoop)
	} 
}

function startGame() {
	board = createBoard(columns, rows)
	currentPiece = createPiece()
	isGamePlaying = true
	requestAnimationFrame(gameLoop)
	this.innerHTML = 'reset'
	window.getSelection().removeAllRanges()
}

document.getElementById('startButton').addEventListener('click', startGame)

document.addEventListener('keydown', function(event) {
	if (event.key === 'ArrowLeft' || event.key === 'h') {
		movePieceLeft()
	} else if (event.key === 'ArrowRight' || event.key === 'l') {
		movePieceRight()
	} else if (event.key === 'ArrowDown' || event.key === 'k') {
		movePieceDown()
	} else if (event.key === ' ' || event.key === 'j') {
		rotatePiece()
	} else if (event.key === 'Enter') {
		startGame()
	}
})
