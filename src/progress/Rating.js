const KEY = 'onelinedraw_rating';
const storage = typeof localStorage !== 'undefined' ? localStorage : null;

export function loadRating() {
  if (!storage) return 1000;
  const val = parseInt(storage.getItem(KEY), 10);
  return Number.isFinite(val) ? val : 1000;
}

export function saveRating(val) {
  if (storage) storage.setItem(KEY, String(val));
}

export function updateRating(current, win) {
  const K = 32;
  const expected = 0.5;
  const score = win ? 1 : 0;
  return Math.max(0, Math.round(current + K * (score - expected)));
}

export function getHintDelay(rating) {
  const delay = 10000 - (rating - 1000) * 5;
  return Math.max(3000, Math.min(15000, delay));
}
