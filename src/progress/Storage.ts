const KEY = 'onelinedraw_progress';
const RATING_KEY = 'onelinedraw_rating';

export interface ProgressState {
  hearts: number;
  timer: number;
  mode: string;
  rating: number;
  version: number;
}

const DEFAULT: ProgressState = {
  hearts: 3,
  timer: 0,
  mode: 'classic',
  rating: 1000,
  version: 2,
};

const storage = typeof localStorage !== 'undefined' ? localStorage : null;

function migrate(data: any): ProgressState {
  const version = data.version || 1;
  if (version >= 2) {
    return { ...DEFAULT, ...data };
  }
  const migrated: ProgressState = {
    hearts: data.hearts ?? DEFAULT.hearts,
    timer: data.timer ?? DEFAULT.timer,
    mode: data.mode ?? DEFAULT.mode,
    rating: data.rating ?? DEFAULT.rating,
    version: 2,
  };
  if (storage) storage.setItem(KEY, JSON.stringify(migrated));
  return migrated;
}

export function loadProgress(): ProgressState {
  if (!storage) return { ...DEFAULT };
  const raw = storage.getItem(KEY);
  if (raw) {
    try {
      const data = JSON.parse(raw);
      return migrate(data);
    } catch {
      return { ...DEFAULT };
    }
  }
  const oldRating = parseInt(storage.getItem(RATING_KEY) || '0', 10);
  const progress: ProgressState = {
    ...DEFAULT,
    rating: Number.isFinite(oldRating) ? oldRating : DEFAULT.rating,
  };
  storage.setItem(KEY, JSON.stringify(progress));
  storage.removeItem(RATING_KEY);
  return progress;
}

export function saveProgress(update: Partial<ProgressState>): void {
  if (!storage) return;
  const current = loadProgress();
  const next = { ...current, ...update };
  storage.setItem(KEY, JSON.stringify(next));
}

export function clearProgress(): void {
  if (storage) storage.removeItem(KEY);
}
=======
const storage = typeof localStorage !== 'undefined' ? localStorage : null;

export function load(key, fallback) {
  if (!storage) return fallback;
  try {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  if (!storage) return;
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}
const KEY = 'onelinedraw_progress';
const storage = typeof localStorage !== 'undefined' ? localStorage : null;
const defaults = {
  currentLevel: 0,
  unlockedLevels: [0],
  bestStats: {},
  mode: 'classic',
  theme: 'dark',
  audio: { music: true, sfx: true },
  locale: 'en',
  daily: {}
};

function read() {
  if (!storage) return { ...defaults };
  try {
    const raw = storage.getItem(KEY);
    if (!raw) return { ...defaults };
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return { ...defaults };
  }
}

function write(data) {
  if (storage) storage.setItem(KEY, JSON.stringify(data));
}

export function getTheme() {
  return read().theme;
}

export function setTheme(theme) {
  const data = read();
  data.theme = theme;
  write(data);
}

export function getAudio() {
  return read().audio;
}

export function setAudio(audio) {
  const data = read();
  data.audio = audio;
  write(data);
}

export function getMode() {
  return read().mode;
}

export function setMode(mode) {
  const data = read();
  data.mode = mode;
  write(data);
}

export function getLocale() {
  return read().locale;
}

export function setLocale(locale) {
  const data = read();
  data.locale = locale;
  write(data);
}

export function getCurrentLevel() {
  return read().currentLevel;
}

export function setCurrentLevel(level) {
  const data = read();
  data.currentLevel = level;
  write(data);
}

export function getUnlockedLevels() {
  return read().unlockedLevels;
}

export function unlockLevel(level) {
  const data = read();
  if (!data.unlockedLevels.includes(level)) data.unlockedLevels.push(level);
  write(data);
}

export function getBestStats() {
  return read().bestStats;
}

export function updateBestStats(level, stats) {
  const data = read();
  const current = data.bestStats[level] || { hearts: 0, time: 0 };
  if (stats.hearts > current.hearts) current.hearts = stats.hearts;
  if (stats.time > current.time) current.time = stats.time;
  data.bestStats[level] = current;
  write(data);
}

export function getDaily(date) {
  const data = read();
  return data.daily[date] || { solved: false, perfect: false, gold: false };
}

export function updateDaily(date, result) {
  const data = read();
  const entry = data.daily[date] || { solved: false, perfect: false, gold: false };
  if (result.solved) entry.solved = true;
  if (result.perfect) entry.perfect = true;
  if (result.gold) entry.gold = true;
  data.daily[date] = entry;
  write(data);
}

export default {
  getTheme,
  setTheme,
  getAudio,
  setAudio,
  getMode,
  setMode,
  getLocale,
  setLocale,
  getCurrentLevel,
  setCurrentLevel,
  getUnlockedLevels,
  unlockLevel,
  getBestStats,
  updateBestStats,
  getDaily,
  updateDaily
};
