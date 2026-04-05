import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PageContent from '../../components/PageContent';
import { renderWithTheme, STORY, PAGE } from './helpers';

const defaults = {
  pages: [PAGE],
  currentPage: 0,
  totalPages: 1,
  selectedStory: STORY,
  selectedVariant: null,
  fontSize: 18,
  lineHeight: 1.8,
  wordSpacing: 'normal',
  fontFamily: 'Georgia, serif',
  textWidth: 640,
  hPadding: 32,
  showAttribution: false,
  showFavorites: true,
  favorites: new Set(),
  onShare: vi.fn(),
  onToggleFavorite: vi.fn(),
  onClose: vi.fn(),
};

function render(props = {}) {
  return renderWithTheme(<PageContent {...defaults} {...props} />);
}

describe('PageContent', () => {
  it('renders the story title on the first page', () => {
    render();
    expect(screen.getByText('Aschenputtel')).toBeInTheDocument();
  });

  it('does not render title on non-first pages', () => {
    const page2 = { hasTitle: false, tokens: [{ word: 'Weiter.', isPara: true }] };
    render({ pages: [PAGE, page2], currentPage: 1, totalPages: 2 });
    expect(screen.queryByText('Aschenputtel')).not.toBeInTheDocument();
  });

  it('uses variant name as title when a variant is selected', () => {
    render({ selectedVariant: { adaptionName: 'Kurze Fassung', content: 'Kurztext' } });
    expect(screen.getByText('Kurze Fassung')).toBeInTheDocument();
  });

  it('reconstructs paragraph text from tokens', () => {
    render();
    expect(screen.getByText('Es war einmal.')).toBeInTheDocument();
  });

  it('returns null when the current page does not exist', () => {
    const { container } = render({ pages: [], currentPage: 0 });
    expect(container).toBeEmptyDOMElement();
  });

  describe('last page actions', () => {
    it('shows close button on last page', () => {
      render({ currentPage: 0, totalPages: 1 });
      expect(screen.getByTestId('story-close')).toBeInTheDocument();
    });

    it('does not show close button on non-last pages', () => {
      render({ pages: [PAGE, PAGE], currentPage: 0, totalPages: 2 });
      expect(screen.queryByTestId('story-close')).not.toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', async () => {
      const onClose = vi.fn();
      render({ onClose });
      await userEvent.click(screen.getByTestId('story-close'));
      expect(onClose).toHaveBeenCalledOnce();
    });

    it('calls onShare when share button is clicked', async () => {
      const onShare = vi.fn();
      render({ onShare });
      await userEvent.click(screen.getByTitle('Teilen'));
      expect(onShare).toHaveBeenCalledOnce();
    });

    it('calls onToggleFavorite when favorite button is clicked', async () => {
      const onToggleFavorite = vi.fn();
      render({ onToggleFavorite });
      await userEvent.click(screen.getByTitle('Zu Favoriten hinzufügen'));
      expect(onToggleFavorite).toHaveBeenCalledOnce();
    });
  });
});
