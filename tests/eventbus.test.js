import test from 'node:test';
import assert from 'node:assert/strict';
import EventBus from '../src/utils/EventBus.js';

test('EventBus emits and removes listeners', () => {
  const bus = new EventBus();
  let called = 0;
  const handler = (v) => { called += v; };
  bus.on('add', handler);
  bus.emit('add', 2);
  assert.equal(called, 2);
  bus.off('add', handler);
  bus.emit('add', 2);
  assert.equal(called, 2);
});
