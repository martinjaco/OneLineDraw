export type Handler<T=any> = (event: T) => void;

export default class State<T=any> {
  private handlers: Map<string, Handler<T>> = new Map();

  on(type: string, handler: Handler<T>) {
    this.handlers.set(type, handler);
  }

  off(type: string) {
    this.handlers.delete(type);
  }

  update(events: any[]) {
    for (const e of events) {
      const handler = this.handlers.get(e.type);
      if (handler) handler(e);
    }
  }
}
