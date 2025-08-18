export default class Particles {
  constructor(container) {
    this.container = container;
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'absolute';
    this.canvas.style.left = '0';
    this.canvas.style.top = '0';
    this.canvas.style.pointerEvents = 'none';
    this.resize();
    this.container.appendChild(this.canvas);
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');
    this.ctx = ctx;
    this.particles = [];
    window.addEventListener('resize', () => this.resize());
    requestAnimationFrame(() => this.loop());
  }

  resize() {
    this.canvas.width = this.container.clientWidth;
    this.canvas.height = this.container.clientHeight;
  }

  add(p) {
    this.particles.push(p);
    if (this.particles.length > 200) {
      this.particles.splice(0, this.particles.length - 200);
    }
  }

  connectBurst(x, y) {
    for (let i = 0; i < 20; i++) {
      this.add({
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 0.5,
        color: '#0f0',
        size: 2,
      });
    }
  }

  solveConfetti() {
    const colors = ['#ff6', '#6f6', '#66f', '#f66', '#6ff'];
    for (let i = 0; i < 40; i++) {
      this.add({
        x: this.canvas.width / 2,
        y: this.canvas.height / 2,
        vx: (Math.random() - 0.5) * 6,
        vy: Math.random() * -4 - 2,
        life: 1,
        color: colors[i % colors.length],
        size: 3,
      });
    }
  }

  errorSparks(x, y) {
    for (let i = 0; i < 15; i++) {
      this.add({
        x,
        y,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5,
        life: 0.4,
        color: '#f00',
        size: 2,
      });
    }
  }

  loop() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.loop());
  }

  update() {
    const dt = 1 / 60;
    this.particles.forEach((p) => {
      p.x += p.vx * 60 * dt;
      p.y += p.vy * 60 * dt;
      p.life -= dt;
    });
    this.particles = this.particles.filter((p) => p.life > 0);
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.particles.forEach((p) => {
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }
}
