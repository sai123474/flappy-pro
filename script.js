const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let gameRunning = false;

// Load Images
const birdImg = new Image();
birdImg.src = "assets/bird.png";

const pipeImg = new Image();
pipeImg.src = "assets/pipe.png";

const bgImg = new Image();
bgImg.src = "assets/bg.png";

// Sounds
const jumpSound = new Audio("assets/jump.mp3");
const hitSound = new Audio("assets/hit.mp3");
const pointSound = new Audio("assets/point.mp3");

let bird, pipes, score, highScore;

function initGame() {
    bird = {
        x: 80,
        y: 200,
        width: 40,
        height: 40,
        gravity: 0.6,
        lift: -10,
        velocity: 0
    };

    pipes = [];
    score = 0;
    highScore = localStorage.getItem("highScore") || 0;
}

function startGame() {
    document.getElementById("startScreen").style.display = "none";
    canvas.style.display = "block";
    gameRunning = true;
    initGame();
    update();
}

function restartGame() {
    document.getElementById("gameOverScreen").style.display = "none";
    startGame();
}

function jump() {
    if (!gameRunning) return;
    bird.velocity = bird.lift;
    jumpSound.play();
}

// Touch + Keyboard
document.addEventListener("keydown", e => {
    if (e.code === "Space") jump();
});
document.addEventListener("touchstart", jump);

function update() {
    if (!gameRunning) return;

    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (Math.random() < 0.02) {
        let topHeight = Math.random() * (canvas.height / 2);
        pipes.push({
            x: canvas.width,
            top: topHeight,
            bottom: topHeight + 180,
            passed: false
        });
    }

    pipes.forEach(p => {
        p.x -= 3;

        ctx.drawImage(pipeImg, p.x, 0, 60, p.top);
        ctx.drawImage(pipeImg, p.x, p.bottom, 60, canvas.height - p.bottom);

        if (
            bird.x < p.x + 60 &&
            bird.x + bird.width > p.x &&
            (bird.y < p.top || bird.y + bird.height > p.bottom)
        ) {
            endGame();
        }

        if (!p.passed && p.x < bird.x) {
            score++;
            p.passed = true;
            pointSound.play();
        }
    });

    if (bird.y + bird.height > canvas.height || bird.y < 0) {
        endGame();
    }

    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Score: " + score, 20, 50);

    requestAnimationFrame(update);
}

function endGame() {
    gameRunning = false;
    hitSound.play();

    if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
    }

    document.getElementById("finalScore").innerText = "Score: " + score;
    document.getElementById("highScoreText").innerText = "High Score: " + highScore;
    document.getElementById("gameOverScreen").style.display = "block";
}
