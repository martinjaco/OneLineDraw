export default class Input {
  constructor() {
    this.queue = [];
    this.recording = null;
    this.playback = null;
    this.playbackIndex = 0;
  }

  capture(event) {
    this.queue.push(event);
  }

  poll(frame) {
    const events = this.queue;
    this.queue = [];
    if (this.recording) {
      for (const e of events) this.recording.push({ frame, event: e });
    }
    if (this.playback) {
      while (
        this.playbackIndex < this.playback.length &&
        this.playback[this.playbackIndex].frame === frame
      ) {
        events.push(this.playback[this.playbackIndex].event);
        this.playbackIndex++;
      }
    }
    return events;
  }

  startRecording() {
    this.recording = [];
  }

  stopRecording() {
    const rec = this.recording || [];
    this.recording = null;
    return rec.slice();
  }

  startPlayback(recording) {
    this.playback = recording.slice();
    this.playbackIndex = 0;
  }

  stopPlayback() {
    this.playback = null;
    this.playbackIndex = 0;
  }
}
