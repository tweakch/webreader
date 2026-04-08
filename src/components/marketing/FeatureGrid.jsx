import React from 'react';
import { useTranslation } from 'react-i18next';
import { FEATURES } from '../../../features';

const HIGHLIGHTED_KEYS = [
  'favorites',
  'font-size-controls',
  'speed-reader',
  'typography-panel',
  'audio-player',
  'tap-zones',
  'eink-flash',
  'high-contrast-theme',
  'word-count',
];

export default function FeatureGrid() {
  const { t } = useTranslation();
  const shown = FEATURES.filter(f => HIGHLIGHTED_KEYS.includes(f.key));

  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-amber-900">{t('home.features_title')}</h2>
        <p className="mt-3 text-amber-700 max-w-xl mx-auto">
          {t('home.features_desc')}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {shown.map(({ key, label, description, Icon }) => (
          <div
            key={key}
            className="bg-white rounded-2xl p-6 border border-amber-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 text-amber-700 mb-4">
              <Icon />
            </div>
            <h3 className="font-semibold text-amber-900 mb-1">{label}</h3>
            <p className="text-sm text-amber-700 leading-relaxed">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
