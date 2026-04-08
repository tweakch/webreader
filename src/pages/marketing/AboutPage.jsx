import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="font-serif text-4xl md:text-5xl font-bold text-amber-900">{t('about.title')}</h1>
      <div className="mt-6 space-y-4 text-amber-800 leading-relaxed">
        <p className="text-lg">
          {t('about.p1')}
        </p>
        <p>
          {t('about.p2')}
        </p>
        <p>
          {t('about.p3')}
        </p>
      </div>
      <div className="mt-10">
        <Link to="/app" className="inline-block px-6 py-3 font-semibold bg-amber-800 text-amber-50 rounded-xl hover:bg-amber-700 transition-colors">
          {t('home.open_reader')}
        </Link>
      </div>
    </div>
  );
}
