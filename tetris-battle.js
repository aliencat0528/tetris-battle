// 俄罗斯方块形状定义
const SHAPES = {
    I: [
        [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]],
        [[0,0,1,0], [0,0,1,0], [0,0,1,0], [0,0,1,0]]
    ],
    J: [
        [[1,0,0], [1,1,1], [0,0,0]],
        [[0,1,1], [0,1,0], [0,1,0]],
        [[0,0,0], [1,1,1], [0,0,1]],
        [[0,1,0], [0,1,0], [1,1,0]]
    ],
    L: [
        [[0,0,1], [1,1,1], [0,0,0]],
        [[0,1,0], [0,1,0], [0,1,1]],
        [[0,0,0], [1,1,1], [1,0,0]],
        [[1,1,0], [0,1,0], [0,1,0]]
    ],
    O: [
        [[1,1], [1,1]]
    ],
    S: [
        [[0,1,1], [1,1,0], [0,0,0]],
        [[0,1,0], [0,1,1], [0,0,1]]
    ],
    T: [
        [[0,1,0], [1,1,1], [0,0,0]],
        [[0,1,0], [0,1,1], [0,1,0]],
        [[0,0,0], [1,1,1], [0,1,0]],
        [[0,1,0], [1,1,0], [0,1,0]]
    ],
    Z: [
        [[1,1,0], [0,1,1], [0,0,0]],
        [[0,0,1], [0,1,1], [0,1,0]]
    ]
};

const COLORS = {
    I: '#00f0f0',
    J: '#0000f0',
    L: '#f0a000',
    O: '#f0f000',
    S: '#00f000',
    T: '#a000f0',
    Z: '#f00000',
    garbage: '#808080'
};

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 24;

class TetrisGame {
    constructor(canvasId, nextCanvasId, playerId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById(nextCanvasId);
        this.nextCtx = this.nextCanvas.getContext('2d');
        this.playerId = playerId;

        this.board = this.createBoard();
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.currentPiece = null;
        this.nextPiece = null;
        this.gameOver = false;
        this.paused = false;

        this.dropCounter = 0;
        this.dropInterval = 1000;
        this.lastTime = 0;

        this.opponent = null;
    }

    createBoard() {
        return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    }

    setOpponent(opponent) {
        this.opponent = opponent;
    }

    createPiece() {
        const shapes = Object.keys(SHAPES);
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        const rotations = SHAPES[shape];
        return {
            shape: shape,
            rotation: 0,
            matrix: rotations[0],
            x: Math.floor(COLS / 2) - Math.floor(rotations[0][0].length / 2),
            y: 0,
            color: COLORS[shape]
        };
    }

    rotate() {
        const rotations = SHAPES[this.currentPiece.shape];
        const nextRotation = (this.currentPiece.rotation + 1) % rotations.length;
        const nextMatrix = rotations[nextRotation];

        if (!this.collides(this.currentPiece.x, this.currentPiece.y, nextMatrix)) {
            this.currentPiece.rotation = nextRotation;
            this.currentPiece.matrix = nextMatrix;
        }
    }

    move(dir) {
        this.currentPiece.x += dir;
        if (this.collides(this.currentPiece.x, this.currentPiece.y, this.currentPiece.matrix)) {
            this.currentPiece.x -= dir;
        }
    }

    drop() {
        this.currentPiece.y++;
        if (this.collides(this.currentPiece.x, this.currentPiece.y, this.currentPiece.matrix)) {
            this.currentPiece.y--;
            this.merge();
            this.clearLines();
            this.spawnPiece();
        }
        this.dropCounter = 0;
    }

    hardDrop() {
        while (!this.collides(this.currentPiece.x, this.currentPiece.y + 1, this.currentPiece.matrix)) {
            this.currentPiece.y++;
            this.score += 2;
        }
        this.merge();
        this.clearLines();
        this.spawnPiece();
    }

    collides(x, y, matrix) {
        for (let row = 0; row < matrix.length; row++) {
            for (let col = 0; col < matrix[row].length; col++) {
                if (matrix[row][col] && (
                    x + col < 0 ||
                    x + col >= COLS ||
                    y + row >= ROWS ||
                    (y + row >= 0 && this.board[y + row][x + col])
                )) {
                    return true;
                }
            }
        }
        return false;
    }

    merge() {
        for (let row = 0; row < this.currentPiece.matrix.length; row++) {
            for (let col = 0; col < this.currentPiece.matrix[row].length; col++) {
                if (this.currentPiece.matrix[row][col]) {
                    const boardRow = this.currentPiece.y + row;
                    const boardCol = this.currentPiece.x + col;
                    if (boardRow >= 0 && boardRow < ROWS && boardCol >= 0 && boardCol < COLS) {
                        this.board[boardRow][boardCol] = this.currentPiece.color;
                    }
                }
            }
        }
    }

    clearLines() {
        let linesCleared = 0;

        for (let row = ROWS - 1; row >= 0; row--) {
            if (this.board[row].every(cell => cell !== 0)) {
                this.board.splice(row, 1);
                this.board.unshift(Array(COLS).fill(0));
                linesCleared++;
                row++;
            }
        }

        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.updateScore(linesCleared);
            this.updateLevel();

            // 攻击系统：消除多行时向对手发送垃圾行
            if (linesCleared >= 2 && this.opponent) {
                this.opponent.receiveAttack(linesCleared - 1);
            }
        }
    }

    receiveAttack(lines) {
        // 接收攻击：在底部添加垃圾行
        for (let i = 0; i < lines; i++) {
            this.board.shift();
            const garbageLine = Array(COLS).fill(COLORS.garbage);
            const holePosition = Math.floor(Math.random() * COLS);
            garbageLine[holePosition] = 0;
            this.board.push(garbageLine);
        }
    }

    updateScore(linesCleared) {
        const points = [0, 40, 100, 300, 1200];
        this.score += points[linesCleared] * this.level;
    }

    updateLevel() {
        const newLevel = Math.floor(this.lines / 10) + 1;
        if (newLevel !== this.level) {
            this.level = newLevel;
            this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
        }
    }

    spawnPiece() {
        if (!this.nextPiece) {
            this.nextPiece = this.createPiece();
        }

        this.currentPiece = this.nextPiece;
        this.nextPiece = this.createPiece();

        if (this.collides(this.currentPiece.x, this.currentPiece.y, this.currentPiece.matrix)) {
            this.gameOver = true;
        }
    }

    draw() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawBoard();
        if (this.currentPiece) {
            this.drawPiece(this.currentPiece, this.ctx);
            this.drawGhost();
        }
        this.drawNextPiece();
    }

    drawBoard() {
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                if (this.board[row][col]) {
                    this.drawBlock(col * BLOCK_SIZE, row * BLOCK_SIZE, this.board[row][col], this.ctx);
                }
            }
        }
    }

    drawPiece(piece, context) {
        for (let row = 0; row < piece.matrix.length; row++) {
            for (let col = 0; col < piece.matrix[row].length; col++) {
                if (piece.matrix[row][col]) {
                    this.drawBlock(
                        (piece.x + col) * BLOCK_SIZE,
                        (piece.y + row) * BLOCK_SIZE,
                        piece.color,
                        context
                    );
                }
            }
        }
    }

    drawGhost() {
        let ghostY = this.currentPiece.y;
        while (!this.collides(this.currentPiece.x, ghostY + 1, this.currentPiece.matrix)) {
            ghostY++;
        }

        for (let row = 0; row < this.currentPiece.matrix.length; row++) {
            for (let col = 0; col < this.currentPiece.matrix[row].length; col++) {
                if (this.currentPiece.matrix[row][col]) {
                    this.ctx.strokeStyle = this.currentPiece.color;
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeRect(
                        (this.currentPiece.x + col) * BLOCK_SIZE + 1,
                        (ghostY + row) * BLOCK_SIZE + 1,
                        BLOCK_SIZE - 2,
                        BLOCK_SIZE - 2
                    );
                }
            }
        }
    }

    drawBlock(x, y, color, context) {
        context.fillStyle = color;
        context.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
        context.strokeStyle = '#000';
        context.lineWidth = 1;
        context.strokeRect(x, y, BLOCK_SIZE, BLOCK_SIZE);

        context.fillStyle = 'rgba(255, 255, 255, 0.3)';
        context.fillRect(x + 1, y + 1, BLOCK_SIZE / 2, BLOCK_SIZE / 2);
    }

    drawNextPiece() {
        this.nextCtx.fillStyle = '#000';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);

        if (this.nextPiece) {
            const size = 16;
            const offsetX = (this.nextCanvas.width - this.nextPiece.matrix[0].length * size) / 2;
            const offsetY = (this.nextCanvas.height - this.nextPiece.matrix.length * size) / 2;

            for (let row = 0; row < this.nextPiece.matrix.length; row++) {
                for (let col = 0; col < this.nextPiece.matrix[row].length; col++) {
                    if (this.nextPiece.matrix[row][col]) {
                        this.nextCtx.fillStyle = this.nextPiece.color;
                        this.nextCtx.fillRect(
                            offsetX + col * size,
                            offsetY + row * size,
                            size,
                            size
                        );
                        this.nextCtx.strokeStyle = '#000';
                        this.nextCtx.strokeRect(
                            offsetX + col * size,
                            offsetY + row * size,
                            size,
                            size
                        );
                    }
                }
            }
        }
    }

    update(deltaTime) {
        if (this.gameOver || this.paused) return;

        this.dropCounter += deltaTime;
        if (this.dropCounter > this.dropInterval) {
            this.drop();
        }
    }

    updateUI() {
        document.getElementById(`score${this.playerId}`).textContent = this.score;
        document.getElementById(`level${this.playerId}`).textContent = this.level;
        document.getElementById(`lines${this.playerId}`).textContent = this.lines;
    }

    reset() {
        this.board = this.createBoard();
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameOver = false;
        this.paused = false;
        this.dropCounter = 0;
        this.dropInterval = 1000;
        this.currentPiece = null;
        this.nextPiece = null;
        this.spawnPiece();
        this.updateUI();
    }
}

// 游戏实例
let game1, game2;
let animationId;
let gameStarted = false;
let gamePaused = false;

function init() {
    game1 = new TetrisGame('canvas1', 'next1', 1);
    game2 = new TetrisGame('canvas2', 'next2', 2);
    game1.setOpponent(game2);
    game2.setOpponent(game1);
}

function startGame() {
    if (!gameStarted) {
        gameStarted = true;
        game1.reset();
        game2.reset();
        document.getElementById('gameOverOverlay').style.display = 'none';
        gameLoop(0);
    }
}

function pauseGame() {
    if (!gameStarted) return;

    gamePaused = !gamePaused;
    game1.paused = gamePaused;
    game2.paused = gamePaused;

    if (!gamePaused && (game1.gameOver || game2.gameOver)) {
        return;
    }
}

function resetGame() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    gameStarted = false;
    gamePaused = false;
    document.getElementById('gameOverOverlay').style.display = 'none';
    init();
    startGame();
}

function gameLoop(time) {
    if (!gameStarted) return;

    const deltaTime = time - game1.lastTime;
    game1.lastTime = time;
    game2.lastTime = time;

    game1.update(deltaTime);
    game2.update(deltaTime);

    game1.draw();
    game2.draw();

    game1.updateUI();
    game2.updateUI();

    if (game1.gameOver || game2.gameOver) {
        handleGameOver();
        return;
    }

    animationId = requestAnimationFrame(gameLoop);
}

function handleGameOver() {
    gameStarted = false;
    const overlay = document.getElementById('gameOverOverlay');
    const winnerText = document.getElementById('winnerText');

    if (game1.gameOver && game2.gameOver) {
        winnerText.textContent = '平局!';
    } else if (game1.gameOver) {
        winnerText.textContent = '玩家 2 获胜!';
    } else {
        winnerText.textContent = '玩家 1 获胜!';
    }

    overlay.style.display = 'flex';
}

// 键盘控制
document.addEventListener('keydown', (e) => {
    if (!gameStarted || gamePaused) return;

    // 玩家 1 (WASD + Space)
    if (!game1.gameOver) {
        switch(e.key.toLowerCase()) {
            case 'a':
                game1.move(-1);
                e.preventDefault();
                break;
            case 'd':
                game1.move(1);
                e.preventDefault();
                break;
            case 's':
                game1.drop();
                e.preventDefault();
                break;
            case 'w':
                game1.rotate();
                e.preventDefault();
                break;
            case ' ':
                game1.hardDrop();
                e.preventDefault();
                break;
        }
    }

    // 玩家 2 (方向键 + Enter)
    if (!game2.gameOver) {
        switch(e.key) {
            case 'ArrowLeft':
                game2.move(-1);
                e.preventDefault();
                break;
            case 'ArrowRight':
                game2.move(1);
                e.preventDefault();
                break;
            case 'ArrowDown':
                game2.drop();
                e.preventDefault();
                break;
            case 'ArrowUp':
                game2.rotate();
                e.preventDefault();
                break;
            case 'Enter':
                game2.hardDrop();
                e.preventDefault();
                break;
        }
    }
});

// 初始化游戏
init();
