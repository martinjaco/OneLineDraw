const THEMES = ['dark','light','high','protan','deutan','tritan'];

export function initTheme(){
  const saved = localStorage.getItem('theme');
  const theme = saved && THEMES.includes(saved) ? saved : 'dark';
  document.documentElement.dataset.theme = theme;
  return theme;
}

export function cycleTheme(current){
  const next = THEMES[(THEMES.indexOf(current)+1)%THEMES.length];
  document.documentElement.dataset.theme = next;
  localStorage.setItem('theme', next);
  return next;
}
