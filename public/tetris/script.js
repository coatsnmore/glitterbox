const BLOCK_SIZE = 24;
const COLS = 10;
const ROWS = 20;
const LINES_PER_LEVEL = 10;

const canvas = document.getElementById('board');
const context = canvas.getContext('2d');
context.scale(BLOCK_SIZE, BLOCK_SIZE);

const nextCanvas = document.getElementById('next');
const nextContext = nextCanvas.getContext('2d');
const nextScale = nextCanvas.width / 4;
nextContext.scale(nextScale, nextScale);

const scoreElem = document.getElementById('score');
const linesElem = document.getElementById('lines');
const levelElem = document.getElementById('level');

const restartButton = document.getElementById('restart');

const colors = {
  T: '#c084fc',
  O: '#facc15',
  L: '#fb923c',
  J: '#38bdf8',
  S: '#4ade80',
  Z: '#f87171',
  I: '#22d3ee'
};

const shapes = {
  T: [
    ['0', 'T', '0'],
    ['T', 'T', 'T'],
    ['0', '0', '0']
  ],
  O: [
    ['O', 'O'],
    ['O', 'O']
  ],
  L: [
    ['0', '0', 'L'],
    ['L', 'L', 'L'],
    ['0', '0', '0']
  ],
  J: [
    ['J', '0', '0'],
    ['J', 'J', 'J'],
    ['0', '0', '0']
  ],
  S: [
    ['0', 'S', 'S'],
    ['S', 'S', '0'],
    ['0', '0', '0']
  ],
  Z: [
    ['Z', 'Z', '0'],
    ['0', 'Z', 'Z'],
    ['0', '0', '0']
  ],
  I: [
    ['0', '0', '0', '0'],
    ['I', 'I', 'I', 'I'],
    ['0', '0', '0', '0'],
    ['0', '0', '0', '0']
  ]
};

function createMatrix(width, height) {
  return Array.from({ length: height }, () => Array(width).fill(0));
}

function drawMatrix(matrix, offset, ctx = context) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0 && value !== '0') {
        ctx.fillStyle = colors[value];
        ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.55)';
        ctx.lineWidth = 0.08;
        ctx.strokeRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0 && value !== '0') {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

function collide(arena, player) {
  const [matrix, pos] = [player.matrix, player.pos];
  for (let y = 0; y < matrix.length; y += 1) {
    for (let x = 0; x < matrix[y].length; x += 1) {
      if (matrix[y][x] !== 0 && matrix[y][x] !== '0') {
        if (
          !arena[y + pos.y] ||
          arena[y + pos.y][x + pos.x] !== 0
        ) {
          return true;
        }
      }
    }
  }
  return false;
}

function rotate(matrix, direction) {
  for (let y = 0; y < matrix.length; y += 1) {
    for (let x = 0; x < y; x += 1) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }
  if (direction > 0) {
    matrix.forEach(row => row.reverse());
  } else {
    matrix.reverse();
  }
}

function arenaSweep() {
  let rowCount = 0;
  for (let y = arena.length - 1; y >= 0; y -= 1) {
    if (arena[y].every(value => value !== 0)) {
      const row = arena.splice(y, 1)[0].fill(0);
      arena.unshift(row);
      rowCount += 1;
      y += 1;
    }
  }
  if (rowCount > 0) {
    const points = [0, 100, 300, 500, 800];
    player.lines += rowCount;
    player.score += (points[rowCount] || rowCount * 200) * player.level;
    const newLevel = 1 + Math.floor(player.lines / LINES_PER_LEVEL);
    if (newLevel !== player.level) {
      player.level = newLevel;
      updateSpeed();
    }
  }
}

function createPiece() {
  const types = Object.keys(shapes);
  const type = types[Math.floor(Math.random() * types.length)];
  return shapes[type].map(row => row.slice());
}

function updateScore() {
  scoreElem.textContent = player.score.toLocaleString();
  linesElem.textContent = player.lines;
  levelElem.textContent = player.level;
}

function updateSpeed() {
  dropInterval = Math.max(1000 - (player.level - 1) * 75, 150);
}

function updateNextPreview() {
  nextContext.save();
  nextContext.setTransform(1, 0, 0, 1, 0, 0);
  nextContext.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
  nextContext.restore();
  nextContext.fillStyle = 'rgba(15, 23, 42, 0.95)';
  nextContext.fillRect(0, 0, nextCanvas.width / nextScale, nextCanvas.height / nextScale);
  const offset = {
    x: Math.floor((4 - nextPiece[0].length) / 2),
    y: Math.floor((4 - nextPiece.length) / 2)
  };
  drawMatrix(nextPiece, offset, nextContext);
}

function playerReset() {
  player.matrix = nextPiece;
  player.pos.y = 0;
  player.pos.x = Math.floor((COLS - player.matrix[0].length) / 2);
  nextPiece = createPiece();
  updateNextPreview();
  if (collide(arena, player)) {
    arena.forEach(row => row.fill(0));
    player.score = 0;
    player.lines = 0;
    player.level = 1;
    updateSpeed();
  }
  updateScore();
}

function playerMove(offset) {
  player.pos.x += offset;
  if (collide(arena, player)) {
    player.pos.x -= offset;
  }
}

function playerDrop() {
  player.pos.y += 1;
  if (collide(arena, player)) {
    player.pos.y -= 1;
    merge(arena, player);
    arenaSweep();
    playerReset();
  }
  dropCounter = 0;
}

function playerHardDrop() {
  while (!collide(arena, player)) {
    player.pos.y += 1;
  }
  player.pos.y -= 1;
  merge(arena, player);
  arenaSweep();
  playerReset();
  dropCounter = 0;
}

function playerRotate(direction) {
  const pos = player.pos.x;
  let offset = 1;
  rotate(player.matrix, direction);
  while (collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -direction);
      player.pos.x = pos;
      return;
    }
  }
}

function draw() {
  context.fillStyle = '#0b1120';
  context.fillRect(0, 0, COLS, ROWS);
  drawMatrix(arena, { x: 0, y: 0 });
  drawMatrix(player.matrix, player.pos);
}

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    playerDrop();
  }
  draw();
  animationFrame = requestAnimationFrame(update);
}

const arena = createMatrix(COLS, ROWS);
const player = {
  pos: { x: 0, y: 0 },
  matrix: createMatrix(0, 0),
  score: 0,
  lines: 0,
  level: 1
};

let nextPiece = createPiece();
let animationFrame = null;

playerReset();
updateSpeed();
update();

const keyActions = {
  ArrowLeft: () => playerMove(-1),
  ArrowRight: () => playerMove(1),
  ArrowDown: () => playerDrop(),
  ArrowUp: () => playerRotate(1),
  KeyA: () => playerMove(-1),
  KeyD: () => playerMove(1),
  KeyS: () => playerDrop(),
  KeyW: () => playerRotate(1),
  Space: () => playerHardDrop(),
  KeyQ: () => playerRotate(-1),
  KeyE: () => playerRotate(1)
};

document.addEventListener('keydown', event => {
  const action = keyActions[event.code];
  if (action) {
    event.preventDefault();
    action();
  }
});

restartButton.addEventListener('click', () => {
  arena.forEach(row => row.fill(0));
  player.score = 0;
  player.lines = 0;
  player.level = 1;
  updateSpeed();
  nextPiece = createPiece();
  playerReset();
});

window.addEventListener('blur', () => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }
});

window.addEventListener('focus', () => {
  if (!animationFrame) {
    lastTime = 0;
    update();
  }
});
