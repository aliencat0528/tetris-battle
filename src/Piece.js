/**
 * Tetris Piece Class
 * 俄羅斯方塊類別
 */

import { SHAPES, COLORS, PIECE_TYPES, WALL_KICKS } from './constants.js';

export class Piece {
    /**
     * 建立新方塊
     * @param {string} type - 方塊類型 (I, O, T, S, Z, J, L)
     */
    constructor(type = null) {
        this.type = type || this.getRandomType();
        this.rotationIndex = 0;
        this.x = 0;
        this.y = 0;
        this.color = COLORS[this.type];
    }

    /**
     * 取得隨機方塊類型
     * @returns {string} 方塊類型
     */
    getRandomType() {
        return PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
    }

    /**
     * 取得當前旋轉狀態的形狀矩陣
     * @returns {number[][]} 形狀矩陣
     */
    getShape() {
        return SHAPES[this.type][this.rotationIndex];
    }

    /**
     * 取得指定旋轉狀態的形狀矩陣
     * @param {number} rotationIndex - 旋轉索引
     * @returns {number[][]} 形狀矩陣
     */
    getShapeAt(rotationIndex) {
        const normalizedIndex = ((rotationIndex % 4) + 4) % 4;
        return SHAPES[this.type][normalizedIndex];
    }

    /**
     * 取得方塊寬度
     * @returns {number} 寬度
     */
    getWidth() {
        return this.getShape()[0].length;
    }

    /**
     * 取得方塊高度
     * @returns {number} 高度
     */
    getHeight() {
        return this.getShape().length;
    }

    /**
     * 順時針旋轉
     * @returns {number} 新的旋轉索引
     */
    rotateCW() {
        this.rotationIndex = (this.rotationIndex + 1) % 4;
        return this.rotationIndex;
    }

    /**
     * 逆時針旋轉
     * @returns {number} 新的旋轉索引
     */
    rotateCCW() {
        this.rotationIndex = (this.rotationIndex + 3) % 4;
        return this.rotationIndex;
    }

    /**
     * 設定旋轉狀態
     * @param {number} index - 旋轉索引
     */
    setRotation(index) {
        this.rotationIndex = ((index % 4) + 4) % 4;
    }

    /**
     * 取得 Wall Kick 測試資料
     * @param {number} fromRotation - 原始旋轉狀態
     * @param {number} toRotation - 目標旋轉狀態
     * @returns {number[][]} Wall Kick 位移陣列
     */
    getWallKicks(fromRotation, toRotation) {
        const from = ((fromRotation % 4) + 4) % 4;
        const to = ((toRotation % 4) + 4) % 4;
        const key = `${from}>${to}`;

        if (this.type === 'I') {
            return WALL_KICKS.I[key] || [[0, 0]];
        }
        return WALL_KICKS.normal[key] || [[0, 0]];
    }

    /**
     * 移動方塊
     * @param {number} dx - X 方向位移
     * @param {number} dy - Y 方向位移
     */
    move(dx, dy) {
        this.x += dx;
        this.y += dy;
    }

    /**
     * 設定位置
     * @param {number} x - X 座標
     * @param {number} y - Y 座標
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * 複製方塊
     * @returns {Piece} 新的方塊實例
     */
    clone() {
        const piece = new Piece(this.type);
        piece.rotationIndex = this.rotationIndex;
        piece.x = this.x;
        piece.y = this.y;
        return piece;
    }

    /**
     * 遍歷方塊的每個實心格子
     * @param {function} callback - 回調函數 (x, y, globalX, globalY)
     */
    forEachBlock(callback) {
        const shape = this.getShape();
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    callback(col, row, this.x + col, this.y + row);
                }
            }
        }
    }

    /**
     * 取得方塊佔據的所有格子座標
     * @returns {Array<{x: number, y: number}>} 座標陣列
     */
    getOccupiedCells() {
        const cells = [];
        this.forEachBlock((localX, localY, globalX, globalY) => {
            cells.push({ x: globalX, y: globalY });
        });
        return cells;
    }
}

/**
 * 方塊袋生成器（7-bag 隨機系統）
 * 確保每 7 個方塊各種類型都會出現一次
 */
export class PieceBag {
    constructor() {
        this.bag = [];
        this.fillBag();
    }

    /**
     * 填充方塊袋
     */
    fillBag() {
        this.bag = [...PIECE_TYPES];
        this.shuffle();
    }

    /**
     * 洗牌（Fisher-Yates 演算法）
     */
    shuffle() {
        for (let i = this.bag.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
        }
    }

    /**
     * 取得下一個方塊類型
     * @returns {string} 方塊類型
     */
    next() {
        if (this.bag.length === 0) {
            this.fillBag();
        }
        return this.bag.pop();
    }

    /**
     * 預覽接下來的方塊類型
     * @param {number} count - 預覽數量
     * @returns {string[]} 方塊類型陣列
     */
    preview(count = 3) {
        // 確保袋子有足夠的方塊供預覽
        while (this.bag.length < count) {
            const newBag = [...PIECE_TYPES];
            // 洗牌新袋子
            for (let i = newBag.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newBag[i], newBag[j]] = [newBag[j], newBag[i]];
            }
            this.bag = [...newBag, ...this.bag];
        }
        // 返回袋子最後 count 個元素（因為是 pop 取出）
        return this.bag.slice(-count).reverse();
    }
}
