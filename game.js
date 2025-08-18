import Graph from './src/core/Graph.js';
import Solver from './src/core/Solver.js';
import Renderer from './src/engine/Renderer.js';
import AudioManager from './src/engine/Audio.js';
import { initTheme, cycleTheme } from './src/utils/Theme.js';
import { updateRating, getHintDelay, recommendLevel } from './src/progress/Rating.js';
import { loadProgress, saveProgress } from './src/progress/Storage.js';
import { loadRating, saveRating, updateRating, getHintDelay } from './src/progress/Rating.js';
import Particles from './src/engine/Particles.js';
import { announce, showModal as trapShowModal, hideModal as trapHideModal } from './src/ui/UI.js';

const i18n = await fetch('./i18n/en.json').then(r => r.json());
import * as Storage from './src/progress/Storage.ts';
const locale = Storage.getLocale();
Storage.setLocale(locale);
const i18n = await fetch(`./i18n/${locale}.json`).then(r => r.json());
const levels = await fetch('./levels/levels.json').then(r => r.json());

const progressEl = document.getElementById('progress');
const preloader = document.getElementById('preloader');
const title = document.getElementById('title');
const startBtn = document.getElementById('startBtn');
const modeSelect = document.getElementById('modeSelect');
const editorLink = document.getElementById('editorLink');
const gameEl = document.getElementById('game');
const board = document.getElementById('board');
const heartsEl = document.getElementById('hearts');
const metaEl = document.getElementById('meta');
const toggleMusicBtn = document.getElementById('toggleMusic');
const toggleSfxBtn = document.getElementById('toggleSfx');
const toggleThemeBtn = document.getElementById('toggleTheme');
const hintBtn = document.getElementById('hintBtn');
const musicSlider = document.getElementById('musicSlider');
const sfxSlider = document.getElementById('sfxSlider');
const modal = document.getElementById('modal');
const modalText = document.getElementById('modalText');
const modalBtn = document.getElementById('modalBtn');

const resources = [
  fetch('./i18n/en.json').then(r => r.json()),
  fetch('./levels/levels.json').then(r => r.json())
];
let loaded = 0;
function updateProgress() {
  progressEl.style.width = `${(loaded / resources.length) * 100}%`;
}
updateProgress();
const [i18n, levels] = await Promise.all(
  resources.map(p => p.then(res => { loaded++; updateProgress(); return res; }))
);

const audio = new AudioManager();
const particles = new Particles(gameEl);

startBtn.textContent = i18n.start;
document.querySelector('#title h1').textContent = i18n.title;
editorLink.textContent = i18n.editor;
toggleMusicBtn.textContent = '🎵';
toggleSfxBtn.textContent = '🔊';
toggleThemeBtn.textContent = '🌓';
toggleMusicBtn.title = i18n.music;
toggleSfxBtn.title = i18n.sfx;
toggleThemeBtn.title = i18n.theme || 'Theme';
toggleMusicBtn.setAttribute('aria-label', i18n.music);
toggleSfxBtn.setAttribute('aria-label', i18n.sfx);
toggleThemeBtn.setAttribute('aria-label', i18n.theme || 'Theme');
hintBtn.textContent = i18n.hint;
hintBtn.title = i18n.hint;
 hintBtn.setAttribute('aria-label', i18n.hint);
 musicSlider.value = audio.volume.music;
 sfxSlider.value = audio.volume.sfx;
function updateAudioButtons() {
  toggleMusicBtn.textContent = audio.enabled.music ? '🎵' : '🔇';
  toggleSfxBtn.textContent = audio.enabled.sfx ? '🔊' : '🔇';
  toggleMusicBtn.classList.toggle('off', !audio.enabled.music);
  toggleSfxBtn.classList.toggle('off', !audio.enabled.sfx);
}
updateAudioButtons();
hintBtn.setAttribute('aria-label', i18n.hint);
toggleMusicBtn.classList.toggle('off', !audio.enabled.music);
toggleSfxBtn.classList.toggle('off', !audio.enabled.sfx);

modeSelect.value = Storage.getMode();
let currentTheme = initTheme();
let levelIndex = 0;

const progress = loadProgress();
let rating = progress.rating;
let mode = progress.mode;
modeSelect.value = mode;
let levelIndex = recommendLevel(rating, levels.length);
let hearts = progress.hearts;
let timer = progress.timer;
let levelIndex = Storage.getCurrentLevel();
let hearts = 3;
let initialHearts = 3;
let mode = Storage.getMode();
let timer = 0;
let moves = 0;

let timerId;
let hintTimerId;
let graph;
let renderer;
let solutionEdges = [];
let currentNode = null;
const visitedEdges = new Set();

function saveState() {
  saveProgress({ hearts, timer, mode, rating });
}
const edgeHistory = [];
let nodeElems = [];
let paused = false;
let rating = loadRating();
let lastClickTime = 0;

function vibrate(pattern) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

function shake(intensity = 5, duration = 150) {
  if (!board.animate) return;
  const keyframes = [];
  for (let i = 0; i < 10; i++) {
    keyframes.push({
      transform: `translate(${(Math.random() - 0.5) * intensity}px, ${(Math.random() - 0.5) * intensity}px)`
    });
  }
  board.animate(keyframes, { duration, easing: 'ease-out' });
}

function pulse(type) {
  switch (type) {
    case 'success':
      vibrate(20);
      shake(3, 120);
      break;
    case 'fail':
      vibrate([20, 60, 20]);
      shake(5, 150);
      break;
    case 'heart':
      vibrate(100);
      shake(8, 200);
      break;
  }
}

function loseHeart() {
  hearts--;
  heartsEl.textContent = '❤'.repeat(hearts);
  pulse('heart');
  if (hearts <= 0) {
    gameOver();
    return true;
  }
  return false;
}

startBtn.textContent = i18n.start;
document.querySelector('#title h1').textContent = i18n.title;
let dailyDate = null;

function showTitle() {
  preloader.classList.add('hidden');
  title.classList.remove('hidden');
  requestAnimationFrame(() => title.classList.add('show'));
}

function getDailyChallenge() {
  const date = new Date().toISOString().slice(0,10);
  let hash = 0;
  for (const c of date) {
    hash = (hash * 31 + c.charCodeAt(0)) % levels.length;
  }
  return { index: hash, date };
}

function startGame() {
  title.classList.add('hidden');
  gameEl.classList.remove('hidden');
  audio.init();
  audio.startMusic();
  mode = modeSelect.value;
  saveState();
  Storage.setMode(mode);
  if (mode === 'daily') {
    const daily = getDailyChallenge();
    levelIndex = daily.index;
    dailyDate = daily.date;
  } else {
    levelIndex = Storage.getCurrentLevel();
    dailyDate = null;
  }
  loadLevel(levelIndex);
}

function loadLevel(idx) {
  const data = levels[idx];
  initialHearts = data.hearts || 3;
  hearts = initialHearts;
  timer = 30;
  moves = data.edges.length * 2;
  saveState();

  clearInterval(timerId);
  clearTimeout(hintTimerId);

  if (mode === 'timed') {
    metaEl.textContent = `⏱ ${timer}`;
  if (mode === 'timed' || mode === 'daily') {
    timerId = setInterval(() => {
      timer--;
      metaEl.textContent = `⏱ ${timer}`;
      saveState();
      if (timer <= 0) gameOver();
    }, 1000);
    heartsEl.textContent = '❤'.repeat(hearts);
  } else if (mode === 'moves') {
    metaEl.textContent = `📦 ${moves}`;
    heartsEl.textContent = '❤'.repeat(hearts);
  } else if (mode === 'zen') {
    heartsEl.textContent = '';
    metaEl.textContent = '';
  } else {
    heartsEl.textContent = '❤'.repeat(hearts);
    metaEl.textContent = '';
  }

  graph = new Graph(data.nodes, data.edges);
  renderer = new Renderer(board, graph);
  const solver = new Solver(graph);
  solutionEdges = solver.solve();
  currentNode = null;
  visitedEdges.clear();
  edgeHistory.length = 0;
  nodeElems = Array.from(board.querySelectorAll('.node'));
  if (nodeElems[0]) nodeElems[0].focus();
  hintBtn.disabled = true;
  hintTimerId = setTimeout(() => {
    hintBtn.disabled = false;
  }, getHintDelay(rating));
  lastClickTime = 0;
  if (mode !== 'daily') Storage.setCurrentLevel(idx);
}

function showModal(text, btnText, cb) {
  modalText.textContent = text;
  modalBtn.textContent = btnText;
  trapShowModal(modal);
  modal.classList.remove('hidden');
  audio.duck(true);
  const handler = () => {
    trapHideModal(modal);
    modalBtn.removeEventListener('click', handler);
    audio.duck(false);
    cb();
  };
  modalBtn.addEventListener('click', handler, { once: true });
}

function handleNodeClick(e) {
  const target = e.target;
  if (!target.classList.contains('node')) return;
  const idx = parseInt(target.getAttribute('data-index'), 10);
  if (currentNode === null) {
    currentNode = idx;
    target.classList.add('active');
  } else if (currentNode === idx) {
    target.classList.remove('active');
    currentNode = null;
  } else if (graph.edgeExists(currentNode, idx)) {
    const key = `${Math.min(currentNode, idx)}-${Math.max(currentNode, idx)}`;
    if (visitedEdges.has(key)) {
  } else {
    if (graph.edgeExists(currentNode, idx)) {
      const key = `${Math.min(currentNode, idx)}-${Math.max(currentNode, idx)}`;
      if (visitedEdges.has(key)) {
        audio.play('fail');
        pulse('fail');
        const nodePos = graph.nodes[idx];
        particles.errorSparks(nodePos.x * gameEl.clientWidth, nodePos.y * gameEl.clientHeight);
        if (mode !== 'zen' && loseHeart()) return;
        if (mode !== 'zen') {
          hearts--;
          heartsEl.textContent = '❤'.repeat(hearts);
          audio.play('fail');
          announce('Edge already used');
          if (hearts <= 0) return gameOver();
        }
      } else {
        const now = performance.now();
        let velocity = 0;
        if (lastClickTime) {
          const prev = graph.nodes[currentNode];
          const next = graph.nodes[idx];
          const dist = Math.hypot(prev.x - next.x, prev.y - next.y);
          velocity = dist / (now - lastClickTime);
        }
        lastClickTime = now;
        visitedEdges.add(key);
        renderer.markEdge(currentNode, idx, velocity);
        audio.play('connect');
        pulse('success');
        const nodePos = graph.nodes[idx];
        particles.connectBurst(nodePos.x * gameEl.clientWidth, nodePos.y * gameEl.clientHeight);
        edgeHistory.push({ a: currentNode, b: idx });
        renderer.markEdge(currentNode, idx);
        audio.play('connect');
        announce(`Connected ${currentNode} to ${idx}`);
        currentNode = idx;
        if (mode === 'moves') {
          moves--;
          metaEl.textContent = `📦 ${moves}`;
          if (moves <= 0) return gameOver();
        }
        if (visitedEdges.size === graph.edges.length) return levelComplete();
      }
    } else {
      audio.play('fail');
      pulse('fail');
      const nodePos = graph.nodes[idx];
      particles.errorSparks(nodePos.x * gameEl.clientWidth, nodePos.y * gameEl.clientHeight);
      if (mode !== 'zen' && loseHeart()) return;
      if (mode !== 'zen') {
        hearts--;
        heartsEl.textContent = '❤'.repeat(hearts);
        saveState();
        audio.play('fail');
        announce('Invalid move');
        if (hearts <= 0) return gameOver();
      }
    } else {
      visitedEdges.add(key);
      renderer.markEdge(currentNode, idx);
      audio.play('connect');
      currentNode = idx;
      if (mode === 'moves') {
        moves--;
        metaEl.textContent = `📦 ${moves}`;
        if (moves <= 0) return gameOver();
      }
      if (visitedEdges.size === graph.edges.length) return levelComplete();
    }
  } else {
    if (mode !== 'zen') {
      hearts--;
      heartsEl.textContent = '❤'.repeat(hearts);
      saveState();
      audio.play('fail');
      if (hearts <= 0) return gameOver();
    }
    if (mode === 'moves') {
      moves--;
      metaEl.textContent = `📦 ${moves}`;
      if (moves <= 0) return gameOver();
    }
  }
}

function handleKey(e) {
  const key = e.key;
  if (key === 'ArrowRight' || key === 'ArrowDown') {
    moveFocus(1);
    e.preventDefault();
  } else if (key === 'ArrowLeft' || key === 'ArrowUp') {
    moveFocus(-1);
    e.preventDefault();
  } else if (key === 'Enter' || key === ' ') {
    if (e.target.classList.contains('node')) handleNodeClick(e);
    e.preventDefault();
  } else if (key.toLowerCase() === 'u') {
    undo();
  } else if (key.toLowerCase() === 'p') {
    togglePause();
  } else if (key.toLowerCase() === 'h') {
    handleHint();
  }
}

function moveFocus(dir) {
  if (!nodeElems.length) return;
  const current = nodeElems.indexOf(document.activeElement);
  let next = current + dir;
  if (next < 0) next = nodeElems.length - 1;
  if (next >= nodeElems.length) next = 0;
  nodeElems[next].focus();
}

function undo() {
  const last = edgeHistory.pop();
  if (!last) return;
  const key = `${Math.min(last.a, last.b)}-${Math.max(last.a, last.b)}`;
  visitedEdges.delete(key);
  renderer.unmarkEdge(last.a, last.b);
  currentNode = last.a;
  announce('Undid move');
}

function togglePause() {
  if (paused) {
    trapHideModal(modal);
    paused = false;
  } else {
    modalText.textContent = i18n.paused || 'Paused';
    modalBtn.textContent = i18n.resume || 'Resume';
    trapShowModal(modal);
    modalBtn.onclick = () => {
      trapHideModal(modal);
      modalBtn.onclick = null;
      paused = false;
    };
    paused = true;
  }
}

function handleHint() {
  for (const [a, b] of solutionEdges) {
    const key = `${Math.min(a, b)}-${Math.max(a, b)}`;
    if (!visitedEdges.has(key)) {
      renderer.highlightEdge(a, b);
      break;
      return;
    }
  }
}

function levelComplete() {
  clearInterval(timerId);
  audio.play('complete');
  pulse('success');
  particles.solveConfetti();
  rating = updateRating(rating, true);
  saveState();
  showModal(i18n.levelComplete, i18n.next, () => {
    levelIndex = (levelIndex + 1) % levels.length;
    loadLevel(levelIndex);
  });
  if (mode === 'daily') {
    Storage.updateDaily(dailyDate, {
      solved: true,
      perfect: hearts === initialHearts,
      gold: timer >= 20
    });
    showModal(i18n.dailyComplete || i18n.levelComplete, i18n.retry, () => {
      loadLevel(levelIndex);
    });
  } else {
    rating = updateRating(rating, true);
    saveRating(rating);
    Storage.updateBestStats(levelIndex, { hearts, time: timer });
    Storage.unlockLevel((levelIndex + 1) % levels.length);
    showModal(i18n.levelComplete, i18n.next, () => {
      levelIndex = (levelIndex + 1) % levels.length;
      Storage.setCurrentLevel(levelIndex);
      loadLevel(levelIndex);
    });
  }
}

function gameOver() {
  clearInterval(timerId);
  audio.play('fail');
  pulse('fail');
  rating = updateRating(rating, false);
  saveState();
  showModal(i18n.gameOver, i18n.retry, () => {
  if (mode !== 'daily') {
    rating = updateRating(rating, false);
    saveRating(rating);
    levelIndex = 0;
    Storage.setCurrentLevel(levelIndex);
  }
  showModal(i18n.gameOver, i18n.retry, () => {
    loadLevel(levelIndex);
  });
}

board.addEventListener('click', handleNodeClick);
board.addEventListener('keydown', handleKey);
startBtn.addEventListener('click', startGame);
modeSelect.addEventListener('change', () => {
  Storage.setMode(modeSelect.value);
});
toggleMusicBtn.addEventListener('click', () => {
  audio.toggle('music');
  updateAudioButtons();
});
toggleSfxBtn.addEventListener('click', () => {
  audio.toggle('sfx');
  updateAudioButtons();
});
musicSlider.addEventListener('input', e => {
  audio.setVolume('music', parseFloat(e.target.value));
});
sfxSlider.addEventListener('input', e => {
  audio.setVolume('sfx', parseFloat(e.target.value));
});
hintBtn.addEventListener('click', handleHint);
toggleThemeBtn.addEventListener('click', () => {
  currentTheme = cycleTheme(currentTheme);
});

setTimeout(showTitle, 600);
setTimeout(showTitle, 700);
