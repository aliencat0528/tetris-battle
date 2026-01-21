/**
 * Tetris 主題特效系統
 * Theme Effects System with Distinct Visual Styles
 */

class EffectsManager {
    constructor() {
        this.backgroundEffects = document.getElementById('background-effects');
        this.confettiContainer = document.getElementById('confetti-container');
        this.bubbleCount = 0;
        this.maxBubbles = 35;  // 大量泡泡
        this.starCount = 0;
        this.maxStars = 40;

        // 當前主題
        this.currentTheme = 'bubble';

        // 主題配色方案 - 夢幻淡色系
        this.themeColors = {
            bubble: {
                // 夢幻淡色系：淡粉、淡藍、淡黃、淡橘、白、淡紫
                primary: ['#ffb6c1', '#87ceeb', '#fffacd', '#ffdab9', '#ffffff', '#e6e6fa'],
                confetti: ['#ffb6c1', '#87ceeb', '#fffacd', '#ffdab9', '#ffffff', '#e6e6fa', '#f0fff0'],
                soft: ['#fff0f5', '#f0f8ff', '#fffaf0', '#fff5ee', '#f8f8ff', '#faf0e6']
            },
            candy: {
                // 粉、紫、黃
                primary: ['#ff96c8', '#c896e8', '#ffe664', '#ffb6dc'],
                confetti: ['#ff96c8', '#c896e8', '#ffe664', '#ffb6dc', '#dda0dd'],
                soft: ['#ffe4ec', '#e8d4f0', '#fff8dc', '#ffeef4']
            },
            space: {
                primary: ['#8a2be2', '#4169e1', '#1e90ff', '#9370db'],
                confetti: ['#8a2be2', '#4169e1', '#1e90ff', '#e040fb', '#7c4dff'],
                soft: ['#e1bee7', '#c5cae9', '#bbdefb', '#b39ddb']
            }
        };

        // 泡泡尺寸設定（再度放大）
        this.bubbleSizes = {
            bubble: { min: 80, max: 180 },  // 夢幻泡泡 - 超大泡泡
            candy: { min: 60, max: 140 },   // 霓虹糖果 - 大糖果
            space: { min: 50, max: 120 }    // 太空 - 大星球效果
        };

        // 鼓勵訊息列表（含換行）
        this.encourageMessages = [
            '再試一次！<br>你可以的！',
            '失敗是成功之母！<br>繼續加油！',
            '下次一定更棒！<br>別放棄！',
            '堅持就是勝利！<br>再來一局！',
            '每次嘗試都是進步！<br>你很棒！',
            '繼續加油！<br>勝利在望！',
            '你已經很棒了！<br>再挑戰一次！',
            '再來一局吧！<br>這次會更好！'
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

        // 持續生成泡泡（非常頻繁）
        this.bubbleInterval = setInterval(() => this.createBubble(), 800);

        // 持續生成星星
        this.starInterval = setInterval(() => this.createStar(), 1500);

        // 太空主題流星
        this.meteorInterval = null;

        // 泡泡主題水波紋
        this.rippleInterval = null;

        // 糖果主題星星
        this.candyStarInterval = null;

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
            const buttons = document.querySelectorAll('#theme-switcher .theme-btn');
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

        // 添加新主題 class
        document.body.classList.add(`theme-${theme}`);

        // 清理並重新創建背景效果
        this.clearBackgroundEffects();
        this.createInitialBubbles();
        this.createInitialStars();

        // 停止所有主題特有效果
        this.stopAllThemeEffects();

        // 根據主題啟動特有效果
        switch (theme) {
            case 'bubble':
                this.startWaterRipples();
                break;
            case 'candy':
                this.startCandyStars();
                break;
            case 'space':
                this.startMeteorShower();
                break;
        }

        console.log(`Theme switched to: ${theme}`);
    }

    // 停止所有主題特有效果
    stopAllThemeEffects() {
        if (this.meteorInterval) {
            clearInterval(this.meteorInterval);
            this.meteorInterval = null;
        }
        if (this.rippleInterval) {
            clearInterval(this.rippleInterval);
            this.rippleInterval = null;
        }
        if (this.candyStarInterval) {
            clearInterval(this.candyStarInterval);
            this.candyStarInterval = null;
        }
    }

    // 清理背景效果
    clearBackgroundEffects() {
        if (this.backgroundEffects) {
            this.backgroundEffects.innerHTML = '';
        }
        this.bubbleCount = 0;
        this.starCount = 0;
    }

    // 開始水波紋效果（泡泡主題）
    startWaterRipples() {
        if (this.rippleInterval) return;

        const createRipple = () => {
            if (this.currentTheme !== 'bubble') return;

            const ripple = document.createElement('div');
            ripple.className = 'water-ripple';

            const x = Math.random() * window.innerWidth;
            const y = window.innerHeight - Math.random() * 200;

            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;

            this.backgroundEffects.appendChild(ripple);

            setTimeout(() => ripple.remove(), 4000);
        };

        this.rippleInterval = setInterval(createRipple, 3000);
        createRipple(); // 立即創建一個
    }

    // 開始糖果星星效果
    startCandyStars() {
        if (this.candyStarInterval) return;

        const createCandyStar = () => {
            if (this.currentTheme !== 'candy') return;

            const star = document.createElement('div');
            star.className = 'candy-star';

            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const size = Math.random() * 15 + 15;
            const delay = Math.random() * 2;

            star.style.left = `${x}%`;
            star.style.top = `${y}%`;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.animationDelay = `${delay}s`;

            this.backgroundEffects.appendChild(star);

            setTimeout(() => star.remove(), 12000);
        };

        this.candyStarInterval = setInterval(createCandyStar, 2000);

        // 創建初始糖果星星
        for (let i = 0; i < 5; i++) {
            setTimeout(createCandyStar, i * 400);
        }
    }

    // 開始流星雨（太空主題）
    startMeteorShower() {
        if (this.meteorInterval) return;

        const createMeteor = () => {
            if (this.currentTheme !== 'space') return;

            const meteor = document.createElement('div');
            meteor.className = 'meteor';

            const startX = Math.random() * window.innerWidth * 0.8;
            const startY = Math.random() * window.innerHeight * 0.3 - 100;

            meteor.style.left = `${startX}px`;
            meteor.style.top = `${startY}px`;

            this.backgroundEffects.appendChild(meteor);

            setTimeout(() => meteor.remove(), 2500);
        };

        this.meteorInterval = setInterval(createMeteor, 2500);

        // 立即創建一個
        createMeteor();
    }

    // 獲取當前主題顏色
    getColors(type = 'primary') {
        return this.themeColors[this.currentTheme]?.[type] || this.themeColors.bubble[type];
    }

    // 創建初始泡泡（大量初始泡泡）
    createInitialBubbles() {
        for (let i = 0; i < 20; i++) {
            setTimeout(() => this.createBubble(), i * 200);
        }
    }

    // 創建初始星星
    createInitialStars() {
        for (let i = 0; i < 25; i++) {
            this.createStar(true);
        }
    }

    // 創建泡泡（放大版）
    createBubble() {
        if (this.bubbleCount >= this.maxBubbles) return;

        const bubble = document.createElement('div');
        bubble.className = 'bubble';

        // 根據主題獲取尺寸
        const sizeConfig = this.bubbleSizes[this.currentTheme] || this.bubbleSizes.bubble;
        const size = Math.random() * (sizeConfig.max - sizeConfig.min) + sizeConfig.min;

        const left = Math.random() * 100;
        const duration = Math.random() * 12 + 18; // 18-30s (更慢，更明顯)
        const drift = (Math.random() - 0.5) * 150;

        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${left}%`;
        bubble.style.bottom = '-150px';
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
        star.className = 'star' + (Math.random() > 0.75 ? ' large' : '');

        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const duration = Math.random() * 3 + 2;
        const delay = isInitial ? Math.random() * 5 : 0;

        star.style.left = `${left}%`;
        star.style.top = `${top}%`;
        star.style.animationDuration = `${duration}s`;
        star.style.animationDelay = `${delay}s`;

        this.backgroundEffects.appendChild(star);
        this.starCount++;

        if (!isInitial) {
            setTimeout(() => {
                star.remove();
                this.starCount--;
            }, (duration + delay) * 1000 * 3);
        }
    }

    // 創建彩紙效果（放大版）
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
                const duration = Math.random() * 2.5 + 2.5;
                const delay = Math.random() * 0.5;

                confetti.style.backgroundColor = color;
                confetti.style.left = `${left}%`;
                confetti.style.top = '-30px';
                confetti.style.animationDuration = `${duration}s`;
                confetti.style.animationDelay = `${delay}s`;

                this.confettiContainer.appendChild(confetti);

                setTimeout(() => confetti.remove(), (duration + delay + 0.5) * 1000);
            }, i * 25);
        }
    }

    // 創建煙火效果（放大版）
    createFirework(x, y, color = null) {
        const colors = this.getColors('primary');
        const fireworkColor = color || colors[Math.floor(Math.random() * colors.length)];

        const particleCount = 24;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'firework-particle';

            const angle = (i / particleCount) * Math.PI * 2;
            const distance = Math.random() * 100 + 60;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;

            particle.style.backgroundColor = fireworkColor;
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            particle.style.setProperty('--tx', `${tx}px`);
            particle.style.setProperty('--ty', `${ty}px`);
            particle.style.boxShadow = `0 0 8px ${fireworkColor}`;

            this.confettiContainer.appendChild(particle);

            setTimeout(() => particle.remove(), 1500);
        }
    }

    // 創建多個煙火
    createFireworks(count = 5) {
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const x = Math.random() * window.innerWidth;
                const y = Math.random() * (window.innerHeight * 0.5);
                this.createFirework(x, y);
            }, i * 350);
        }
    }

    // 創建閃爍星星（放大版）
    createSparkle(x, y) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.left = `${x}px`;
        sparkle.style.top = `${y}px`;

        const colors = this.getColors('primary');
        const color = colors[Math.floor(Math.random() * colors.length)];
        sparkle.style.setProperty('--sparkle-color', color);

        this.confettiContainer.appendChild(sparkle);

        setTimeout(() => sparkle.remove(), 1000);
    }

    // 創建多個閃爍星星
    createSparkles(centerX, centerY, count = 10) {
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const offsetX = (Math.random() - 0.5) * 250;
                const offsetY = (Math.random() - 0.5) * 250;
                this.createSparkle(centerX + offsetX, centerY + offsetY);
            }, i * 80);
        }
    }

    // 創建彩虹波紋效果（放大版）
    createRipple(x, y) {
        const ripple = document.createElement('div');
        ripple.className = 'clear-ripple';
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        this.confettiContainer.appendChild(ripple);

        setTimeout(() => ripple.remove(), 1000);
    }

    // 創建方塊碎片飛散效果（放大版）
    createBlockFragments(x, y, color, count = 10) {
        for (let i = 0; i < count; i++) {
            const fragment = document.createElement('div');
            fragment.className = 'block-fragment';

            const angle = (Math.random() * Math.PI * 2);
            const distance = Math.random() * 80 + 40;
            const fx = Math.cos(angle) * distance;
            const fy = Math.sin(angle) * distance - 30;
            const fr = Math.random() * 1080 - 540;

            fragment.style.backgroundColor = color;
            fragment.style.left = `${x}px`;
            fragment.style.top = `${y}px`;
            fragment.style.setProperty('--fx', `${fx}px`);
            fragment.style.setProperty('--fy', `${fy}px`);
            fragment.style.setProperty('--fr', `${fr}deg`);
            fragment.style.boxShadow = `0 0 6px ${color}`;

            this.confettiContainer.appendChild(fragment);

            setTimeout(() => fragment.remove(), 800);
        }
    }

    // 創建粒子爆炸效果（放大版）
    createParticleBurst(x, y, color, count = 16) {
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle-burst';

            const angle = (i / count) * Math.PI * 2;
            const distance = Math.random() * 70 + 40;
            const px = Math.cos(angle) * distance;
            const py = Math.sin(angle) * distance;

            particle.style.backgroundColor = color;
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            particle.style.setProperty('--px', `${px}px`);
            particle.style.setProperty('--py', `${py}px`);
            particle.style.boxShadow = `0 0 6px ${color}`;

            this.confettiContainer.appendChild(particle);

            setTimeout(() => particle.remove(), 700);
        }
    }

    // 遊戲結束 - 失敗鼓勵動畫
    showGameOverEncouragement(overlayElement, score) {
        if (!overlayElement) return;

        overlayElement.classList.add('game-over');

        // 添加鼓勵文字
        const existingEncourage = overlayElement.querySelector('.encourage-container');
        if (!existingEncourage) {
            const encourageContainer = document.createElement('div');
            encourageContainer.className = 'encourage-container';

            const encourageText = document.createElement('p');
            encourageText.className = 'encourage-text';
            encourageText.innerHTML = this.getRandomEncourageMessage();

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
        this.createConfetti(40, this.getColors('soft'));
    }

    // 遊戲結束 - 勝利祝賀動畫
    showVictoryCelebration(overlayElement, isNewRecord = false) {
        if (!overlayElement) return;

        overlayElement.classList.add('victory');

        // 如果是新紀錄，添加特殊效果
        if (isNewRecord) {
            const existingRecord = overlayElement.querySelector('.new-record');
            if (!existingRecord) {
                const newRecordDiv = document.createElement('div');
                newRecordDiv.className = 'new-record';
                newRecordDiv.textContent = '新紀錄！';

                const overlayContent = overlayElement.querySelector('#overlay-content');
                if (overlayContent) {
                    overlayContent.insertBefore(newRecordDiv, overlayContent.firstChild);
                }
            }
        }

        // 播放煙火效果
        this.createFireworks(10);

        // 播放彩紙效果
        setTimeout(() => this.createConfetti(100), 400);

        // 創建閃爍星星
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        this.createSparkles(centerX, centerY, 20);
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
            }, i * 60);

            // 創建粒子
            for (let col = 0; col < 10; col++) {
                const particleX = rect.left + col * 30 + 15;
                const color = colors[Math.floor(Math.random() * colors.length)];
                setTimeout(() => {
                    this.createBlockFragments(particleX, y, color, 4);
                }, i * 60 + col * 25);
            }
        });

        // Tetris 特殊效果
        if (clearType === 'tetris') {
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            setTimeout(() => {
                this.createFirework(centerX, centerY, colors[0]);
                this.createFirework(centerX - 50, centerY - 50, colors[1]);
                this.createFirework(centerX + 50, centerY - 50, colors[2]);
                this.createSparkles(centerX, centerY, 15);
            }, 150);

            boardElement.classList.add('tetris-clear');
            setTimeout(() => {
                boardElement.classList.remove('tetris-clear');
            }, 1000);
        }
    }

    // 連擊特效
    comboEffect(comboCount) {
        if (comboCount >= 3) {
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2 - 100;
            this.createSparkles(centerX, centerY, Math.min(comboCount * 2, 15));
        }

        if (comboCount >= 5) {
            this.createConfetti(25);
        }

        if (comboCount >= 8) {
            this.createFireworks(3);
        }
    }

    // 關卡完成特效
    stageCompleteEffect() {
        this.createFireworks(7);
        this.createConfetti(80);

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 3;
        this.createSparkles(centerX, centerY, 18);
    }

    // 清理 overlay 中的特效元素
    cleanupOverlay(overlayElement) {
        if (!overlayElement) return;

        overlayElement.classList.remove('game-over', 'victory');

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
            bubble: '夢幻泡泡',
            candy: '霓虹糖果',
            space: '星際太空'
        };
        return names[this.currentTheme] || '夢幻泡泡';
    }
}

// 全局實例
window.effectsManager = null;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    window.effectsManager = new EffectsManager();
    console.log('Effects Manager initialized - Theme System Ready');
});
