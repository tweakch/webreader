import { screen } from '@testing-library/react';
import AppTopBar from '../../components/AppTopBar';
import { GestureDrawerProvider } from '../../components/GestureDrawerContext';
import { renderWithTheme } from './helpers';

function render(props = {}) {
  return renderWithTheme(
    <GestureDrawerProvider>
      <AppTopBar
        selectedStory={null}
        useDrawerSidebar={false}
        menuOpen={false}
        onMenuOpenChange={() => {}}
        fontSize={18}
        maxFontSize={32}
        onSetFontSize={() => {}}
        showFontSizeControls={false}
        voiceControl={null}
        theme="light"
        onSetTheme={() => {}}
        showHighContrastTheme={false}
        showEnhancedGestures={false}
        {...props}
      />
    </GestureDrawerProvider>
  );
}

describe('AppTopBar chrome hide', () => {
  it('collapses out of the flex flow when not visible', () => {
    render({ visible: false });
    const bar = screen.getByTestId('app-top-bar');
    expect(bar).toHaveAttribute('aria-hidden', 'true');
    expect(bar.className).toMatch(/\bh-0\b/);
    expect(bar.className).toMatch(/pointer-events-none/);
  });

  it('keeps settings chrome in the document when shown', () => {
    render({ visible: true });
    const bar = screen.getByTestId('app-top-bar');
    expect(bar).toHaveAttribute('aria-hidden', 'false');
    expect(bar.className).not.toMatch(/\bh-0\b/);
  });
});
