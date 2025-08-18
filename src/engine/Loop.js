import Input from './Input.js';

export default class Loop {
  constructor(opts) {
    this.update = opts.update;
    this.render = opts.render || (() => {});
    this.input = opts.input || null;
    this.running = false;
    this.frame = 0;
    this.last = 0;
    this.accumulator = 0;
    this.step = 1000 / 120;
    this.boundTick = this.tick.bind(this);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    requestAnimationFrame(this.boundTick);
  }

  stop() {
    this.running = false;
  }

  tick(time) {
    if (!this.running) return;
    this.accumulator += time - this.last;
    this.last = time;
    while (this.accumulator >= this.step) {
      this.stepFrame();
      this.accumulator -= this.step;
    }
    this.render();
    requestAnimationFrame(this.boundTick);
  }

  stepFrame() {
    this.frame++;
    const events = this.input ? this.input.poll(this.frame) : [];
    this.update(events, this.step);
  }
}
