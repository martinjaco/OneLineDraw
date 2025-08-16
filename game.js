import Graph from './src/core/Graph.js';
import Solver from './src/core/Solver.js';
import Renderer from './src/engine/Renderer.js';
import AudioManager from './src/engine/Audio.js';
import { initTheme, cycleTheme } from './src/utils/Theme.js';

const i18n = await fetch('./i18n/en.json').then(r => r.json());
const levels = await fetch('./levels/levels.json').then(r => r.json());

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
const modal = document.getElementById('modal');
const modalText = document.getElementById('modalText');
const modalBtn = document.getElementById('modalBtn');

const audio = new AudioManager();

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
toggleMusicBtn.classList.toggle('off', !audio.enabled.music);
toggleSfxBtn.classList.toggle('off', !audio.enabled.sfx);
let currentTheme = initTheme();

let levelIndex = 0;
let hearts = 3;
let mode = 'classic';
let timer = 0;
let moves = 0;
let timerId;
let graph, renderer;
let solutionEdges = [];
let currentNode = null;
const visitedEdges = new Set();

function showTitle() {
  preloader.classList.add('hidden');
  title.classList.remove('hidden');
}

function startGame() {
  title.classList.add('hidden');
  gameEl.classList.remove('hidden');
  audio.init();
  audio.startMusic();
  mode = modeSelect.value;
  loadLevel(levelIndex);
}

function loadLevel(idx) {
  const data = levels[idx];
  hearts = data.hearts || 3;
  timer = 30;
  moves = data.edges.length * 2;
  clearInterval(timerId);
  if (mode === 'timed') {
    timerId = setInterval(() => {
      timer--;
      metaEl.textContent = `⏱ ${timer}`;
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
}

function showModal(text, btnText, cb) {
  modalText.textContent = text;
  modalBtn.textContent = btnText;
  modal.classList.remove('hidden');
  const handler = () => {
    modal.classList.add('hidden');
    modalBtn.removeEventListener('click', handler);
    cb();
  };
  modalBtn.addEventListener('click', handler, { once: true });
  modalBtn.focus();
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
  } else {
    if (graph.edgeExists(currentNode, idx)) {
      const key = `${Math.min(currentNode, idx)}-${Math.max(currentNode, idx)}`;
      if (visitedEdges.has(key)) {
        if (mode !== 'zen') {
          hearts--;
          heartsEl.textContent = '❤'.repeat(hearts);
          audio.play('fail');
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
}

function handleKey(e) {
  if (e.target.classList.contains('node') && (e.key === 'Enter' || e.key === ' ')) {
    handleNodeClick(e);
    e.preventDefault();
  }
  if (e.key.toLowerCase() === 'h') {
    handleHint();
  }
}

function handleHint() {
  for (const [a, b] of solutionEdges) {
    const key = `${Math.min(a, b)}-${Math.max(a, b)}`;
    if (!visitedEdges.has(key)) {
      renderer.highlightEdge(a, b);
      return;
    }
  }
}

function levelComplete() {
  clearInterval(timerId);
  audio.play('complete');
  showModal(i18n.levelComplete, i18n.next, () => {
    levelIndex = (levelIndex + 1) % levels.length;
    loadLevel(levelIndex);
  });
}

function gameOver() {
  clearInterval(timerId);
  audio.play('fail');
  showModal(i18n.gameOver, i18n.retry, () => {
    levelIndex = 0;
    loadLevel(levelIndex);
  });
}

board.addEventListener('click', handleNodeClick);
board.addEventListener('keydown', handleKey);
startBtn.addEventListener('click', startGame);
toggleMusicBtn.addEventListener('click', () => {
  const on = audio.toggle('music');
  toggleMusicBtn.classList.toggle('off', !on);
});
toggleSfxBtn.addEventListener('click', () => {
  const on = audio.toggle('sfx');
  toggleSfxBtn.classList.toggle('off', !on);
});
hintBtn.addEventListener('click', handleHint);
toggleThemeBtn.addEventListener('click', () => {
  currentTheme = cycleTheme(currentTheme);
});

setTimeout(showTitle, 700);
