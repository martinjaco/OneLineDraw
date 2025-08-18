import EventBus from '../utils/EventBus.js';

export default class UI {
  private bus: EventBus;
  constructor(bus: EventBus) {
    this.bus = bus;
  }

  bindButton(el: HTMLElement, event: string) {
    el.addEventListener('click', () => this.bus.emit(event));
  }

  show(el: HTMLElement) {
    el.classList.remove('hidden');
  }

  hide(el: HTMLElement) {
    el.classList.add('hidden');
  }
}
