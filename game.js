import Graph from './src/core/Graph.js';
import Solver from './src/core/Solver.js';
import Renderer from './src/engine/Renderer.js';
import AudioManager from './src/engine/Audio.js';
import { initTheme, cycleTheme } from './src/utils/Theme.js';
import { loadRating, saveRating, updateRating, getHintDelay } from './src/progress/Rating.js';
import * as Storage from './src/progress/Storage.ts';
const locale = Storage.getLocale();
Storage.setLocale(locale);
const i18n = await fetch(`./i18n/${locale}.json`).then(r => r.json());
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
const musicSlider = document.getElementById('musicSlider');
const sfxSlider = document.getElementById('sfxSlider');
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

let levelIndex = Storage.getCurrentLevel();
let hearts = 3;
let initialHearts = 3;
let mode = Storage.getMode();
let timer = 0;
let moves = 0;
let timerId;
let hintTimerId;
let graph, renderer;
let solutionEdges = [];
let currentNode = null;
const visitedEdges = new Set();
let rating = loadRating();
let dailyDate = null;

function showTitle() {
  preloader.classList.add('hidden');
  title.classList.remove('hidden');
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
  clearInterval(timerId);
  clearTimeout(hintTimerId);
  if (mode === 'timed' || mode === 'daily') {
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
  hintBtn.disabled = true;
  hintTimerId = setTimeout(() => {
    hintBtn.disabled = false;
  }, getHintDelay(rating));
  if (mode !== 'daily') Storage.setCurrentLevel(idx);
}

function showModal(text, btnText, cb) {
  modalText.textContent = text;
  modalBtn.textContent = btnText;
  modal.classList.remove('hidden');
  audio.duck(true);
  const handler = () => {
    modal.classList.add('hidden');
    modalBtn.removeEventListener('click', handler);
    audio.duck(false);
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

setTimeout(showTitle, 700);
