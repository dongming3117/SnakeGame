class Snake {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 400;
        this.canvas.height = 400;
        this.gridSize = 20;
        this.snake = [{x: 5, y: 5}];
        this.direction = 'right';
        this.food = this.generateFood();
        this.score = 0;
        this.gameLoop = null;
        this.speed = 150;
        this.nextDirection = 'right';  // 添加方向缓冲
        
        // 添加新属性
        this.redFoodCount = 0;  // 记录吃到的红色食物数量
        this.yellowFood = null; // 黄色食物位置
        this.yellowFoodTimer = null; // 黄色食物倒计时
        this.yellowFoodValue = 0; // 黄色食物当前分值
        this.yellowFoodOpacity = 1; // 添加透明度属性
        this.highScores = this.loadHighScores();
        
        this.isPaused = false;
        this.isGameRunning = false;

        // 更新按钮引用
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resumeBtn = document.getElementById('resumeBtn');
        this.endBtn = document.getElementById('endBtn');
        
        // 更新事件监听
        this.startBtn.addEventListener('click', () => this.startGame());
        this.pauseBtn.addEventListener('click', () => this.pauseGame());
        this.resumeBtn.addEventListener('click', () => this.resumeGame());
        this.endBtn.addEventListener('click', () => this.endGame());
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));  // 添加键盘事件监听
        
        // 添加难度选择监听
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', () => this.setDifficulty(btn));
        });
        
        // 设置默认难度
        this.setDifficulty(document.querySelector('[data-speed="150"]'));
    }

    generateFood() {
        let newFood;
        let isValidPosition;
        
        do {
            newFood = {
                x: Math.floor(Math.random() * (this.canvas.width / this.gridSize)),
                y: Math.floor(Math.random() * (this.canvas.height / this.gridSize))
            };
            
            // 检查是否与蛇的任何部分重叠
            isValidPosition = !this.snake.some(segment => 
                segment.x === newFood.x && segment.y === newFood.y
            );
            
            // 检查是否与黄色食物重叠
            if (this.yellowFood) {
                isValidPosition = isValidPosition && 
                    !(newFood.x === this.yellowFood.x && newFood.y === this.yellowFood.y);
            }
            
        } while (!isValidPosition);
        
        return newFood;
    }

    generateYellowFood() {
        let newFood;
        let isValidPosition;
        
        do {
            newFood = {
                x: Math.floor(Math.random() * (this.canvas.width / this.gridSize)),
                y: Math.floor(Math.random() * (this.canvas.height / this.gridSize))
            };
            
            // 检查是否与蛇的任何部分重叠
            isValidPosition = !this.snake.some(segment => 
                segment.x === newFood.x && segment.y === newFood.y
            );
            
            // 检查是否与红色食物重叠
            isValidPosition = isValidPosition && 
                !(newFood.x === this.food.x && newFood.y === this.food.y);
            
        } while (!isValidPosition);
        
        return newFood;
    }

    startYellowFoodTimer() {
        this.yellowFoodValue = 7;
        this.yellowFoodOpacity = 1;
        if (this.yellowFoodTimer) clearInterval(this.yellowFoodTimer);
        
        this.yellowFoodTimer = setInterval(() => {
            this.yellowFoodValue--;
            
            // 当倒计时到4秒及以下时，开始降低透明度
            if (this.yellowFoodValue <= 4) {
                this.yellowFoodOpacity = this.yellowFoodValue / 4;
            }
            
            if (this.yellowFoodValue <= 0) {
                this.clearYellowFood();
            }
        }, 1000);
    }

    clearYellowFood() {
        this.yellowFood = null;
        if (this.yellowFoodTimer) clearInterval(this.yellowFoodTimer);
        this.yellowFoodTimer = null;
        this.yellowFoodOpacity = 1;
    }

    draw() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 画蛇身
        this.ctx.fillStyle = '#4CAF50';
        this.snake.forEach((segment, index) => {
            this.ctx.fillRect(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                this.gridSize - 2,
                this.gridSize - 2
            );

            // 为蛇头添加眼睛
            if (index === 0) {
                this.ctx.fillStyle = '#000000';
                const eyeSize = 4;
                const eyeOffset = 4;
                
                // 根据方向调整眼睛位置
                switch(this.direction) {
                    case 'right':
                        // 右眼
                        this.ctx.fillRect(
                            (segment.x * this.gridSize) + this.gridSize - 6,
                            (segment.y * this.gridSize) + eyeOffset,
                            eyeSize,
                            eyeSize
                        );
                        // 左眼
                        this.ctx.fillRect(
                            (segment.x * this.gridSize) + this.gridSize - 6,
                            (segment.y * this.gridSize) + this.gridSize - eyeOffset - eyeSize,
                            eyeSize,
                            eyeSize
                        );
                        break;
                    case 'left':
                        // 右眼
                        this.ctx.fillRect(
                            (segment.x * this.gridSize) + 2,
                            (segment.y * this.gridSize) + eyeOffset,
                            eyeSize,
                            eyeSize
                        );
                        // 左眼
                        this.ctx.fillRect(
                            (segment.x * this.gridSize) + 2,
                            (segment.y * this.gridSize) + this.gridSize - eyeOffset - eyeSize,
                            eyeSize,
                            eyeSize
                        );
                        break;
                    case 'up':
                        // 右眼
                        this.ctx.fillRect(
                            (segment.x * this.gridSize) + eyeOffset,
                            (segment.y * this.gridSize) + 2,
                            eyeSize,
                            eyeSize
                        );
                        // 左眼
                        this.ctx.fillRect(
                            (segment.x * this.gridSize) + this.gridSize - eyeOffset - eyeSize,
                            (segment.y * this.gridSize) + 2,
                            eyeSize,
                            eyeSize
                        );
                        break;
                    case 'down':
                        // 右眼
                        this.ctx.fillRect(
                            (segment.x * this.gridSize) + eyeOffset,
                            (segment.y * this.gridSize) + this.gridSize - 6,
                            eyeSize,
                            eyeSize
                        );
                        // 左眼
                        this.ctx.fillRect(
                            (segment.x * this.gridSize) + this.gridSize - eyeOffset - eyeSize,
                            (segment.y * this.gridSize) + this.gridSize - 6,
                            eyeSize,
                            eyeSize
                        );
                        break;
                }
                this.ctx.fillStyle = '#4CAF50';
            }
        });

        // 画红色食物
        this.ctx.fillStyle = '#FF0000';
        this.ctx.fillRect(
            this.food.x * this.gridSize,
            this.food.y * this.gridSize,
            this.gridSize - 2,
            this.gridSize - 2
        );

        // 画黄色食物
        if (this.yellowFood) {
            this.ctx.fillStyle = `rgba(255, 215, 0, ${this.yellowFoodOpacity})`;
            this.ctx.fillRect(
                this.yellowFood.x * this.gridSize,
                this.yellowFood.y * this.gridSize,
                this.gridSize - 2,
                this.gridSize - 2
            );
        }
    }

    move() {
        const head = {...this.snake[0]};
        const gridWidth = this.canvas.width / this.gridSize;
        const gridHeight = this.canvas.height / this.gridSize;

        // 在移动时更新方向
        if (this.canChangeDirection(this.direction, this.nextDirection)) {
            this.direction = this.nextDirection;
        }

        switch(this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        // 处理边界穿越
        if (head.x < 0) {
            head.x = gridWidth - 1;
        } else if (head.x >= gridWidth) {
            head.x = 0;
        }

        if (head.y < 0) {
            head.y = gridHeight - 1;
        } else if (head.y >= gridHeight) {
            head.y = 0;
        }

        // 检查是否撞到自己
        if (this.checkCollision(head)) {
            this.gameOver();
            return;
        }

        // 检查是否吃到食物
        const eatsFood = head.x === this.food.x && head.y === this.food.y;
        const eatsYellowFood = this.yellowFood && head.x === this.yellowFood.x && head.y === this.yellowFood.y;

        // 先将新头部添加到蛇身
        this.snake.unshift(head);

        if (eatsFood) {
            // 吃到红色食物
            // 不删除尾部，这样蛇就会变长
            this.food = this.generateFood();
            this.score += 1;
            this.redFoodCount++;
            
            // 每吃到5个红色食物，生成一个黄色食物
            if (this.redFoodCount >= 5) {
                this.redFoodCount = 0;
                this.yellowFood = this.generateYellowFood();
                this.startYellowFoodTimer();
            }
            
            document.getElementById('scoreValue').textContent = this.score;
        } else if (eatsYellowFood) {
            // 吃到黄色食物
            // 不删除尾部，这样蛇就会变长
            this.score += this.yellowFoodValue;
            document.getElementById('scoreValue').textContent = this.score;
            this.clearYellowFood();
        } else {
            // 没吃到食物就删除尾部
            this.snake.pop();
        }

        this.draw();
    }

    checkCollision(head) {
        // 只检查是否撞到自己的身体
        return this.snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y);
    }

    canChangeDirection(currentDir, newDir) {
        return !(
            (currentDir === 'up' && newDir === 'down') ||
            (currentDir === 'down' && newDir === 'up') ||
            (currentDir === 'left' && newDir === 'right') ||
            (currentDir === 'right' && newDir === 'left')
        );
    }

    handleKeyPress(e) {
        // 处理空格键暂停/继续
        if (e.key === ' ' || e.code === 'Space') {
            e.preventDefault(); // 阻止空格键的默认滚动行为
            if (this.isGameRunning) {
                if (this.isPaused) {
                    this.resumeGame();
                } else {
                    this.pauseGame();
                }
            }
            return;
        }

        // 如果游戏暂停或未开始，不处理方向键
        if (!this.isGameRunning || this.isPaused) {
            return;
        }

        // 阻止方向键的默认滚动行为
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
        }

        switch(e.key) {
            case 'ArrowUp':
                this.nextDirection = 'up';
                break;
            case 'ArrowDown':
                this.nextDirection = 'down';
                break;
            case 'ArrowLeft':
                this.nextDirection = 'left';
                break;
            case 'ArrowRight':
                this.nextDirection = 'right';
                break;
        }
    }

    setDifficulty(btn) {
        if (this.isGameRunning) {
            alert('请先结束当前游戏再切换难度！');
            return;
        }

        // 移除其他按钮的活跃状态
        document.querySelectorAll('.difficulty-btn').forEach(b => 
            b.classList.remove('active'));
        
        // 设置当前按钮为活跃状态
        btn.classList.add('active');
        
        // 更新游戏速度
        this.speed = parseInt(btn.dataset.speed);
        
        // 如果游戏正在运行，重启游戏以应用新速度
        if (this.gameLoop) {
            this.startGame();
        }
    }

    loadHighScores() {
        // 为每个难度级别分别加载记分榜
        const allScores = {
            '200': [], // 初级
            '150': [], // 中级
            '100': []  // 高级
        };
        
        // 从本地存储加载所有难度的记分榜
        Object.keys(allScores).forEach(speed => {
            const scores = localStorage.getItem(`snakeHighScores_${speed}`);
            allScores[speed] = scores ? JSON.parse(scores) : [];
        });
        
        return allScores;
    }

    saveHighScore(score) {
        // 获取当前难度的记分榜
        const currentSpeedScores = this.highScores[this.speed];
        
        // 添加新分数
        currentSpeedScores.push({
            score: score,
            date: new Date().toLocaleDateString()
        });
        
        // 按分数排序
        currentSpeedScores.sort((a, b) => b.score - a.score);
        
        // 只保留前5个最高分
        this.highScores[this.speed] = currentSpeedScores.slice(0, 5);
        
        // 保存到本地存储
        localStorage.setItem(
            `snakeHighScores_${this.speed}`, 
            JSON.stringify(this.highScores[this.speed])
        );
        
        // 更新显示
        this.updateHighScoresDisplay();
    }

    updateHighScoresDisplay() {
        const container = document.getElementById('highScores');
        const difficultyNames = {
            '200': '初级',
            '150': '中级',
            '100': '高级'
        };
        
        // 生成所有难度的记分榜HTML
        container.innerHTML = Object.entries(this.highScores).map(([speed, scores]) => `
            <div class="difficulty-scores">
                <div class="scoreboard-header">
                    <h4>${difficultyNames[speed]}记分榜</h4>
                    <button class="reset-btn" data-speed="${speed}">重置</button>
                </div>
                ${scores.length > 0 ? 
                    scores.map((score, index) => `
                        <div class="score-item">
                            ${index + 1}. ${score.score}分 - ${score.date}
                        </div>
                    `).join('') 
                    : 
                    '<div class="score-item">暂无记录</div>'
                }
            </div>
        `).join('');

        // 为所有重置按钮添加点击事件
        document.querySelectorAll('.reset-btn').forEach(btn => {
            btn.addEventListener('click', () => this.resetHighScores(btn.dataset.speed));
        });
    }

    resetHighScores(speed) {
        if (confirm(`确定要重置${speed === '200' ? '初级' : speed === '150' ? '中级' : '高级'}难度的记分榜吗？`)) {
            // 清空指定难度的记分榜
            this.highScores[speed] = [];
            // 更新本地存储
            localStorage.setItem(`snakeHighScores_${speed}`, JSON.stringify([]));
            // 更新显示
            this.updateHighScoresDisplay();
        }
    }

    startGame() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }
        this.isGameRunning = true;
        this.isPaused = false;
        this.reset();
        this.gameLoop = setInterval(() => this.move(), this.speed);
        this.updateHighScoresDisplay();
        
        // 更新按钮状态
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        this.endBtn.disabled = false;
        this.resumeBtn.style.display = 'none';
        
        // 禁用难度选择按钮
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.disabled = true;
        });
    }

    pauseGame() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        this.isPaused = true;
        
        // 更新按钮状态
        this.pauseBtn.disabled = true;
        this.resumeBtn.style.display = 'inline-block';
    }

    resumeGame() {
        this.gameLoop = setInterval(() => this.move(), this.speed);
        this.isPaused = false;
        
        // 更新按钮状态
        this.pauseBtn.disabled = false;
        this.resumeBtn.style.display = 'none';
    }

    endGame() {
        if (confirm('确定要结束当前游戏吗？')) {
            this.isGameRunning = false;
            if (this.gameLoop) {
                clearInterval(this.gameLoop);
                this.gameLoop = null;
            }
            
            // 保存分数
            if (this.score > 0) {
                this.saveHighScore(this.score);
            }
            
            this.reset();
            
            // 更新按钮状态
            this.startBtn.disabled = false;
            this.pauseBtn.disabled = true;
            this.endBtn.disabled = true;
            this.resumeBtn.style.display = 'none';
            
            // 启用难度选择按钮
            document.querySelectorAll('.difficulty-btn').forEach(btn => {
                btn.disabled = false;
            });
        }
    }

    gameOver() {
        this.isGameRunning = false;
        clearInterval(this.gameLoop);
        this.clearYellowFood();
        
        if (this.score > 0) {
            this.saveHighScore(this.score);
        }
        
        alert(`游戏结束！得分：${this.score}`);
        
        // 更新按钮状态
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.endBtn.disabled = true;
        this.resumeBtn.style.display = 'none';
        
        // 启用难度选择按钮
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.disabled = false;
        });
        
        this.reset();
    }

    reset() {
        // 设置蛇的初始长度为3，从左到右排列
        this.snake = [
            {x: 5, y: 5},  // 蛇头
            {x: 4, y: 5},  // 第二节
            {x: 3, y: 5}   // 第三节
        ];
        this.direction = 'right';
        this.food = this.generateFood();
        this.score = 0;
        document.getElementById('scoreValue').textContent = this.score;
        this.redFoodCount = 0;
        this.clearYellowFood();
    }
}

// 初始化游戏
window.onload = () => {
    new Snake();
}; 