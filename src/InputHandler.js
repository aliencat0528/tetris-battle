/**
 * Tetris Input Handler
 * 俄羅斯方塊輸入處理器
 */

import { KEY_BINDINGS } from './constants.js';

export class InputHandler {
    /**
     * 建立輸入處理器
     * @param {object} callbacks - 回調函數物件
     */
    constructor(callbacks = {}) {
        this.callbacks = {
            onLeft: callbacks.onLeft || (() => {}),
            onRight: callbacks.onRight || (() => {}),
            onSoftDrop: callbacks.onSoftDrop || (() => {}),
            onHardDrop: callbacks.onHardDrop || (() => {}),
            onRotateCW: callbacks.onRotateCW || (() => {}),
            onRotateCCW: callbacks.onRotateCCW || (() => {}),
            onHold: callbacks.onHold || (() => {}),
            onPause: callbacks.onPause || (() => {}),
            onRestart: callbacks.onRestart || (() => {}),
            onStart: callbacks.onStart || (() => {})
        };

        // 按鍵狀態
        this.keys = {};

        // 重複移動設定
        this.repeatDelay = 170;  // 首次重複延遲
        this.repeatRate = 50;    // 重複速率
        this.repeatTimers = {};

        // 觸控相關
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchStartTime = 0;
        this.swipeThreshold = 30;
        this.longPressThreshold = 500;
        this.longPressTimer = null;

        // 綁定事件
        this.bindKeyboard();
        this.bindTouch();
    }

    /**
     * 綁定鍵盤事件
     */
    bindKeyboard() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }

    /**
     * 處理按鍵按下
     * @param {KeyboardEvent} e - 鍵盤事件
     */
    handleKeyDown(e) {
        const key = e.code;

        // 防止重複觸發
        if (this.keys[key]) return;
        this.keys[key] = true;

        // 防止瀏覽器預設行為
        if (this.isGameKey(key)) {
            e.preventDefault();
        }

        // 開始遊戲
        if (key === 'Enter') {
            this.callbacks.onStart();
            return;
        }

        // 暫停
        if (KEY_BINDINGS.PAUSE.includes(key)) {
            this.callbacks.onPause();
            return;
        }

        // 重新開始
        if (KEY_BINDINGS.RESTART.includes(key)) {
            this.callbacks.onRestart();
            return;
        }

        // 移動（支援重複）
        if (KEY_BINDINGS.LEFT.includes(key)) {
            this.callbacks.onLeft();
            this.startRepeat('left', () => this.callbacks.onLeft());
            return;
        }

        if (KEY_BINDINGS.RIGHT.includes(key)) {
            this.callbacks.onRight();
            this.startRepeat('right', () => this.callbacks.onRight());
            return;
        }

        // Soft Drop（支援重複）
        if (KEY_BINDINGS.SOFT_DROP.includes(key)) {
            this.callbacks.onSoftDrop();
            this.startRepeat('softDrop', () => this.callbacks.onSoftDrop());
            return;
        }

        // Hard Drop（不重複）
        if (KEY_BINDINGS.HARD_DROP.includes(key)) {
            this.callbacks.onHardDrop();
            return;
        }

        // 旋轉（不重複）
        if (KEY_BINDINGS.ROTATE_CW.includes(key)) {
            this.callbacks.onRotateCW();
            return;
        }

        if (KEY_BINDINGS.ROTATE_CCW.includes(key)) {
            this.callbacks.onRotateCCW();
            return;
        }

        // Hold（不重複）
        if (KEY_BINDINGS.HOLD.includes(key)) {
            this.callbacks.onHold();
            return;
        }
    }

    /**
     * 處理按鍵放開
     * @param {KeyboardEvent} e - 鍵盤事件
     */
    handleKeyUp(e) {
        const key = e.code;
        this.keys[key] = false;

        // 停止重複
        if (KEY_BINDINGS.LEFT.includes(key)) {
            this.stopRepeat('left');
        }
        if (KEY_BINDINGS.RIGHT.includes(key)) {
            this.stopRepeat('right');
        }
        if (KEY_BINDINGS.SOFT_DROP.includes(key)) {
            this.stopRepeat('softDrop');
        }
    }

    /**
     * 檢查是否為遊戲按鍵
     * @param {string} key - 按鍵代碼
     * @returns {boolean}
     */
    isGameKey(key) {
        const allKeys = [
            ...KEY_BINDINGS.LEFT,
            ...KEY_BINDINGS.RIGHT,
            ...KEY_BINDINGS.SOFT_DROP,
            ...KEY_BINDINGS.HARD_DROP,
            ...KEY_BINDINGS.ROTATE_CW,
            ...KEY_BINDINGS.ROTATE_CCW,
            ...KEY_BINDINGS.HOLD,
            ...KEY_BINDINGS.PAUSE,
            ...KEY_BINDINGS.RESTART
        ];
        return allKeys.includes(key);
    }

    /**
     * 開始按鍵重複
     * @param {string} action - 動作名稱
     * @param {function} callback - 回調函數
     */
    startRepeat(action, callback) {
        this.stopRepeat(action);

        this.repeatTimers[action] = {
            delay: setTimeout(() => {
                this.repeatTimers[action].interval = setInterval(callback, this.repeatRate);
            }, this.repeatDelay)
        };
    }

    /**
     * 停止按鍵重複
     * @param {string} action - 動作名稱
     */
    stopRepeat(action) {
        if (this.repeatTimers[action]) {
            clearTimeout(this.repeatTimers[action].delay);
            clearInterval(this.repeatTimers[action].interval);
            delete this.repeatTimers[action];
        }
    }

    /**
     * 綁定觸控事件
     */
    bindTouch() {
        const gameCanvas = document.getElementById('game-canvas');
        if (!gameCanvas) return;

        gameCanvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        gameCanvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        gameCanvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
    }

    /**
     * 處理觸控開始
     * @param {TouchEvent} e - 觸控事件
     */
    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
        this.touchStartTime = Date.now();

        // 長按計時器
        this.longPressTimer = setTimeout(() => {
            this.callbacks.onHold();
        }, this.longPressThreshold);
    }

    /**
     * 處理觸控移動
     * @param {TouchEvent} e - 觸控事件
     */
    handleTouchMove(e) {
        e.preventDefault();

        // 取消長按
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }
    }

    /**
     * 處理觸控結束
     * @param {TouchEvent} e - 觸控事件
     */
    handleTouchEnd(e) {
        e.preventDefault();

        // 取消長按
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }

        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - this.touchStartX;
        const deltaY = touch.clientY - this.touchStartY;
        const deltaTime = Date.now() - this.touchStartTime;

        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);

        // 判斷手勢
        if (absDeltaX < this.swipeThreshold && absDeltaY < this.swipeThreshold) {
            // 點擊 - 旋轉
            if (deltaTime < this.longPressThreshold) {
                this.callbacks.onRotateCW();
            }
        } else if (absDeltaX > absDeltaY) {
            // 水平滑動
            if (deltaX > this.swipeThreshold) {
                this.callbacks.onRight();
            } else if (deltaX < -this.swipeThreshold) {
                this.callbacks.onLeft();
            }
        } else {
            // 垂直滑動
            if (deltaY > this.swipeThreshold) {
                // 下滑 - Soft Drop
                this.callbacks.onSoftDrop();
            } else if (deltaY < -this.swipeThreshold) {
                // 上滑 - Hard Drop
                this.callbacks.onHardDrop();
            }
        }
    }

    /**
     * 停止所有重複
     */
    stopAllRepeats() {
        Object.keys(this.repeatTimers).forEach(action => this.stopRepeat(action));
    }

    /**
     * 銷毀輸入處理器
     */
    destroy() {
        this.stopAllRepeats();
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
    }
}
