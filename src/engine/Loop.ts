import Input from './Input.js';

type UpdateFn = (events: any[], dt: number) => void;
type RenderFn = () => void;

export default class Loop {
  private update: UpdateFn;
  private render: RenderFn;
  private input: Input | null;
  private running = false;
  private frame = 0;
  private last = 0;
  private accumulator = 0;
  private readonly step = 1000 / 120;
  private readonly boundTick: FrameRequestCallback;

  constructor(opts: { update: UpdateFn; render?: RenderFn; input?: Input }) {
    this.update = opts.update;
    this.render = opts.render || (() => {});
    this.input = opts.input || null;
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

  private tick(time: number) {
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
