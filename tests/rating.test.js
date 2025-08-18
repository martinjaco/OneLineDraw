import { test } from 'node:test';
import assert from 'node:assert/strict';
import { updateRating, getHintDelay, recommendLevel } from '../src/progress/Rating.js';

test('updateRating adjusts score', () => {
  assert.ok(updateRating(1000, true) > 1000);
  assert.ok(updateRating(1000, false) < 1000);
});

test('getHintDelay clamps between 3s and 15s', () => {
  assert.equal(getHintDelay(4000), 3000);
  assert.equal(getHintDelay(0), 15000);
});

test('recommendLevel scales rating to level index', () => {
  assert.equal(recommendLevel(1000, 10), 4);
  assert.equal(recommendLevel(0, 10), 0);
  assert.equal(recommendLevel(9999, 5), 4);
});
