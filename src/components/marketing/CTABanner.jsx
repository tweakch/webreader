import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function CTABanner() {
  const { t } = useTranslation();

  return (
    <section className="bg-amber-900 text-amber-50">
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="font-serif text-3xl md:text-4xl font-bold">
          {t('home.cta_title')}
        </h2>
        <p className="mt-4 text-amber-300 text-lg">
          {t('home.cta_desc')}
        </p>
        <Link
          to="/app"
          className="mt-8 inline-block px-8 py-3.5 text-base font-semibold bg-amber-300 text-amber-950 rounded-xl hover:bg-amber-200 transition-colors shadow-lg"
        >
          {t('home.open_reader')}
        </Link>
      </div>
    </section>
  );
}
