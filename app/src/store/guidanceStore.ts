/**
 * Guidance Store - Contextual Tooltip and User Journey Management
 * Provides smart, non-intrusive guidance throughout the application
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TooltipGuidance, UserJourneyStep } from '@/types';

// ============================================================================
// JOURNEY STEPS DEFINITION
// ============================================================================

export const DEFAULT_JOURNEY_STEPS: UserJourneyStep[] = [
  {
    id: 'explore-dashboard',
    title: 'Explore Your Dashboard',
    description: 'Get familiar with your key metrics and active jobs.',
    actionText: 'View Dashboard',
    targetRoute: '/',
    completed: false,
  },
  {
    id: 'create-first-job',
    title: 'Create Your First Job',
    description: 'Start by creating a new job to track your work.',
    actionText: 'Create Job',
    targetRoute: '/jobs/new',
    completed: false,
  },
  {
    id: 'schedule-visit',
    title: 'Schedule a Visit',
    description: 'Assign field engineers to jobs with scheduled visits.',
    actionText: 'Schedule Visit',
    targetRoute: '/jobs',
    completed: false,
  },
  {
    id: 'add-client',
    title: 'Add a Client',
    description: 'Manage your customer relationships effectively.',
    actionText: 'Add Client',
    targetRoute: '/customers/clients',
    completed: false,
  },
  {
    id: 'create-invoice',
    title: 'Create an Invoice',
    description: 'Generate and send invoices for completed work.',
    actionText: 'Create Invoice',
    targetRoute: '/finance/invoices',
    completed: false,
  },
];

// ============================================================================
// TOOLTIP DEFINITIONS
// ============================================================================

export const DEFAULT_TOOLTIPS: Record<string, TooltipGuidance> = {
  'entity-switcher': {
    id: 'entity-switcher',
    targetElement: '[data-tooltip="entity-switcher"]',
    title: 'Switch Between Companies',
    message: 'Click here to seamlessly switch between Phillips Construction and Phillips Barnes Environmental.',
    position: 'bottom',
    trigger: 'auto',
    showOnce: true,
  },
  'new-job-button': {
    id: 'new-job-button',
    targetElement: '[data-tooltip="new-job-button"]',
    title: 'Ready to Create a Job?',
    message: 'Click here to start creating a new job with auto-generated numbering.',
    position: 'bottom',
    trigger: 'hover',
  },
  'planner-view': {
    id: 'planner-view',
    targetElement: '[data-tooltip="planner-view"]',
    title: 'Visual Workforce Planning',
    message: 'View and manage your field engineers\' schedules in a calendar view.',
    position: 'right',
    trigger: 'hover',
  },
  'cis-warning': {
    id: 'cis-warning',
    targetElement: '[data-tooltip="cis-warning"]',
    title: 'CIS Compliance Alert',
    message: 'This subcontractor is not CIS verified. 20% deduction will apply.',
    position: 'top',
    trigger: 'auto',
  },
  'job-status-workflow': {
    id: 'job-status-workflow',
    targetElement: '[data-tooltip="job-status-workflow"]',
    title: 'Job Status Workflow',
    message: 'Track jobs from Awaiting Action through to Paid status.',
    position: 'right',
    trigger: 'hover',
  },
  'cost-breakdown': {
    id: 'cost-breakdown',
    targetElement: '[data-tooltip="cost-breakdown"]',
    title: 'Real-time Cost Tracking',
    message: 'Monitor costs by category: Labour, Materials, Subcontract, Plant, Waste, and Other.',
    position: 'left',
    trigger: 'hover',
  },
  'xero-sync': {
    id: 'xero-sync',
    targetElement: '[data-tooltip="xero-sync"]',
    title: 'Xero Integration',
    message: 'Your financial data syncs automatically with Xero accounting.',
    position: 'bottom',
    trigger: 'hover',
  },
};

// ============================================================================
// STORE INTERFACE
// ============================================================================

interface GuidanceState {
  journeySteps: UserJourneyStep[];
  currentStepIndex: number;
  journeyCompleted: boolean;
  activeTooltip: string | null;
  dismissedTooltips: string[];
  showJourneyPanel: boolean;
  guidanceEnabled: boolean;
  completeStep: (stepId: string) => void;
  setCurrentStep: (index: number) => void;
  resetJourney: () => void;
  dismissJourney: () => void;
  showTooltip: (tooltipId: string) => void;
  hideTooltip: () => void;
  dismissTooltip: (tooltipId: string) => void;
  isTooltipDismissed: (tooltipId: string) => boolean;
  toggleJourneyPanel: () => void;
  setJourneyPanelOpen: (open: boolean) => void;
  toggleGuidance: () => void;
  getCurrentStep: () => UserJourneyStep | null;
  getCompletedStepsCount: () => number;
  getProgressPercentage: () => number;
  getNextIncompleteStep: () => UserJourneyStep | null;
}

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useGuidanceStore = create<GuidanceState>()(
  persist(
    (set, get) => ({
      journeySteps: DEFAULT_JOURNEY_STEPS,
      currentStepIndex: 0,
      journeyCompleted: false,
      activeTooltip: null,
      dismissedTooltips: [],
      showJourneyPanel: true,
      guidanceEnabled: true,
      
      completeStep: (stepId: string) => {
        set((state) => {
          const updatedSteps = state.journeySteps.map((step) =>
            step.id === stepId ? { ...step, completed: true } : step
          );
          
          const allCompleted = updatedSteps.every((step) => step.completed);
          
          return {
            journeySteps: updatedSteps,
            journeyCompleted: allCompleted,
          };
        });
      },
      
      setCurrentStep: (index: number) => {
        set({ currentStepIndex: index });
      },
      
      resetJourney: () => {
        set({
          journeySteps: DEFAULT_JOURNEY_STEPS.map((step) => ({
            ...step,
            completed: false,
          })),
          currentStepIndex: 0,
          journeyCompleted: false,
          showJourneyPanel: true,
        });
      },
      
      dismissJourney: () => {
        set({ showJourneyPanel: false });
      },
      
      showTooltip: (tooltipId: string) => {
        const { dismissedTooltips, guidanceEnabled } = get();
        
        if (!guidanceEnabled || dismissedTooltips.includes(tooltipId)) return;
        
        set({ activeTooltip: tooltipId });
      },
      
      hideTooltip: () => {
        set({ activeTooltip: null });
      },
      
      dismissTooltip: (tooltipId: string) => {
        set((state) => ({
          dismissedTooltips: [...state.dismissedTooltips, tooltipId],
          activeTooltip: null,
        }));
      },
      
      isTooltipDismissed: (tooltipId: string) => {
        return get().dismissedTooltips.includes(tooltipId);
      },
      
      toggleJourneyPanel: () => {
        set((state) => ({ showJourneyPanel: !state.showJourneyPanel }));
      },
      
      setJourneyPanelOpen: (open: boolean) => {
        set({ showJourneyPanel: open });
      },
      
      toggleGuidance: () => {
        set((state) => ({ guidanceEnabled: !state.guidanceEnabled }));
      },
      
      getCurrentStep: () => {
        const { journeySteps, currentStepIndex } = get();
        return journeySteps[currentStepIndex] || null;
      },
      
      getCompletedStepsCount: () => {
        return get().journeySteps.filter((step) => step.completed).length;
      },
      
      getProgressPercentage: () => {
        const { journeySteps } = get();
        const completed = journeySteps.filter((step) => step.completed).length;
        return Math.round((completed / journeySteps.length) * 100);
      },
      
      getNextIncompleteStep: () => {
        return get().journeySteps.find((step) => !step.completed) || null;
      },
    }),
    {
      name: 'phillips-guidance-storage',
      partialize: (state) => ({
        journeySteps: state.journeySteps,
        currentStepIndex: state.currentStepIndex,
        journeyCompleted: state.journeyCompleted,
        dismissedTooltips: state.dismissedTooltips,
        guidanceEnabled: state.guidanceEnabled,
      }),
    }
  )
);

// ============================================================================
// SELECTOR HOOKS
// ============================================================================

export const useJourneySteps = () => useGuidanceStore((state) => state.journeySteps);
export const useCurrentStep = () => useGuidanceStore((state) => state.getCurrentStep());
export const useJourneyProgress = () => useGuidanceStore((state) => state.getProgressPercentage());
export const useActiveTooltip = () => useGuidanceStore((state) => state.activeTooltip);
export const useGuidanceEnabled = () => useGuidanceStore((state) => state.guidanceEnabled);
export const useShowJourneyPanel = () => useGuidanceStore((state) => state.showJourneyPanel);
