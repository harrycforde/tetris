const canvas = document.getElementById('tetrisCanvas')
const context = canvas.getContext('2d')
const scale = 20
const columns = canvas.width / scale
const rows = canvas.height / scale
const dropInterval = 1000
let lastDropTime = 0

function createBoard(columns, rows) {
	return Array.from({ length: rows}, () => Array(columns).fill(0))
}

let board = createBoard(columns, rows)

const colors = ['blue', 'red', 'green', 'yellow']



function createPiece() {
	const color = Math.floor(Math.random() * colors.length) + 1

	const pieces = [
		[
			[color, color],
			[color, color]
		],
		[
			[color],
			[color],
			[color],
			[color]
		]
	]

	return {
		shape: pieces[Math.floor(Math.random() * pieces.length)],
		x: Math.floor(columns / 2) - 1,
		y: 0,
	}
}

let currentPiece = createPiece()

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
		row.forEach((value, x ) => {
			if (value) {
				board[y + currentPiece.y][x + currentPiece.x] = value
			}
		})
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

function movePieceDown() {
	currentPiece.y++
	if (hasCollision()) {
		currentPiece.y--
		mergePiece()
		currentPiece = createPiece()
	}
}

function updateGame(timestamp) {
	if (timestamp - lastDropTime > dropInterval) {
		movePieceDown()
		lastDropTime = timestamp
	}
}

function gameLoop(timestamp) {
	context.clearRect(0, 0, canvas.width, canvas.height)
	updateGame(timestamp)
	drawBoard()
	drawPiece()
	requestAnimationFrame(gameLoop)
}

requestAnimationFrame(gameLoop)

document.addEventListener('keydown', function(event) {
	if (event.key === 'ArrowLeft') {
		currentPiece.x -= 1
	} else if (event.key === 'ArrowRight') {
		currentPiece.x += 1
	} else if (event.key === 'ArrowDown') {
		currentPiece.y += 1
	}
})
