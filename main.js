// main.js

export const canvas = document.getElementById('game');
export const ctx = canvas.getContext('2d');

export let dpr = 1;
export let cssWidth = 0;
export let cssHeight = 0;

export const theme = {
  coreStrokePx: 4,
  glowBlurPx: 16,
  coreColors: ['#0ff', '#0f0'],
  glowColor: '#0ff',
  alpha: { unused: 0.8, consumed: 0.3, active: 1 }
};

const PERF_MODE = false;

const MAX_PARTICLES = 256;
const particles = Array.from({ length: MAX_PARTICLES }, () => ({
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  life: 0,
  maxLife: 0,
  size: 0
}));

function setupCanvas() {
  const rect = canvas.getBoundingClientRect();
  cssWidth = rect.width;
  cssHeight = rect.height;
  dpr = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = Math.round(cssWidth * dpr);
  canvas.height = Math.round(cssHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function spawnBurst(x, y, count) {
  for (let i = 0; i < count; i++) {
    let p = null;
    for (const candidate of particles) {
      if (candidate.life <= 0) {
        p = candidate;
        break;
      }
    }
    if (!p) break;
    p.x = x;
    p.y = y;
    const angle = Math.random() * Math.PI * 2;
    const speed = 40 + Math.random() * 40;
    p.vx = Math.cos(angle) * speed;
    p.vy = Math.sin(angle) * speed;
    p.life = 0;
    p.maxLife = 0.4 + Math.random() * 0.5;
    p.size = 2 + Math.random() * 2;
  }
}

function updateParticles(dt) {
  for (const p of particles) {
    if (p.maxLife <= 0) continue;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= 0.985;
    p.vy = p.vy * 0.985 + 10 * dt;
    p.life += dt;
    if (p.life > p.maxLife) {
      p.life = 0;
      p.maxLife = 0;
    }
  }
}

function drawParticles(ctx) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  if (!PERF_MODE) {
    ctx.shadowColor = theme.glowColor;
    ctx.shadowBlur = 6;
  } else {
    ctx.shadowBlur = 0;
  }
  ctx.fillStyle = theme.glowColor;
  for (const p of particles) {
    if (p.maxLife <= 0) continue;
    const alpha = 1 - p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

function drawEdge(p0, p1, opts = {}) {
  const alpha = opts.alpha ?? (opts.consumed ? theme.alpha.consumed : theme.alpha.unused);

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.shadowColor = theme.glowColor;
  ctx.shadowBlur = theme.glowBlurPx;
  ctx.lineWidth = theme.coreStrokePx * 2.2;
  ctx.lineCap = ctx.lineJoin = 'round';
  ctx.strokeStyle = theme.glowColor;
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.moveTo(p0.x, p0.y);
  ctx.lineTo(p1.x, p1.y);
  ctx.stroke();
  ctx.restore();

  const grad = ctx.createLinearGradient(p0.x, p0.y, p1.x, p1.y);
  grad.addColorStop(0, theme.coreColors[0]);
  grad.addColorStop(1, theme.coreColors[1]);
  ctx.lineWidth = theme.coreStrokePx;
  ctx.lineCap = ctx.lineJoin = 'round';
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = grad;
  ctx.beginPath();
  ctx.moveTo(p0.x, p0.y);
  ctx.lineTo(p1.x, p1.y);
  ctx.stroke();
}

function drawActiveEdgePartial(p0, p1, t) {
  const p = {
    x: p0.x + (p1.x - p0.x) * t,
    y: p0.y + (p1.y - p0.y) * t
  };
  drawEdge(p0, p, { alpha: theme.alpha.active });
}

function render(dt) {
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  const midX = cssWidth / 2;
  const midY = cssHeight / 2;
  const offset = Math.min(cssWidth, cssHeight) / 6;

  const a = { x: midX - offset, y: midY };
  const b = { x: midX + offset, y: midY };
  const c = { x: midX, y: midY - offset };

  drawEdge(a, b);
  drawEdge(b, c, { consumed: true });
  drawActiveEdgePartial(c, a, 0.6);

  updateParticles(dt);
  drawParticles(ctx);
}

let resizeScheduled = false;
function handleResize() {
  if (resizeScheduled) return;
  resizeScheduled = true;
  requestAnimationFrame(() => {
    resizeScheduled = false;
    setupCanvas();
    render(0);
    console.log('dpr:', dpr);
    console.log('resize ok');
  });
}

window.addEventListener('resize', handleResize);
window.addEventListener('orientationchange', handleResize);
canvas.addEventListener('pointerdown', e => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  spawnBurst(x, y, 24);
});

setupCanvas();
render(0);
console.log('dpr:', dpr);
console.log('boot ok');

let lastTime = performance.now();
function frame(now) {
  const dt = Math.min((now - lastTime) / 1000, 1 / 30);
  lastTime = now;
  render(dt);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

export { setupCanvas, render, drawEdge, drawActiveEdgePartial, spawnBurst, theme };

console.log('boot ok');
main
