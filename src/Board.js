/**
 * Tetris Board Class
 * 俄羅斯方塊棋盤類別
 */

import { COLS, ROWS, COLORS } from './constants.js';

export class Board {
    constructor() {
        this.cols = COLS;
        this.rows = ROWS;
        this.grid = this.createEmptyGrid();
    }

    /**
     * 建立空白棋盤網格
     * @returns {Array<Array<string|null>>} 二維陣列，null 表示空格
     */
    createEmptyGrid() {
        return Array.from({ length: this.rows }, () =>
            Array.from({ length: this.cols }, () => null)
        );
    }

    /**
     * 重置棋盤
     */
    reset() {
        this.grid = this.createEmptyGrid();
    }

    /**
     * 取得指定位置的格子內容
     * @param {number} x - X 座標
     * @param {number} y - Y 座標
     * @returns {string|null} 顏色或 null
     */
    getCell(x, y) {
        if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) {
            return undefined; // 超出邊界
        }
        return this.grid[y][x];
    }

    /**
     * 設定指定位置的格子內容
     * @param {number} x - X 座標
     * @param {number} y - Y 座標
     * @param {string|null} value - 顏色或 null
     */
    setCell(x, y, value) {
        if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
            this.grid[y][x] = value;
        }
    }

    /**
     * 檢查位置是否為空（可放置）
     * @param {number} x - X 座標
     * @param {number} y - Y 座標
     * @returns {boolean} 是否為空
     */
    isEmpty(x, y) {
        // 超出左右邊界
        if (x < 0 || x >= this.cols) {
            return false;
        }
        // 超出底部邊界
        if (y >= this.rows) {
            return false;
        }
        // 頂部以上視為空（允許方塊從上方進入）
        if (y < 0) {
            return true;
        }
        // 檢查格子是否已被佔據
        return this.grid[y][x] === null;
    }

    /**
     * 檢查方塊是否與棋盤碰撞
     * @param {Piece} piece - 方塊
     * @param {number} offsetX - X 偏移量
     * @param {number} offsetY - Y 偏移量
     * @param {number[][]} shape - 可選的形狀矩陣（用於測試旋轉）
     * @returns {boolean} 是否碰撞
     */
    collides(piece, offsetX = 0, offsetY = 0, shape = null) {
        const matrix = shape || piece.getShape();
        const testX = piece.x + offsetX;
        const testY = piece.y + offsetY;

        for (let row = 0; row < matrix.length; row++) {
            for (let col = 0; col < matrix[row].length; col++) {
                if (matrix[row][col]) {
                    const x = testX + col;
                    const y = testY + row;
                    if (!this.isEmpty(x, y)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * 將方塊鎖定到棋盤上
     * @param {Piece} piece - 方塊
     */
    lockPiece(piece) {
        piece.forEachBlock((localX, localY, globalX, globalY) => {
            if (globalY >= 0) {
                this.setCell(globalX, globalY, piece.color);
            }
        });
    }

    /**
     * 檢查並消除已填滿的行
     * @returns {number[]} 被消除的行索引陣列
     */
    clearLines() {
        const clearedLines = [];

        for (let row = this.rows - 1; row >= 0; row--) {
            if (this.isLineFull(row)) {
                clearedLines.push(row);
            }
        }

        // 從下往上移除行
        clearedLines.forEach((lineIndex, i) => {
            // 因為每次移除後行索引會變化，需要調整
            this.removeLine(lineIndex + i);
        });

        return clearedLines;
    }

    /**
     * 檢查指定行是否已填滿
     * @param {number} row - 行索引
     * @returns {boolean} 是否填滿
     */
    isLineFull(row) {
        return this.grid[row].every(cell => cell !== null);
    }

    /**
     * 移除指定行並將上方的行下移
     * @param {number} row - 行索引
     */
    removeLine(row) {
        // 移除該行
        this.grid.splice(row, 1);
        // 在頂部添加新的空行
        this.grid.unshift(Array.from({ length: this.cols }, () => null));
    }

    /**
     * 檢查遊戲是否結束（頂部有方塊）
     * @returns {boolean} 是否遊戲結束
     */
    isGameOver() {
        // 檢查最上面兩行是否有方塊
        for (let col = 0; col < this.cols; col++) {
            if (this.grid[0][col] !== null || this.grid[1][col] !== null) {
                return true;
            }
        }
        return false;
    }

    /**
     * 取得方塊的 Ghost 位置（瞬降預覽）
     * @param {Piece} piece - 當前方塊
     * @returns {number} Ghost 的 Y 座標
     */
    getGhostY(piece) {
        let ghostY = piece.y;
        while (!this.collides(piece, 0, ghostY - piece.y + 1)) {
            ghostY++;
        }
        return ghostY;
    }

    /**
     * 計算方塊到底部的距離
     * @param {Piece} piece - 方塊
     * @returns {number} 到底部的格數
     */
    getDropDistance(piece) {
        return this.getGhostY(piece) - piece.y;
    }

    /**
     * 嘗試旋轉方塊（含 Wall Kick）
     * @param {Piece} piece - 方塊
     * @param {boolean} clockwise - 是否順時針旋轉
     * @returns {{success: boolean, kickX: number, kickY: number}} 旋轉結果
     */
    tryRotate(piece, clockwise = true) {
        const fromRotation = piece.rotationIndex;
        const toRotation = clockwise
            ? (fromRotation + 1) % 4
            : (fromRotation + 3) % 4;

        const kicks = piece.getWallKicks(fromRotation, toRotation);
        const newShape = piece.getShapeAt(toRotation);

        for (const [kickX, kickY] of kicks) {
            if (!this.collides(piece, kickX, -kickY, newShape)) {
                return {
                    success: true,
                    newRotation: toRotation,
                    kickX: kickX,
                    kickY: -kickY
                };
            }
        }

        return {
            success: false,
            newRotation: fromRotation,
            kickX: 0,
            kickY: 0
        };
    }

    /**
     * 取得起始位置 X 座標（置中）
     * @param {Piece} piece - 方塊
     * @returns {number} X 座標
     */
    getSpawnX(piece) {
        return Math.floor((this.cols - piece.getWidth()) / 2);
    }

    /**
     * 取得起始位置 Y 座標
     * @param {Piece} piece - 方塊
     * @returns {number} Y 座標
     */
    getSpawnY(piece) {
        // 從頂部開始，可能在可視區域外
        return -1;
    }

    /**
     * 檢查方塊是否可以生成
     * @param {Piece} piece - 方塊
     * @returns {boolean} 是否可以生成
     */
    canSpawn(piece) {
        const spawnX = this.getSpawnX(piece);
        const spawnY = this.getSpawnY(piece);
        piece.setPosition(spawnX, spawnY);

        // 檢查生成位置和下一格是否都沒有碰撞
        return !this.collides(piece, 0, 0) && !this.collides(piece, 0, 1);
    }

    /**
     * 遍歷棋盤上所有非空格子
     * @param {function} callback - 回調函數 (x, y, color)
     */
    forEachCell(callback) {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const color = this.grid[row][col];
                if (color !== null) {
                    callback(col, row, color);
                }
            }
        }
    }

    /**
     * 取得棋盤狀態的複製
     * @returns {Array<Array<string|null>>} 棋盤網格副本
     */
    getGridCopy() {
        return this.grid.map(row => [...row]);
    }
}
