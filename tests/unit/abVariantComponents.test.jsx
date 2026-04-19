import { pickSidebarComponent, pickProfilePanelComponent } from '../../src/lib/abVariantComponents';
import Sidebar from '../../components/Sidebar';
import SidebarV2 from '../../components/SidebarV2';
import ProfilePanel from '../../components/ProfilePanel';
import ProfilePanelGrouped from '../../components/ProfilePanelGrouped';
import ProfilePanelTabbed from '../../components/ProfilePanelTabbed';

describe('pickSidebarComponent', () => {
  it('returns SidebarV2 for the v2 variant', () => {
    expect(pickSidebarComponent('v2')).toBe(SidebarV2);
  });

  it('returns the control Sidebar for the control variant', () => {
    expect(pickSidebarComponent('control')).toBe(Sidebar);
  });

  it('falls back to the control Sidebar for unknown variants', () => {
    expect(pickSidebarComponent(undefined)).toBe(Sidebar);
    expect(pickSidebarComponent('bogus')).toBe(Sidebar);
  });
});

describe('pickProfilePanelComponent', () => {
  it('returns ProfilePanelTabbed for the tabbed variant', () => {
    expect(pickProfilePanelComponent('tabbed')).toBe(ProfilePanelTabbed);
  });

  it('returns ProfilePanelGrouped for grouped and role-opt', () => {
    expect(pickProfilePanelComponent('grouped')).toBe(ProfilePanelGrouped);
    expect(pickProfilePanelComponent('role-opt')).toBe(ProfilePanelGrouped);
  });

  it('falls back to the flat ProfilePanel for the flat variant or unknown values', () => {
    expect(pickProfilePanelComponent('flat')).toBe(ProfilePanel);
    expect(pickProfilePanelComponent(undefined)).toBe(ProfilePanel);
    expect(pickProfilePanelComponent('nope')).toBe(ProfilePanel);
  });
});
