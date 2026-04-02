/**
 * Entity Store - Zustand Global State Management
 * Manages the dual-entity switching between Construction and Environmental
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Company, ThemeConfig } from '@/types';

export type CompanyType = 'construction' | 'environmental';

// ============================================================================
// THEME CONFIGURATIONS
// ============================================================================

export const CONSTRUCTION_THEME: ThemeConfig = {
  primary: '#3B82F6',
  secondary: '#1E40AF',
  accent: '#60A5FA',
  glow: 'rgba(59, 130, 246, 0.5)',
  gradient: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 50%, #06B6D4 100%)',
};

export const ENVIRONMENTAL_THEME: ThemeConfig = {
  primary: '#14B8A6',
  secondary: '#0F766E',
  accent: '#2DD4BF',
  glow: 'rgba(20, 184, 166, 0.5)',
  gradient: 'linear-gradient(135deg, #134E4A 0%, #14B8A6 50%, #10B981 100%)',
};

// ============================================================================
// COMPANY DATA
// ============================================================================

export const COMPANIES: Record<CompanyType, Company> = {
  construction: {
    id: 1,
    name: 'Phillips Construction Ltd',
    shortName: 'Phillips Construction',
    type: 'construction',
    logo: '/images/logo-construction.svg',
    address: 'The Cottage, Worthy Lane, Taunton, TA3 5EF',
    phone: '01823 213314',
    website: 'https://www.pphillipsconstruction.co.uk',
    companyRegNo: '06142552',
    vatRegNo: '840762233',
    bank: 'LLOYDS TSB BANK PLC',
    xeroTenantId: 'dda816eb-0b20-409d-a31a-c44e56f13f76',
    theme: CONSTRUCTION_THEME,
  },
  environmental: {
    id: 2,
    name: 'Phillips Barnes Environmental Ltd',
    shortName: 'Phillips Barnes Environmental',
    type: 'environmental',
    logo: '/images/logo-environmental.svg',
    address: 'The Cottage, Worthy Lane, Taunton, TA3 5EF',
    phone: '01823 213314',
    website: 'https://www.pphillipsconstruction.co.uk',
    companyRegNo: '14433186',
    vatRegNo: '427610703',
    bank: 'ANNA',
    xeroTenantId: 'd52d3570-9e7c-4f21-8b54-4cc8f5e05724',
    theme: ENVIRONMENTAL_THEME,
  },
};

// ============================================================================
// STORE INTERFACE
// ============================================================================

interface EntityState {
  activeCompany: Company;
  activeCompanyType: CompanyType;
  isSwitcherOpen: boolean;
  isTransitioning: boolean;
  setActiveCompany: (type: CompanyType) => void;
  setActiveCompanyById: (id: number) => void;
  toggleSwitcher: () => void;
  setSwitcherOpen: (open: boolean) => void;
  setTransitioning: (transitioning: boolean) => void;
  getTheme: () => ThemeConfig;
  getCompanyId: () => number;
  isConstruction: () => boolean;
  isEnvironmental: () => boolean;
}

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useEntityStore = create<EntityState>()(
  persist(
    (set, get) => ({
      activeCompany: COMPANIES.construction,
      activeCompanyType: 'construction',
      isSwitcherOpen: false,
      isTransitioning: false,
      
      setActiveCompany: (type: CompanyType) => {
        const { isTransitioning } = get();
        if (isTransitioning) return;
        
        set({ isTransitioning: true });
        
        setTimeout(() => {
          set({
            activeCompany: COMPANIES[type],
            activeCompanyType: type,
            isTransitioning: false,
            isSwitcherOpen: false,
          });
        }, 600);
      },
      
      setActiveCompanyById: (id: number) => {
        const type = id === 1 ? 'construction' : 'environmental';
        get().setActiveCompany(type);
      },
      
      toggleSwitcher: () => {
        set((state) => ({ isSwitcherOpen: !state.isSwitcherOpen }));
      },
      
      setSwitcherOpen: (open: boolean) => {
        set({ isSwitcherOpen: open });
      },
      
      setTransitioning: (transitioning: boolean) => {
        set({ isTransitioning: transitioning });
      },
      
      getTheme: () => {
        return get().activeCompany.theme;
      },
      
      getCompanyId: () => {
        return get().activeCompany.id;
      },
      
      isConstruction: () => {
        return get().activeCompanyType === 'construction';
      },
      
      isEnvironmental: () => {
        return get().activeCompanyType === 'environmental';
      },
    }),
    {
      name: 'phillips-entity-storage',
      partialize: (state) => ({
        activeCompanyType: state.activeCompanyType,
      }),
    }
  )
);

// ============================================================================
// SELECTOR HOOKS
// ============================================================================

export const useActiveCompany = () => useEntityStore((state) => state.activeCompany);
export const useActiveCompanyType = () => useEntityStore((state) => state.activeCompanyType);
export const useTheme = () => useEntityStore((state) => state.getTheme());
export const useIsTransitioning = () => useEntityStore((state) => state.isTransitioning);
export const useIsSwitcherOpen = () => useEntityStore((state) => state.isSwitcherOpen);
