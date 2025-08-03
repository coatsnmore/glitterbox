const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const player = { x: canvas.width / 2, y: canvas.height / 2, radius: 10, speed: 3 };
const keys = {};
const bullets = [];
const enemies = [];
let lastFire = 0;
let lastSpawn = 0;
let score = 0;

window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);

function spawnEnemy() {
  const edge = Math.floor(Math.random() * 4);
  let x, y;
  if (edge === 0) { x = 0; y = Math.random() * canvas.height; }
  else if (edge === 1) { x = canvas.width; y = Math.random() * canvas.height; }
  else if (edge === 2) { x = Math.random() * canvas.width; y = 0; }
  else { x = Math.random() * canvas.width; y = canvas.height; }
  enemies.push({ x, y, radius: 10, speed: 1.5 });
}

function fire() {
  if (!enemies.length) return;
  const target = enemies[0];
  const angle = Math.atan2(target.y - player.y, target.x - player.x);
  bullets.push({ x: player.x, y: player.y, dx: Math.cos(angle) * 6, dy: Math.sin(angle) * 6, radius: 4 });
}

function update(delta) {
  if (keys['ArrowUp']) player.y -= player.speed;
  if (keys['ArrowDown']) player.y += player.speed;
  if (keys['ArrowLeft']) player.x -= player.speed;
  if (keys['ArrowRight']) player.x += player.speed;

  player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
  player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));

  if (Date.now() - lastFire > 500) {
    fire();
    lastFire = Date.now();
  }

  if (Date.now() - lastSpawn > 1000) {
    spawnEnemy();
    lastSpawn = Date.now();
  }

  bullets.forEach(b => { b.x += b.dx; b.y += b.dy; });
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) bullets.splice(i, 1);
  }

  enemies.forEach(e => {
    const angle = Math.atan2(player.y - e.y, player.x - e.x);
    e.x += Math.cos(angle) * e.speed;
    e.y += Math.sin(angle) * e.speed;
    const dist = Math.hypot(player.x - e.x, player.y - e.y);
    if (dist < player.radius + e.radius) {
      alert('Game Over! Score: ' + score);
      document.location.reload();
    }
  });

  for (let i = enemies.length - 1; i >= 0; i--) {
    for (let j = bullets.length - 1; j >= 0; j--) {
      const e = enemies[i];
      const b = bullets[j];
      if (Math.hypot(e.x - b.x, e.y - b.y) < e.radius + b.radius) {
        enemies.splice(i, 1);
        bullets.splice(j, 1);
        score++;
        break;
      }
    }
  }
}

function draw() {
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'yellow';
  bullets.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = 'red';
  enemies.forEach(e => {
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = 'white';
  ctx.font = '20px sans-serif';
  ctx.fillText('Score: ' + score, 20, 30);
}

let last = 0;
function loop(timestamp) {
  const delta = timestamp - last;
  last = timestamp;
  update(delta);
  draw();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
