const THEMES = ['dark','light','high','protan','deutan','tritan'];
import { getTheme, setTheme } from '../progress/Storage.ts';

const THEMES = ['dark','light','high'];

export function initTheme(){
  const saved = getTheme();
  const theme = saved && THEMES.includes(saved) ? saved : 'dark';
  document.documentElement.dataset.theme = theme;
  if (saved !== theme) setTheme(theme);
  return theme;
}

export function cycleTheme(current){
  const next = THEMES[(THEMES.indexOf(current)+1)%THEMES.length];
  document.documentElement.dataset.theme = next;
  setTheme(next);
  return next;
}
