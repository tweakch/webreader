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

  it('uses variant title when a variant with a title is selected', () => {
    render({ selectedVariant: { adaptionName: 'Kurze Fassung', title: 'Aschenputtel (kurz)', content: 'Kurztext' } });
    expect(screen.getByText('Aschenputtel (kurz)')).toBeInTheDocument();
  });

  it('falls back to story title when variant has no title', () => {
    render({ selectedVariant: { adaptionName: 'Kurze Fassung', content: 'Kurztext' } });
    expect(screen.getByText('Aschenputtel')).toBeInTheDocument();
  });

  it('reconstructs paragraph text from tokens', () => {
    render();
    expect(screen.getByText('Es war einmal.')).toBeInTheDocument();
  });

  it('bolds first letter on paragraph starts', () => {
    render();
    const p = screen.getByText('Es war einmal.');
    expect(p.className).toContain('first-letter:font-bold');
  });

  it('does not bold first letter when page starts mid-paragraph', () => {
    // Page 1 ends mid-paragraph (last token isPara=false), so page 2's first
    // paragraph is a continuation and its first letter must not be bolded.
    const page1 = {
      hasTitle: true,
      tokens: [
        { word: 'Es', isPara: false },
        { word: 'war', isPara: false },
      ],
    };
    const page2 = {
      hasTitle: false,
      tokens: [
        { word: 'einmal.', isPara: true },
        { word: 'Dann', isPara: false },
        { word: 'geschah', isPara: false },
        { word: 'etwas.', isPara: true },
      ],
    };
    render({ pages: [page1, page2], currentPage: 1, totalPages: 2 });
    const continuation = screen.getByText('einmal.');
    expect(continuation.className).not.toContain('first-letter:font-bold');
    const newPara = screen.getByText('Dann geschah etwas.');
    expect(newPara.className).toContain('first-letter:font-bold');
  });

  it('bolds first letter when previous page ended on a paragraph boundary', () => {
    const page1 = {
      hasTitle: true,
      tokens: [{ word: 'Ende.', isPara: true }],
    };
    const page2 = {
      hasTitle: false,
      tokens: [{ word: 'Neuer', isPara: false }, { word: 'Absatz.', isPara: true }],
    };
    render({ pages: [page1, page2], currentPage: 1, totalPages: 2 });
    const p = screen.getByText('Neuer Absatz.');
    expect(p.className).toContain('first-letter:font-bold');
  });

  it('returns null when the current page does not exist', () => {
    const { container } = render({ pages: [], currentPage: 0 });
    expect(container).toBeEmptyDOMElement();
  });

  describe('illustrations', () => {
    const storyWithCover = { ...STORY, coverUrl: '/stories/grimm/aschenputtel/cover.svg' };

    it('renders the cover image on the title page when showIllustrations is on', () => {
      render({ selectedStory: storyWithCover, showIllustrations: true });
      const img = screen.getByTestId('story-cover');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', '/stories/grimm/aschenputtel/cover.svg');
    });

    it('does not render the cover when showIllustrations is off', () => {
      render({ selectedStory: storyWithCover, showIllustrations: false });
      expect(screen.queryByTestId('story-cover')).not.toBeInTheDocument();
    });

    it('does not render the cover when the story has no coverUrl', () => {
      render({ selectedStory: { ...STORY, coverUrl: null }, showIllustrations: true });
      expect(screen.queryByTestId('story-cover')).not.toBeInTheDocument();
    });

    it('does not render the cover on non-title pages', () => {
      const page2 = { hasTitle: false, tokens: [{ word: 'Weiter.', isPara: true }] };
      render({
        selectedStory: storyWithCover,
        showIllustrations: true,
        pages: [PAGE, page2],
        currentPage: 1,
        totalPages: 2,
      });
      expect(screen.queryByTestId('story-cover')).not.toBeInTheDocument();
    });
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
