const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const minFoodCount = 600; 

// Configuración del mundo
const worldSize = 3000; // Tamaño del mapa
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
    // Leer el nombre ingresado en el input
    playerName = document.getElementById("playerName").value || "Gusano";
    
    // Ocultar el menú
    document.getElementById("menu").style.display = "none";
    
    // Mostrar el canvas
    const canvas = document.getElementById("gameCanvas");
    canvas.style.display = "block";
    
    // Configurar el juego
    createBots(15);
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


function growSnake(foodItem) {
    // Añadir nuevos segmentos para simular crecimiento
    for (let i = 0; i < Math.floor(foodItem.size * 0.5); i++) {
        let lastSegment = snake[snake.length - 1]; // Último segmento del cuerpo
        snake.push({
            x: lastSegment.x,
            y: lastSegment.y,
            size: lastSegment.size + foodItem.size * 0.05, // Crece poco a poco
            glow: lastSegment.glow + foodItem.glow * 0.05
        });
    }
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

let bots = [];

function createBots(count) {
    for (let i = 0; i < count; i++) {
        let bot = {
            segments: [{ x: Math.random() * worldSize, y: Math.random() * worldSize, size: 5, glow: 5 }],
            direction: { x: Math.random() - 0.5, y: Math.random() - 0.5 }
        };
        bots.push(bot);
    }
}

// Mover los bots de forma automática
function moveBots() {
    bots.forEach(bot => {
        let head = bot.segments[0];

        // Elegir dirección aleatoria de vez en cuando
        if (Math.random() < 0.02) {
            bot.direction.x = Math.random() - 0.5;
            bot.direction.y = Math.random() - 0.5;
        }

        const newHead = {
            x: head.x + bot.direction.x * 2,
            y: head.y + bot.direction.y * 2,
            size: head.size,
            glow: head.glow
        };

        bot.segments.unshift(newHead);
        bot.segments.pop(); // Mantiene tamaño estable

        // Comprobar si el bot come comida
        food.forEach((f, index) => {
            if (Math.abs(newHead.x - f.x) < f.size * 2 && Math.abs(newHead.y - f.y) < f.size * 2) {
                growBot(bot, f);
                food.splice(index, 1);
                generateFood();
            }
        });
    });
}

// Crecer bots cuando comen
function growBot(bot, foodItem) {
    for (let i = 0; i < Math.floor(foodItem.size * 0.5); i++) {
        let lastSegment = bot.segments[bot.segments.length - 1];
        bot.segments.push({ ...lastSegment });
    }
}


// Dibujar los bots
function drawBots() {
    bots.forEach(bot => {
        bot.segments.forEach(segment => {
            ctx.beginPath();
            ctx.arc(segment.x - camera.x, segment.y - camera.y, segment.size, 0, Math.PI * 2);
            ctx.fillStyle = "red"; // Color diferente para los bots
            ctx.shadowColor = `rgba(255, 0, 0, ${segment.glow})`;
            ctx.shadowBlur = 10 * segment.glow;
            ctx.fill();
            ctx.closePath();
        });
    });
}

// Bucle del juego
function gameLoop() {
    drawBackground();
    drawMapBorder()
    drawFood();
    moveSnake();
    drawSnake();
    killBotOnCollisionWithPlayer(); 
    moveBots();  // Mover bots
    drawBots();  // Dibujar bots
    generateFood();
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
    if (snake.length > 10) { // Solo permite dash si el gusano es grande
        isDashing = true;
    }
});

// Desactivar el "dash" al soltar el clic
canvas.addEventListener("mouseup", () => {
    isDashing = false;
});

function moveSnake() {
    const head = snake[0];

    let angle = Math.atan2(mouseY - canvas.height / 2, mouseX - canvas.width / 2);
    let speed = isDashing ? dashSpeed : normalSpeed;

    const newHead = {
        x: head.x + Math.cos(angle) * speed,
        y: head.y + Math.sin(angle) * speed,
        size: head.size,
        glow: head.glow
    };

    snake.unshift(newHead);

    if (isDashing) {
        snake.pop();
        snake.pop();
        if (snake.length <= 10) {
            isDashing = false;
        }
    } else {
        snake.pop();
    }

    camera.x = newHead.x - canvas.width / 2;
    camera.y = newHead.y - canvas.height / 2;

    eatFood();

    // Si el jugador toca el borde del mapa o choca con otro gusano, muere
    if (checkOutOfBounds(snake) || checkCollision(snake, bots)) {
        alert("¡Has muerto!");
        location.reload(); // Reinicia el juego
    }
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
function checkOutOfBounds(snakeArray) {
    let head = snakeArray[0];
    if (head.x < 0 || head.x > worldSize || head.y < 0 || head.y > worldSize) {
        return true; // Fuera del mapa
    }
    return false;
}
function moveBots() {
    bots.forEach((bot, index) => {
        let head = bot.segments[0];

        // Movimiento aleatorio
        if (Math.random() < 0.02) {
            bot.direction.x = Math.random() - 0.5;
            bot.direction.y = Math.random() - 0.5;
        }

        // Dash aleatorio (10% de probabilidad)
        let isDashing = Math.random() < 0.1;
        let botSpeed = isDashing ? dashSpeed : normalSpeed;

        const newHead = {
            x: head.x + bot.direction.x * botSpeed,
            y: head.y + bot.direction.y * botSpeed,
            size: head.size,
            glow: head.glow
        };

        bot.segments.unshift(newHead);
        
        // Si está en dash y es grande, se adelgaza
        if (isDashing && bot.segments.length > 10) {
            bot.segments.pop();
            bot.segments.pop();
        } else {
            bot.segments.pop();
        }

        

        // Comer comida
        food.forEach((f, foodIndex) => {
            if (Math.abs(newHead.x - f.x) < f.size * 2 && Math.abs(newHead.y - f.y) < f.size * 2) {
                growBot(bot, f);
                food.splice(foodIndex, 1);
                generateFood();
            }
        });

        // Si un bot muere, revivirlo
        if (checkOutOfBounds(bot.segments)) {
            bots[index] = createBot();
        }
        
    });
    
    
}
function createBot() {
    return {
        segments: [{ x: Math.random() * worldSize, y: Math.random() * worldSize, size: 5, glow: 5 }],
        direction: { x: Math.random() - 0.5, y: Math.random() - 0.5 }
    };
}
function checkCollision(snake, otherSnakes) {
    let head = snake[0]; // La cabeza del jugador

    for (let bot of otherSnakes) {
        // Comprobamos si la cabeza del jugador toca algún segmento del cuerpo de los bots
        for (let segment of bot.segments) {
            let distance = Math.hypot(head.x - segment.x, head.y - segment.y);
            if (distance < head.size * 1.5) {
                return true; // Hay colisión
            }
        }
    }
    return false;
}
function killBotOnCollisionWithPlayer() {
    const head = snake[0]; // cabeza del jugador

    // Recorremos el array de bots
    for (let i = 0; i < bots.length; i++) {
        let bot = bots[i];

        // Revisamos cada segmento del bot
        for (let segment of bot.segments) {
            let distance = Math.hypot(head.x - segment.x, head.y - segment.y);

            // Ajusta el factor (head.size * 1.5) según el tamaño de tu gusano
            if (distance < head.size * 1.5) {
                // "Matar" al bot: quitarlo del array
                bots.splice(i, 1);
                i--; 
                break; // Importante: salir del for para evitar errores de índice
            }
        }
    }
}
function drawMapBorder() {
    // Establece el estilo del borde
    ctx.strokeStyle = "#FFFFFF"; // Color blanco para el borde
    ctx.lineWidth = 5; // Ancho del borde
  
    // Dibuja un rectángulo que representa el límite del mundo.
    // Se toma en cuenta el offset de la cámara para que se dibuje correctamente en pantalla.
    ctx.strokeRect(0 - camera.x, 0 - camera.y, worldSize, worldSize);
  }
  function moveBots() {
    bots.forEach((bot, index) => {
      let head = bot.segments[0];
  
      // Opcional: inteligencia simple para que el bot se dirija hacia la comida si está cerca
      let targetFood = null;
      let minDistance = Infinity;
      food.forEach(f => {
        let distance = Math.hypot(head.x - f.x, head.y - f.y);
        if (distance < minDistance) {
          minDistance = distance;
          targetFood = f;
        }
      });
  
      // Si hay comida cerca (por ejemplo, a menos de 200 unidades), moverse hacia ella
      if (targetFood && minDistance < 200) {
        bot.direction.x = (targetFood.x - head.x) / minDistance;
        bot.direction.y = (targetFood.y - head.y) / minDistance;
      } else {
        // Si no hay comida cerca, movimiento aleatorio
        if (Math.random() < 0.02) {
          bot.direction.x = Math.random() - 0.5;
          bot.direction.y = Math.random() - 0.5;
        }
      }
  
      // Opcional: Dash aleatorio para el bot
      let isDashing = Math.random() < 0.1;
      let botSpeed = isDashing ? dashSpeed : normalSpeed;
  
      // Calcular la nueva cabeza del bot
      const newHead = {
        x: head.x + bot.direction.x * botSpeed,
        y: head.y + bot.direction.y * botSpeed,
        size: head.size,
        glow: head.glow
      };
  
      bot.segments.unshift(newHead);
      // Control de longitud: si está en dash y es grande, reduce la longitud más rápido
      if (isDashing && bot.segments.length > 10) {
        bot.segments.pop();
        bot.segments.pop();
      } else {
        bot.segments.pop();
      }
  
      // Verificar si la cabeza del bot toca alguna comida
      food.forEach((f, foodIndex) => {
        if (Math.abs(newHead.x - f.x) < f.size * 2 &&
            Math.abs(newHead.y - f.y) < f.size * 2) {
          // El bot "come" la comida y crece
          growBot(bot, f);
          // Eliminar la comida y generar una nueva
          food.splice(foodIndex, 1);
          generateFood();
        }
      });
  
      // Si el bot se sale del límite del mundo, se "revive" en una posición aleatoria
      if (checkOutOfBounds(bot.segments)) {
        bots[index] = createBot();
      }
    });
  }
