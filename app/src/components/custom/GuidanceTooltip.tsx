/**
 * Guidance Tooltip Component
 * Contextual, non-intrusive smart guidance system
 */

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { X, Lightbulb, ArrowRight } from 'lucide-react';
import { 
  useGuidanceStore, 
  DEFAULT_TOOLTIPS 
} from '@/store/guidanceStore';
import { useActiveCompanyType } from '@/store/entityStore';

// ============================================================================
// TYPES
// ============================================================================

interface GuidanceTooltipProps {
  tooltipId: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click' | 'auto';
  showOnce?: boolean;
  customContent?: {
    title: string;
    message: string;
  };
}

// ============================================================================
// POSITION STYLES
// ============================================================================

const positionStyles = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

const arrowStyles = {
  top: 'top-full left-1/2 -translate-x-1/2 border-t-slate-800',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-800',
  left: 'left-full top-1/2 -translate-y-1/2 border-l-slate-800',
  right: 'right-full top-1/2 -translate-y-1/2 border-r-slate-800',
};

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const tooltipVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.9,
    y: 10 
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: { 
      type: 'spring' as const,
      stiffness: 400,
      damping: 25
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.9,
    transition: { duration: 0.15 }
  }
};

const pulseVariants: Variants = {
  pulse: {
    boxShadow: [
      '0 0 0 0 rgba(250, 204, 21, 0.4)',
      '0 0 0 10px rgba(250, 204, 21, 0)',
    ],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeOut'
    }
  }
};

// ============================================================================
// WRAPPER COMPONENT
// ============================================================================

export const GuidanceTooltip: React.FC<GuidanceTooltipProps> = ({
  tooltipId,
  children,
  position = 'bottom',
  trigger = 'hover',
  showOnce = false,
  customContent,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);
  
  const { 
    dismissTooltip, 
    isTooltipDismissed, 
    guidanceEnabled 
  } = useGuidanceStore();
  
  const companyType = useActiveCompanyType();
  
  const tooltipContent = customContent || DEFAULT_TOOLTIPS[tooltipId] || {
    title: 'Tip',
    message: 'Hover for more information'
  };
  
  const shouldShow = guidanceEnabled && 
    !isTooltipDismissed(tooltipId) && 
    !(showOnce && hasBeenShown);
  
  useEffect(() => {
    if (trigger === 'auto' && shouldShow) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        setHasBeenShown(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [trigger, shouldShow]);
  
  const handleMouseEnter = useCallback(() => {
    if (trigger === 'hover' && shouldShow) {
      setIsVisible(true);
    }
  }, [trigger, shouldShow]);
  
  const handleMouseLeave = useCallback(() => {
    if (trigger === 'hover') {
      setIsVisible(false);
    }
  }, [trigger]);
  
  const handleDismiss = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    dismissTooltip(tooltipId);
    setIsVisible(false);
  }, [dismissTooltip, tooltipId]);
  
  const themeColor = companyType === 'construction' ? '#3B82F6' : '#14B8A6';
  
  return (
    <div 
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-tooltip={tooltipId}
    >
      <div className="relative">
        {trigger === 'auto' && shouldShow && (
          <motion.div
            className="absolute inset-0 rounded-lg"
            variants={pulseVariants}
            animate="pulse"
          />
        )}
        {children}
      </div>
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={`absolute z-50 w-72 ${positionStyles[position]}`}
            variants={tooltipVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div 
              className="relative rounded-xl border backdrop-blur-xl overflow-hidden"
              style={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                borderColor: 'rgba(71, 85, 105, 0.5)'
              }}
            >
              <div 
                className="flex items-center gap-2 px-3 py-2 border-b"
                style={{ borderColor: 'rgba(71, 85, 105, 0.3)' }}
              >
                <Lightbulb 
                  className="w-4 h-4" 
                  style={{ color: themeColor }}
                />
                <span className="text-sm font-semibold text-white flex-1">
                  {tooltipContent.title}
                </span>
                <button
                  onClick={handleDismiss}
                  className="p-1 rounded hover:bg-slate-700/50 transition-colors"
                >
                  <X className="w-3 h-3 text-slate-400" />
                </button>
              </div>
              
              <div className="p-3">
                <p className="text-sm text-slate-300 leading-relaxed">
                  {tooltipContent.message}
                </p>
              </div>
              
              <div 
                className="px-3 py-2 flex items-center justify-between"
                style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)' }}
              >
                <span className="text-xs text-slate-500">
                  Smart Guidance
                </span>
                <button
                  onClick={handleDismiss}
                  className="text-xs flex items-center gap-1 transition-colors"
                  style={{ color: themeColor }}
                >
                  Got it
                </button>
              </div>
              
              <div 
                className={`absolute w-0 h-0 border-4 border-transparent ${arrowStyles[position]}`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// JOURNEY PANEL COMPONENT
// ============================================================================

export const JourneyPanel: React.FC = () => {
  const {
    journeySteps,
    showJourneyPanel,
    journeyCompleted,
    dismissJourney,
    getProgressPercentage,
    getNextIncompleteStep,
  } = useGuidanceStore();
  
  const companyType = useActiveCompanyType();
  const themeColor = companyType === 'construction' ? '#3B82F6' : '#14B8A6';
  
  if (!showJourneyPanel || journeyCompleted) return null;
  
  const nextStep = getNextIncompleteStep();
  const progress = getProgressPercentage();
  
  return (
    <motion.div
      className="fixed bottom-6 right-6 z-40 w-80"
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <div 
        className="rounded-2xl border backdrop-blur-xl overflow-hidden"
        style={{ 
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          borderColor: 'rgba(71, 85, 105, 0.5)'
        }}
      >
        <div 
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: 'rgba(71, 85, 105, 0.3)' }}
        >
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${themeColor}20` }}
            >
              <Lightbulb className="w-4 h-4" style={{ color: themeColor }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Getting Started</p>
              <p className="text-xs text-slate-400">Complete these steps</p>
            </div>
          </div>
          <button
            onClick={dismissJourney}
            className="p-1.5 rounded-lg hover:bg-slate-700/50 transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
        
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Progress</span>
            <span className="text-xs font-medium" style={{ color: themeColor }}>
              {progress}%
            </span>
          </div>
          <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: themeColor }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
        
        {nextStep && (
          <div className="px-4 pb-4">
            <div 
              className="p-3 rounded-xl border cursor-pointer transition-all duration-200 hover:scale-[1.02]"
              style={{ 
                backgroundColor: `${themeColor}10`,
                borderColor: `${themeColor}30`
              }}
            >
              <p className="text-sm font-medium text-white mb-1">
                {nextStep.title}
              </p>
              <p className="text-xs text-slate-400 mb-3">
                {nextStep.description}
              </p>
              <button 
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white transition-all duration-200"
                style={{ backgroundColor: themeColor }}
              >
                {nextStep.actionText}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        
        <div className="px-4 pb-4 space-y-2 max-h-48 overflow-y-auto">
          {journeySteps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-200 ${
                step.completed 
                  ? 'bg-slate-800/50' 
                  : 'bg-transparent opacity-50'
              }`}
            >
              <div 
                className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  step.completed 
                    ? 'bg-green-500/20' 
                    : 'bg-slate-700'
                }`}
              >
                {step.completed ? (
                  <span className="text-xs text-green-500">✓</span>
                ) : (
                  <span className="text-xs text-slate-400">{index + 1}</span>
                )}
              </div>
              <span className={`text-sm ${
                step.completed ? 'text-slate-300 line-through' : 'text-slate-500'
              }`}>
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// CONTEXTUAL HINT COMPONENT
// ============================================================================

interface ContextualHintProps {
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const ContextualHint: React.FC<ContextualHintProps> = ({ 
  message, 
  action 
}) => {
  const companyType = useActiveCompanyType();
  const themeColor = companyType === 'construction' ? '#3B82F6' : '#14B8A6';
  
  return (
    <motion.div
      className="flex items-center gap-3 px-4 py-3 rounded-xl"
      style={{ 
        backgroundColor: `${themeColor}15`,
        border: `1px solid ${themeColor}30`
      }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <Lightbulb className="w-5 h-5 flex-shrink-0" style={{ color: themeColor }} />
      <p className="text-sm text-slate-300 flex-1">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-all duration-200 hover:opacity-90"
          style={{ backgroundColor: themeColor }}
        >
          {action.label}
          <ArrowRight className="w-3 h-3" />
        </button>
      )}
    </motion.div>
  );
};

export default GuidanceTooltip;
