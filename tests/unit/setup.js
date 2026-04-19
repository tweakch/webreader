import '@testing-library/jest-dom';

// Tests that use `// @vitest-environment node` run without jsdom — skip the
// DOM-specific polyfills so those files don't trip on missing globals.
if (typeof window !== 'undefined') {
  // matchMedia is not implemented in jsdom
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  beforeEach(() => {
    localStorage.clear();
  });
}
