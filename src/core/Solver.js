export default class Solver {
  constructor(graph) {
    this.graph = graph;
  }

  solve() {
    const g = this.graph;
    const used = new Array(g.edges.length).fill(false);
    const path = [];
    const stack = [this.startNode()];
    while (stack.length) {
      const v = stack[stack.length - 1];
      const neighbors = g.adj[v];
      let found = false;
      for (const { node: u, index } of neighbors) {
        if (!used[index]) {
          used[index] = true;
          stack.push(u);
          found = true;
          break;
        }
      }
      if (!found) {
        path.push(stack.pop());
      }
    }
    path.reverse();
    const edges = [];
    for (let i = 1; i < path.length; i++) {
      edges.push([path[i - 1], path[i]]);
    }
    return edges;
  }

  startNode() {
    const g = this.graph;
    const odd = [];
    for (let i = 0; i < g.nodes.length; i++) {
      if (g.degree(i) % 2 === 1) odd.push(i);
    }
    return odd.length > 0 ? odd[0] : 0;
  }
}
