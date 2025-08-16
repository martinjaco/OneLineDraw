import Graph from './src/core/Graph.js';
import Renderer from './src/engine/Renderer.js';

const i18n = await fetch('./i18n/en.json').then(r => r.json());
const levels = await fetch('./levels/levels.json').then(r => r.json());

const preloader = document.getElementById('preloader');
const title = document.getElementById('title');
const startBtn = document.getElementById('startBtn');
const gameEl = document.getElementById('game');
const board = document.getElementById('board');
const heartsEl = document.getElementById('hearts');

startBtn.textContent = i18n.start;
document.querySelector('#title h1').textContent = i18n.title;

let levelIndex = 0;
let hearts = 3;
let graph, renderer;
let currentNode = null;
const visitedEdges = new Set();

function showTitle() {
  preloader.classList.add('hidden');
  title.classList.remove('hidden');
}

function startGame() {
  title.classList.add('hidden');
  gameEl.classList.remove('hidden');
  loadLevel(levelIndex);
}

function loadLevel(idx) {
  const data = levels[idx];
  hearts = data.hearts || 3;
  heartsEl.textContent = '❤'.repeat(hearts);
  graph = new Graph(data.nodes, data.edges);
  renderer = new Renderer(board, graph);
  currentNode = null;
  visitedEdges.clear();
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
        hearts--;
        heartsEl.textContent = '❤'.repeat(hearts);
        if (hearts <= 0) return gameOver();
      } else {
        visitedEdges.add(key);
        renderer.markEdge(currentNode, idx);
        currentNode = idx;
        if (visitedEdges.size === graph.edges.length) return levelComplete();
      }
    } else {
      hearts--;
      heartsEl.textContent = '❤'.repeat(hearts);
      if (hearts <= 0) return gameOver();
    }
  }
}

function levelComplete() {
  alert(i18n.levelComplete);
  levelIndex = (levelIndex + 1) % levels.length;
  loadLevel(levelIndex);
}

function gameOver() {
  alert(i18n.gameOver);
  levelIndex = 0;
  loadLevel(levelIndex);
}

board.addEventListener('click', handleNodeClick);
startBtn.addEventListener('click', startGame);

setTimeout(showTitle, 700);
