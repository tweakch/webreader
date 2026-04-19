import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTheme } from '../ui/ThemeContext';
import Toggle from '../ui/Toggle';
import VariantPicker from '../ui/VariantPicker';
import { ROLES, ROLE_LABELS } from '../hooks/useRole';
import { FEATURE_GROUPS } from '../src/lib/featureRegistry';

const APP_ANIMATION_OPTIONS = [
  { value: 'seal',    label: 'Portal',   testId: 'app-animation-variant-seal' },
  { value: 'fade',    label: 'Minimal',  testId: 'app-animation-variant-fade' },
  { value: 'sparkle', label: 'Funken',   testId: 'app-animation-variant-sparkle' },
  { value: 'ink',     label: 'Tinte',    testId: 'app-animation-variant-ink' },
];

function partitionByGroup(visibleFeatures) {
  const byGroup = new Map();
  for (const g of FEATURE_GROUPS) byGroup.set(g.id, []);
  const unknown = [];
  for (const f of visibleFeatures) {
    if (byGroup.has(f.group)) byGroup.get(f.group).push(f);
    else unknown.push(f);
  }
  const sections = FEATURE_GROUPS
    .map((g) => ({ ...g, items: byGroup.get(g.id) }))
    .filter((g) => g.items.length > 0);
  if (unknown.length > 0) {
    sections.push({
      id: 'other', label: 'Weitere', description: '', Icon: () => null, items: unknown,
    });
  }
  return sections;
}

/**
 * Collapsible, group-aware feature-toggle list for the profile panel.
 *
 * Each group renders as a bordered section with a header that shows
 * icon + label + "N/M aktiv" + chevron, plus a master Toggle that
 * switches every child in the group on or off. The group definitions
 * come from FEATURE_GROUPS in the registry.
 */
export default function ProfileFeatureList({
  visibleFeatures,
  _rawFlagValues,
  userFeatureOverrides,
  onToggleFeature,
  onSetFeaturesEnabled,
  isAdmin,
  isFeatureAssignedToRole,
  toggleFeatureForRole,
  onOpenDocs,
  appAnimationVariant = 'seal',
  onSetAppAnimationVariant,
}) {
  const { dark } = useTheme();
  const _o = (key, raw) => Object.hasOwn(userFeatureOverrides, key) ? userFeatureOverrides[key] : raw;
  const nonAdminRoles = ROLES.filter((r) => r !== 'admin');
  const groupedFeatures = partitionByGroup(visibleFeatures);

  const [collapsedGroups, setCollapsedGroups] = useState(() => new Set());
  const toggleGroupCollapsed = (groupId) =>
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId); else next.add(groupId);
      return next;
    });

  const masterToggle = (items) => {
    const allOn = items.every((f) => _o(f.key, _rawFlagValues[f.key] ?? false));
    const nextValue = !allOn;
    const keys = items.map((f) => f.key);
    if (onSetFeaturesEnabled) {
      onSetFeaturesEnabled(keys, nextValue);
    } else {
      for (const f of items) {
        const current = _o(f.key, _rawFlagValues[f.key] ?? false);
        if (current !== nextValue) onToggleFeature(f.key);
      }
    }
  };

  const renderFeatureRow = ({ key, label, description, Icon }) => {
    const effective = _o(key, _rawFlagValues[key] ?? false);
    const isUnreleased = !Object.hasOwn(_rawFlagValues, key);
    return (
      <div key={key} className={`px-5 py-4 flex items-start gap-4 ${dark ? 'text-amber-200' : 'text-amber-900'}`}>
        <div className={`flex-shrink-0 mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
          effective
            ? dark ? 'bg-amber-700/40 text-amber-300' : 'bg-amber-100 text-amber-700'
            : dark ? 'bg-slate-700/60 text-amber-700' : 'bg-amber-50/80 text-amber-400'
        }`}>
          <div className="w-5 h-5"><Icon /></div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <p className={`text-sm font-medium transition-opacity ${effective ? '' : 'opacity-40'}`}>{label}</p>
              {isUnreleased && (
                <span className={`flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                  dark ? 'bg-violet-900/60 text-violet-300' : 'bg-violet-100 text-violet-700'
                }`}>
                  unveröffentlicht
                </span>
              )}
            </div>
            <Toggle checked={effective} onChange={() => onToggleFeature(key)} label={label} />
          </div>
          <p className={`text-xs mt-1 leading-relaxed ${dark ? 'text-amber-600' : 'text-amber-500'}`}>{description}</p>
          <button
            onClick={() => onOpenDocs(key)}
            className={`text-xs mt-1 inline-block transition-colors hover:underline ${
              dark ? 'text-amber-400/70 hover:text-amber-400' : 'text-amber-600/70 hover:text-amber-700'
            }`}
          >
            Mehr erfahren →
          </button>
          {key === 'app-animation' && effective && onSetAppAnimationVariant && (
            <div className="mt-3" data-testid="app-animation-variant-picker">
              <VariantPicker
                ariaLabel="App-Animation Variante"
                options={APP_ANIMATION_OPTIONS}
                value={appAnimationVariant}
                onChange={onSetAppAnimationVariant}
              />
            </div>
          )}
          {isAdmin && (
            <div className="flex items-center gap-3 mt-2">
              <span className={`text-[10px] uppercase tracking-wider ${dark ? 'text-amber-700' : 'text-amber-400'}`}>Rollen:</span>
              {nonAdminRoles.map((r) => {
                const assigned = isFeatureAssignedToRole(key, r);
                return (
                  <button
                    key={r}
                    data-testid={`role-assign-${key}-${r}`}
                    onClick={() => toggleFeatureForRole(key, r)}
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full border transition-colors ${
                      assigned
                        ? dark ? 'bg-violet-700/60 border-violet-500 text-violet-200' : 'bg-violet-100 border-violet-400 text-violet-800'
                        : dark ? 'border-amber-800/50 text-amber-800 hover:text-amber-600' : 'border-amber-300 text-amber-400 hover:text-amber-600'
                    }`}
                  >
                    {ROLE_LABELS[r]}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {groupedFeatures.map((group) => {
        const collapsed = collapsedGroups.has(group.id);
        const onCount = group.items.reduce(
          (n, f) => n + (_o(f.key, _rawFlagValues[f.key] ?? false) ? 1 : 0),
          0,
        );
        const allOn = onCount === group.items.length;
        const anyOn = onCount > 0;
        const GroupIcon = group.Icon;
        return (
          <div
            key={group.id}
            data-testid={`feature-group-${group.id}`}
            className={`rounded-2xl border overflow-hidden ${dark ? 'border-amber-700/30' : 'border-amber-200'}`}
          >
            <div className={`flex items-center gap-3 px-5 py-3 ${dark ? 'text-amber-200' : 'text-amber-900'}`}>
              <button
                type="button"
                onClick={() => toggleGroupCollapsed(group.id)}
                data-testid={`feature-group-header-${group.id}`}
                aria-expanded={!collapsed}
                className={`flex-1 min-w-0 flex items-center gap-3 text-left transition-colors rounded-lg -mx-1 px-1 py-1 ${
                  dark ? 'hover:bg-amber-900/20' : 'hover:bg-amber-50'
                }`}
              >
                <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  anyOn
                    ? dark ? 'bg-amber-700/40 text-amber-300' : 'bg-amber-100 text-amber-700'
                    : dark ? 'bg-slate-700/60 text-amber-700' : 'bg-amber-50/80 text-amber-400'
                }`}>
                  <GroupIcon />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold truncate">{group.label}</span>
                  <span
                    data-testid={`feature-group-count-${group.id}`}
                    className={`block text-[11px] mt-0.5 ${dark ? 'text-amber-600' : 'text-amber-500'}`}
                  >
                    {onCount}/{group.items.length} aktiv
                  </span>
                </span>
                <ChevronDown
                  size={16}
                  className={`flex-shrink-0 transition-transform ${collapsed ? '' : 'rotate-180'} ${
                    dark ? 'text-amber-600' : 'text-amber-500'
                  }`}
                />
              </button>
              <span data-testid={`feature-group-toggle-${group.id}`} className="flex-shrink-0">
                <Toggle
                  checked={allOn}
                  onChange={() => masterToggle(group.items)}
                  label={`Alle „${group.label}" umschalten`}
                />
              </span>
            </div>
            {!collapsed && (
              <div
                data-testid={`feature-group-body-${group.id}`}
                className={`border-t divide-y ${dark ? 'border-amber-700/30 divide-amber-700/30' : 'border-amber-200 divide-amber-200'}`}
              >
                {group.items.map(renderFeatureRow)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
