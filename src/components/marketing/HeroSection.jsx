import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function HeroSection() {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-amber-900 to-amber-800 text-amber-50">
      {/* Decorative background pattern */}
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

      <div className="relative max-w-4xl mx-auto px-6 py-28 text-center">
        <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-widest bg-amber-700 text-amber-200 rounded-full mb-6">
          {t('home.tagline')}
        </span>
        <h1 className="font-serif text-5xl md:text-6xl font-bold leading-tight tracking-tight" dangerouslySetInnerHTML={{ __html: t('home.hero_title') }} />
        <p className="mt-6 text-lg md:text-xl text-amber-200 max-w-2xl mx-auto leading-relaxed">
          {t('home.hero_desc')}
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
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
