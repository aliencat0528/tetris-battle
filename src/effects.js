/**
 * Tetris 主題特效系統
 * Theme Effects System with Multiple Styles
 */

class EffectsManager {
    constructor() {
        this.backgroundEffects = document.getElementById('background-effects');
        this.confettiContainer = document.getElementById('confetti-container');
        this.bubbleCount = 0;
        this.maxBubbles = 15;
        this.starCount = 0;
        this.maxStars = 30;

        // 當前主題
        this.currentTheme = 'bubble';

        // 主題配色方案
        this.themeColors = {
            bubble: {
                primary: ['#00d4ff', '#9b59b6', '#ff6b9d', '#ffd700'],
                confetti: ['#00d4ff', '#9b59b6', '#ff6b9d', '#ffd700', '#2ecc71'],
                soft: ['#ff9ff3', '#ffeaa7', '#74b9ff', '#a29bfe', '#dfe6e9']
            },
            candy: {
                primary: ['#ff6b9d', '#ffd93d', '#6bcb77', '#4ecdc4'],
                confetti: ['#ff6b9d', '#ffd93d', '#6bcb77', '#4ecdc4', '#ff9f43'],
                soft: ['#ffcccc', '#fff3cd', '#d4edda', '#cce5ff']
            },
            space: {
                primary: ['#8a2be2', '#4169e1', '#1e90ff', '#9370db'],
                confetti: ['#8a2be2', '#4169e1', '#1e90ff', '#e040fb', '#7c4dff'],
                soft: ['#e1bee7', '#c5cae9', '#bbdefb', '#b39ddb']
            }
        };

        // 鼓勵訊息列表
        this.encourageMessages = [
            '再試一次！你可以的！',
            '失敗是成功之母！',
            '下次一定更棒！',
            '堅持就是勝利！',
            '每次嘗試都是進步！',
            '繼續加油！',
            '你已經很棒了！',
            '再來一局吧！'
        ];

        // 勝利訊息列表
        this.victoryMessages = [
            '太厲害了！',
            '完美表現！',
            '你是最棒的！',
            '無人能敵！',
            '登峰造極！'
        ];

        this.init();
    }

    init() {
        // 初始化背景效果
        this.createInitialBubbles();
        this.createInitialStars();

        // 持續生成泡泡
        this.bubbleInterval = setInterval(() => this.createBubble(), 3000);

        // 持續生成星星
        this.starInterval = setInterval(() => this.createStar(), 2000);

        // 太空主題流星
        this.meteorInterval = null;

        // 初始化主題切換器
        this.initThemeSwitcher();

        // 載入保存的主題
        this.loadSavedTheme();
    }

    // 初始化主題切換器
    initThemeSwitcher() {
        const themeSwitcher = document.getElementById('theme-switcher');
        if (!themeSwitcher) return;

        const buttons = themeSwitcher.querySelectorAll('.theme-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                this.switchTheme(theme);

                // 更新按鈕狀態
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    // 載入保存的主題
    loadSavedTheme() {
        const savedTheme = localStorage.getItem('tetrisTheme');
        if (savedTheme && ['bubble', 'candy', 'space'].includes(savedTheme)) {
            this.switchTheme(savedTheme);

            // 更新按鈕狀態
            const buttons = document.querySelectorAll('.theme-btn');
            buttons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.theme === savedTheme);
            });
        }
    }

    // 切換主題
    switchTheme(theme) {
        this.currentTheme = theme;
        localStorage.setItem('tetrisTheme', theme);

        // 移除舊主題 class
        document.body.classList.remove('theme-bubble', 'theme-candy', 'theme-space');

        // 添加新主題 class（bubble 是默認主題，不需要 class）
        if (theme !== 'bubble') {
            document.body.classList.add(`theme-${theme}`);
        }

        // 清理並重新創建背景效果
        this.clearBackgroundEffects();
        this.createInitialBubbles();
        this.createInitialStars();

        // 太空主題特殊效果
        if (theme === 'space') {
            this.startMeteorShower();
        } else {
            this.stopMeteorShower();
        }

        // 更新裝飾元素
        this.updateDecorations(theme);

        console.log(`Theme switched to: ${theme}`);
    }

    // 清理背景效果
    clearBackgroundEffects() {
        if (this.backgroundEffects) {
            this.backgroundEffects.innerHTML = '';
        }
        this.bubbleCount = 0;
        this.starCount = 0;
    }

    // 更新裝飾元素
    updateDecorations(theme) {
        const decorations = document.getElementById('decorations');
        if (!decorations) return;

        const emojis = decorations.querySelectorAll('.floating-emoji');
        const emojiSets = {
            bubble: ['⭐', '🌟', '✨', '💫', '🎮', '🎯'],
            candy: ['🍭', '🍬', '🎀', '🌈', '🦄', '💖'],
            space: ['🚀', '🌙', '⭐', '🛸', '🌠', '💫']
        };

        const selectedEmojis = emojiSets[theme] || emojiSets.bubble;
        emojis.forEach((emoji, i) => {
            emoji.textContent = selectedEmojis[i % selectedEmojis.length];
        });
    }

    // 開始流星雨（太空主題）
    startMeteorShower() {
        if (this.meteorInterval) return;
        this.meteorInterval = setInterval(() => {
            if (this.currentTheme === 'space') {
                this.createMeteor();
            }
        }, 4000);
    }

    // 停止流星雨
    stopMeteorShower() {
        if (this.meteorInterval) {
            clearInterval(this.meteorInterval);
            this.meteorInterval = null;
        }
    }

    // 創建流星
    createMeteor() {
        const meteor = document.createElement('div');
        meteor.className = 'meteor';

        const startX = Math.random() * window.innerWidth * 0.7;
        const startY = Math.random() * window.innerHeight * 0.3;

        meteor.style.left = `${startX}px`;
        meteor.style.top = `${startY}px`;

        this.backgroundEffects.appendChild(meteor);

        setTimeout(() => meteor.remove(), 2000);
    }

    // 獲取當前主題顏色
    getColors(type = 'primary') {
        return this.themeColors[this.currentTheme]?.[type] || this.themeColors.bubble[type];
    }

    // 創建初始泡泡
    createInitialBubbles() {
        for (let i = 0; i < 8; i++) {
            setTimeout(() => this.createBubble(), i * 500);
        }
    }

    // 創建初始星星
    createInitialStars() {
        for (let i = 0; i < 20; i++) {
            this.createStar(true);
        }
    }

    // 創建泡泡
    createBubble() {
        if (this.bubbleCount >= this.maxBubbles) return;

        const bubble = document.createElement('div');
        bubble.className = 'bubble';

        const size = Math.random() * 40 + 20; // 20-60px
        const left = Math.random() * 100;
        const duration = Math.random() * 10 + 15; // 15-25s
        const drift = (Math.random() - 0.5) * 100;

        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${left}%`;
        bubble.style.bottom = '-60px';
        bubble.style.animationDuration = `${duration}s`;
        bubble.style.setProperty('--drift', `${drift}px`);

        this.backgroundEffects.appendChild(bubble);
        this.bubbleCount++;

        // 動畫結束後移除
        bubble.addEventListener('animationend', () => {
            bubble.remove();
            this.bubbleCount--;
        });
    }

    // 創建星星
    createStar(isInitial = false) {
        if (!isInitial && this.starCount >= this.maxStars) return;

        const star = document.createElement('div');
        star.className = 'star' + (Math.random() > 0.7 ? ' large' : '');

        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const duration = Math.random() * 3 + 2; // 2-5s
        const delay = isInitial ? Math.random() * 5 : 0;

        star.style.left = `${left}%`;
        star.style.top = `${top}%`;
        star.style.animationDuration = `${duration}s`;
        star.style.animationDelay = `${delay}s`;

        this.backgroundEffects.appendChild(star);
        this.starCount++;

        // 一段時間後移除並重新創建
        if (!isInitial) {
            setTimeout(() => {
                star.remove();
                this.starCount--;
            }, (duration + delay) * 1000 * 3);
        }
    }

    // 創建彩紙效果
    createConfetti(count = 50, colors = null) {
        const confettiColors = colors || this.getColors('confetti');
        const shapes = ['square', 'circle', 'star', 'heart'];

        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                const shape = shapes[Math.floor(Math.random() * shapes.length)];
                confetti.className = `confetti ${shape}`;

                const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
                const left = Math.random() * 100;
                const duration = Math.random() * 2 + 2; // 2-4s
                const delay = Math.random() * 0.5;

                confetti.style.backgroundColor = color;
                confetti.style.left = `${left}%`;
                confetti.style.top = '-20px';
                confetti.style.animationDuration = `${duration}s`;
                confetti.style.animationDelay = `${delay}s`;

                this.confettiContainer.appendChild(confetti);

                // 動畫結束後移除
                setTimeout(() => confetti.remove(), (duration + delay + 0.5) * 1000);
            }, i * 30);
        }
    }

    // 創建煙火效果
    createFirework(x, y, color = null) {
        const colors = this.getColors('primary');
        const fireworkColor = color || colors[Math.floor(Math.random() * colors.length)];

        const particleCount = 20;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'firework-particle';

            const angle = (i / particleCount) * Math.PI * 2;
            const distance = Math.random() * 80 + 40;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;

            particle.style.backgroundColor = fireworkColor;
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            particle.style.setProperty('--tx', `${tx}px`);
            particle.style.setProperty('--ty', `${ty}px`);
            particle.style.boxShadow = `0 0 6px ${fireworkColor}`;

            this.confettiContainer.appendChild(particle);

            setTimeout(() => particle.remove(), 1500);
        }
    }

    // 創建多個煙火
    createFireworks(count = 5) {
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const x = Math.random() * window.innerWidth;
                const y = Math.random() * (window.innerHeight * 0.6);
                this.createFirework(x, y);
            }, i * 300);
        }
    }

    // 創建閃爍星星
    createSparkle(x, y) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.left = `${x}px`;
        sparkle.style.top = `${y}px`;

        // 根據主題設置顏色
        const colors = this.getColors('primary');
        const color = colors[Math.floor(Math.random() * colors.length)];
        sparkle.style.setProperty('--sparkle-color', color);

        this.confettiContainer.appendChild(sparkle);

        setTimeout(() => sparkle.remove(), 800);
    }

    // 創建多個閃爍星星
    createSparkles(centerX, centerY, count = 8) {
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const offsetX = (Math.random() - 0.5) * 200;
                const offsetY = (Math.random() - 0.5) * 200;
                this.createSparkle(centerX + offsetX, centerY + offsetY);
            }, i * 100);
        }
    }

    // 創建彩虹波紋效果
    createRipple(x, y) {
        const ripple = document.createElement('div');
        ripple.className = 'clear-ripple';
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        this.confettiContainer.appendChild(ripple);

        setTimeout(() => ripple.remove(), 800);
    }

    // 創建方塊碎片飛散效果
    createBlockFragments(x, y, color, count = 8) {
        for (let i = 0; i < count; i++) {
            const fragment = document.createElement('div');
            fragment.className = 'block-fragment';

            const angle = (Math.random() * Math.PI * 2);
            const distance = Math.random() * 60 + 30;
            const fx = Math.cos(angle) * distance;
            const fy = Math.sin(angle) * distance - 20; // 偏上
            const fr = Math.random() * 720 - 360;

            fragment.style.backgroundColor = color;
            fragment.style.left = `${x}px`;
            fragment.style.top = `${y}px`;
            fragment.style.setProperty('--fx', `${fx}px`);
            fragment.style.setProperty('--fy', `${fy}px`);
            fragment.style.setProperty('--fr', `${fr}deg`);
            fragment.style.boxShadow = `0 0 4px ${color}`;

            this.confettiContainer.appendChild(fragment);

            setTimeout(() => fragment.remove(), 600);
        }
    }

    // 創建粒子爆炸效果
    createParticleBurst(x, y, color, count = 12) {
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle-burst';

            const angle = (i / count) * Math.PI * 2;
            const distance = Math.random() * 50 + 30;
            const px = Math.cos(angle) * distance;
            const py = Math.sin(angle) * distance;

            particle.style.backgroundColor = color;
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            particle.style.setProperty('--px', `${px}px`);
            particle.style.setProperty('--py', `${py}px`);
            particle.style.boxShadow = `0 0 4px ${color}`;

            this.confettiContainer.appendChild(particle);

            setTimeout(() => particle.remove(), 500);
        }
    }

    // 創建消行光條效果
    createClearFlash(y, width) {
        const flash = document.createElement('div');
        flash.className = 'clear-flash';
        flash.style.top = `${y}px`;
        flash.style.width = `${width}px`;

        this.confettiContainer.appendChild(flash);

        setTimeout(() => flash.remove(), 300);
    }

    // 遊戲結束 - 失敗鼓勵動畫
    showGameOverEncouragement(overlayElement, score) {
        if (!overlayElement) return;

        overlayElement.classList.add('game-over');

        // 添加可愛失敗表情
        const existingEmoji = overlayElement.querySelector('.game-over-emoji');
        if (!existingEmoji) {
            const emoji = document.createElement('div');
            emoji.className = 'game-over-emoji';
            emoji.textContent = this.getRandomSadEmoji();

            const overlayContent = overlayElement.querySelector('#overlay-content');
            if (overlayContent) {
                overlayContent.insertBefore(emoji, overlayContent.firstChild);
            }
        }

        // 添加鼓勵文字
        const existingEncourage = overlayElement.querySelector('.encourage-container');
        if (!existingEncourage) {
            const encourageContainer = document.createElement('div');
            encourageContainer.className = 'encourage-container';

            const encourageText = document.createElement('p');
            encourageText.className = 'encourage-text';
            encourageText.textContent = this.getRandomEncourageMessage();

            encourageContainer.appendChild(encourageText);

            const overlayContent = overlayElement.querySelector('#overlay-content');
            if (overlayContent) {
                const overlayMessage = overlayContent.querySelector('#overlay-message');
                if (overlayMessage) {
                    overlayMessage.parentNode.insertBefore(encourageContainer, overlayMessage.nextSibling);
                }
            }
        }

        // 播放溫柔的彩紙效果
        this.createConfetti(30, this.getColors('soft'));
    }

    // 遊戲結束 - 勝利祝賀動畫
    showVictoryCelebration(overlayElement, isNewRecord = false) {
        if (!overlayElement) return;

        overlayElement.classList.add('victory');

        // 添加勝利表情
        const existingEmoji = overlayElement.querySelector('.victory-emoji');
        if (!existingEmoji) {
            const emoji = document.createElement('div');
            emoji.className = 'victory-emoji';
            emoji.textContent = this.getRandomHappyEmoji();

            const overlayContent = overlayElement.querySelector('#overlay-content');
            if (overlayContent) {
                overlayContent.insertBefore(emoji, overlayContent.firstChild);
            }
        }

        // 如果是新紀錄，添加特殊效果
        if (isNewRecord) {
            const newRecordDiv = document.createElement('div');
            newRecordDiv.className = 'new-record';
            newRecordDiv.textContent = '🏆 新紀錄！🏆';

            const overlayContent = overlayElement.querySelector('#overlay-content');
            if (overlayContent) {
                const emoji = overlayContent.querySelector('.victory-emoji');
                if (emoji) {
                    emoji.parentNode.insertBefore(newRecordDiv, emoji.nextSibling);
                }
            }
        }

        // 播放煙火效果
        this.createFireworks(8);

        // 播放彩紙效果
        setTimeout(() => this.createConfetti(80), 500);

        // 創建閃爍星星
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        this.createSparkles(centerX, centerY, 15);
    }

    // 消行特效增強
    enhancedLineClear(boardElement, clearedRows, clearType) {
        if (!boardElement) return;

        const rect = boardElement.getBoundingClientRect();
        const colors = this.getColors('primary');

        clearedRows.forEach((rowIndex, i) => {
            const y = rect.top + rowIndex * 30 + 15;
            const x = rect.left + rect.width / 2;

            // 創建波紋
            setTimeout(() => {
                this.createRipple(x, y);
            }, i * 50);

            // 創建粒子
            for (let col = 0; col < 10; col++) {
                const particleX = rect.left + col * 30 + 15;
                const color = colors[Math.floor(Math.random() * colors.length)];
                setTimeout(() => {
                    this.createBlockFragments(particleX, y, color, 3);
                }, i * 50 + col * 20);
            }
        });

        // Tetris 特殊效果
        if (clearType === 'tetris') {
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            setTimeout(() => {
                this.createFirework(centerX, centerY, colors[0]);
                this.createSparkles(centerX, centerY, 10);
            }, 200);

            // 屏幕彩虹效果
            boardElement.classList.add('tetris-clear');
            setTimeout(() => {
                boardElement.classList.remove('tetris-clear');
            }, 800);
        }
    }

    // 連擊特效
    comboEffect(comboCount) {
        if (comboCount >= 3) {
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2 - 100;
            this.createSparkles(centerX, centerY, Math.min(comboCount, 10));
        }

        if (comboCount >= 5) {
            this.createConfetti(20);
        }
    }

    // 關卡完成特效
    stageCompleteEffect() {
        this.createFireworks(5);
        this.createConfetti(60);

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 3;
        this.createSparkles(centerX, centerY, 12);
    }

    // 清理 overlay 中的特效元素
    cleanupOverlay(overlayElement) {
        if (!overlayElement) return;

        overlayElement.classList.remove('game-over', 'victory');

        const emoji = overlayElement.querySelector('.game-over-emoji, .victory-emoji');
        if (emoji) emoji.remove();

        const encourage = overlayElement.querySelector('.encourage-container');
        if (encourage) encourage.remove();

        const newRecord = overlayElement.querySelector('.new-record');
        if (newRecord) newRecord.remove();
    }

    // 獲取隨機悲傷表情
    getRandomSadEmoji() {
        const emojis = ['(๑•́ ₃ •̀๑)', '(´;ω;`)', '( ´•̥̥̥ω•̥̥̥` )', '(´;︵;`)', '( ˃̣̣̥⌓˂̣̣̥ )', '(｡•́︿•̀｡)'];
        return emojis[Math.floor(Math.random() * emojis.length)];
    }

    // 獲取隨機開心表情
    getRandomHappyEmoji() {
        const emojis = ['(ﾉ◕ヮ◕)ﾉ*:・ﾟ✧', '٩(◕‿◕｡)۶', '(●´∀｀●)', '(*≧▽≦)', '(◕‿◕✿)', '\\(^ω^\\)'];
        return emojis[Math.floor(Math.random() * emojis.length)];
    }

    // 獲取隨機鼓勵訊息
    getRandomEncourageMessage() {
        return this.encourageMessages[Math.floor(Math.random() * this.encourageMessages.length)];
    }

    // 獲取隨機勝利訊息
    getRandomVictoryMessage() {
        return this.victoryMessages[Math.floor(Math.random() * this.victoryMessages.length)];
    }

    // 獲取當前主題名稱
    getCurrentThemeName() {
        const names = {
            bubble: '夢幻泡泡風',
            candy: '霓虹糖果風',
            space: '太空星際風'
        };
        return names[this.currentTheme] || '夢幻泡泡風';
    }
}

// 全局實例
window.effectsManager = null;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    window.effectsManager = new EffectsManager();
    console.log('Effects Manager initialized - Theme System Ready');
});
