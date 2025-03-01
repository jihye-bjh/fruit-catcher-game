// 게임 변수 초기화
let score = 0;
let gameActive = false;
let timeLeft = 60;
let playerX = 310;
const playerSpeed = 10;
const player = document.getElementById('player');
const gameArea = document.getElementById('game-area');
const scoreDisplay = document.getElementById('score');
const timeDisplay = document.getElementById('time');
const finalScoreDisplay = document.getElementById('final-score');
const gameOverScreen = document.getElementById('game-over');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
let gameInterval;
let timerInterval;
const keys = {};
const fruitTypes = ['apple', 'banana', 'orange', 'strawberry', 'golden'];
const fruitScores = {
    'apple': 10,
    'banana': 15,
    'orange': 20,
    'strawberry': 25,
    'golden': 50
};
const fruitSpeeds = {
    'apple': 3,
    'banana': 4,
    'orange': 5,
    'strawberry': 6,
    'golden': 7
};

// 키보드 이벤트 리스너
window.addEventListener('keydown', function(e) {
    keys[e.key] = true;
});

window.addEventListener('keyup', function(e) {
    keys[e.key] = false;
});

// 게임 시작 버튼 이벤트 리스너
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);

// 게임 시작 함수
function startGame() {
    // 게임 초기화
    score = 0;
    timeLeft = 60;
    playerX = 310;
    player.style.left = playerX + 'px';
    scoreDisplay.textContent = score;
    timeDisplay.textContent = timeLeft;
    
    // 이전 과일 제거
    const fruits = document.querySelectorAll('.fruit');
    fruits.forEach(fruit => fruit.remove());
    
    // 게임 오버 화면 숨기기
    gameOverScreen.classList.add('hidden');
    
    // 게임 활성화
    gameActive = true;
    
    // 과일 생성 및 게임 루프 시작
    gameInterval = setInterval(createFruit, 1000);
    timerInterval = setInterval(updateTimer, 1000);
    
    // 게임 루프 시작
    requestAnimationFrame(gameLoop);
    
    // 시작 버튼 비활성화
    startButton.disabled = true;
}

// 타이머 업데이트 함수
function updateTimer() {
    timeLeft--;
    timeDisplay.textContent = timeLeft;
    
    if (timeLeft <= 0) {
        endGame();
    }
}

// 게임 종료 함수
function endGame() {
    gameActive = false;
    clearInterval(gameInterval);
    clearInterval(timerInterval);
    finalScoreDisplay.textContent = score;
    gameOverScreen.classList.remove('hidden');
    startButton.disabled = false;
}

// 과일 생성 함수
function createFruit() {
    if (!gameActive) return;
    
    const fruit = document.createElement('div');
    
    // 랜덤 과일 타입 선택 (황금 과일은 10% 확률)
    let fruitType;
    if (Math.random() < 0.1) {
        fruitType = 'golden';
    } else {
        fruitType = fruitTypes[Math.floor(Math.random() * (fruitTypes.length - 1))];
    }
    
    fruit.classList.add('fruit', fruitType);
    
    // 랜덤 위치 설정 (게임 영역 내 X좌표)
    const x = Math.floor(Math.random() * (gameArea.offsetWidth - 40));
    fruit.style.left = x + 'px';
    fruit.style.top = '-40px';  // 화면 위에서 시작
    
    // 과일 속도 설정
    const speed = fruitSpeeds[fruitType];
    fruit.dataset.speed = speed;
    fruit.dataset.type = fruitType;
    
    gameArea.appendChild(fruit);
}

// 과일 이동 함수
function moveFruits() {
    const fruits = document.querySelectorAll('.fruit');
    
    fruits.forEach(fruit => {
        const speed = parseInt(fruit.dataset.speed);
        const currentTop = parseInt(fruit.style.top) || -40;
        fruit.style.top = (currentTop + speed) + 'px';
        
        // 화면 밖으로 나간 과일 제거
        if (currentTop > gameArea.offsetHeight) {
            fruit.remove();
        }
    });
}

// 충돌 감지 함수
function checkCollisions() {
    if (!gameActive) return;
    
    const fruits = document.querySelectorAll('.fruit');
    const playerRect = player.getBoundingClientRect();
    
    fruits.forEach(fruit => {
        const fruitRect = fruit.getBoundingClientRect();
        
        if (!(playerRect.right < fruitRect.left || 
              playerRect.left > fruitRect.right || 
              playerRect.bottom < fruitRect.top || 
              playerRect.top > fruitRect.bottom)) {
            
            // 과일 타입 확인 및 점수 추가
            const fruitType = fruit.dataset.type;
            const points = fruitScores[fruitType];
            
            // 점수 효과 표시
            showScoreEffect(fruitRect.left, fruitRect.top, points);
            
            // 점수 업데이트
            score += points;
            scoreDisplay.textContent = score;
            
            // 과일 제거
            fruit.remove();
        }
    });
}

// 점수 효과 표시 함수
function showScoreEffect(x, y, points) {
    const effect = document.createElement('div');
    effect.classList.add('fruit-splash');
    effect.textContent = '+' + points;
    effect.style.left = x + 'px';
    effect.style.top = y + 'px';
    
    gameArea.appendChild(effect);
    
    // 애니메이션 완료 후 제거
    setTimeout(() => {
        effect.remove();
    }, 500);
}

// 게임 루프
function gameLoop() {
    if (gameActive) {
        // 플레이어 이동
        if (keys['ArrowLeft'] && playerX > 0) {
            playerX -= playerSpeed;
        }
        if (keys['ArrowRight'] && playerX < gameArea.offsetWidth - player.offsetWidth) {
            playerX += playerSpeed;
        }
        
        player.style.left = playerX + 'px';
        
        // 과일 이동
        moveFruits();
        
        // 충돌 확인
        checkCollisions();
        
        // 다음 프레임 요청
        requestAnimationFrame(gameLoop);
    }
}

// 모바일 터치 컨트롤 추가
let touchStartX = 0;
gameArea.addEventListener('touchstart', function(e) {
    if (!gameActive) return;
    touchStartX = e.touches[0].clientX;
    e.preventDefault(); // 스크롤 방지
});

gameArea.addEventListener('touchmove', function(e) {
    if (!gameActive) return;
    e.preventDefault(); // 스크롤 방지
    
    const touchX = e.touches[0].clientX;
    const diff = touchX - touchStartX;
    
    // 터치 위치에 따라 플레이어 이동
    playerX += diff;
    
    // 경계 확인
    if (playerX < 0) playerX = 0;
    if (playerX > gameArea.offsetWidth - player.offsetWidth) {
        playerX = gameArea.offsetWidth - player.offsetWidth;
    }
    
    player.style.left = playerX + 'px';
    touchStartX = touchX;
});

// 모바일 버튼 컨트롤 추가
document.addEventListener('DOMContentLoaded', function() {
    // 모바일 감지
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
        // 모바일 컨트롤 버튼 생성
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'mobile-controls';
        controlsDiv.innerHTML = `
            <button id="btn-left" class="control-btn">←</button>
            <button id="btn-right" class="control-btn">→</button>
        `;
        
        // 게임 영역 아래에 컨트롤 추가
        const gameContainer = document.querySelector('.game-container');
        gameContainer.appendChild(controlsDiv);
        
        // 버튼 이벤트 리스너
        const btnLeft = document.getElementById('btn-left');
        const btnRight = document.getElementById('btn-right');
        
        // 왼쪽 버튼 누르고 있을 때
        btnLeft.addEventListener('touchstart', function() {
            keys['ArrowLeft'] = true;
        });
        
        btnLeft.addEventListener('touchend', function() {
            keys['ArrowLeft'] = false;
        });
        
        // 오른쪽 버튼 누르고 있을 때
        btnRight.addEventListener('touchstart', function() {
            keys['ArrowRight'] = true;
        });
        
        btnRight.addEventListener('touchend', function() {
            keys['ArrowRight'] = false;
        });
    }
});
