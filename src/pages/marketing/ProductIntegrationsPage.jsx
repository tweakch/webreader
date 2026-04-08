import React from 'react';
import { useTranslation } from 'react-i18next';

export default function ProductIntegrationsPage() {
  const { t } = useTranslation();

  const items = [
    { title: t('product_integrations.pwa'), desc: t('product_integrations.pwa_desc') },
    { title: t('product_integrations.offline'), desc: t('product_integrations.offline_desc') },
    { title: t('product_integrations.screen_size'), desc: t('product_integrations.screen_size_desc') },
    { title: t('product_integrations.keyboard'), desc: t('product_integrations.keyboard_desc') },
  ];

  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="font-serif text-4xl md:text-5xl font-bold text-amber-900">{t('product_integrations.title')}</h1>
      <p className="mt-4 text-amber-700 text-lg max-w-xl">
        {t('product_integrations.desc')}
      </p>
      <div className="mt-12 grid sm:grid-cols-2 gap-6">
        {items.map(({ title, desc }) => (
          <div key={title} className="bg-white rounded-2xl border border-amber-100 p-6">
            <h2 className="font-semibold text-amber-900">{title}</h2>
            <p className="mt-1 text-sm text-amber-600">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
