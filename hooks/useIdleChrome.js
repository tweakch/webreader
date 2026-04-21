import { useEffect } from 'react';

/**
 * Chrome auto-hide while reading.
 *
 * Turns the reader's nav bar + top bar into "paper" — present when the reader
 * wants them, invisible when they'd only compete with the text. After the
 * configured idle window of pointer/key silence the hook calls
 * `setVisible(false)`; any activity (pointerdown, pointermove, keydown) calls
 * `setVisible(true)` and restarts the timer.
 *
 * The effect is paused (chrome stays visible) when any of the gating flags is
 * true — typically when an overlay panel is open or the reader is in a
 * dedicated mode like speed-reader.
 *
 * @param {object} opts
 * @param {boolean} opts.active        — run the idle timer when true.
 * @param {boolean} [opts.paused]      — keep chrome visible while true.
 * @param {number}  [opts.idleMs=2500] — silence window before fade.
 * @param {(v:boolean) => void} opts.setVisible — receives the new visibility.
 */
export function useIdleChrome({ active, paused = false, idleMs = 2500, setVisible }) {
  useEffect(() => {
    if (!active) return undefined;
    if (paused) {
      setVisible(true);
      return undefined;
    }
    let visibleNow = true;
    let timer;
    const wake = () => {
      clearTimeout(timer);
      if (!visibleNow) {
        visibleNow = true;
        setVisible(true);
      }
      timer = window.setTimeout(() => {
        visibleNow = false;
        setVisible(false);
      }, idleMs);
    };
    wake();
    window.addEventListener('pointerdown', wake);
    window.addEventListener('pointermove', wake);
    window.addEventListener('keydown', wake);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('pointerdown', wake);
      window.removeEventListener('pointermove', wake);
      window.removeEventListener('keydown', wake);
    };
  }, [active, paused, idleMs, setVisible]);
}
