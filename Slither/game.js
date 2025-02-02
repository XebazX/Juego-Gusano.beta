const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const minFoodCount = 150;

// Configuración del mundo
const worldSize = 5000; // Tamaño del mapa
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let playerName = "";
let snake = [{ x: worldSize / 2, y: worldSize / 2, size: 5, glow: 5 }];
let direction = { x: 0, y: 0 };
let food = [];
let speed = 5;

// Posición de la cámara (seguirá al gusano)
let camera = { x: snake[0].x - canvas.width / 2, y: snake[0].y - canvas.height / 2 };

// Tipos de comida con diferentes valores nutricionales
const foodTypes = [
    { size: 5, glow: 2, color: "#FFD700" }, // Oro - Muy alimenticio
    { size: 4, glow: 1.5, color: "#FF4500" }, // Rojo - Alimenticio
    { size: 3, glow: 1, color: "#00FF00" }, // Verde - Normal
    { size: 2, glow: 0.5, color: "#1E90FF" } // Azul - Poco alimenticio
];

// Función para iniciar el juego
function startGame() {
    playerName = document.getElementById("playerName").value || "Gusano";
    document.getElementById("menu").style.display = "none";
    canvas.style.display = "block";
    generateFood();
    gameLoop();
}

// Dibujar el fondo con cuadrícula
function drawBackground() {
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;

    for (let x = -camera.x % 50; x < canvas.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = -camera.y % 50; y < canvas.height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// Dibujar la serpiente
function drawSnake() {
    snake.forEach(segment => {
        ctx.beginPath();
        ctx.arc(segment.x - camera.x, segment.y - camera.y, segment.size, 0, Math.PI * 2);
        ctx.fillStyle = "#87CEEB";
        ctx.shadowColor = `rgba(135, 206, 235, ${segment.glow})`;
        ctx.shadowBlur = 10 * segment.glow;
        ctx.fill();
        ctx.closePath();
    });

    // Dibujar el nombre del gusano
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText(playerName, snake[0].x - camera.x - 20, snake[0].y - camera.y - 15);
}

// Mover la serpiente y la cámara
function moveSnake() {
    const head = {
        x: snake[0].x + direction.x * speed,
        y: snake[0].y + direction.y * speed,
        size: snake[0].size,
        glow: snake[0].glow
    };
    snake.unshift(head);

    let ate = false;

    food.forEach((f, index) => {
        if (Math.abs(head.x - f.x) < f.size * 2 && Math.abs(head.y - f.y) < f.size * 2) {
            growSnake(f);
            food.splice(index, 1);
            generateFood();
            ate = true;
        }
    });

    if (!ate) {
        snake.pop();
    }

    // Mover la cámara para que siga al gusano
    camera.x = head.x - canvas.width / 2;
    camera.y = head.y - canvas.height / 2;
}

// Crecer dependiendo del tipo de comida
function growSnake(foodItem) {
    snake.forEach(segment => {
        segment.size += foodItem.size * 0.1;
        segment.glow += foodItem.glow * 0.1;
    });
}

// Generar comida en posiciones aleatorias dentro del mundo
function generateFood() {
    while (food.length < minFoodCount) {
        let type = foodTypes[Math.floor(Math.random() * foodTypes.length)];
        food.push({
            x: Math.random() * worldSize,
            y: Math.random() * worldSize,
            size: type.size,
            glow: type.glow,
            color: type.color
        });
    }
}

// Dibujar la comida
function drawFood() {
    food.forEach(f => {
        ctx.beginPath();
        ctx.arc(f.x - camera.x, f.y - camera.y, f.size, 0, Math.PI * 2);
        ctx.fillStyle = f.color;
        ctx.shadowColor = f.color;
        ctx.shadowBlur = f.glow * 10;
        ctx.fill();
        ctx.closePath();
    });
}

// Controles del jugador
document.addEventListener("keydown", (event) => {
    const keyMap = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 }
    };

    if (keyMap[event.key]) {
        direction = keyMap[event.key];
    }
});

// Bucle del juego
function gameLoop() {
    drawBackground();
    drawFood();
    moveSnake();
    drawSnake();
    generateFood(); // Asegurar comida constante
    requestAnimationFrame(gameLoop);
}
let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;
let isDashing = false;
let normalSpeed = 2;
let dashSpeed = 6;

// Detectar la posición del cursor
canvas.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
});

// Activar el "dash" solo si ha crecido lo suficiente
canvas.addEventListener("mousedown", () => {
    if (snake.length > 10) {
        isDashing = true;
    }
});

// Desactivar el "dash" al soltar el clic
canvas.addEventListener("mouseup", () => {
    isDashing = false;
});

// Mover el gusano hacia el cursor
function moveSnake() {
    const head = snake[0];

    // Calcular dirección al cursor
    let angle = Math.atan2(mouseY - canvas.height / 2, mouseX - canvas.width / 2);
    let speed = isDashing && snake.length > 10 ? dashSpeed : normalSpeed; 

    const newHead = {
        x: head.x + Math.cos(angle) * speed,
        y: head.y + Math.sin(angle) * speed,
        size: head.size,
        glow: head.glow
    };

    snake.unshift(newHead);
    
    // Si está en dash y es grande, se adelgaza
    if (isDashing && snake.length > 10) {
        snake.pop(); // Reduce la longitud
    }

    // Mover la cámara para seguir al gusano
    camera.x = newHead.x - canvas.width / 2;
    camera.y = newHead.y - canvas.height / 2;

    // Atraer y comer la comida
    eatFood();
}
function eatFood() {
    food.forEach((f, index) => {
        let distance = Math.hypot(snake[0].x - f.x, snake[0].y - f.y);

        // Si está cerca, atraer la comida
        if (distance < 50) {
            f.x += (snake[0].x - f.x) * 0.1;
            f.y += (snake[0].y - f.y) * 0.1;
        }

        // Si la toca, se la come
        if (distance < snake[0].size * 2) {
            growSnake(f);
            food.splice(index, 1);
            generateFood();
        }
    });
}