const root = document.documentElement;
const toggle = document.querySelector<HTMLButtonElement>('.theme-toggle');
const THEME_COLORS = { light: '#ffffff', dark: '#141312' } as const;

function effectiveTheme(): 'light' | 'dark' {
  const chosen = root.dataset.theme;
  // Standard ist das dunkle Design, hell nur auf Wunsch.
  return chosen === 'light' ? 'light' : 'dark';
}

function sync(): void {
  const theme = effectiveTheme();
  toggle?.setAttribute('aria-pressed', String(theme === 'dark'));
  for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) meta.content = THEME_COLORS[theme];
}

toggle?.addEventListener('click', () => {
  const next = effectiveTheme() === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  try {
    localStorage.setItem('theme', next);
  } catch {
    // Speicher nicht verfügbar – Auswahl gilt nur für diese Seite.
  }
  sync();
});
sync();
