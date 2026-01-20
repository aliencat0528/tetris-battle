/**
 * Tetris Game - Main Entry Point
 * 俄羅斯方塊遊戲主程式入口
 */

import { Game } from './Game.js';

// 等待 DOM 載入完成後初始化遊戲
document.addEventListener('DOMContentLoaded', () => {
    console.log('Tetris Game initializing...');

    // 建立遊戲實例
    const game = new Game();

    // 將遊戲實例暴露給全域（用於除錯）
    window.tetrisGame = game;

    console.log('Tetris Game ready! Press Enter to start.');
});
