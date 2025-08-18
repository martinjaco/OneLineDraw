import { loadProgress, saveProgress } from './Storage.js';

export function loadRating() {
  return loadProgress().rating;
}

export function saveRating(val) {
  saveProgress({ rating: val });
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

export function recommendLevel(rating, totalLevels) {
  const idx = Math.floor((rating - 800) / 50);
  return Math.max(0, Math.min(totalLevels - 1, idx));
}
