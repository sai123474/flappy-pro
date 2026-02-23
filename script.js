const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let gameRunning = false;
let gameSpeed = 1;
let shakeIntensity = 0;
let particles = [];
let splatters = [];

// Images
const birdImg = new Image();
birdImg.src = "assets/bird.png";

const pipeImg = new Image();
pipeImg.src = "assets/pipe.png";

const bgImg = new Image();
bgImg.src = "assets/bg.png";

const splatterImg = new Image();
splatterImg.src = "assets/blood.png"; // transparent splatter PNG

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
    particles = [];
    splatters = [];
    gameSpeed = 1;
}

function startGame() {
    document.getElementById("startScreen").style.display = "none";
    document.getElementById("gameOverScreen").style.display = "none";
    canvas.style.display = "block";
    gameRunning = true;
    initGame();
    update();
}

function restartGame() {
    startGame();
}

function jump() {
    if (!gameRunning) return;
    bird.velocity = bird.lift;
    jumpSound.play();
}

// Controls
document.addEventListener("keydown", e => {
    if (e.code === "Space") jump();
});
document.addEventListener("touchstart", jump);

// Blood Particle System
function createBloodEffect(x, y) {
    for (let i = 0; i < 40; i++) {
        particles.push({
            x: x,
            y: y,
            radius: Math.random() * 4 + 2,
            color: Math.random() > 0.5 ? "#8b0000" : "#ff4d4d",
            velocityX: (Math.random() - 0.5) * 6,
            velocityY: Math.random() * -6,
            gravity: 0.3,
            alpha: 1
        });
    }

    // Add splatter image
    splatters.push({
        x: x - 50,
        y: y - 50,
        size: 100,
        alpha: 1
    });
}

// Screen Shake
function applyShake() {
    if (shakeIntensity > 0) {
        const dx = (Math.random() - 0.5) * shakeIntensity;
        const dy = (Math.random() - 0.5) * shakeIntensity;
        ctx.translate(dx, dy);
        shakeIntensity *= 0.9;
    }
}

// Update Game
function update() {
    if (!gameRunning) return;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    applyShake();

    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

    bird.velocity += bird.gravity * gameSpeed;
    bird.y += bird.velocity * gameSpeed;

    ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (Math.random() < 0.02 * gameSpeed) {
        let topHeight = Math.random() * (canvas.height / 2);
        pipes.push({
            x: canvas.width,
            top: topHeight,
            bottom: topHeight + 180,
            passed: false
        });
    }

    pipes.forEach(p => {
        p.x -= 3 * gameSpeed;

        ctx.drawImage(pipeImg, p.x, 0, 60, p.top);
        ctx.drawImage(pipeImg, p.x, p.bottom, 60, canvas.height - p.bottom);

        if (
            bird.x < p.x + 60 &&
            bird.x + bird.width > p.x &&
            (bird.y < p.top || bird.y + bird.height > p.bottom)
        ) {
            cinematicImpact();
        }

        if (!p.passed && p.x < bird.x) {
            score++;
            p.passed = true;
            pointSound.play();
        }
    });

    // Draw Blood Particles
    particles.forEach((p, index) => {
        p.velocityY += p.gravity;
        p.x += p.velocityX;
        p.y += p.velocityY;
        p.alpha -= 0.02;

        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.globalAlpha = 1;

        if (p.alpha <= 0) {
            particles.splice(index, 1);
        }
    });

    // Draw Splatter Image
    splatters.forEach(s => {
        ctx.globalAlpha = s.alpha;
        ctx.drawImage(splatterImg, s.x, s.y, s.size, s.size);
        ctx.globalAlpha = 1;
    });

    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Score: " + score, 20, 50);

    ctx.restore();

    if (bird.y + bird.height > canvas.height || bird.y < 0) {
        cinematicImpact();
    }

    requestAnimationFrame(update);
}

// Cinematic Impact
function cinematicImpact() {
    if (!gameRunning) return;

    gameRunning = false;

    // Slow motion
    gameSpeed = 0.3;

    // Shake
    shakeIntensity = 20;

    // Blood
    createBloodEffect(
        bird.x + bird.width / 2,
        bird.y + bird.height / 2
    );

    // Vibration (mobile)
    if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
    }

    // Flash effect
    flashScreen();

    hitSound.play();

    setTimeout(() => {
        endGame();
    }, 800);
}

function flashScreen() {
    const flash = document.createElement("div");
    flash.style.position = "fixed";
    flash.style.top = "0";
    flash.style.left = "0";
    flash.style.width = "100%";
    flash.style.height = "100%";
    flash.style.background = "white";
    flash.style.opacity = "0.8";
    flash.style.zIndex = "999";
    document.body.appendChild(flash);

    setTimeout(() => {
        flash.remove();
    }, 150);
}

function endGame() {
    gameSpeed = 1;

    if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
    }

    document.getElementById("finalScore").innerText = "Score: " + score;
    document.getElementById("highScoreText").innerText =
        "High Score: " + highScore;
    document.getElementById("gameOverScreen").style.display = "block";
}
