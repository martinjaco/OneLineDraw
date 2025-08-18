export function announce(msg) {
  const region = document.getElementById('announcer');
  if (region) {
    region.textContent = '';
    region.textContent = msg;
  }
}

let lastFocused = null;
let trapHandler = null;

export function showModal(modal) {
  lastFocused = document.activeElement;
  modal.classList.remove('hidden');
  const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  (focusable || modal).focus();
  trapHandler = (e) => {
    if (e.key === 'Tab') {
      const focusables = Array.from(modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'));
      if (focusables.length === 0) {
        e.preventDefault();
        modal.focus();
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

export function hideModal(modal) {
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
