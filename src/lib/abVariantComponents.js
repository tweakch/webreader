import Sidebar from '../../components/Sidebar';
import SidebarV2 from '../../components/SidebarV2';
import ProfilePanel from '../../components/ProfilePanel';
import ProfilePanelGrouped from '../../components/ProfilePanelGrouped';
import ProfilePanelTabbed from '../../components/ProfilePanelTabbed';

/**
 * Variant-id → component mappers for live A/B experiments.
 *
 * When an experiment resolves, collapse the corresponding mapper to a
 * single component and delete the losing variant files. The variant
 * ids here must stay aligned with `AB_EXPERIMENTS` in `abExperiments.js`.
 */

export function pickSidebarComponent(variant) {
  return variant === 'v2' ? SidebarV2 : Sidebar;
}

export function pickProfilePanelComponent(variant) {
  if (variant === 'tabbed') return ProfilePanelTabbed;
  if (variant === 'grouped' || variant === 'role-opt') return ProfilePanelGrouped;
  return ProfilePanel;
}
