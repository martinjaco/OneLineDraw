import EventBus from '../utils/EventBus.js';

export default class UI {
  constructor(bus) {
    this.bus = bus;
  }

  bindButton(el, event) {
    el.addEventListener('click', () => this.bus.emit(event));
  }

  show(el) {
    el.classList.remove('hidden');
  }

  hide(el) {
    el.classList.add('hidden');
  }
}
