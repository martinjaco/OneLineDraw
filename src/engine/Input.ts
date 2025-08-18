interface RecordedEvent<T=any> {
  frame: number;
  event: T;
}

export default class Input<T=any> {
  private queue: T[] = [];
  private recording: RecordedEvent<T>[] | null = null;
  private playback: RecordedEvent<T>[] | null = null;
  private playbackIndex = 0;

  capture(event: T) {
    this.queue.push(event);
  }

  poll(frame: number): T[] {
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

  stopRecording(): RecordedEvent<T>[] {
    const rec = this.recording || [];
    this.recording = null;
    return rec.slice();
  }

  startPlayback(recording: RecordedEvent<T>[]) {
    this.playback = recording.slice();
    this.playbackIndex = 0;
  }

  stopPlayback() {
    this.playback = null;
    this.playbackIndex = 0;
  }
}
