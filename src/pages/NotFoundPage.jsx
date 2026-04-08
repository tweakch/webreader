import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="max-w-2xl mx-auto px-6 py-32 text-center">
      <p className="font-serif text-8xl font-bold text-amber-200">404</p>
      <h1 className="mt-4 font-serif text-3xl font-bold text-amber-900">{t('not_found.title')}</h1>
      <p className="mt-3 text-amber-600">{t('not_found.desc')}</p>
      <div className="mt-8 flex items-center justify-center gap-4">
        <Link to="/" className="px-5 py-2.5 text-sm font-semibold bg-amber-800 text-amber-50 rounded-xl hover:bg-amber-700 transition-colors">
          {t('not_found.go_home')}
        </Link>
        <Link to="/app" className="px-5 py-2.5 text-sm font-medium text-amber-800 border border-amber-300 rounded-xl hover:bg-amber-100 transition-colors">
          {t('not_found.open_reader')}
        </Link>
      </div>
    </div>
  );
}
