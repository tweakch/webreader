import React from 'react';
import { useTranslation } from 'react-i18next';

export default function BlogPage() {
  const { t } = useTranslation();

  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="font-serif text-4xl md:text-5xl font-bold text-amber-900">{t('blog.title')}</h1>
      <p className="mt-4 text-amber-700 text-lg">{t('blog.desc')}</p>
      <div className="mt-12 border-t border-amber-200 pt-8 text-amber-500 text-sm italic">
        {t('blog.no_posts')}
      </div>
    </div>
  );
}
