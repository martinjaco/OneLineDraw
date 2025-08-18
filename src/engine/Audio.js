import { load, save } from '../progress/Storage.ts';

const FILES = {
  music: 'assets/music.mp3',
  connect: 'assets/connect.wav',
  fail: 'assets/fail.wav',
  complete: 'assets/complete.wav',
};

export default class AudioManager {
  constructor() {
    this.ctx = null;
    this.buffers = {};
    this.musicSource = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.duckGain = null;
    const saved = load('audio', {
      enabled: { music: true, sfx: true },
      volume: { music: 1, sfx: 1 },
    });
    this.enabled = saved.enabled;
    this.volume = saved.volume;
  }

  init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    this.ctx = new AudioCtx();
    this.musicGain = this.ctx.createGain();
    this.sfxGain = this.ctx.createGain();
    this.duckGain = this.ctx.createGain();
    this.duckGain.gain.value = 1;
    this.musicGain.connect(this.duckGain).connect(this.ctx.destination);
    this.sfxGain.connect(this.ctx.destination);
    this.setVolume('music', this.volume.music);
    this.setVolume('sfx', this.volume.sfx);
  }

  async loadBuffer(name) {
    if (this.buffers[name]) return this.buffers[name];
    const file = FILES[name];
    if (!file || !this.ctx) return null;
    const res = await fetch(file);
    const arr = await res.arrayBuffer();
    const buf = await this.ctx.decodeAudioData(arr);
    this.buffers[name] = buf;
    return buf;
  }

  save() {
    save('audio', { enabled: this.enabled, volume: this.volume });
  }

  toggle(type) {
    this.enabled[type] = !this.enabled[type];
    this.setVolume(type, this.volume[type]);
    if (type === 'music') {
      if (this.enabled.music) this.startMusic();
      else this.stopMusic();
    }
    this.save();
    return this.enabled[type];
  }

  setVolume(type, val) {
    this.volume[type] = val;
    if (type === 'music' && this.musicGain) {
      this.musicGain.gain.value = this.enabled.music ? val : 0;
    } else if (type === 'sfx' && this.sfxGain) {
      this.sfxGain.gain.value = this.enabled.sfx ? val : 0;
    }
    this.save();
  }

  duck(on) {
    if (!this.duckGain || !this.ctx) return;
    const target = on ? 0.3 : 1;
    this.duckGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.duckGain.gain.linearRampToValueAtTime(target, this.ctx.currentTime + 0.1);
  }

  async startMusic() {
    if (!this.enabled.music) return;
    this.init();
    if (!this.ctx || this.musicSource) return;
    await this.ctx.resume();
    const buffer = await this.loadBuffer('music');
    if (!buffer) return;
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    src.connect(this.musicGain);
    src.start();
    this.musicSource = src;
  }

  stopMusic() {
    if (this.musicSource) {
      this.musicSource.stop();
      this.musicSource.disconnect();
      this.musicSource = null;
    }
  }

  async play(type) {
    if (!this.enabled.sfx) return;
    this.init();
    if (!this.ctx) return;
    const buffer = await this.loadBuffer(type);
    if (!buffer) return;
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(this.sfxGain);
    src.start();
  }
}
