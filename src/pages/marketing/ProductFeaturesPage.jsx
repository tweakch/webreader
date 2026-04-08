import React from 'react';
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
            <div className="w-9 h-9 text-amber-700 mb-3">
              <Icon />
            </div>
            <h2 className="font-semibold text-amber-900">{label}</h2>
            <p className="mt-1 text-sm text-amber-600 leading-relaxed">{description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
