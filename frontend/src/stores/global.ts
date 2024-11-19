import { defineStore } from 'pinia';
import { ref } from 'vue';

const knownLanguages = ['en-us', 'hr-hr'];

/**
 * Global states available regardless of whether the user is authenticated or not.
 */
const useGlobalStore = defineStore('global', () => {
  const theme = ref('light');
  const language = ref<string>('en-us');

  /**
   * @deprecated Multiple themes are a planned feature for the future
   * @returns Whether the currently selected theme is the dark theme
   */
  function isDarkTheme() {
    return theme.value == 'dark';
  }

  function setTheme(newTheme: string, store: boolean = false) {
    theme.value = newTheme;
    document.documentElement.classList.toggle('dark', isDarkTheme());

    if (store) {
      localStorage.setItem('theme', theme.value);
    }
  }

  function setLanguage(newLanguage: string) {
    if (knownLanguages.includes(newLanguage.toLowerCase())) {
      language.value = newLanguage;
    }
  }

  function toggleTheme() {
    setTheme(isDarkTheme() ? 'light' : 'dark');
  }

  function getSavedTheme() {
    return localStorage.getItem('theme');
  }

  /**
   * Sets the current theme by priority to the theme:
   * 1. stored in current authenticated user, otherwise if not authenticated:
   * 2. the one stored in localStorage,
   * 3. otherwise uses the default one used by the browser or system.
   */
  function loadPreferredTheme() {
    const newTheme = getSavedTheme()
      ?? (window.matchMedia('(prefers-color-scheme: dark').matches
        ? 'dark'
        : 'light');

    setTheme(newTheme);
  }

  loadPreferredTheme();

  return { theme, language, isDarkTheme, setTheme, setLanguage, toggleTheme, getSavedTheme, loadPreferredTheme };
});

export default useGlobalStore;
