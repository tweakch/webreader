import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

export default function MarketingNav() {
  const { t } = useTranslation();
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const productLinks = [
    { to: '/product/features', label: t('nav.product_features') },
    { to: '/product/how-it-works', label: t('nav.product_how_it_works') },
    { to: '/product/integrations', label: t('nav.product_integrations') },
  ];

  const useCaseLinks = [
    { to: '/use-cases/students', label: t('nav.use_cases_students') },
    { to: '/use-cases/professionals', label: t('nav.use_cases_professionals') },
    { to: '/use-cases/researchers', label: t('nav.use_cases_researchers') },
    { to: '/use-cases/creators', label: t('nav.use_cases_creators') },
  ];

  const toggle = (name) => setOpenMenu(prev => prev === name ? null : name);

  function DropdownMenu({ label, links, open, onToggle }) {
    return (
      <div className="relative">
        <button
          onClick={onToggle}
          className="flex items-center gap-1 text-sm font-medium text-amber-900 hover:text-amber-700 transition-colors"
        >
          {label}
          <svg className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        {open && (
          <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-amber-100 py-1 z-50">
            {links.map(({ to, label: l }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onToggle}
                className={({ isActive }) =>
                  `block px-4 py-2 text-sm transition-colors ${isActive ? 'text-amber-800 bg-amber-50 font-medium' : 'text-amber-900 hover:bg-amber-50'}`
                }
              >
                {l}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <header className="sticky top-0 z-40 bg-amber-50/90 backdrop-blur border-b border-amber-200">
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left cluster: mobile menu + logo */}
        <div className="flex items-center gap-2">
          <button
            className="lg:hidden p-2 text-amber-900"
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen
                ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
              }
            </svg>
          </button>

          <Link to="/" className="font-serif text-xl font-bold text-amber-900 tracking-tight">
            Märchenschatz
          </Link>
        </div>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-6">
          <DropdownMenu
            label={t('nav.product')}
            links={productLinks}
            open={openMenu === 'product'}
            onToggle={() => toggle('product')}
          />
          <DropdownMenu
            label={t('nav.use_cases')}
            links={useCaseLinks}
            open={openMenu === 'use-cases'}
            onToggle={() => toggle('use-cases')}
          />
          <NavLink to="/pricing" className={({ isActive }) => `text-sm font-medium transition-colors ${isActive ? 'text-amber-800' : 'text-amber-900 hover:text-amber-700'}`}>
            {t('nav.pricing')}
          </NavLink>
          <NavLink to="/blog" className={({ isActive }) => `text-sm font-medium transition-colors ${isActive ? 'text-amber-800' : 'text-amber-900 hover:text-amber-700'}`}>
            {t('nav.blog')}
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => `text-sm font-medium transition-colors ${isActive ? 'text-amber-800' : 'text-amber-900 hover:text-amber-700'}`}>
            {t('nav.about')}
          </NavLink>
        </div>

        {/* CTA and Language switcher */}
        <div className="hidden lg:flex items-center gap-3">
          <LanguageSwitcher />
          <Link
            to="/app"
            className="px-4 py-2 text-sm font-semibold whitespace-nowrap shrink-0 bg-amber-800 text-amber-50 rounded-lg hover:bg-amber-700 transition-colors"
          >
            {t('nav.open_app')}
          </Link>
        </div>

        {/* Mobile / tablet CTA */}
        <div className="lg:hidden flex items-center">
          <Link
            to="/app"
            className="px-3 py-1.5 text-sm font-semibold whitespace-nowrap shrink-0 bg-amber-800 text-amber-50 rounded-lg hover:bg-amber-700 transition-colors"
          >
            {t('nav.open_app')}
          </Link>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-amber-200 bg-amber-50 px-6 py-4 flex flex-col gap-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-500">{t('nav.product')}</p>
          {productLinks.map(({ to, label }) => (
            <Link key={to} to={to} onClick={() => setMobileOpen(false)} className="text-sm text-amber-900">{label}</Link>
          ))}
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-500 mt-2">{t('nav.use_cases')}</p>
          {useCaseLinks.map(({ to, label }) => (
            <Link key={to} to={to} onClick={() => setMobileOpen(false)} className="text-sm text-amber-900">{label}</Link>
          ))}
          <hr className="border-amber-200" />
          <Link to="/pricing" onClick={() => setMobileOpen(false)} className="text-sm text-amber-900">{t('nav.pricing')}</Link>
          <Link to="/blog" onClick={() => setMobileOpen(false)} className="text-sm text-amber-900">{t('nav.blog')}</Link>
          <Link to="/about" onClick={() => setMobileOpen(false)} className="text-sm text-amber-900">{t('nav.about')}</Link>
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-amber-200">
            <LanguageSwitcher />
          </div>
        </div>
      )}
    </header>
  );
}
