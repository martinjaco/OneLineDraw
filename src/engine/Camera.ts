export interface Vec2 { x: number; y: number }

export default class Camera {
  private state = { x: 0, y: 0, scale: 1 };
  constructor(private element: HTMLElement) {}

  focus(nodes: Vec2[], padding: number = 10) {
    const w = this.element.clientWidth;
    const h = this.element.clientHeight;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodes.forEach((n) => {
      minX = Math.min(minX, n.x);
      minY = Math.min(minY, n.y);
      maxX = Math.max(maxX, n.x);
      maxY = Math.max(maxY, n.y);
    });
    const width = (maxX - minX) * 1000;
    const height = (maxY - minY) * 1000;
    const scale = Math.min(
      (w - padding * 2) / width,
      (h - padding * 2) / height
    );
    const x = -minX * 1000 * scale + (w - width * scale) / 2;
    const y = -minY * 1000 * scale + (h - height * scale) / 2;
    this.animateTo({ x, y, scale });
  }

  private animateTo(target: { x: number; y: number; scale: number }, duration = 300) {
    const start = { ...this.state };
    const startTime = performance.now();
    const ease = (t: number) => t * t * (3 - 2 * t);
    const step = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const k = ease(t);
      this.state.x = start.x + (target.x - start.x) * k;
      this.state.y = start.y + (target.y - start.y) * k;
      this.state.scale = start.scale + (target.scale - start.scale) * k;
      this.element.style.transform = `translate(${this.state.x}px, ${this.state.y}px) scale(${this.state.scale})`;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
}
