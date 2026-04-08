import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FEATURES } from '../../../features';

export default function ProductFeaturesPage() {
  const { t } = useTranslation();

  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      <h1 className="font-serif text-4xl md:text-5xl font-bold text-amber-900">{t('product_features.title')}</h1>
      <p className="mt-4 text-amber-700 text-lg max-w-xl">
        {t('product_features.desc')}
      </p>
      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map(({ key, label, description, Icon }) => (
          <div key={key} className="bg-white rounded-2xl border border-amber-100 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 text-amber-700 flex-shrink-0 flex items-center justify-center">
                <Icon />
              </div>
              <h2 className="font-semibold text-amber-900 leading-none">{label}</h2>
            </div>
            <p className="mt-1 text-sm text-amber-600 leading-relaxed">{description}</p>
            <Link
              to={`/app?docs=${encodeURIComponent(key)}`}
              className="mt-3 inline-block text-sm font-medium text-amber-800 hover:text-amber-900 underline underline-offset-2"
            >
              Details in Feature Docs
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
