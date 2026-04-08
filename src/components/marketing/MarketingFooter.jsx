import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function MarketingFooter() {
  const { t } = useTranslation();

  const columns = [
    {
      title: t('footer.product'),
      links: [
        { to: '/product/features', label: t('nav.product_features') },
        { to: '/product/how-it-works', label: t('nav.product_how_it_works') },
        { to: '/product/integrations', label: t('nav.product_integrations') },
        { to: '/pricing', label: t('nav.pricing') },
      ],
    },
    {
      title: t('footer.use_cases'),
      links: [
        { to: '/use-cases/students', label: t('nav.use_cases_students') },
        { to: '/use-cases/professionals', label: t('nav.use_cases_professionals') },
        { to: '/use-cases/researchers', label: t('nav.use_cases_researchers') },
        { to: '/use-cases/creators', label: t('nav.use_cases_creators') },
      ],
    },
    {
      title: t('footer.company'),
      links: [
        { to: '/about', label: t('nav.about') },
        { to: '/blog', label: t('nav.blog') },
      ],
    },
  ];

  return (
    <footer className="border-t border-amber-200 bg-amber-100">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="font-serif text-lg font-bold text-amber-900">Märchenschatz</Link>
          <p className="mt-2 text-sm text-amber-700 leading-relaxed">
            {t('home.hero_desc')}
          </p>
        </div>
        {columns.map(col => (
          <div key={col.title}>
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-500 mb-3">{col.title}</p>
            <ul className="flex flex-col gap-2">
              {col.links.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-amber-800 hover:text-amber-600 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-amber-200 py-4">
        <p className="text-center text-xs text-amber-500">
          {t('footer.copyright', { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  );
}
