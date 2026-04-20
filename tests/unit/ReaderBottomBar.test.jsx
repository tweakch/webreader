import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReaderBottomBar from '../../components/ReaderBottomBar';
import { GestureDrawerProvider } from '../../components/GestureDrawerContext';
import { renderWithTheme } from './helpers';

const defaults = {
  currentPage: 0,
  totalPages: 5,
  storyTitle: 'Aschenputtel',
  onPrev: vi.fn(),
  onNext: vi.fn(),
  showSpeedReader: false,
  speedReaderMode: false,
  onToggleSpeedReader: vi.fn(),
  showTypographyPanel: false,
  typoPanelOpen: false,
  onToggleTypoPanel: vi.fn(),
  srWordCount: 120,
};

function render(props = {}) {
  return renderWithTheme(
    <GestureDrawerProvider>
      <ReaderBottomBar {...defaults} {...props} />
    </GestureDrawerProvider>
  );
}

describe('ReaderBottomBar', () => {
  describe('page counter', () => {
    it('displays current page and total', () => {
      render({ currentPage: 2, totalPages: 7 });
      expect(screen.getByTestId('page-counter')).toHaveTextContent('3 / 7');
    });

    it('shows word count in speed reader mode instead of page counter', () => {
      render({ speedReaderMode: true, srWordCount: 250 });
      expect(screen.queryByTestId('page-counter')).not.toBeInTheDocument();
      expect(screen.getByText('250 Wörter')).toBeInTheDocument();
    });
  });

  describe('prev button', () => {
    it('is disabled on first page', () => {
      render({ currentPage: 0 });
      expect(screen.getByTestId('prev-page')).toBeDisabled();
    });

    it('is enabled on subsequent pages', () => {
      render({ currentPage: 1 });
      expect(screen.getByTestId('prev-page')).toBeEnabled();
    });

    it('is disabled in speed reader mode regardless of page', () => {
      render({ currentPage: 2, speedReaderMode: true });
      expect(screen.getByTestId('prev-page')).toBeDisabled();
    });

    it('calls onPrev when clicked', async () => {
      const onPrev = vi.fn();
      render({ currentPage: 2, onPrev });
      await userEvent.click(screen.getByTestId('prev-page'));
      expect(onPrev).toHaveBeenCalledOnce();
    });
  });

  describe('next button', () => {
    it('is disabled on last page', () => {
      render({ currentPage: 4, totalPages: 5 });
      expect(screen.getByTestId('next-page')).toBeDisabled();
    });

    it('is enabled before last page', () => {
      render({ currentPage: 3, totalPages: 5 });
      expect(screen.getByTestId('next-page')).toBeEnabled();
    });

    it('is disabled in speed reader mode', () => {
      render({ currentPage: 0, speedReaderMode: true });
      expect(screen.getByTestId('next-page')).toBeDisabled();
    });

    it('calls onNext when clicked', async () => {
      const onNext = vi.fn();
      render({ currentPage: 0, onNext });
      await userEvent.click(screen.getByTestId('next-page'));
      expect(onNext).toHaveBeenCalledOnce();
    });
  });

  describe('speed reader toggle', () => {
    it('is not rendered when showSpeedReader is false', () => {
      render({ showSpeedReader: false });
      expect(screen.queryByTestId('speed-reader-toggle')).not.toBeInTheDocument();
    });

    it('is rendered when showSpeedReader is true', () => {
      render({ showSpeedReader: true });
      expect(screen.getByTestId('speed-reader-toggle')).toBeInTheDocument();
    });

    it('calls onToggleSpeedReader when clicked', async () => {
      const onToggleSpeedReader = vi.fn();
      render({ showSpeedReader: true, onToggleSpeedReader });
      await userEvent.click(screen.getByTestId('speed-reader-toggle'));
      expect(onToggleSpeedReader).toHaveBeenCalledOnce();
    });
  });
});
