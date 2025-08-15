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

function setupCanvas() {
  const rect = canvas.getBoundingClientRect();
  cssWidth = rect.width;
  cssHeight = rect.height;
  dpr = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = Math.round(cssWidth * dpr);
  canvas.height = Math.round(cssHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
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

function render() {
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
}

let resizeScheduled = false;
function handleResize() {
  if (resizeScheduled) return;
  resizeScheduled = true;
  requestAnimationFrame(() => {
    resizeScheduled = false;
    setupCanvas();
    render();
    console.log('dpr:', dpr);
    console.log('resize ok');
  });
}

window.addEventListener('resize', handleResize);
window.addEventListener('orientationchange', handleResize);

setupCanvas();
render();
console.log('dpr:', dpr);
console.log('boot ok');

export { setupCanvas, render, drawEdge, drawActiveEdgePartial, theme };
console.log('boot ok');
main
