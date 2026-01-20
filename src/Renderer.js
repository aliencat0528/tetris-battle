/**
 * Tetris Renderer Class
 * 俄羅斯方塊渲染器
 */

import { COLS, ROWS, BLOCK_SIZE, PREVIEW_BLOCK_SIZE, COLORS } from './constants.js';

export class Renderer {
    constructor() {
        // 主遊戲畫布
        this.gameCanvas = document.getElementById('game-canvas');
        this.gameCtx = this.gameCanvas.getContext('2d');

        // Hold 畫布
        this.holdCanvas = document.getElementById('hold-canvas');
        this.holdCtx = this.holdCanvas.getContext('2d');

        // Next 預覽畫布
        this.nextCanvases = [
            document.getElementById('next-canvas-1'),
            document.getElementById('next-canvas-2'),
            document.getElementById('next-canvas-3')
        ];
        this.nextCtxs = this.nextCanvases.map(canvas => canvas.getContext('2d'));

        // UI 元素
        this.scoreElement = document.getElementById('score');
        this.levelElement = document.getElementById('level');
        this.linesElement = document.getElementById('lines');
        this.comboElement = document.getElementById('combo');
        this.overlay = document.getElementById('overlay');
        this.overlayTitle = document.getElementById('overlay-title');
        this.overlayMessage = document.getElementById('overlay-message');
        this.highScoresDiv = document.getElementById('high-scores');
        this.scoreList = document.getElementById('score-list');

        // 設定主畫布大小
        this.gameCanvas.width = COLS * BLOCK_SIZE;
        this.gameCanvas.height = ROWS * BLOCK_SIZE;

        // 設定預覽畫布大小
        this.holdCanvas.width = 4 * PREVIEW_BLOCK_SIZE + 10;
        this.holdCanvas.height = 4 * PREVIEW_BLOCK_SIZE + 10;

        this.nextCanvases.forEach(canvas => {
            canvas.width = 4 * PREVIEW_BLOCK_SIZE + 10;
            canvas.height = 4 * PREVIEW_BLOCK_SIZE + 10;
        });
    }

    /**
     * 清除主畫布
     */
    clearGameCanvas() {
        this.gameCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.gameCtx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
    }

    /**
     * 繪製網格線
     */
    drawGrid() {
        this.gameCtx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.gameCtx.lineWidth = 1;

        // 垂直線
        for (let x = 0; x <= COLS; x++) {
            this.gameCtx.beginPath();
            this.gameCtx.moveTo(x * BLOCK_SIZE, 0);
            this.gameCtx.lineTo(x * BLOCK_SIZE, ROWS * BLOCK_SIZE);
            this.gameCtx.stroke();
        }

        // 水平線
        for (let y = 0; y <= ROWS; y++) {
            this.gameCtx.beginPath();
            this.gameCtx.moveTo(0, y * BLOCK_SIZE);
            this.gameCtx.lineTo(COLS * BLOCK_SIZE, y * BLOCK_SIZE);
            this.gameCtx.stroke();
        }
    }

    /**
     * 繪製單個方塊
     * @param {CanvasRenderingContext2D} ctx - 畫布上下文
     * @param {number} x - X 座標（格數）
     * @param {number} y - Y 座標（格數）
     * @param {string} color - 顏色
     * @param {number} blockSize - 方塊大小
     * @param {boolean} isGhost - 是否為 Ghost
     */
    drawBlock(ctx, x, y, color, blockSize = BLOCK_SIZE, isGhost = false) {
        const padding = 1;
        const innerSize = blockSize - padding * 2;

        if (isGhost) {
            // Ghost piece - 只畫邊框
            ctx.strokeStyle = COLORS.ghost;
            ctx.lineWidth = 2;
            ctx.strokeRect(
                x * blockSize + padding,
                y * blockSize + padding,
                innerSize,
                innerSize
            );
        } else {
            // 主體顏色
            ctx.fillStyle = color;
            ctx.fillRect(
                x * blockSize + padding,
                y * blockSize + padding,
                innerSize,
                innerSize
            );

            // 高光效果（左上）
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(
                x * blockSize + padding,
                y * blockSize + padding,
                innerSize,
                3
            );
            ctx.fillRect(
                x * blockSize + padding,
                y * blockSize + padding,
                3,
                innerSize
            );

            // 陰影效果（右下）
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(
                x * blockSize + padding,
                y * blockSize + blockSize - padding - 3,
                innerSize,
                3
            );
            ctx.fillRect(
                x * blockSize + blockSize - padding - 3,
                y * blockSize + padding,
                3,
                innerSize
            );

            // 邊框
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 1;
            ctx.strokeRect(
                x * blockSize + padding,
                y * blockSize + padding,
                innerSize,
                innerSize
            );
        }
    }

    /**
     * 繪製棋盤上已鎖定的方塊
     * @param {Board} board - 棋盤
     */
    drawBoard(board) {
        board.forEachCell((x, y, color) => {
            this.drawBlock(this.gameCtx, x, y, color);
        });
    }

    /**
     * 繪製當前方塊
     * @param {Piece} piece - 方塊
     */
    drawPiece(piece) {
        if (!piece) return;

        piece.forEachBlock((localX, localY, globalX, globalY) => {
            if (globalY >= 0) {
                this.drawBlock(this.gameCtx, globalX, globalY, piece.color);
            }
        });
    }

    /**
     * 繪製 Ghost Piece
     * @param {Piece} piece - 當前方塊
     * @param {number} ghostY - Ghost 的 Y 座標
     */
    drawGhost(piece, ghostY) {
        if (!piece || ghostY <= piece.y) return;

        const shape = piece.getShape();
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const y = ghostY + row;
                    if (y >= 0) {
                        this.drawBlock(
                            this.gameCtx,
                            piece.x + col,
                            y,
                            piece.color,
                            BLOCK_SIZE,
                            true
                        );
                    }
                }
            }
        }
    }

    /**
     * 在預覽區繪製方塊
     * @param {CanvasRenderingContext2D} ctx - 畫布上下文
     * @param {Piece} piece - 方塊
     */
    drawPreviewPiece(ctx, piece) {
        const canvas = ctx.canvas;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (!piece) return;

        const shape = piece.getShape();
        const pieceWidth = shape[0].length;
        const pieceHeight = shape.length;

        // 計算置中偏移
        const offsetX = (canvas.width - pieceWidth * PREVIEW_BLOCK_SIZE) / 2;
        const offsetY = (canvas.height - pieceHeight * PREVIEW_BLOCK_SIZE) / 2;

        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const x = offsetX + col * PREVIEW_BLOCK_SIZE;
                    const y = offsetY + row * PREVIEW_BLOCK_SIZE;

                    // 繪製方塊
                    const padding = 1;
                    const innerSize = PREVIEW_BLOCK_SIZE - padding * 2;

                    ctx.fillStyle = piece.color;
                    ctx.fillRect(x + padding, y + padding, innerSize, innerSize);

                    // 高光
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    ctx.fillRect(x + padding, y + padding, innerSize, 2);
                    ctx.fillRect(x + padding, y + padding, 2, innerSize);

                    // 邊框
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(x + padding, y + padding, innerSize, innerSize);
                }
            }
        }
    }

    /**
     * 繪製 Hold 方塊
     * @param {Piece} piece - Hold 的方塊
     * @param {boolean} canUse - 是否可以使用
     */
    drawHold(piece, canUse = true) {
        this.holdCtx.clearRect(0, 0, this.holdCanvas.width, this.holdCanvas.height);
        this.holdCtx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.holdCtx.fillRect(0, 0, this.holdCanvas.width, this.holdCanvas.height);

        if (!piece) return;

        // 如果不能使用，降低透明度
        if (!canUse) {
            this.holdCtx.globalAlpha = 0.4;
        }

        this.drawPreviewPiece(this.holdCtx, piece);

        this.holdCtx.globalAlpha = 1;
    }

    /**
     * 繪製 Next 預覽方塊
     * @param {Piece[]} pieces - 下一個方塊陣列
     */
    drawNextPieces(pieces) {
        pieces.forEach((piece, index) => {
            if (index < this.nextCtxs.length) {
                this.drawPreviewPiece(this.nextCtxs[index], piece);
            }
        });
    }

    /**
     * 更新分數顯示
     * @param {number} score - 分數
     */
    updateScore(score) {
        this.scoreElement.textContent = score.toLocaleString();
    }

    /**
     * 更新等級顯示
     * @param {number} level - 等級
     */
    updateLevel(level) {
        this.levelElement.textContent = level;
    }

    /**
     * 更新消除行數顯示
     * @param {number} lines - 消除行數
     */
    updateLines(lines) {
        this.linesElement.textContent = lines;
    }

    /**
     * 更新連擊顯示
     * @param {number} combo - 連擊數
     */
    updateCombo(combo) {
        this.comboElement.textContent = combo;
        // 連擊時添加動畫效果
        if (combo > 0) {
            this.comboElement.style.color = '#ffd700';
            this.comboElement.style.transform = 'scale(1.2)';
            setTimeout(() => {
                this.comboElement.style.transform = 'scale(1)';
            }, 200);
        } else {
            this.comboElement.style.color = '#00d4ff';
        }
    }

    /**
     * 顯示覆蓋層
     * @param {string} title - 標題
     * @param {string} message - 訊息
     * @param {Array} scores - 高分榜（可選）
     */
    showOverlay(title, message, scores = null) {
        this.overlayTitle.textContent = title;
        this.overlayMessage.textContent = message;

        if (scores && scores.length > 0) {
            this.highScoresDiv.classList.remove('hidden');
            this.scoreList.innerHTML = scores
                .slice(0, 5)
                .map((s, i) => `<li>${s.toLocaleString()}</li>`)
                .join('');
        } else {
            this.highScoresDiv.classList.add('hidden');
        }

        this.overlay.classList.remove('hidden');
    }

    /**
     * 隱藏覆蓋層
     */
    hideOverlay() {
        this.overlay.classList.add('hidden');
    }

    /**
     * 完整渲染一幀
     * @param {Board} board - 棋盤
     * @param {Piece} currentPiece - 當前方塊
     * @param {number} ghostY - Ghost Y 座標
     * @param {Piece} holdPiece - Hold 方塊
     * @param {boolean} canHold - 是否可以 Hold
     * @param {Piece[]} nextPieces - Next 方塊陣列
     */
    render(board, currentPiece, ghostY, holdPiece, canHold, nextPieces) {
        // 清除並繪製主畫布
        this.clearGameCanvas();
        this.drawGrid();
        this.drawBoard(board);
        this.drawGhost(currentPiece, ghostY);
        this.drawPiece(currentPiece);

        // 繪製 Hold 和 Next
        this.drawHold(holdPiece, canHold);
        this.drawNextPieces(nextPieces);
    }

    /**
     * 繪製消行動畫
     * @param {number[]} lines - 被消除的行索引
     * @param {function} callback - 動畫完成回調
     */
    animateClearLines(lines, callback) {
        if (lines.length === 0) {
            callback();
            return;
        }

        let alpha = 1;
        const animate = () => {
            alpha -= 0.1;
            if (alpha <= 0) {
                callback();
                return;
            }

            // 閃爍效果
            lines.forEach(row => {
                this.gameCtx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                this.gameCtx.fillRect(0, row * BLOCK_SIZE, COLS * BLOCK_SIZE, BLOCK_SIZE);
            });

            requestAnimationFrame(animate);
        };

        animate();
    }
}
