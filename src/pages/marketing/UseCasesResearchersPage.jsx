import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function UseCasesResearchersPage() {
  const { t } = useTranslation();

  const features = [
    t('use_case_researchers.features_1'),
    t('use_case_researchers.features_2'),
    t('use_case_researchers.features_3'),
    t('use_case_researchers.features_4'),
    t('use_case_researchers.features_5'),
  ];

  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <p className="text-sm font-semibold uppercase tracking-widest text-amber-500 mb-2">{t('nav.use_cases')}</p>
      <h1 className="font-serif text-4xl md:text-5xl font-bold text-amber-900">{t('use_case_researchers.title')}</h1>
      <p className="mt-4 text-amber-700 text-lg leading-relaxed">
        {t('use_case_researchers.desc')}
      </p>
      <ul className="mt-8 flex flex-col gap-3 text-amber-800">
        {features.map(f => (
          <li key={f} className="flex items-center gap-2 text-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-700 flex-shrink-0" />
            {f}
          </li>
        ))}
      </ul>
      <Link to="/app" className="mt-10 inline-block px-6 py-3 font-semibold bg-amber-800 text-amber-50 rounded-xl hover:bg-amber-700 transition-colors">
        {t('home.open_reader')}
      </Link>
    </div>
  );
}
