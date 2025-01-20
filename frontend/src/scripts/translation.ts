export const availableLocales: ReadonlyArray<[string, string]> = [
  ['en', 'English'],
  ['hr', 'Hrvatski'],
  ['it', 'Italiano'],
];

export const defaultLocale = availableLocales[0][0];

export function chooseAvailableLocale() {
  const localeCodes = availableLocales.map((locale) => locale[0]);
  const persistedLocaleCode = localStorage.getItem('locale')?.toLowerCase();

  if (persistedLocaleCode && localeCodes.includes(persistedLocaleCode)) {
    return persistedLocaleCode;
  } else if (localeCodes.includes(window.navigator.language)) {
    return window.navigator.language;
  }

  const matchingPreference = localeCodes.find((localeCode) =>
    window.navigator.languages.some((otherCode) => otherCode.startsWith(localeCode)),
  );

  return matchingPreference || defaultLocale;
}
