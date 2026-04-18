import { FlaskConical, Shield, Trash2 } from 'lucide-react';
import { useTheme } from '../ui/ThemeContext';
import Toggle from '../ui/Toggle';
import { ROLES, ROLE_LABELS } from '../hooks/useRole';

/**
 * A/B testing panel. Embedded in ProfilePanel.
 *
 * Renders:
 *  - User section (when showAbTesting is on): per-experiment variant pickers,
 *    limited to experiments the user currently has access to.
 *  - Admin section (when showAbTestingAdmin is on and isAdmin): full experiment
 *    list with active toggle, role-access chips, revoke button.
 */
export default function ABTestingPanel({
  showAbTesting,
  showAbTestingAdmin,
  isAdmin,
  experiments,
  accessibleExperiments,
  getExperimentConfig,
  getVariant,
  setExperimentActive,
  toggleRoleAccess,
  revokeExperiment,
  selectVariant,
}) {
  const { dark } = useTheme();

  const showAdmin = showAbTestingAdmin && isAdmin;
  const showUser = showAbTesting && accessibleExperiments.length > 0;

  if (!showAdmin && !showUser) return null;

  const nonAdminRoles = ROLES.filter((r) => r !== 'admin');

  return (
    <div className="mt-10 space-y-8" data-testid="ab-testing-panel">
      {/* User section: variant picker for experiments the user has access to */}
      {showUser && (
        <div>
          <h2 className={`text-xs font-semibold uppercase tracking-wider mb-3 px-1 flex items-center gap-1.5 ${
            dark ? 'text-amber-500' : 'text-amber-600'
          }`}>
            <FlaskConical size={12} />
            UI-Varianten
          </h2>
          <div className={`rounded-2xl border divide-y ${
            dark ? 'border-amber-700/30 divide-amber-700/30' : 'border-amber-200 divide-amber-200'
          }`}>
            {accessibleExperiments.map((exp) => {
              const current = getVariant(exp.id);
              return (
                <div
                  key={exp.id}
                  data-testid={`ab-user-experiment-${exp.id}`}
                  className={`px-5 py-4 ${dark ? 'text-amber-200' : 'text-amber-900'}`}
                >
                  <p className="text-sm font-medium">{exp.label}</p>
                  <p className={`text-xs mt-0.5 leading-relaxed ${dark ? 'text-amber-600' : 'text-amber-500'}`}>
                    {exp.description}
                  </p>
                  <div className={`mt-3 flex rounded-xl border overflow-hidden ${
                    dark ? 'border-amber-700/40' : 'border-amber-200'
                  }`}>
                    {exp.variants.map((v) => {
                      const active = current === v.id;
                      return (
                        <button
                          key={v.id}
                          data-testid={`ab-user-variant-${exp.id}-${v.id}`}
                          onClick={() => selectVariant(exp.id, v.id)}
                          className={`flex-1 py-2 text-sm font-medium transition-colors ${
                            active
                              ? dark ? 'bg-amber-700/50 text-amber-100' : 'bg-amber-100 text-amber-900'
                              : dark ? 'text-amber-600 hover:text-amber-400' : 'text-amber-500 hover:text-amber-800'
                          }`}
                        >
                          {v.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <p className={`mt-2 px-1 text-xs ${dark ? 'text-amber-700' : 'text-amber-500'}`}>
            Du kannst jederzeit zwischen den Varianten wechseln. Dein Feedback hilft uns weiter.
          </p>
        </div>
      )}

      {/* Admin section: full experiment management */}
      {showAdmin && (
        <div>
          <h2 className={`text-xs font-semibold uppercase tracking-wider mb-3 px-1 flex items-center gap-1.5 ${
            dark ? 'text-violet-400' : 'text-violet-600'
          }`}>
            <Shield size={12} />
            A/B-Verwaltung (Admin)
          </h2>
          <div className={`rounded-2xl border divide-y ${
            dark ? 'border-violet-800/40 divide-violet-800/40' : 'border-violet-200 divide-violet-200'
          }`}>
            {experiments.map((exp) => {
              const cfg = getExperimentConfig(exp.id);
              return (
                <div
                  key={exp.id}
                  data-testid={`ab-admin-experiment-${exp.id}`}
                  className={`px-5 py-4 ${dark ? 'text-amber-200' : 'text-amber-900'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{exp.label}</p>
                      <p className={`text-xs mt-0.5 leading-relaxed ${dark ? 'text-amber-600' : 'text-amber-500'}`}>
                        {exp.description}
                      </p>
                      <p className={`text-[11px] mt-1 ${dark ? 'text-amber-700' : 'text-amber-400'}`}>
                        Varianten: {exp.variants.map((v) => v.label).join(' · ')}
                      </p>
                    </div>
                    <div data-testid={`ab-admin-active-${exp.id}`}>
                      <Toggle
                        checked={!!cfg.active}
                        onChange={() => setExperimentActive(exp.id, !cfg.active)}
                        label={`Aktiv: ${exp.label}`}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <span className={`text-[10px] uppercase tracking-wider ${
                      dark ? 'text-amber-700' : 'text-amber-400'
                    }`}>
                      Zugriff:
                    </span>
                    {nonAdminRoles.map((r) => {
                      const assigned = cfg.allowedRoles?.includes(r);
                      return (
                        <button
                          key={r}
                          data-testid={`ab-admin-role-${exp.id}-${r}`}
                          onClick={() => toggleRoleAccess(exp.id, r)}
                          disabled={!cfg.active}
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full border transition-colors disabled:opacity-30 ${
                            assigned
                              ? dark
                                ? 'bg-violet-700/60 border-violet-500 text-violet-200'
                                : 'bg-violet-100 border-violet-400 text-violet-800'
                              : dark
                                ? 'border-amber-800/50 text-amber-800 hover:text-amber-600'
                                : 'border-amber-300 text-amber-400 hover:text-amber-600'
                          }`}
                        >
                          {ROLE_LABELS[r]}
                        </button>
                      );
                    })}
                    <span className={`ml-auto text-[10px] ${dark ? 'text-amber-700' : 'text-amber-400'}`}>
                      (Admin hat immer Zugriff)
                    </span>
                    <button
                      data-testid={`ab-admin-revoke-${exp.id}`}
                      onClick={() => revokeExperiment(exp.id)}
                      title="Experiment deaktivieren und alle Rollen-Freigaben zurücknehmen"
                      className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border transition-colors ${
                        dark
                          ? 'border-red-800/60 text-red-400 hover:bg-red-900/30'
                          : 'border-red-200 text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <Trash2 size={10} />
                      Widerrufen
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <p className={`mt-2 px-1 text-xs ${dark ? 'text-amber-700' : 'text-amber-500'}`}>
            „Aktiv" schaltet das Experiment ein. Zuweisungen bestimmen, welche Rollen die Variante wählen dürfen.
          </p>
        </div>
      )}
    </div>
  );
}
