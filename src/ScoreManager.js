/**
 * Tetris Score Manager
 * 俄羅斯方塊計分與排行榜管理器
 */

import {
    SCORE_TABLE,
    SOFT_DROP_SCORE,
    HARD_DROP_SCORE,
    COMBO_BONUS,
    LINES_PER_LEVEL,
    MAX_LEVEL,
    INITIAL_DROP_INTERVAL,
    SPEED_DECREASE_PER_LEVEL,
    MIN_DROP_INTERVAL
} from './constants.js';

export class ScoreManager {
    constructor() {
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.combo = 0;

        this.storageKey = 'tetris_high_scores';
        this.maxHighScores = 10;
    }

    /**
     * 重置計分
     */
    reset() {
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.combo = 0;
    }

    /**
     * 計算消行得分
     * @param {number} linesCleared - 消除的行數
     * @returns {number} 得分
     */
    calculateLineScore(linesCleared) {
        if (linesCleared === 0) {
            this.combo = 0;
            return 0;
        }

        // 基本分數
        let baseScore = SCORE_TABLE[linesCleared] || 0;

        // 等級加成
        baseScore *= this.level;

        // 連擊加成
        if (this.combo > 0) {
            baseScore += COMBO_BONUS * this.combo * this.level;
        }

        // 更新連擊數
        this.combo++;

        return baseScore;
    }

    /**
     * 添加消行得分
     * @param {number} linesCleared - 消除的行數
     * @returns {{score: number, levelUp: boolean}} 得分和是否升級
     */
    addLineScore(linesCleared) {
        const scoreGain = this.calculateLineScore(linesCleared);
        this.score += scoreGain;
        this.lines += linesCleared;

        // 檢查升級
        const newLevel = Math.min(
            Math.floor(this.lines / LINES_PER_LEVEL) + 1,
            MAX_LEVEL
        );
        const levelUp = newLevel > this.level;
        this.level = newLevel;

        return { score: scoreGain, levelUp };
    }

    /**
     * 添加 Soft Drop 得分
     * @param {number} cells - 下降格數
     */
    addSoftDropScore(cells = 1) {
        this.score += SOFT_DROP_SCORE * cells;
    }

    /**
     * 添加 Hard Drop 得分
     * @param {number} cells - 下降格數
     */
    addHardDropScore(cells) {
        this.score += HARD_DROP_SCORE * cells;
    }

    /**
     * 取得當前下落間隔（根據等級）
     * @returns {number} 毫秒
     */
    getDropInterval() {
        const interval = INITIAL_DROP_INTERVAL - (this.level - 1) * SPEED_DECREASE_PER_LEVEL;
        return Math.max(interval, MIN_DROP_INTERVAL);
    }

    /**
     * 取得分數
     * @returns {number}
     */
    getScore() {
        return this.score;
    }

    /**
     * 取得等級
     * @returns {number}
     */
    getLevel() {
        return this.level;
    }

    /**
     * 取得消除行數
     * @returns {number}
     */
    getLines() {
        return this.lines;
    }

    /**
     * 取得連擊數
     * @returns {number}
     */
    getCombo() {
        return this.combo;
    }

    /**
     * 載入高分榜
     * @returns {number[]} 高分陣列
     */
    loadHighScores() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (data) {
                return JSON.parse(data);
            }
        } catch (e) {
            console.warn('Failed to load high scores:', e);
        }
        return [];
    }

    /**
     * 儲存高分榜
     * @param {number[]} scores - 高分陣列
     */
    saveHighScores(scores) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(scores));
        } catch (e) {
            console.warn('Failed to save high scores:', e);
        }
    }

    /**
     * 嘗試添加分數到高分榜
     * @param {number} score - 分數
     * @returns {{added: boolean, rank: number, scores: number[]}} 結果
     */
    addHighScore(score) {
        const scores = this.loadHighScores();

        // 找到插入位置
        let rank = scores.findIndex(s => score > s);
        if (rank === -1) {
            rank = scores.length;
        }

        // 插入分數
        scores.splice(rank, 0, score);

        // 保留前 N 名
        const trimmedScores = scores.slice(0, this.maxHighScores);

        // 儲存
        this.saveHighScores(trimmedScores);

        return {
            added: rank < this.maxHighScores,
            rank: rank + 1,
            scores: trimmedScores
        };
    }

    /**
     * 取得高分榜
     * @returns {number[]} 高分陣列
     */
    getHighScores() {
        return this.loadHighScores();
    }

    /**
     * 清除高分榜
     */
    clearHighScores() {
        try {
            localStorage.removeItem(this.storageKey);
        } catch (e) {
            console.warn('Failed to clear high scores:', e);
        }
    }

    /**
     * 檢查是否為新高分
     * @param {number} score - 分數
     * @returns {boolean}
     */
    isHighScore(score) {
        const scores = this.loadHighScores();
        if (scores.length < this.maxHighScores) {
            return score > 0;
        }
        return score > scores[scores.length - 1];
    }
}
