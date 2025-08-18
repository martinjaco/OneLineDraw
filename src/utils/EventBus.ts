export default class EventBus {
  private listeners: Map<string, Set<Function>> = new Map();

  on(event: string, handler: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
    return () => this.off(event, handler);
  }

  off(event: string, handler: Function) {
    const set = this.listeners.get(event);
    if (set) {
      set.delete(handler);
      if (set.size === 0) this.listeners.delete(event);
    }
  }

  emit(event: string, data?: any) {
    const set = this.listeners.get(event);
    if (set) {
      for (const handler of Array.from(set)) handler(data);
    }
  }

  once(event: string, handler: Function) {
    const wrapper = (data: any) => {
      this.off(event, wrapper);
      handler(data);
    };
    this.on(event, wrapper);
  }

  clear() {
    this.listeners.clear();
  }
}
