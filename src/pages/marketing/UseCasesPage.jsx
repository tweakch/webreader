import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function UseCasesPage() {
  const { t } = useTranslation();

  const cases = [
    { to: '/use-cases/students', title: t('use_cases.students'), desc: t('use_cases.students_desc') },
    { to: '/use-cases/educators', title: t('use_cases.educators'), desc: t('use_cases.educators_desc') },
    { to: '/use-cases/professionals', title: t('use_cases.professionals'), desc: t('use_cases.professionals_desc') },
    { to: '/use-cases/researchers', title: t('use_cases.researchers'), desc: t('use_cases.researchers_desc') },
    { to: '/use-cases/creators', title: t('use_cases.creators'), desc: t('use_cases.creators_desc') },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      <h1 className="font-serif text-4xl md:text-5xl font-bold text-amber-900">{t('use_cases.title')}</h1>
      <p className="mt-4 text-amber-700 text-lg max-w-xl">
        {t('use_cases.desc')}
      </p>
      <div className="mt-10 grid sm:grid-cols-2 gap-6">
        {cases.map(({ to, title, desc }) => (
          <Link key={to} to={to} className="block bg-white rounded-2xl border border-amber-100 p-6 hover:shadow-md transition-shadow">
            <h2 className="font-semibold text-amber-900 text-lg">{title}</h2>
            <p className="mt-1 text-sm text-amber-600">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
