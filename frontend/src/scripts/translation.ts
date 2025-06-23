export const availableLocales: ReadonlyArray<[string, string]> = [
  ['en', 'English'],
  ['hr', 'Hrvatski'],
  ['it', 'Italiano'],
];

export const defaultLocale = availableLocales[0][0];

export function chooseAvailableLocale() {
  const localeCodes = availableLocales.map((locale) => locale[0]);
  const persistedLocaleCode = localStorage.getItem('locale')?.toLowerCase();

  if (persistedLocaleCode && localeCodes.includes(persistedLocaleCode)) return persistedLocaleCode;

  for (const localeCode of window.navigator.languages) {
    const found = localeCodes.find((otherCode) => localeCode.startsWith(otherCode));

    if (found) return found;
  }

  return defaultLocale;
}
