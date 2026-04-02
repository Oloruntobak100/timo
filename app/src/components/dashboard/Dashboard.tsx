/**
 * Dashboard Component
 * Main dashboard view with metrics, charts, and recent activity
 */

import React, { useEffect } from 'react';
import { motion, type Variants } from 'framer-motion';
import { 
  Briefcase, 
  PoundSterling, 
  HardHat,
  TrendingUp,
  Clock,
  Users,
  ArrowRight
} from 'lucide-react';
import { MetricCard } from './MetricCard';
import { 
  RevenueChart, 
  JobStatusChart, 
  CostBreakdownChart,
  WeeklyVisitsChart 
} from './Charts';
import { GuidanceTooltip, ContextualHint } from '@/components/custom/GuidanceTooltip';
import { useActiveCompany } from '@/store/entityStore';
import { useGuidanceStore } from '@/store/guidanceStore';

// ============================================================================
// MOCK DATA
// ============================================================================

const RECENT_JOBS = [
  { id: 'N-001234', client: 'Aviva Insurance', status: 'Complete', value: 12500, date: '2 hours ago' },
  { id: 'N-001235', client: 'Direct Line', status: 'In Progress', value: 8750, date: '4 hours ago' },
  { id: 'P-001089', client: 'Taunton Council', status: 'Awaiting Action', value: 45000, date: '1 day ago' },
  { id: 'N-001236', client: 'AXA Insurance', status: 'On Hold', value: 3200, date: '2 days ago' },
];

const RECENT_INVOICES = [
  { id: 'INV-001', client: 'Aviva Insurance', amount: 12500, status: 'Paid', date: '1 day ago' },
  { id: 'INV-002', client: 'Direct Line', amount: 8750, status: 'Pending', date: '2 days ago' },
  { id: 'INV-003', client: 'AXA Insurance', amount: 3200, status: 'Overdue', date: '7 days ago' },
];

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut'
    }
  }
};

// ============================================================================
// STATUS BADGE COMPONENT
// ============================================================================

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusColor = () => {
    switch (status.toLowerCase()) {
      case 'complete':
      case 'paid':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in progress':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'awaiting action':
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'on hold':
      case 'overdue':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };
  
  return (
    <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor()}`}>
      {status}
    </span>
  );
};

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================

export const Dashboard: React.FC = () => {
  const activeCompany = useActiveCompany();
  const { completeStep } = useGuidanceStore();
  
  const theme = activeCompany.theme;
  
  useEffect(() => {
    completeStep('explore-dashboard');
  }, [completeStep]);
  
  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Page Header */}
      <motion.div 
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        variants={itemVariants}
      >
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            Dashboard
          </h1>
          <p className="text-slate-400">
            Welcome back to {activeCompany.shortName}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">
            {new Date().toLocaleDateString('en-GB', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </motion.div>
      
      {/* Contextual Hint */}
      <motion.div variants={itemVariants}>
        <ContextualHint
          message="Ready to create a new job? Start here to track your work from inception to completion."
          action={{
            label: 'Create Job',
            onClick: () => console.log('Create job clicked')
          }}
        />
      </motion.div>
      
      {/* Metrics Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={itemVariants}
      >
        <GuidanceTooltip 
          tooltipId="job-status-workflow"
          position="bottom"
          trigger="hover"
        >
          <div data-tooltip="job-status-workflow">
            <MetricCard
              title="Active Jobs"
              value="64"
              subtitle="12 awaiting action"
              change={8.5}
              icon={Briefcase}
              color="primary"
              delay={0}
            />
          </div>
        </GuidanceTooltip>
        
        <MetricCard
          title="Total Invoiced"
          value="£328,450"
          subtitle="£245,800 paid"
          change={12.3}
          icon={PoundSterling}
          color="success"
          delay={1}
        />
        
        <MetricCard
          title="Field Engineers"
          value="12"
          subtitle="8 on site today"
          change={-2.1}
          icon={HardHat}
          color="info"
          delay={2}
        />
        
        <GuidanceTooltip
          tooltipId="cost-breakdown"
          position="bottom"
          trigger="hover"
        >
          <div data-tooltip="cost-breakdown">
            <MetricCard
              title="WIP Value"
              value="£156,230"
              subtitle="Across 23 jobs"
              change={5.7}
              icon={TrendingUp}
              color="warning"
              delay={3}
            />
          </div>
        </GuidanceTooltip>
      </motion.div>
      
      {/* Charts Row 1 */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        variants={itemVariants}
      >
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <JobStatusChart />
      </motion.div>
      
      {/* Charts Row 2 */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        variants={itemVariants}
      >
        <CostBreakdownChart />
        <WeeklyVisitsChart />
      </motion.div>
      
      {/* Recent Activity */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        variants={itemVariants}
      >
        {/* Recent Jobs */}
        <div 
          className="rounded-2xl p-6"
          style={{ 
            backgroundColor: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(71, 85, 105, 0.3)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Recent Jobs</h3>
              <p className="text-sm text-slate-400">Latest job activity</p>
            </div>
            <button 
              className="flex items-center gap-1 text-sm transition-colors"
              style={{ color: theme.primary }}
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            {RECENT_JOBS.map((job, index) => (
              <motion.div
                key={job.id}
                className="flex items-center justify-between p-3 rounded-xl transition-colors cursor-pointer"
                style={{ backgroundColor: 'rgba(15, 23, 42, 0.3)' }}
                whileHover={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.5)',
                  x: 4 
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${theme.primary}20` }}
                  >
                    <Briefcase className="w-5 h-5" style={{ color: theme.primary }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{job.id}</p>
                    <p className="text-xs text-slate-400">{job.client}</p>
                  </div>
                </div>
                <div className="text-right">
                  <StatusBadge status={job.status} />
                  <p className="text-xs text-slate-500 mt-1">{job.date}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Recent Invoices */}
        <div 
          className="rounded-2xl p-6"
          style={{ 
            backgroundColor: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(71, 85, 105, 0.3)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Recent Invoices</h3>
              <p className="text-sm text-slate-400">Latest invoice activity</p>
            </div>
            <button 
              className="flex items-center gap-1 text-sm transition-colors"
              style={{ color: theme.primary }}
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            {RECENT_INVOICES.map((invoice, index) => (
              <motion.div
                key={invoice.id}
                className="flex items-center justify-between p-3 rounded-xl transition-colors cursor-pointer"
                style={{ backgroundColor: 'rgba(15, 23, 42, 0.3)' }}
                whileHover={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.5)',
                  x: 4 
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${theme.primary}20` }}
                  >
                    <PoundSterling className="w-5 h-5" style={{ color: theme.primary }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{invoice.id}</p>
                    <p className="text-xs text-slate-400">{invoice.client}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">
                    £{invoice.amount.toLocaleString()}
                  </p>
                  <StatusBadge status={invoice.status} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
      
      {/* Quick Actions */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        variants={itemVariants}
      >
        {[
          { label: 'New Job', icon: Briefcase, color: theme.primary },
          { label: 'Create Invoice', icon: PoundSterling, color: theme.accent },
          { label: 'Schedule Visit', icon: Clock, color: '#22C55E' },
          { label: 'Add Client', icon: Users, color: '#EAB308' },
        ].map((action) => (
          <motion.button
            key={action.label}
            className="flex flex-col items-center gap-3 p-4 rounded-xl transition-all duration-200"
            style={{ 
              backgroundColor: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(71, 85, 105, 0.3)'
            }}
            whileHover={{ 
              scale: 1.02,
              borderColor: action.color 
            }}
            whileTap={{ scale: 0.98 }}
          >
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${action.color}20` }}
            >
              <action.icon className="w-6 h-6" style={{ color: action.color }} />
            </div>
            <span className="text-sm font-medium text-white">{action.label}</span>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
