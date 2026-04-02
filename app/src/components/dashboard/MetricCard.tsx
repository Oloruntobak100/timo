/**
 * Metric Card Component
 * Glassmorphism card displaying key metrics with animations
 */

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useActiveCompany } from '@/store/entityStore';

// ============================================================================
// TYPES
// ============================================================================

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  changeLabel?: string;
  icon: React.ElementType;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  delay?: number;
  onClick?: () => void;
}

// ============================================================================
// COLOR CONFIGURATIONS
// ============================================================================

const colorConfigs = {
  primary: {
    bg: 'rgba(59, 130, 246, 0.1)',
    border: 'rgba(59, 130, 246, 0.3)',
    icon: 'rgba(59, 130, 246, 0.2)',
    text: '#3B82F6',
  },
  success: {
    bg: 'rgba(34, 197, 94, 0.1)',
    border: 'rgba(34, 197, 94, 0.3)',
    icon: 'rgba(34, 197, 94, 0.2)',
    text: '#22C55E',
  },
  warning: {
    bg: 'rgba(250, 204, 21, 0.1)',
    border: 'rgba(250, 204, 21, 0.3)',
    icon: 'rgba(250, 204, 21, 0.2)',
    text: '#EAB308',
  },
  error: {
    bg: 'rgba(239, 68, 68, 0.1)',
    border: 'rgba(239, 68, 68, 0.3)',
    icon: 'rgba(239, 68, 68, 0.2)',
    text: '#EF4444',
  },
  info: {
    bg: 'rgba(20, 184, 166, 0.1)',
    border: 'rgba(20, 184, 166, 0.3)',
    icon: 'rgba(20, 184, 166, 0.2)',
    text: '#14B8A6',
  },
};

// ============================================================================
// COMPONENT
// ============================================================================

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  change,
  changeLabel = 'vs last month',
  icon: Icon,
  color = 'primary',
  delay = 0,
  onClick,
}) => {
  const activeCompany = useActiveCompany();
  const colors = colorConfigs[color];
  
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;
  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
  const trendColor = isPositive ? '#22C55E' : isNegative ? '#EF4444' : '#94A3B8';
  
  return (
    <motion.div
      className="relative rounded-2xl p-5 cursor-pointer overflow-hidden"
      style={{
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        backdropFilter: 'blur(10px)'
      }}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: delay * 0.1, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ 
        y: -4,
        scale: 1.02,
        transition: { type: 'spring', stiffness: 400, damping: 20 }
      }}
      onClick={onClick}
    >
      <div 
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-30 blur-3xl pointer-events-none"
        style={{ backgroundColor: colors.text }}
      />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: colors.icon }}
          >
            <Icon className="w-5 h-5" style={{ color: colors.text }} />
          </div>
          
          {change !== undefined && (
            <div 
              className="flex items-center gap-1 px-2 py-1 rounded-lg"
              style={{ backgroundColor: `${trendColor}20` }}
            >
              <TrendIcon className="w-3 h-3" style={{ color: trendColor }} />
              <span className="text-xs font-medium" style={{ color: trendColor }}>
                {isPositive ? '+' : ''}{change}%
              </span>
            </div>
          )}
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
        >
          <h3 className="text-2xl font-bold text-white mb-1">
            {value}
          </h3>
        </motion.div>
        
        <p className="text-sm text-slate-400 mb-1">{title}</p>
        
        {subtitle && (
          <p className="text-xs text-slate-500">{subtitle}</p>
        )}
        
        {change !== undefined && (
          <p className="text-xs text-slate-500 mt-2">{changeLabel}</p>
        )}
      </div>
      
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          border: `2px solid ${activeCompany.theme.primary}`,
          opacity: 0
        }}
        whileHover={{ opacity: 0.3 }}
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  );
};

export default MetricCard;
