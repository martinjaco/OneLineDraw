export default class Renderer {
  constructor(target, graph) {
    this.graph = graph;
    if (target instanceof SVGElement) {
      this.svg = target;
      this.ctx = null;
    } else {
      this.svg = null;
      this.canvas = document.createElement('canvas');
      target.appendChild(this.canvas);
      this.ctx = this.canvas.getContext('2d');
    }
    this.drawBase();
  }

  clear() {
    if (this.svg) {
      while (this.svg.firstChild) this.svg.removeChild(this.svg.firstChild);
    }
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  drawBase() {
    this.clear();
    const { nodes, edges } = this.graph;
    if (this.svg) {
      this.svg.setAttribute('viewBox', '0 0 1000 1000');
      this._addGlow();
      edges.forEach(([a, b]) => {
        const pa = nodes[a];
        const pb = nodes[b];
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', pa.x * 1000);
        line.setAttribute('y1', pa.y * 1000);
        line.setAttribute('x2', pb.x * 1000);
        line.setAttribute('y2', pb.y * 1000);
        line.setAttribute('class', 'edge');
        line.setAttribute('filter', 'url(#glow)');
        this.svg.appendChild(line);
      });
      nodes.forEach((p, i) => {
        const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        c.setAttribute('cx', p.x * 1000);
        c.setAttribute('cy', p.y * 1000);
        c.setAttribute('r', 20);
        c.setAttribute('data-index', i);
        c.setAttribute('class', 'node');
        c.setAttribute('tabindex', 0);
        c.setAttribute('role', 'button');
        c.setAttribute('aria-label', `Node ${i}`);
        this.svg.appendChild(c);
      });
    } else if (this.ctx) {
      const w = (this.canvas.width = this.canvas.clientWidth);
      const h = (this.canvas.height = this.canvas.clientHeight);
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      this.ctx.strokeStyle = '#888';
      edges.forEach(([a, b]) => {
        const pa = nodes[a];
        const pb = nodes[b];
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(pa.x * w, pa.y * h);
        this.ctx.lineTo(pb.x * w, pb.y * h);
        this.ctx.stroke();
      });
      this.ctx.fillStyle = '#444';
      nodes.forEach((p) => {
        this.ctx.beginPath();
        this.ctx.arc(p.x * w, p.y * h, 20, 0, Math.PI * 2);
        this.ctx.fill();
      });
    }
  }

  _addGlow() {
    if (!this.svg || this.svg.querySelector('#glow')) return;
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', 'glow');
    const blur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
    blur.setAttribute('stdDeviation', '3.5');
    blur.setAttribute('result', 'coloredBlur');
    const merge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
    const merge1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
    merge1.setAttribute('in', 'coloredBlur');
    const merge2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
    merge2.setAttribute('in', 'SourceGraphic');
    merge.appendChild(merge1);
    merge.appendChild(merge2);
    filter.appendChild(blur);
    filter.appendChild(merge);
    defs.appendChild(filter);
    this.svg.appendChild(defs);
  }

  _strokeWidth(v) {
    return Math.max(2, Math.min(10, 2 + v * 10));
  }

  markEdge(a, b, velocity = 0) {
    if (this.svg) {
      const edges = this.svg.querySelectorAll('.edge');
      const pa = this.graph.nodes[a];
      const pb = this.graph.nodes[b];
      edges.forEach((line) => {
        const x1 = parseFloat(line.getAttribute('x1'));
        const y1 = parseFloat(line.getAttribute('y1'));
        const x2 = parseFloat(line.getAttribute('x2'));
        const y2 = parseFloat(line.getAttribute('y2'));
        if (
          (x1 === pa.x * 1000 && y1 === pa.y * 1000 &&
            x2 === pb.x * 1000 && y2 === pb.y * 1000) ||
          (x1 === pb.x * 1000 && y1 === pb.y * 1000 &&
            x2 === pa.x * 1000 && y2 === pa.y * 1000)
        ) {
          line.classList.add('path');
          line.classList.remove('hint');
          line.setAttribute('stroke-width', this._strokeWidth(velocity));
        }
      });
    } else if (this.ctx) {
      const pa = this.graph.nodes[a];
      const pb = this.graph.nodes[b];
      const w = this.canvas.width;
      const h = this.canvas.height;
      this.ctx.strokeStyle = '#0f0';
      this.ctx.lineWidth = this._strokeWidth(velocity);
      this.ctx.beginPath();
      this.ctx.moveTo(pa.x * w, pa.y * h);
      this.ctx.lineTo(pb.x * w, pb.y * h);
      this.ctx.stroke();
    }
  }

  unmarkEdge(a, b) {
    const edges = this.svg.querySelectorAll('.edge');
    const pa = this.graph.nodes[a];
    const pb = this.graph.nodes[b];
    edges.forEach(line => {
      const x1 = parseFloat(line.getAttribute('x1'));
      const y1 = parseFloat(line.getAttribute('y1'));
      const x2 = parseFloat(line.getAttribute('x2'));
      const y2 = parseFloat(line.getAttribute('y2'));
      if (
        (x1 === pa.x * 1000 && y1 === pa.y * 1000 && x2 === pb.x * 1000 && y2 === pb.y * 1000) ||
        (x1 === pb.x * 1000 && y1 === pb.y * 1000 && x2 === pa.x * 1000 && y2 === pa.y * 1000)
      ) {
        line.classList.remove('path');
      }
    });
  }

  highlightEdge(a, b) {
    if (!this.svg) return;
    this.svg
      .querySelectorAll('.edge.hint')
      .forEach((l) => l.classList.remove('hint'));
    const edges = this.svg.querySelectorAll('.edge');
    const pa = this.graph.nodes[a];
    const pb = this.graph.nodes[b];
    edges.forEach((line) => {
      const x1 = parseFloat(line.getAttribute('x1'));
      const y1 = parseFloat(line.getAttribute('y1'));
      const x2 = parseFloat(line.getAttribute('x2'));
      const y2 = parseFloat(line.getAttribute('y2'));
      if (
        (x1 === pa.x * 1000 && y1 === pa.y * 1000 &&
          x2 === pb.x * 1000 && y2 === pb.y * 1000) ||
        (x1 === pb.x * 1000 && y1 === pb.y * 1000 &&
          x2 === pa.x * 1000 && y2 === pa.y * 1000)
      ) {
        line.classList.add('hint');
        line.setAttribute('stroke-width', this._strokeWidth(0));
      }
    });
  }
}
