export default class Graph {
  constructor(nodes = [], edges = []) {
    this.nodes = nodes;
    this.edges = edges;
    this.adj = this.buildAdjacency();
  }

  buildAdjacency() {
    const adj = Array.from({ length: this.nodes.length }, () => []);
    this.edges.forEach(([a, b], index) => {
      adj[a].push({ node: b, index });
      adj[b].push({ node: a, index });
    });
    return adj;
  }

  edgeExists(a, b) {
    return this.edges.some(
      (e) => (e[0] === a && e[1] === b) || (e[0] === b && e[1] === a)
    );
  }

  degree(i) {
    return this.adj[i].length;
  }

  eulerian() {
    let odd = 0;
    for (let i = 0; i < this.nodes.length; i++) {
      if (this.degree(i) % 2 !== 0) odd++;
    }
    if (odd === 0) return "circuit";
    if (odd === 2) return "trail";
    return false;
  }
}
