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
export function announce(msg: string): void {
  const region = document.getElementById('announcer');
  if (region) {
    region.textContent = '';
    // force screen readers to announce even if same text
    region.textContent = msg;
  }
}

let lastFocused: HTMLElement | null = null;
let trapHandler: ((e: KeyboardEvent) => void) | null = null;

export function showModal(modal: HTMLElement): void {
  lastFocused = document.activeElement as HTMLElement;
  modal.classList.remove('hidden');
  const focusable = modal.querySelector<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  (focusable || modal).focus();
  trapHandler = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      const focusables = Array.from(
        modal.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      );
      if (focusables.length === 0) {
        e.preventDefault();
        (modal as HTMLElement).focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    } else if (e.key === 'Escape') {
      hideModal(modal);
    }
  };
  modal.addEventListener('keydown', trapHandler);
}

export function hideModal(modal: HTMLElement): void {
  modal.classList.add('hidden');
  if (trapHandler) {
    modal.removeEventListener('keydown', trapHandler);
    trapHandler = null;
  }
  if (lastFocused) {
    lastFocused.focus();
    lastFocused = null;
  }
}
