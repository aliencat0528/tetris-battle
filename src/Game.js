/**
 * Tetris Game Controller
 * 俄羅斯方塊遊戲主控制器
 */

import { GAME_STATE, LOCK_DELAY, LOCK_DELAY_RESET_LIMIT, COLS } from './constants.js';
import { Piece, PieceBag } from './Piece.js';
import { Board } from './Board.js';
import { Renderer } from './Renderer.js';
import { InputHandler } from './InputHandler.js';
import { ScoreManager } from './ScoreManager.js';

export class Game {
    constructor() {
        // 核心模組
        this.board = new Board();
        this.renderer = new Renderer();
        this.scoreManager = new ScoreManager();
        this.pieceBag = new PieceBag();

        // 遊戲狀態
        this.state = GAME_STATE.IDLE;
        this.currentPiece = null;
        this.holdPiece = null;
        this.canHold = true;
        this.nextPieces = [];

        // 計時器
        this.lastDropTime = 0;
        this.dropInterval = this.scoreManager.getDropInterval();

        // Lock Delay
        this.isLocking = false;
        this.lockStartTime = 0;
        this.lockResetCount = 0;

        // 動畫幀
        this.animationId = null;
        this.lastTime = 0;

        // 初始化輸入處理
        this.inputHandler = new InputHandler({
            onLeft: () => this.moveLeft(),
            onRight: () => this.moveRight(),
            onSoftDrop: () => this.softDrop(),
            onHardDrop: () => this.hardDrop(),
            onRotateCW: () => this.rotateCW(),
            onRotateCCW: () => this.rotateCCW(),
            onHold: () => this.hold(),
            onPause: () => this.togglePause(),
            onRestart: () => this.restart(),
            onStart: () => this.start()
        });

        // 初始化顯示
        this.initDisplay();
    }

    /**
     * 初始化顯示
     */
    initDisplay() {
        // 顯示開始畫面
        const highScores = this.scoreManager.getHighScores();
        this.renderer.showOverlay('TETRIS', '按 Enter 開始遊戲', highScores);

        // 更新 UI
        this.renderer.updateScore(0);
        this.renderer.updateLevel(1);
        this.renderer.updateLines(0);
        this.renderer.updateCombo(0);

        // 繪製空棋盤
        this.renderer.clearGameCanvas();
        this.renderer.drawGrid();
    }

    /**
     * 開始遊戲
     */
    start() {
        if (this.state === GAME_STATE.PLAYING) return;

        // 重置遊戲狀態
        this.board.reset();
        this.scoreManager.reset();
        this.pieceBag = new PieceBag();

        this.holdPiece = null;
        this.canHold = true;
        this.isLocking = false;
        this.lockResetCount = 0;

        this.dropInterval = this.scoreManager.getDropInterval();

        // 填充 Next 佇列
        this.nextPieces = [];
        for (let i = 0; i < 3; i++) {
            this.nextPieces.push(new Piece(this.pieceBag.next()));
        }

        // 生成第一個方塊
        this.spawnPiece();

        // 更新 UI
        this.updateUI();

        // 隱藏覆蓋層
        this.renderer.hideOverlay();

        // 開始遊戲迴圈
        this.state = GAME_STATE.PLAYING;
        this.lastTime = performance.now();
        this.lastDropTime = this.lastTime;
        this.gameLoop(this.lastTime);
    }

    /**
     * 遊戲主迴圈
     * @param {number} time - 當前時間
     */
    gameLoop(time) {
        if (this.state !== GAME_STATE.PLAYING) {
            this.animationId = null;
            return;
        }

        const deltaTime = time - this.lastTime;
        this.lastTime = time;

        // 更新遊戲邏輯
        this.update(time);

        // 渲染
        this.render();

        // 繼續迴圈
        this.animationId = requestAnimationFrame((t) => this.gameLoop(t));
    }

    /**
     * 更新遊戲邏輯
     * @param {number} time - 當前時間
     */
    update(time) {
        if (!this.currentPiece) return;

        // 處理 Lock Delay
        if (this.isLocking) {
            if (time - this.lockStartTime >= LOCK_DELAY) {
                this.lockPiece();
            }
            return;
        }

        // 自然下落
        if (time - this.lastDropTime >= this.dropInterval) {
            this.drop();
            this.lastDropTime = time;
        }
    }

    /**
     * 渲染遊戲
     */
    render() {
        const ghostY = this.currentPiece
            ? this.board.getGhostY(this.currentPiece)
            : 0;

        this.renderer.render(
            this.board,
            this.currentPiece,
            ghostY,
            this.holdPiece,
            this.canHold,
            this.nextPieces
        );
    }

    /**
     * 生成新方塊
     */
    spawnPiece() {
        // 從 Next 佇列取出
        this.currentPiece = this.nextPieces.shift();

        // 補充 Next 佇列
        this.nextPieces.push(new Piece(this.pieceBag.next()));

        // 設定初始位置
        const spawnX = this.board.getSpawnX(this.currentPiece);
        const spawnY = this.board.getSpawnY(this.currentPiece);
        this.currentPiece.setPosition(spawnX, spawnY);

        // 檢查是否可以生成
        if (this.board.collides(this.currentPiece, 0, 0)) {
            this.gameOver();
            return;
        }

        // 重置 Hold 狀態
        this.canHold = true;
        this.isLocking = false;
        this.lockResetCount = 0;
    }

    /**
     * 方塊自然下落
     */
    drop() {
        if (!this.currentPiece) return;

        if (!this.board.collides(this.currentPiece, 0, 1)) {
            this.currentPiece.move(0, 1);
            this.cancelLock();
        } else {
            this.startLock();
        }
    }

    /**
     * 左移
     */
    moveLeft() {
        if (this.state !== GAME_STATE.PLAYING || !this.currentPiece) return;

        if (!this.board.collides(this.currentPiece, -1, 0)) {
            this.currentPiece.move(-1, 0);
            this.resetLock();
        }
    }

    /**
     * 右移
     */
    moveRight() {
        if (this.state !== GAME_STATE.PLAYING || !this.currentPiece) return;

        if (!this.board.collides(this.currentPiece, 1, 0)) {
            this.currentPiece.move(1, 0);
            this.resetLock();
        }
    }

    /**
     * Soft Drop
     */
    softDrop() {
        if (this.state !== GAME_STATE.PLAYING || !this.currentPiece) return;

        if (!this.board.collides(this.currentPiece, 0, 1)) {
            this.currentPiece.move(0, 1);
            this.scoreManager.addSoftDropScore(1);
            this.updateUI();
            this.cancelLock();
            this.lastDropTime = performance.now();
        }
    }

    /**
     * Hard Drop
     */
    hardDrop() {
        if (this.state !== GAME_STATE.PLAYING || !this.currentPiece) return;

        const dropDistance = this.board.getDropDistance(this.currentPiece);
        this.currentPiece.move(0, dropDistance);
        this.scoreManager.addHardDropScore(dropDistance);
        this.updateUI();
        this.lockPiece();
    }

    /**
     * 順時針旋轉
     */
    rotateCW() {
        if (this.state !== GAME_STATE.PLAYING || !this.currentPiece) return;

        const result = this.board.tryRotate(this.currentPiece, true);
        if (result.success) {
            this.currentPiece.setRotation(result.newRotation);
            this.currentPiece.move(result.kickX, result.kickY);
            this.resetLock();
        }
    }

    /**
     * 逆時針旋轉
     */
    rotateCCW() {
        if (this.state !== GAME_STATE.PLAYING || !this.currentPiece) return;

        const result = this.board.tryRotate(this.currentPiece, false);
        if (result.success) {
            this.currentPiece.setRotation(result.newRotation);
            this.currentPiece.move(result.kickX, result.kickY);
            this.resetLock();
        }
    }

    /**
     * Hold 暫存
     */
    hold() {
        if (this.state !== GAME_STATE.PLAYING || !this.currentPiece || !this.canHold) return;

        const current = this.currentPiece;

        if (this.holdPiece) {
            // 交換
            this.currentPiece = this.holdPiece;
            this.currentPiece.setRotation(0);
            const spawnX = this.board.getSpawnX(this.currentPiece);
            const spawnY = this.board.getSpawnY(this.currentPiece);
            this.currentPiece.setPosition(spawnX, spawnY);
        } else {
            // 第一次 Hold，生成新方塊
            this.spawnPiece();
        }

        // 保存到 Hold
        this.holdPiece = new Piece(current.type);
        this.canHold = false;
        this.isLocking = false;
        this.lockResetCount = 0;
    }

    /**
     * 開始鎖定計時
     */
    startLock() {
        if (!this.isLocking) {
            this.isLocking = true;
            this.lockStartTime = performance.now();
        }
    }

    /**
     * 重置鎖定計時（移動或旋轉時）
     */
    resetLock() {
        if (this.isLocking && this.lockResetCount < LOCK_DELAY_RESET_LIMIT) {
            // 檢查是否仍然在地面上
            if (this.board.collides(this.currentPiece, 0, 1)) {
                this.lockStartTime = performance.now();
                this.lockResetCount++;
            } else {
                this.cancelLock();
            }
        }
    }

    /**
     * 取消鎖定
     */
    cancelLock() {
        this.isLocking = false;
        this.lockResetCount = 0;
    }

    /**
     * 鎖定方塊
     */
    lockPiece() {
        if (!this.currentPiece) return;

        // 鎖定到棋盤
        this.board.lockPiece(this.currentPiece);

        // 消除行
        const clearedLines = this.board.clearLines();

        // 計分
        if (clearedLines.length > 0) {
            const result = this.scoreManager.addLineScore(clearedLines.length);
            if (result.levelUp) {
                this.dropInterval = this.scoreManager.getDropInterval();
            }
        } else {
            // 沒有消行，重置連擊
            this.scoreManager.addLineScore(0);
        }

        // 更新 UI
        this.updateUI();

        // 檢查遊戲結束
        if (this.board.isGameOver()) {
            this.gameOver();
            return;
        }

        // 生成新方塊
        this.currentPiece = null;
        this.isLocking = false;
        this.lockResetCount = 0;
        this.spawnPiece();

        // 重置下落計時
        this.lastDropTime = performance.now();
    }

    /**
     * 更新 UI
     */
    updateUI() {
        this.renderer.updateScore(this.scoreManager.getScore());
        this.renderer.updateLevel(this.scoreManager.getLevel());
        this.renderer.updateLines(this.scoreManager.getLines());
        this.renderer.updateCombo(this.scoreManager.getCombo());
    }

    /**
     * 切換暫停
     */
    togglePause() {
        if (this.state === GAME_STATE.PLAYING) {
            this.state = GAME_STATE.PAUSED;
            this.inputHandler.stopAllRepeats();
            this.renderer.showOverlay('PAUSED', '按 P 繼續遊戲');
        } else if (this.state === GAME_STATE.PAUSED) {
            this.state = GAME_STATE.PLAYING;
            this.renderer.hideOverlay();
            this.lastTime = performance.now();
            this.lastDropTime = this.lastTime;
            this.gameLoop(this.lastTime);
        }
    }

    /**
     * 重新開始
     */
    restart() {
        this.inputHandler.stopAllRepeats();
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.state = GAME_STATE.IDLE;
        this.start();
    }

    /**
     * 遊戲結束
     */
    gameOver() {
        this.state = GAME_STATE.GAME_OVER;
        this.inputHandler.stopAllRepeats();

        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        // 保存高分
        const score = this.scoreManager.getScore();
        const result = this.scoreManager.addHighScore(score);

        // 顯示遊戲結束畫面
        let message = `分數：${score.toLocaleString()}`;
        if (result.added && result.rank <= 3) {
            message += `\n新紀錄！第 ${result.rank} 名！`;
        }
        message += '\n按 Enter 重新開始';

        this.renderer.showOverlay('GAME OVER', message, result.scores);
    }

    /**
     * 銷毀遊戲
     */
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.inputHandler.destroy();
    }
}
