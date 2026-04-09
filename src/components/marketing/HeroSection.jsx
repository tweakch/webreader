import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFlag } from '@openfeature/react-sdk';

function parseMarkdown(html) {
  const parts = [];
  const regex = /<mark>([^<]*)<\/mark>|([^<]+)|<([^>]+)>/g;
  let match;

  while ((match = regex.exec(html)) !== null) {
    if (match[1]) {
      parts.push({ type: 'mark', text: match[1] });
    } else if (match[2]) {
      parts.push({ type: 'text', text: match[2] });
    }
  }

  return parts;
}

export default function HeroSection() {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const showHeroTagline = useFlag('hero-tagline', false);
  const cycles = t('home.cycles', { returnObjects: true });

  const handleNav = (direction) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setIndex((i) => (i + direction + cycles.length) % cycles.length);
      setIsTransitioning(false);
    }, 200);
  };

  const currentText = cycles[index];
  const parts = parseMarkdown(currentText);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-amber-900 to-amber-800 text-amber-50">
      {/* Grid background pattern */}
      <div className="absolute inset-0 opacity-10" aria-hidden="true">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative max-w-4xl mx-auto px-6 py-28">
        <h1 className="hero-title font-serif text-5xl md:text-6xl font-bold leading-tight tracking-tight">
          {showHeroTagline && (
            <span className="hero-tagline block md:hidden lg:block">
              {t('home.tagline').split(' · ').map((word, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span className="hero-tagline-dot">·</span>}
                  {word}
                </React.Fragment>
              ))}
            </span>
          )}

          <div className="relative mt-6 min-h-[2.8em] flex items-start group">
            {/* Left 50% tap zone */}
            <button
              onClick={() => handleNav(-1)}
              disabled={isTransitioning}
              className="absolute left-0 top-0 h-full w-1/2 cursor-pointer hidden md:block opacity-0 group-hover:opacity-30 transition-opacity disabled:opacity-0"
              aria-label="Previous"
            />

            {/* Cycling text with fade */}
            <div
              key={`text-${index}`}
              className="flex-1 transition-opacity duration-200 will-change-opacity leading-tight"
              style={{ opacity: isTransitioning ? 0 : 1 }}
            >
              {parts.map((part, i) =>
                part.type === 'mark' ? (
                  <mark key={i}>{part.text}</mark>
                ) : (
                  <span key={i}>{part.text}</span>
                )
              )}
            </div>

            {/* Right 50% tap zone */}
            <button
              onClick={() => handleNav(1)}
              disabled={isTransitioning}
              className="absolute right-0 top-0 h-full w-1/2 cursor-pointer hidden md:block opacity-0 group-hover:opacity-30 transition-opacity disabled:opacity-0"
              aria-label="Next"
            />
          </div>

          {/* Page counter */}
          <div className="mt-4 text-xs text-amber-400 text-left font-mono">
            {String(index + 1).padStart(2, '0')} / {String(cycles.length).padStart(2, '0')}
          </div>
        </h1>

        <p className="mt-8 text-lg md:text-xl text-amber-200 max-w-2xl leading-relaxed">
          {t('home.hero_desc')}
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-start gap-4">
          <Link
            to="/app"
            className="px-8 py-3.5 text-base font-semibold bg-amber-300 text-amber-950 rounded-xl hover:bg-amber-200 transition-colors shadow-lg"
          >
            {t('home.start_reading')}
          </Link>
          <Link
            to="/product/how-it-works"
            className="px-8 py-3.5 text-base font-medium text-amber-200 border border-amber-600 rounded-xl hover:bg-amber-800 transition-colors"
          >
            {t('home.see_how')}
          </Link>
        </div>
        <p className="mt-6 text-xs text-amber-400">{t('home.no_account')}</p>
      </div>
    </section>
  );
}
