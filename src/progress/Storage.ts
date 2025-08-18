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
