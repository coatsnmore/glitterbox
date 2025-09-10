const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const scale = 20;
const rows = canvas.height / scale;
const columns = canvas.width / scale;

let snake = [{ x: 10, y: 10 }];
let direction = { x: 1, y: 0 };
let food = randomPosition();

function gameLoop() {
  update();
  draw();
}

let interval = window.setInterval(gameLoop, 100);

function update() {
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  if (
    head.x < 0 ||
    head.x >= columns ||
    head.y < 0 ||
    head.y >= rows ||
    collision(head)
  ) {
    snake = [{ x: 10, y: 10 }];
    direction = { x: 1, y: 0 };
    food = randomPosition();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    food = randomPosition();
  } else {
    snake.pop();
  }
}

function draw() {
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'lime';
  snake.forEach((part) => {
    ctx.fillRect(part.x * scale, part.y * scale, scale - 1, scale - 1);
  });

  ctx.fillStyle = 'red';
  ctx.fillRect(food.x * scale, food.y * scale, scale - 1, scale - 1);
}

function randomPosition() {
  return {
    x: Math.floor(Math.random() * columns),
    y: Math.floor(Math.random() * rows),
  };
}

function collision(pos) {
  return snake.some((segment) => segment.x === pos.x && segment.y === pos.y);
}

window.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowUp':
      if (direction.y === 1) break;
      direction = { x: 0, y: -1 };
      break;
    case 'ArrowDown':
      if (direction.y === -1) break;
      direction = { x: 0, y: 1 };
      break;
    case 'ArrowLeft':
      if (direction.x === 1) break;
      direction = { x: -1, y: 0 };
      break;
    case 'ArrowRight':
      if (direction.x === -1) break;
      direction = { x: 1, y: 0 };
      break;
  }
});
