import { defineStore } from 'pinia';
import { ref } from 'vue';

type Theme = 'light' | 'dark';

/**
 * Global states available regardless of whether the user is authenticated or not.
 */
const useGlobalStore = defineStore('global', () => {
  const theme = ref<Theme>('light');

  /**
   * @deprecated Multiple themes are a planned feature for the future
   * @returns Whether the currently selected theme is the dark theme
   */
  function isDarkTheme() {
    return theme.value == 'dark';
  }

  function setTheme(newTheme: Theme, store: boolean = false) {
    theme.value = newTheme;
    document.documentElement.classList.toggle('dark', isDarkTheme());

    if (store) {
      localStorage.setItem('theme', theme.value);
    }
  }

  function toggleTheme() {
    setTheme(isDarkTheme() ? 'light' : 'dark', true);
  }

  function getSavedTheme(): Theme | null {
    const found = localStorage.getItem('theme')?.toLowerCase();

    if (found != 'dark' && found != 'light') return null;

    return found;
  }

  /**
   * Sets the current theme by priority to the theme:
   * 1. stored in current authenticated user, otherwise if not authenticated:
   * 2. the one stored in localStorage,
   * 3. otherwise uses the default one used by the browser or system.
   */
  function loadPreferredTheme() {
    const newTheme =
      getSavedTheme() ??
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

    setTheme(newTheme);
  }

  loadPreferredTheme();

  return { theme, isDarkTheme, setTheme, toggleTheme, getSavedTheme, loadPreferredTheme };
});

export default useGlobalStore;
