import test from 'node:test';
import assert from 'node:assert/strict';
import Graph from '../src/core/Graph.js';
import Solver from '../src/core/Solver.js';

test('Solver returns edge trail for triangle', () => {
  const nodes = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0.5, y: 1 }
  ];
  const edges = [ [0,1], [1,2], [2,0] ];
  const g = new Graph(nodes, edges);
  const solver = new Solver(g);
  const path = solver.solve();
  assert.equal(path.length, edges.length);
});
