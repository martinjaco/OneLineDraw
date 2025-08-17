import { test } from 'node:test';
import assert from 'node:assert/strict';
import { updateRating, getHintDelay } from '../src/progress/Rating.js';

test('updateRating adjusts score', () => {
  assert.ok(updateRating(1000, true) > 1000);
  assert.ok(updateRating(1000, false) < 1000);
});

test('getHintDelay clamps between 3s and 15s', () => {
  assert.equal(getHintDelay(4000), 3000);
  assert.equal(getHintDelay(0), 15000);
});
