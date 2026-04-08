import React from 'react';
import { useTranslation } from 'react-i18next';

export default function ProductHowItWorksPage() {
  const { t } = useTranslation();

  const steps = [
    { n: '1', title: t('product_how_it_works.step_1_title'), body: t('product_how_it_works.step_1_body') },
    { n: '2', title: t('product_how_it_works.step_2_title'), body: t('product_how_it_works.step_2_body') },
    { n: '3', title: t('product_how_it_works.step_3_title'), body: t('product_how_it_works.step_3_body') },
    { n: '4', title: t('product_how_it_works.step_4_title'), body: t('product_how_it_works.step_4_body') },
  ];

  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="font-serif text-4xl md:text-5xl font-bold text-amber-900">{t('product_how_it_works.title')}</h1>
      <p className="mt-4 text-amber-700 text-lg">{t('product_how_it_works.desc')}</p>
      <ol className="mt-12 flex flex-col gap-10">
        {steps.map(({ n, title, body }) => (
          <li key={n} className="flex gap-6">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-800 text-amber-50 flex items-center justify-center font-bold text-lg">
              {n}
            </div>
            <div>
              <h2 className="font-semibold text-xl text-amber-900">{title}</h2>
              <p className="mt-1 text-amber-700">{body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
