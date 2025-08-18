export default class State {
  constructor() {
    this.handlers = new Map();
  }

  on(type, handler) {
    this.handlers.set(type, handler);
  }

  off(type) {
    this.handlers.delete(type);
  }

  update(events) {
    for (const e of events) {
      const handler = this.handlers.get(e.type);
      if (handler) handler(e);
    }
  }
}
