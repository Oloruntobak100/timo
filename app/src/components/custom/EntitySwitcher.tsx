/**
 * Entity Switcher Component
 * High-end transition effect for switching between Phillips Construction 
 * and Phillips Barnes Environmental
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Building2, Leaf, ChevronDown, Check } from 'lucide-react';
import { 
  useEntityStore, 
  COMPANIES, 
  CONSTRUCTION_THEME,
  ENVIRONMENTAL_THEME,
  type CompanyType 
} from '@/store/entityStore';

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const dropdownVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: -10, 
    scale: 0.95 
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      type: 'spring' as const,
      stiffness: 300,
      damping: 25
    }
  },
  exit: { 
    opacity: 0, 
    y: -10, 
    scale: 0.95,
    transition: { duration: 0.2 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.2
    }
  })
};

// ============================================================================
// TRANSITION OVERLAY COMPONENT
// ============================================================================

const TransitionOverlay: React.FC<{ targetType: CompanyType }> = ({ targetType }) => {
  const theme = targetType === 'construction' ? CONSTRUCTION_THEME : ENVIRONMENTAL_THEME;
  
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div 
        className="absolute inset-0 backdrop-blur-xl"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      
      <div className="relative flex items-center justify-center">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border-2"
            style={{ borderColor: theme.primary }}
            initial={{ width: 100, height: 100, opacity: 0 }}
            animate={{ 
              width: 300 + i * 100, 
              height: 300 + i * 100, 
              opacity: [0, 0.5, 0],
            }}
            transition={{ 
              duration: 1.5,
              delay: i * 0.2,
              ease: 'easeOut'
            }}
          />
        ))}
        
        <motion.div
          className="relative z-10 flex flex-col items-center"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="w-24 h-24 rounded-2xl flex items-center justify-center mb-4"
            style={{ 
              background: theme.gradient,
              boxShadow: `0 0 60px ${theme.glow}` 
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          >
            {targetType === 'construction' ? (
              <Building2 className="w-12 h-12 text-white" />
            ) : (
              <Leaf className="w-12 h-12 text-white" />
            )}
          </motion.div>
          
          <motion.p
            className="text-xl font-semibold text-white"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Switching to
          </motion.p>
          
          <motion.p
            className="text-2xl font-bold"
            style={{ color: theme.primary }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {COMPANIES[targetType].shortName}
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const EntitySwitcher: React.FC = () => {
  const { 
    activeCompany, 
    activeCompanyType, 
    isSwitcherOpen, 
    isTransitioning,
    setActiveCompany, 
    toggleSwitcher, 
    setSwitcherOpen 
  } = useEntityStore();
  
  const [targetType, setTargetType] = useState<CompanyType | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setSwitcherOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setSwitcherOpen]);
  
  const handleSwitch = (type: CompanyType) => {
    if (type === activeCompanyType || isTransitioning) return;
    
    setTargetType(type);
    setActiveCompany(type);
  };
  
  const theme = activeCompany.theme;
  
  return (
    <>
      <AnimatePresence>
        {isTransitioning && targetType && (
          <TransitionOverlay targetType={targetType} />
        )}
      </AnimatePresence>
      
      <div ref={containerRef} className="relative" data-tooltip="entity-switcher">
        <motion.button
          onClick={toggleSwitcher}
          disabled={isTransitioning}
          className="relative flex items-center gap-3 px-4 py-2.5 rounded-xl backdrop-blur-md border transition-all duration-300"
          style={{ 
            backgroundColor: 'rgba(30, 41, 59, 0.8)',
            borderColor: theme.primary,
          }}
          whileHover={{ 
            scale: 1.02,
            boxShadow: `0 0 30px ${theme.glow}`
          }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: theme.gradient }}
            animate={{ rotate: isSwitcherOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeCompanyType === 'construction' ? (
              <Building2 className="w-4 h-4 text-white" />
            ) : (
              <Leaf className="w-4 h-4 text-white" />
            )}
          </motion.div>
          
          <div className="flex flex-col items-start">
            <span className="text-xs text-slate-400 uppercase tracking-wider">Current Entity</span>
            <span className="text-sm font-semibold text-white">
              {activeCompany.shortName}
            </span>
          </div>
          
          <motion.div
            animate={{ rotate: isSwitcherOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </motion.div>
          
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
            style={{ backgroundColor: theme.primary }}
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [1, 0.7, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.button>
        
        <AnimatePresence>
          {isSwitcherOpen && (
            <motion.div
              className="absolute top-full left-0 right-0 mt-2 z-50"
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div 
                className="rounded-xl border backdrop-blur-xl overflow-hidden"
                style={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  borderColor: 'rgba(71, 85, 105, 0.5)'
                }}
              >
                <div className="p-2 space-y-1">
                  <motion.button
                    custom={0}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    onClick={() => handleSwitch('construction')}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                      activeCompanyType === 'construction'
                        ? 'bg-blue-500/20 border border-blue-500/50'
                        : 'hover:bg-slate-800/50 border border-transparent'
                    }`}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: CONSTRUCTION_THEME.gradient }}
                    >
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-white">
                        Phillips Construction
                      </p>
                      <p className="text-xs text-slate-400">
                        Active Operations
                      </p>
                    </div>
                    
                    {activeCompanyType === 'construction' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center"
                      >
                        <Check className="w-3 h-3 text-white" />
                      </motion.div>
                    )}
                  </motion.button>
                  
                  <motion.button
                    custom={1}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    onClick={() => handleSwitch('environmental')}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                      activeCompanyType === 'environmental'
                        ? 'bg-teal-500/20 border border-teal-500/50'
                        : 'hover:bg-slate-800/50 border border-transparent'
                    }`}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: ENVIRONMENTAL_THEME.gradient }}
                    >
                      <Leaf className="w-5 h-5 text-white" />
                    </div>
                    
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-white">
                        Phillips Barnes Environmental
                      </p>
                      <p className="text-xs text-slate-400">
                        Ready for Deployment
                      </p>
                    </div>
                    
                    {activeCompanyType === 'environmental' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center"
                      >
                        <Check className="w-3 h-3 text-white" />
                      </motion.div>
                    )}
                  </motion.button>
                </div>
                
                <div className="px-4 py-2 bg-slate-900/50 border-t border-slate-800">
                  <p className="text-xs text-slate-500 text-center">
                    Both entities share the same platform features
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default EntitySwitcher;
