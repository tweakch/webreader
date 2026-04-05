import { render } from '@testing-library/react';
import { ThemeContext } from '../../ui/ThemeContext';

/** Render a component wrapped in ThemeContext with light theme (default). */
export function renderWithTheme(ui, { dark = false, hc = false } = {}) {
  return render(
    <ThemeContext.Provider value={{ dark, hc }}>
      {ui}
    </ThemeContext.Provider>
  );
}

/** Minimal story object for tests. */
export const STORY = {
  id: 'grimm/aschenputtel',
  title: 'Aschenputtel',
  content: 'Es war einmal ein reiches Kind.\n\nDie Mutter starb bald.',
  source: 'grimm',
  sourceLabel: 'Brüder Grimm',
  wordCount: 10,
};

/** Minimal page token array (two words, one paragraph). */
export const PAGE = {
  hasTitle: true,
  tokens: [
    { word: 'Es', isPara: false },
    { word: 'war', isPara: false },
    { word: 'einmal.', isPara: true },
  ],
};
