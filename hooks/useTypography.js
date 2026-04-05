import { useState, useEffect } from 'react';
import { LINE_HEIGHTS, WORD_SPACINGS, FONT_FAMILIES } from '../ui/TypographyPanel';

const TEXT_WIDTHS = [560, 768, 1200];   // max column width cap (desktop)
const H_PADDINGS  = [56,  32,  12];    // horizontal padding px (narrow→wide)

/**
 * Typography state and derived values hook.
 * Owns font size, typography indices, localStorage persistence, and derived values.
 *
 * @param {number} maxFontSize - maximum allowed font size (from feature flags)
 */
export function useTypography({ maxFontSize = 28 } = {}) {
  const [fontSize, setFontSize] = useState(() => parseInt(localStorage.getItem('wr-fs') ?? '18'));
  const [lineHeightIdx, setLineHeightIdx] = useState(() => parseInt(localStorage.getItem('wr-lh') ?? '1'));
  const [textWidthIdx, setTextWidthIdx] = useState(() => parseInt(localStorage.getItem('wr-tw') ?? '1'));
  const [wordSpacingIdx, setWordSpacingIdx] = useState(() => parseInt(localStorage.getItem('wr-ws') ?? '0'));
  const [fontFamilyIdx, setFontFamilyIdx] = useState(() => parseInt(localStorage.getItem('wr-ff') ?? '0'));

  // Persist typography settings to localStorage
  useEffect(() => { localStorage.setItem('wr-fs', fontSize); }, [fontSize]);
  useEffect(() => { localStorage.setItem('wr-lh', lineHeightIdx); }, [lineHeightIdx]);
  useEffect(() => { localStorage.setItem('wr-tw', textWidthIdx); }, [textWidthIdx]);
  useEffect(() => { localStorage.setItem('wr-ws', wordSpacingIdx); }, [wordSpacingIdx]);
  useEffect(() => { localStorage.setItem('wr-ff', fontFamilyIdx); }, [fontFamilyIdx]);

  // Clamp stored font size when the max-size flag reduces the ceiling
  useEffect(() => {
    setFontSize(f => Math.min(f, maxFontSize));
  }, [maxFontSize]);

  // Derive values from indices
  const lineHeight = LINE_HEIGHTS[lineHeightIdx];
  const textWidth = TEXT_WIDTHS[textWidthIdx];
  const hPadding = H_PADDINGS[textWidthIdx];
  const wordSpacing = WORD_SPACINGS[wordSpacingIdx];
  const fontFamily = FONT_FAMILIES[fontFamilyIdx].css;

  return {
    fontSize,
    setFontSize,
    lineHeightIdx,
    setLineHeightIdx,
    textWidthIdx,
    setTextWidthIdx,
    wordSpacingIdx,
    setWordSpacingIdx,
    fontFamilyIdx,
    setFontFamilyIdx,
    // Derived values
    lineHeight,
    textWidth,
    hPadding,
    wordSpacing,
    fontFamily,
  };
}
