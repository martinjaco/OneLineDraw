const svg = document.getElementById('editorBoard');
const exportBtn = document.getElementById('exportBtn');
const output = document.getElementById('output');

svg.setAttribute('viewBox', '0 0 1000 1000');

const nodes = [];
const edges = [];
let selected = null;

function draw() {
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  edges.forEach(([a,b]) => {
    const pa = nodes[a];
    const pb = nodes[b];
    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1', pa.x * 1000);
    line.setAttribute('y1', pa.y * 1000);
    line.setAttribute('x2', pb.x * 1000);
    line.setAttribute('y2', pb.y * 1000);
    line.setAttribute('class','edge');
    svg.appendChild(line);
  });
  nodes.forEach((p,i) => {
    const c = document.createElementNS('http://www.w3.org/2000/svg','circle');
    c.setAttribute('cx', p.x * 1000);
    c.setAttribute('cy', p.y * 1000);
    c.setAttribute('r', 20);
    c.setAttribute('data-index', i);
    c.setAttribute('class','node');
    c.setAttribute('tabindex',0);
    svg.appendChild(c);
  });
}

svg.addEventListener('click', (e) => {
  if (e.target === svg) {
    const rect = svg.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    nodes.push({x,y});
    draw();
  } else if (e.target.classList.contains('node')) {
    const idx = parseInt(e.target.getAttribute('data-index'),10);
    if (selected === null) {
      selected = idx;
      e.target.classList.add('active');
    } else if (selected === idx) {
      e.target.classList.remove('active');
      selected = null;
    } else {
      edges.push([selected, idx]);
      selected = null;
      draw();
    }
  }
});

exportBtn.addEventListener('click', () => {
  output.value = JSON.stringify({nodes, edges}, null, 2);
});
