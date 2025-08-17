export default class AudioManager {
  constructor() {
    this.ctx = null;
    this.musicOsc = null;
    this.musicGain = null;
    const saved = JSON.parse(localStorage.getItem('audio') || '{}');
    this.enabled = {
      music: saved.music !== undefined ? saved.music : true,
      sfx: saved.sfx !== undefined ? saved.sfx : true,
    };
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  save() {
    localStorage.setItem('audio', JSON.stringify(this.enabled));
  }

  toggle(type) {
    this.enabled[type] = !this.enabled[type];
    this.save();
    if (type === 'music') {
      if (this.enabled.music) this.startMusic();
      else this.stopMusic();
    }
    return this.enabled[type];
  }

  startMusic() {
    if (!this.ctx || !this.enabled.music || this.musicOsc) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.value = 110; // mellow tone
    gain.gain.value = 0.05;
    osc.connect(gain).connect(this.ctx.destination);
    osc.start();
    this.musicOsc = osc;
    this.musicGain = gain;
  }

  stopMusic() {
    if (this.musicOsc) {
      this.musicOsc.stop();
      this.musicOsc.disconnect();
      this.musicOsc = null;
    }
  }

  play(type) {
    if (!this.ctx || !this.enabled.sfx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    let freq = 440;
    switch (type) {
      case 'fail':
        freq = 220;
        break;
      case 'complete':
        freq = 660;
        break;
      default:
        freq = 440;
    }
    osc.frequency.value = freq;
    osc.connect(gain).connect(this.ctx.destination);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }
}
