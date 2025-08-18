export default class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(handler);
    return () => this.off(event, handler);
  }

  off(event, handler) {
    const set = this.listeners.get(event);
    if (set) {
      set.delete(handler);
      if (set.size === 0) this.listeners.delete(event);
    }
  }

  emit(event, data) {
    const set = this.listeners.get(event);
    if (set) {
      for (const handler of Array.from(set)) handler(data);
    }
  }

  once(event, handler) {
    const wrapper = (data) => {
      this.off(event, wrapper);
      handler(data);
    };
    this.on(event, wrapper);
  }

  clear() {
    this.listeners.clear();
  }
}
