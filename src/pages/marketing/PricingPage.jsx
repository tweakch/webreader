import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Check() {
  return (
    <svg className="w-5 h-5 text-amber-700 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function PricingPage() {
  const { t } = useTranslation();

  const freeFeatures = [
    t('pricing.full_access'),
    t('pricing.grimm_andersen'),
    t('pricing.paginated_reader'),
    t('pricing.typography'),
    t('pricing.favorites'),
    t('pricing.speed_reader'),
    t('pricing.audio'),
    t('pricing.offline'),
    t('pricing.no_account'),
  ];

  const proFeatures = [
    t('pricing.everything_free'),
    t('pricing.cloud_sync'),
    t('pricing.curated'),
    t('pricing.ad_free'),
    t('pricing.early_access'),
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      <div className="text-center mb-14">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-amber-900">{t('pricing.title')}</h1>
        <p className="mt-4 text-amber-700 text-lg max-w-xl mx-auto">
          {t('pricing.desc')}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Free plan */}
        <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-500">{t('pricing.free')}</p>
          <div className="mt-2 flex items-end gap-1">
            <span className="text-5xl font-bold text-amber-900">{t('pricing.free_price')}</span>
            <span className="text-amber-500 mb-1">{t('pricing.free_period')}</span>
          </div>
          <p className="mt-2 text-sm text-amber-600">{t('pricing.free_tagline')}</p>

          <Link
            to="/app"
            className="mt-6 block text-center px-6 py-3 font-semibold bg-amber-800 text-amber-50 rounded-xl hover:bg-amber-700 transition-colors"
          >
            {t('pricing.start_reading_now')}
          </Link>

          <ul className="mt-8 flex flex-col gap-3">
            {freeFeatures.map(f => (
              <li key={f} className="flex items-start gap-2 text-sm text-amber-800">
                <Check />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Pro plan - coming soon */}
        <div className="bg-amber-900 rounded-2xl border border-amber-700 shadow-lg p-8 text-amber-50 relative overflow-hidden">
          <div className="absolute top-4 right-4 px-2 py-0.5 text-xs font-semibold bg-amber-700 text-amber-200 rounded-full">
            {t('pricing.coming_soon')}
          </div>
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-400">{t('pricing.pro')}</p>
          <div className="mt-2 flex items-end gap-1">
            <span className="text-5xl font-bold">{t('pricing.pro_price')}</span>
            <span className="text-amber-400 mb-1">{t('pricing.pro_period')}</span>
          </div>
          <p className="mt-2 text-sm text-amber-400">{t('pricing.pro_tagline')}</p>

          <button
            disabled
            className="mt-6 w-full px-6 py-3 font-semibold bg-amber-700 text-amber-300 rounded-xl cursor-not-allowed opacity-60"
          >
            {t('pricing.waitlist')}
          </button>

          <ul className="mt-8 flex flex-col gap-3">
            {proFeatures.map(f => (
              <li key={f} className="flex items-start gap-2 text-sm text-amber-200">
                <svg className="w-5 h-5 text-amber-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
