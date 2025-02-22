const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game states: "start", "playing", "gameover"
let gameState = "start";

// Ship properties
let ship = {
    x: 400,
    y: 500,
    width: 20,
    height: 20,
    speed: 5
};

// Game variables
let fuel = 200;
let score = 0;
let deliveries = 0;
let level = 1;
let delivery = {
    x: Math.random() * (canvas.width - 20),
    y: Math.random() * 300,
    size: 20
};

// Asteroids
let asteroids = [];
for (let i = 0; i < 8; i++) {
    asteroids.push({
        x: Math.random() * canvas.width,
        y: Math.random() * 400,
        size: 30,
        speed: Math.random() * 4 - 2
    });
}

// Stars
let stars = [];
for (let i = 0; i < 50; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1
    });
}

// Fuel pickups
let fuelPickups = [];
function spawnFuelPickup() {
    fuelPickups.push({
        x: Math.random() * (canvas.width - 20),
        y: Math.random() * (canvas.height - 20),
        size: 15
    });
}
spawnFuelPickup();

// Audio context
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(frequency, duration, type = "sine") {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gainNode.gain.value = 0.1;
    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    oscillator.stop(audioCtx.currentTime + duration);
}

// Handle keyboard input
document.addEventListener("keydown", (event) => {
    if (gameState === "playing") {
        if (event.key === "ArrowLeft" && ship.x > 0) ship.x -= ship.speed;
        if (event.key === "ArrowRight" && ship.x < canvas.width - ship.width) ship.x += ship.speed;
        if (event.key === "ArrowUp" && ship.y > 0) ship.y -= ship.speed;
        if (event.key === "ArrowDown" && ship.y < canvas.height - ship.height) ship.y += ship.speed;
    }
    if (event.key === " " && (gameState === "start" || gameState === "gameover")) {
        // Reset game
        gameState = "playing";
        fuel = 200;
        score = 0;
        deliveries = 0;
        level = 1;
        ship.x = 400;
        ship.y = 500;
        asteroids = [];
        for (let i = 0; i < 8; i++) {
            asteroids.push({
                x: Math.random() * canvas.width,
                y: Math.random() * 400,
                size: 30,
                speed: Math.random() * 4 - 2
            });
        }
        delivery.x = Math.random() * (canvas.width - delivery.size);
        delivery.y = Math.random() * 300;
        fuelPickups = [];
        spawnFuelPickup();
    }
});

// Game loop
function gameLoop() {
    ctx.fillStyle = "#000014";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw stars
    ctx.fillStyle = "white";
    stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });

    if (gameState === "start") {
        ctx.fillStyle = "#00ffcc";
        ctx.font = "40px Arial";
        ctx.fillText("Cosmic Courier", 250, 200);
        ctx.font = "20px Arial";
        ctx.fillText("Pilot your ship with arrow keys.", 200, 260);
        ctx.fillText("Deliver packages (yellow orbs) to score.", 200, 290);
        ctx.fillText("Collect green fuel orbs to stay alive.", 200, 320);
        ctx.fillText("Avoid asteroids or crash!", 200, 350);
        ctx.fillText("Make 5 deliveries to level up. Survive 3+ minutes!", 200, 380);
        ctx.fillStyle = "yellow";
        ctx.fillText("Press SPACE to start", 300, 450);
    } else if (gameState === "playing") {
        // Draw fuel, score, and level
        ctx.fillStyle = "#00ffcc";
        ctx.font = "20px Arial";
        ctx.fillText("Fuel: " + Math.floor(fuel), 10, 30);
        ctx.fillText("Score: " + score, 10, 60);
        ctx.fillText("Level: " + level, 10, 90);

        // Draw the ship
        const shipGradient = ctx.createLinearGradient(ship.x, ship.y, ship.x + ship.width, ship.y);
        shipGradient.addColorStop(0, "#00ffcc");
        shipGradient.addColorStop(1, "#00ccff");
        ctx.fillStyle = shipGradient;
        ctx.beginPath();
        ctx.moveTo(ship.x, ship.y + ship.height);
        ctx.lineTo(ship.x + ship.width / 2, ship.y);
        ctx.lineTo(ship.x + ship.width, ship.y + ship.height);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "orange";
        ctx.beginPath();
        ctx.moveTo(ship.x + ship.width / 2 - 5, ship.y + ship.height);
        ctx.lineTo(ship.x + ship.width / 2 + 5, ship.y + ship.height);
        ctx.lineTo(ship.x + ship.width / 2, ship.y + ship.height + 10);
        ctx.fill();

        // Update and draw asteroids
        ctx.fillStyle = "#8B4513";
        asteroids.forEach((asteroid) => {
            asteroid.x += asteroid.speed;
            if (asteroid.x > canvas.width) asteroid.x = 0;
            if (asteroid.x < -asteroid.size) asteroid.x = canvas.width;

            if (
                ship.x < asteroid.x + asteroid.size &&
                ship.x + ship.width > asteroid.x &&
                ship.y < asteroid.y + asteroid.size / 2 &&
                ship.y + ship.height > asteroid.y - asteroid.size / 2
            ) {
                gameState = "gameover";
                playSound(200, 0.5, "square");
            }

            ctx.beginPath();
            ctx.moveTo(asteroid.x, asteroid.y);
            ctx.lineTo(asteroid.x + asteroid.size / 3, asteroid.y - asteroid.size / 2);
            ctx.lineTo(asteroid.x + asteroid.size / 1.5, asteroid.y - asteroid.size / 3);
            ctx.lineTo(asteroid.x + asteroid.size, asteroid.y);
            ctx.lineTo(asteroid.x + asteroid.size / 1.5, asteroid.y + asteroid.size / 3);
            ctx.lineTo(asteroid.x + asteroid.size / 3, asteroid.y + asteroid.size / 2);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = "rgba(255, 165, 0, 0.5)";
            ctx.lineWidth = 2;
            ctx.stroke();
        });

        // Pulsing delivery point
        const pulse = Math.sin(Date.now() * 0.005) * 3 + delivery.size / 2;
        const deliveryGradient = ctx.createRadialGradient(
            delivery.x + delivery.size / 2, delivery.y + delivery.size / 2, 0,
            delivery.x + delivery.size / 2, delivery.y + delivery.size / 2, pulse
        );
        deliveryGradient.addColorStop(0, "#ffff99");
        deliveryGradient.addColorStop(1, "rgba(255, 255, 0, 0)");
        ctx.fillStyle = deliveryGradient;
        ctx.beginPath();
        ctx.arc(delivery.x + delivery.size / 2, delivery.y + delivery.size / 2, pulse, 0, Math.PI * 2);
        ctx.fill();

        // Draw and check fuel pickups
        fuelPickups.forEach((pickup, index) => {
            ctx.fillStyle = "#00ff00";
            ctx.beginPath();
            ctx.arc(pickup.x + pickup.size / 2, pickup.y + pickup.size / 2, pickup.size / 2, 0, Math.PI * 2);
            ctx.fill();

            if (Math.abs(ship.x - pickup.x) < ship.width && Math.abs(ship.y - pickup.y) < ship.height) {
                fuel += 50;
                if (fuel > 200) fuel = 200;
                fuelPickups.splice(index, 1);
                spawnFuelPickup();
                playSound(600, 0.15);
            }
        });

        // Check delivery
        if (Math.abs(ship.x - delivery.x) < ship.width && Math.abs(ship.y - delivery.y) < ship.height) {
            score += 10;
            deliveries += 1;
            delivery.x = Math.random() * (canvas.width - delivery.size);
            delivery.y = Math.random() * 300;
            playSound(800, 0.2);

            if (deliveries >= 5) {
                level += 1;
                deliveries = 0;
                asteroids.forEach(a => a.speed *= 1.2);
                for (let i = 0; i < 2; i++) {
                    asteroids.push({
                        x: Math.random() * canvas.width,
                        y: Math.random() * 400,
                        size: 30,
                        speed: Math.random() * 4 * level - 2 * level
                    });
                }
                fuel += 50;
                if (fuel > 200) fuel = 200;
            }
        }

        // Update fuel
        fuel -= 0.03;
        if (fuel <= 0) {
            gameState = "gameover";
            playSound(200, 0.5, "square");
        }
    } else if (gameState === "gameover") {
        ctx.fillStyle = "#ff3333";
        ctx.font = "40px Arial";
        ctx.fillText("Game Over!", 300, 250);
        ctx.fillStyle = "#00ffcc";
        ctx.font = "30px Arial";
        ctx.fillText("Score: " + score, 340, 300);
        ctx.fillText("Level: " + level, 340, 340);
        ctx.fillStyle = "yellow";
        ctx.font = "20px Arial";
        ctx.fillText("Press SPACE to restart", 300, 400);
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();