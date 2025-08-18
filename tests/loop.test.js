import test from 'node:test';
import assert from 'node:assert/strict';
import Input from '../src/engine/Input.js';
import State from '../src/engine/State.js';
import Loop from '../src/engine/Loop.js';

test('recorded input replays deterministically', () => {
  const input = new Input();
  const state = new State();
  state.on('move', (e) => { state.pos = (state.pos || 0) + e.value; });
  const loop = new Loop({ update: (events) => state.update(events), input });

  input.startRecording();
  input.capture({ type: 'move', value: 1 });
  loop.stepFrame(); // frame1
  loop.stepFrame(); // frame2 no input
  input.capture({ type: 'move', value: -1 });
  loop.stepFrame(); // frame3
  const record = input.stopRecording();
  const final = state.pos;

  // replay
  const replayInput = new Input();
  const replayState = new State();
  replayState.on('move', (e) => { replayState.pos = (replayState.pos || 0) + e.value; });
  const replayLoop = new Loop({ update: (ev) => replayState.update(ev), input: replayInput });
  replayInput.startPlayback(record);
  replayLoop.stepFrame();
  replayLoop.stepFrame();
  replayLoop.stepFrame();

  assert.equal(replayState.pos, final);
});
