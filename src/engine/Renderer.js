export default class Renderer {
  constructor(svg, graph) {
    this.svg = svg;
    this.graph = graph;
    this.drawBase();
  }

  clear() {
    while (this.svg.firstChild) this.svg.removeChild(this.svg.firstChild);
  }

  drawBase() {
    this.clear();
    const { nodes, edges } = this.graph;
    this.svg.setAttribute("viewBox", "0 0 1000 1000");
    edges.forEach(([a, b]) => {
      const pa = nodes[a];
      const pb = nodes[b];
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", pa.x * 1000);
      line.setAttribute("y1", pa.y * 1000);
      line.setAttribute("x2", pb.x * 1000);
      line.setAttribute("y2", pb.y * 1000);
      line.setAttribute("class", "edge");
      this.svg.appendChild(line);
    });
    nodes.forEach((p, i) => {
      const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("cx", p.x * 1000);
      c.setAttribute("cy", p.y * 1000);
      c.setAttribute("r", 20);
      c.setAttribute("data-index", i);
      c.setAttribute("class", "node");
      c.setAttribute("tabindex", 0);
      c.setAttribute("role", "button");
      c.setAttribute("aria-label", `Node ${i}`);
      this.svg.appendChild(c);
    });
  }

  markEdge(a, b) {
    const edges = this.svg.querySelectorAll(".edge");
    const pa = this.graph.nodes[a];
    const pb = this.graph.nodes[b];
    edges.forEach((line) => {
      const x1 = parseFloat(line.getAttribute("x1"));
      const y1 = parseFloat(line.getAttribute("y1"));
      const x2 = parseFloat(line.getAttribute("x2"));
      const y2 = parseFloat(line.getAttribute("y2"));
      if (
        (x1 === pa.x * 1000 && y1 === pa.y * 1000 &&
          x2 === pb.x * 1000 && y2 === pb.y * 1000) ||
        (x1 === pb.x * 1000 && y1 === pb.y * 1000 &&
          x2 === pa.x * 1000 && y2 === pa.y * 1000)
      ) {
        line.classList.add("path");
        line.classList.remove("hint");
      }
    });
  }

  highlightEdge(a, b) {
    this.svg.querySelectorAll('.edge.hint').forEach(l => l.classList.remove('hint'));
    const edges = this.svg.querySelectorAll('.edge');
    const pa = this.graph.nodes[a];
    const pb = this.graph.nodes[b];
    edges.forEach((line) => {
      const x1 = parseFloat(line.getAttribute("x1"));
      const y1 = parseFloat(line.getAttribute("y1"));
      const x2 = parseFloat(line.getAttribute("x2"));
      const y2 = parseFloat(line.getAttribute("y2"));
      if (
        (x1 === pa.x * 1000 && y1 === pa.y * 1000 &&
          x2 === pb.x * 1000 && y2 === pb.y * 1000) ||
        (x1 === pb.x * 1000 && y1 === pb.y * 1000 &&
          x2 === pa.x * 1000 && y2 === pa.y * 1000)
      ) {
        line.classList.add('hint');
      }
    });
  }
}
