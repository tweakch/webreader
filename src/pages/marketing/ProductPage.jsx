import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function ProductPage() {
  const { t } = useTranslation();

  const items = [
    { to: '/product/features', title: t('product.features'), desc: t('product.features_short') },
    { to: '/product/how-it-works', title: t('product.how_it_works'), desc: t('product.how_it_works_short') },
    { to: '/product/integrations', title: t('product.integrations'), desc: t('product.integrations_short') },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      <h1 className="font-serif text-4xl md:text-5xl font-bold text-amber-900">{t('product.title')}</h1>
      <p className="mt-4 text-amber-700 text-lg max-w-xl">
        {t('product.desc')}
      </p>
      <div className="mt-10 grid sm:grid-cols-3 gap-6">
        {items.map(({ to, title, desc }) => (
          <Link key={to} to={to} className="block bg-white rounded-2xl border border-amber-100 p-6 hover:shadow-md transition-shadow">
            <h2 className="font-semibold text-amber-900 text-lg">{title}</h2>
            <p className="mt-1 text-sm text-amber-600">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
