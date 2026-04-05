import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HomeView from '../../components/HomeView';
import { renderWithTheme, STORY } from './helpers';

const defaults = {
  resumeSession: null,
  onResume: vi.fn(),
  onDismissResume: vi.fn(),
  favoriteStories: [],
  completedStories: new Set(),
  showFavorites: true,
  showWordCount: false,
  onSelectStory: vi.fn(),
  onToggleFavorite: vi.fn(),
};

function render(props = {}) {
  return renderWithTheme(<HomeView {...defaults} {...props} />);
}

describe('HomeView', () => {
  describe('empty state', () => {
    it('shows the prompt when no favorites exist', () => {
      render();
      expect(screen.getByText('Wähle ein Märchen')).toBeInTheDocument();
    });

    it('does not show resume banner when no session', () => {
      render();
      expect(screen.queryByTestId('resume-banner')).not.toBeInTheDocument();
    });
  });

  describe('resume banner', () => {
    const session = { story: STORY, page: 2 };

    it('appears when a resume session exists', () => {
      render({ resumeSession: session });
      expect(screen.getByTestId('resume-banner')).toBeInTheDocument();
    });

    it('shows story title and page number', () => {
      render({ resumeSession: session });
      expect(screen.getByText(/Aschenputtel/)).toBeInTheDocument();
      expect(screen.getByText(/Seite 3/)).toBeInTheDocument();
    });

    it('calls onResume with story and page when confirm is clicked', async () => {
      const onResume = vi.fn();
      render({ resumeSession: session, onResume });
      await userEvent.click(screen.getByTestId('resume-confirm'));
      expect(onResume).toHaveBeenCalledWith(STORY, 2);
    });

    it('calls onDismissResume when dismiss is clicked', async () => {
      const onDismissResume = vi.fn();
      render({ resumeSession: session, onDismissResume });
      await userEvent.click(screen.getByTestId('resume-dismiss'));
      expect(onDismissResume).toHaveBeenCalledOnce();
    });
  });

  describe('favorites grid', () => {
    it('renders favorite stories when present', () => {
      render({ favoriteStories: [STORY] });
      expect(screen.getByText('Aschenputtel')).toBeInTheDocument();
      expect(screen.getByText('Favoriten')).toBeInTheDocument();
    });

    it('calls onSelectStory when a favorite card is clicked', async () => {
      const onSelectStory = vi.fn();
      render({ favoriteStories: [STORY], onSelectStory });
      await userEvent.click(screen.getByText('Aschenputtel'));
      expect(onSelectStory).toHaveBeenCalledWith(STORY);
    });

    it('shows completed indicator for finished stories', () => {
      render({
        favoriteStories: [STORY],
        completedStories: new Set([STORY.id]),
      });
      expect(screen.getByTestId('completed-indicator')).toBeInTheDocument();
    });

    it('does not show favorites section when showFavorites is false', () => {
      render({ favoriteStories: [STORY], showFavorites: false });
      expect(screen.queryByText('Favoriten')).not.toBeInTheDocument();
    });

    it('shows word count when showWordCount is true', () => {
      render({ favoriteStories: [STORY], showWordCount: true });
      expect(screen.getByText('10 W')).toBeInTheDocument();
    });
  });
});
