const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const levelLabel = document.getElementById('level-label');
const livesLabel = document.getElementById('lives-label');
const shieldLabel = document.getElementById('shield-label');
const powerLabel = document.getElementById('power-label');
const upgradeNotice = document.getElementById('upgrade-notice');
const upgradeTitle = document.getElementById('upgrade-title');
const upgradeDescription = document.getElementById('upgrade-description');
const gameOverOverlay = document.getElementById('game-over');
const finalLevelLabel = document.getElementById('final-level');
const restartButton = document.getElementById('restart');

const keys = new Set();
const stars = [];
const bullets = [];
const enemyBullets = [];
let enemies = [];

const player = {
  width: 52,
  height: 28,
  x: canvas.width / 2 - 26,
  y: canvas.height - 90,
  speed: 280,
  lives: 3,
  shield: 0,
  damage: 1,
  multiShot: 1,
  spreadLevel: 0,
  pierce: 0,
  bulletSpeed: 420,
  cooldown: 0.35,
  cooldownTimer: 0
};

const gameState = {
  level: 1,
  phase: 'playing',
  enemyDirection: 1,
  enemySpeed: 40,
  timeSinceUpgrade: 0,
  running: true
};

let lastTime = performance.now();

const baseUpgrades = [
  {
    id: 'shield',
    name: 'Phase Shield',
    description: 'Gain a charge that blocks the next hit.',
    apply: () => {
      player.shield += 1;
    },
    repeatable: true
  },
  {
    id: 'rapid-fire',
    name: 'Rapid Fire Coils',
    description: 'Reduce weapon cooldown by 20%.',
    apply: () => {
      player.cooldown = Math.max(0.12, player.cooldown * 0.8);
    },
    repeatable: false
  },
  {
    id: 'double-shot',
    name: 'Twin Cannons',
    description: 'Fire a second straight blaster shot.',
    apply: () => {
      player.multiShot = Math.min(3, player.multiShot + 1);
    },
    repeatable: true
  },
  {
    id: 'power-core',
    name: 'Ion Power Core',
    description: 'Increase shot damage by 40%.',
    apply: () => {
      player.damage = parseFloat((player.damage * 1.4).toFixed(2));
    },
    repeatable: true
  },
  {
    id: 'spread',
    name: 'Arc Projectors',
    description: 'Add a pair of angled spread shots.',
    apply: () => {
      player.spreadLevel = Math.min(2, player.spreadLevel + 1);
    },
    repeatable: true
  },
  {
    id: 'pierce',
    name: 'Phase Lances',
    description: 'Shots pierce one additional enemy.',
    apply: () => {
      player.pierce = Math.min(3, player.pierce + 1);
    },
    repeatable: true
  },
  {
    id: 'overload',
    name: 'Overload Capacitors',
    description: 'Boost projectile speed by 15%.',
    apply: () => {
      player.bulletSpeed = Math.min(720, player.bulletSpeed * 1.15);
    },
    repeatable: true
  },
  {
    id: 'repair',
    name: 'Nano-Repair Bay',
    description: 'Restore 1 hull integrity (life).',
    apply: () => {
      player.lives = Math.min(5, player.lives + 1);
    },
    repeatable: true
  }
];

const upgradeDeck = [...baseUpgrades];

function initStars() {
  for (let i = 0; i < 80; i += 1) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speed: Math.random() * 50 + 35
    });
  }
}

function spawnLevel() {
  enemies = [];
  bullets.length = 0;
  enemyBullets.length = 0;
  gameState.enemyDirection = 1;
  const rows = Math.min(4 + Math.floor((gameState.level - 1) / 2), 7);
  const cols = 8;
  const horizontalPadding = 70;
  const verticalPadding = 60;
  const spacingX = (canvas.width - horizontalPadding * 2) / (cols - 1);
  const spacingY = 48;
  const baseY = 90;
  const enemyHealth = 1 + Math.floor((gameState.level - 1) / 3);

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      enemies.push({
        x: horizontalPadding + col * spacingX - 20,
        y: baseY + row * spacingY,
        width: 36,
        height: 28,
        health: enemyHealth,
        maxHealth: enemyHealth,
        color: `hsl(${200 + row * 12}, 70%, 60%)`
      });
    }
  }

  gameState.enemySpeed = 30 + gameState.level * 14;
}

function updateHud() {
  levelLabel.textContent = `Level ${gameState.level}`;
  livesLabel.textContent = `Lives: ${player.lives}`;
  shieldLabel.textContent = `Shield: ${player.shield}`;
  powerLabel.textContent = `Power: ${player.damage.toFixed(2)}x`;
}

function awardUpgrade() {
  let upgrade = upgradeDeck.shift();
  if (!upgrade) {
    const repeatables = baseUpgrades.filter((upg) => upg.repeatable);
    upgrade = repeatables[Math.floor(Math.random() * repeatables.length)];
  }
  upgrade.apply();
  upgradeTitle.textContent = `Upgrade: ${upgrade.name}`;
  upgradeDescription.textContent = upgrade.description;
  upgradeNotice.classList.remove('hidden');
  gameState.phase = 'upgrade';
  gameState.timeSinceUpgrade = 0;
  updateHud();
}

function completeLevel() {
  awardUpgrade();
  gameState.level += 1;
  updateHud();
}

function showGameOver() {
  gameState.phase = 'gameover';
  gameOverOverlay.classList.remove('hidden');
  finalLevelLabel.textContent = `You reached level ${gameState.level}.`;
}

function restartGame() {
  Object.assign(player, {
    width: 52,
    height: 28,
    x: canvas.width / 2 - 26,
    y: canvas.height - 90,
    speed: 280,
    lives: 3,
    shield: 0,
    damage: 1,
    multiShot: 1,
    spreadLevel: 0,
    pierce: 0,
    bulletSpeed: 420,
    cooldown: 0.35,
    cooldownTimer: 0
  });
  gameState.level = 1;
  gameState.phase = 'playing';
  gameState.enemyDirection = 1;
  gameOverOverlay.classList.add('hidden');
  upgradeNotice.classList.add('hidden');
  upgradeDeck.splice(0, upgradeDeck.length, ...baseUpgrades);
  spawnLevel();
  updateHud();
  lastTime = performance.now();
  requestAnimationFrame(gameLoop);
}

restartButton.addEventListener('click', () => {
  restartGame();
});

document.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    event.preventDefault();
  }
  keys.add(event.code.toLowerCase());
  if (gameState.phase === 'gameover' && event.code === 'Enter') {
    restartGame();
  }
});

document.addEventListener('keyup', (event) => {
  keys.delete(event.code.toLowerCase());
});

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function firePlayerWeapon() {
  const baseX = player.x + player.width / 2;
  const bulletWidth = 6;
  const straightOffsets = [];
  if (player.multiShot === 1) {
    straightOffsets.push(0);
  } else if (player.multiShot === 2) {
    straightOffsets.push(-12, 12);
  } else {
    straightOffsets.push(-16, 0, 16);
  }

  straightOffsets.forEach((offset) => {
    bullets.push({
      x: baseX - bulletWidth / 2 + offset,
      y: player.y - 14,
      width: bulletWidth,
      height: 18,
      dx: 0,
      dy: -player.bulletSpeed,
      damage: player.damage,
      pierce: player.pierce,
      color: '#78dcff'
    });
  });

  for (let i = 0; i < player.spreadLevel; i += 1) {
    const spreadSpeed = 110 + i * 25;
    bullets.push({
      x: baseX - bulletWidth / 2 - 8,
      y: player.y - 14,
      width: bulletWidth,
      height: 18,
      dx: -spreadSpeed,
      dy: -player.bulletSpeed,
      damage: player.damage,
      pierce: player.pierce,
      color: '#9c8cff'
    });
    bullets.push({
      x: baseX - bulletWidth / 2 + 8,
      y: player.y - 14,
      width: bulletWidth,
      height: 18,
      dx: spreadSpeed,
      dy: -player.bulletSpeed,
      damage: player.damage,
      pierce: player.pierce,
      color: '#9c8cff'
    });
  }
}

function spawnEnemyBullet(enemy) {
  enemyBullets.push({
    x: enemy.x + enemy.width / 2 - 4,
    y: enemy.y + enemy.height,
    width: 6,
    height: 16,
    dx: (Math.random() - 0.5) * 40,
    dy: 120 + gameState.level * 20,
    color: '#ff7676'
  });
}

function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function updateStars(dt) {
  const starSpeedMultiplier = 1 + gameState.level * 0.05;
  stars.forEach((star) => {
    star.y += star.speed * dt * starSpeedMultiplier;
    if (star.y > canvas.height) {
      star.y = -star.size;
      star.x = Math.random() * canvas.width;
      star.speed = Math.random() * 50 + 35;
    }
  });
}

function updatePlayer(dt) {
  const left = keys.has('arrowleft') || keys.has('a');
  const right = keys.has('arrowright') || keys.has('d');
  const firing = keys.has('space');
  if (left && !right) {
    player.x -= player.speed * dt;
  } else if (right && !left) {
    player.x += player.speed * dt;
  }
  player.x = clamp(player.x, 20, canvas.width - player.width - 20);

  player.cooldownTimer -= dt;
  if (firing && player.cooldownTimer <= 0) {
    firePlayerWeapon();
    player.cooldownTimer = player.cooldown;
  }
}

function updateBullets(dt) {
  for (let i = bullets.length - 1; i >= 0; i -= 1) {
    const bullet = bullets[i];
    bullet.x += bullet.dx * dt;
    bullet.y += bullet.dy * dt;
    if (bullet.y + bullet.height < 0 || bullet.x < -20 || bullet.x > canvas.width + 20) {
      bullets.splice(i, 1);
      continue;
    }

    for (let j = enemies.length - 1; j >= 0; j -= 1) {
      const enemy = enemies[j];
      if (rectsOverlap(bullet, enemy)) {
        enemy.health -= bullet.damage;
        if (enemy.health <= 0) {
          enemies.splice(j, 1);
        }
        if (bullet.pierce > 0) {
          bullet.pierce -= 1;
        } else {
          bullets.splice(i, 1);
        }
        break;
      }
    }
  }

  for (let i = enemyBullets.length - 1; i >= 0; i -= 1) {
    const shot = enemyBullets[i];
    shot.x += shot.dx * dt;
    shot.y += shot.dy * dt;
    if (shot.y > canvas.height + 30) {
      enemyBullets.splice(i, 1);
      continue;
    }
    const hitbox = {
      x: player.x + 6,
      y: player.y,
      width: player.width - 12,
      height: player.height
    };
    if (rectsOverlap(shot, hitbox)) {
      enemyBullets.splice(i, 1);
      if (player.shield > 0) {
        player.shield -= 1;
      } else {
        player.lives -= 1;
        if (player.lives <= 0) {
          showGameOver();
        }
      }
      updateHud();
    }
  }
}

function updateEnemies(dt) {
  if (enemies.length === 0) {
    if (gameState.phase === 'playing') {
      completeLevel();
    }
    return;
  }

  let minX = Infinity;
  let maxX = -Infinity;
  enemies.forEach((enemy) => {
    enemy.x += gameState.enemyDirection * gameState.enemySpeed * dt;
    if (enemy.x < minX) {
      minX = enemy.x;
    }
    if (enemy.x + enemy.width > maxX) {
      maxX = enemy.x + enemy.width;
    }
  });

  if (minX < 20 || maxX > canvas.width - 20) {
    gameState.enemyDirection *= -1;
    enemies.forEach((enemy) => {
      enemy.y += 26 + gameState.level * 2;
      enemy.x += gameState.enemyDirection * 8;
    });
  }

  const fireChance = 0.85 + gameState.level * 0.08;
  enemies.forEach((enemy) => {
    if (Math.random() < fireChance * dt * 0.6) {
      spawnEnemyBullet(enemy);
    }
    if (enemy.y + enemy.height >= canvas.height - 130) {
      if (player.shield > 0) {
        player.shield -= 1;
        enemy.y = canvas.height - 160;
      } else {
        player.lives -= 1;
        enemy.y = canvas.height - 160;
        if (player.lives <= 0) {
          showGameOver();
        }
      }
      updateHud();
    }
  });
}

function drawBackground() {
  ctx.fillStyle = '#010a1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  stars.forEach((star) => {
    ctx.fillStyle = `rgba(144, 200, 255, ${0.4 + Math.random() * 0.4})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawPlayer() {
  ctx.save();
  ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
  ctx.fillStyle = '#2af598';
  ctx.beginPath();
  ctx.moveTo(-player.width / 2, player.height / 2);
  ctx.lineTo(0, -player.height / 2);
  ctx.lineTo(player.width / 2, player.height / 2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#0b3954';
  ctx.fillRect(-player.width / 4, 0, player.width / 2, player.height / 2);

  if (player.shield > 0) {
    ctx.strokeStyle = 'rgba(120, 220, 255, 0.7)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, 4, player.width * 0.65, player.height, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawEnemies() {
  enemies.forEach((enemy) => {
    ctx.fillStyle = enemy.color;
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(enemy.x, enemy.y + enemy.height - 6, enemy.width, 6);
    const healthWidth = (enemy.health / enemy.maxHealth) * enemy.width;
    ctx.fillStyle = '#f6d743';
    ctx.fillRect(enemy.x, enemy.y + enemy.height + 4, healthWidth, 4);
  });
}

function drawBullets() {
  bullets.forEach((bullet) => {
    const gradient = ctx.createLinearGradient(
      bullet.x,
      bullet.y,
      bullet.x,
      bullet.y + bullet.height
    );
    gradient.addColorStop(0, bullet.color);
    gradient.addColorStop(1, '#ffffff');
    ctx.fillStyle = gradient;
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  });

  enemyBullets.forEach((shot) => {
    ctx.fillStyle = shot.color;
    ctx.fillRect(shot.x, shot.y, shot.width, shot.height);
  });
}

function gameLoop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.12);
  lastTime = timestamp;

  updateStars(dt);

  if (gameState.phase === 'playing') {
    updatePlayer(dt);
    updateEnemies(dt);
    updateBullets(dt);
  } else if (gameState.phase === 'upgrade') {
    gameState.timeSinceUpgrade += dt;
    if (gameState.timeSinceUpgrade >= 2.6) {
      upgradeNotice.classList.add('hidden');
      gameState.phase = 'playing';
      spawnLevel();
    }
  }

  drawBackground();
  drawPlayer();
  drawEnemies();
  drawBullets();

  if (gameState.phase !== 'gameover') {
    requestAnimationFrame(gameLoop);
  }
}

initStars();
spawnLevel();
updateHud();
requestAnimationFrame(gameLoop);
