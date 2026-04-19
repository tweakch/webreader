import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Sidebar from '../../components/Sidebar';
import { renderWithTheme } from './helpers';

/**
 * Minimal prop set that keeps Sidebar renderable. Focused on the age-filter
 * surface — other features (directory drill-in, stats, favorites shelf) are
 * covered by their own specs.
 */
const defaults = {
  menuOpen: true,
  onMenuToggle: vi.fn(),
  searchTerm: '',
  onSearchChange: vi.fn(),
  showDeepSearch: false,
  favoritesOnly: false,
  onToggleFavoritesOnly: vi.fn(),
  showFavoritesOnlyToggle: false,
  showFavorites: false,
  selectedStory: null,
  activeSource: null,
  onSelectSource: vi.fn(),
  activeDirectory: null,
  onSelectDirectory: vi.fn(),
  showStoryDirectories: false,
  directoriesBySource: {},
  onSelectStory: vi.fn(),
  completedStories: new Set(),
  favorites: new Set(),
  onToggleFavorite: vi.fn(),
  showWordCount: false,
  showReadingDuration: false,
  storyWordCount: 0,
  readingMinutes: 0,
  favoriteStories: [],
  filteredStories: [],
  sources: [],
  storiesBySource: {},
  onOpenProfile: vi.fn(),
  profileOpen: false,
  onCloseProfile: vi.fn(),
  onCloseApp: vi.fn(),
};

function render(props = {}) {
  return renderWithTheme(<Sidebar {...defaults} {...props} />);
}

describe('Sidebar age-filter picker', () => {
  it('is hidden when showAgeFilter is false', () => {
    render({ showAgeFilter: false });
    expect(screen.queryByTestId('age-filter')).not.toBeInTheDocument();
    expect(screen.queryByTestId('child-age-select')).not.toBeInTheDocument();
  });

  it('renders the age picker with the "Alle Altersstufen" default when showAgeFilter is true', () => {
    render({ showAgeFilter: true, childAge: null });
    expect(screen.getByTestId('age-filter')).toBeInTheDocument();
    const select = screen.getByTestId('child-age-select');
    expect(select).toHaveValue('');
    expect(screen.getByRole('option', { name: 'Alle Altersstufen' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '6 Jahre' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '12 Jahre' })).toBeInTheDocument();
  });

  it('reflects the current childAge value', () => {
    render({ showAgeFilter: true, childAge: 8 });
    expect(screen.getByTestId('child-age-select')).toHaveValue('8');
  });

  it('fires onChildAgeChange with a number when an age is selected', async () => {
    const onChildAgeChange = vi.fn();
    render({ showAgeFilter: true, childAge: null, onChildAgeChange });
    await userEvent.selectOptions(screen.getByTestId('child-age-select'), '6');
    expect(onChildAgeChange).toHaveBeenCalledWith(6);
  });

  it('fires onChildAgeChange with null when "Alle Altersstufen" is selected', async () => {
    const onChildAgeChange = vi.fn();
    render({ showAgeFilter: true, childAge: 8, onChildAgeChange });
    await userEvent.selectOptions(screen.getByTestId('child-age-select'), '');
    expect(onChildAgeChange).toHaveBeenCalledWith(null);
  });
});
