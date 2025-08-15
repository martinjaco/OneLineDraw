// main.js

export const canvas = document.getElementById('game');
export const ctx = canvas.getContext('2d');

export let dpr = 1;
export let cssWidth = 0;
export let cssHeight = 0;

export function setupCanvas() {
  const rect = canvas.getBoundingClientRect();
  cssWidth = rect.width;
  cssHeight = rect.height;
  dpr = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = Math.round(cssWidth * dpr);
  canvas.height = Math.round(cssHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

export function render() {
  ctx.clearRect(0, 0, cssWidth, cssHeight);
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
