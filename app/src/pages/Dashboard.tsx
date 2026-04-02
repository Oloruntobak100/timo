/**
 * Dashboard Page
 * Bento-grid layout with real-time data cards and analytics
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  PoundSterling, 
  HardHat,
  TrendingUp,
  Users,
  Truck,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  AlertCircle,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useEntityStore } from '@/store/entityStore';
import { mockApi, mockData } from '@/lib/api';
import { GuidanceTooltip, ContextualHint } from '@/components/custom/GuidanceTooltip';
import { 
  RevenueChart, 
  JobStatusChart, 
  CostBreakdownChart,
  WeeklyVisitsChart 
} from '@/components/dashboard/Charts';
import type { Job, Invoice, Client } from '@/types';

// ============================================================================
// BENTO CARD COMPONENT
// ============================================================================

interface BentoCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  icon: React.ElementType;
  color: string;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const BentoCard: React.FC<BentoCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  trend, 
  icon: Icon, 
  color, 
  onClick,
  className = '',
  children 
}) => {
  const isPositive = trend && trend > 0;
  
  return (
    <motion.div
      className={`relative rounded-2xl p-5 cursor-pointer overflow-hidden ${className}`}
      style={{
        backgroundColor: 'rgba(30, 41, 59, 0.6)',
        border: `1px solid ${color}30`,
        backdropFilter: 'blur(10px)'
      }}
      whileHover={{ 
        scale: 1.02,
        borderColor: `${color}60`,
        boxShadow: `0 0 30px ${color}20`
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <div 
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ backgroundColor: color }}
      />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
          
          {trend !== undefined && (
            <div 
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium"
              style={{ 
                backgroundColor: isPositive ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: isPositive ? '#22C55E' : '#EF4444'
              }}
            >
              {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
        <p className="text-sm text-slate-400">{title}</p>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        
        {children}
      </div>
    </motion.div>
  );
};

// ============================================================================
// ACTIVITY ITEM COMPONENT
// ============================================================================

const ActivityItem: React.FC<{
  icon: React.ElementType;
  iconColor: string;
  title: string;
  subtitle: string;
  status?: string;
  statusColor?: string;
  time: string;
}> = ({ icon: Icon, iconColor, title, subtitle, status, statusColor, time }) => (
  <motion.div
    className="flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer"
    style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)' }}
    whileHover={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', x: 4 }}
  >
    <div 
      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: `${iconColor}20` }}
    >
      <Icon className="w-5 h-5" style={{ color: iconColor }} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-white truncate">{title}</p>
      <p className="text-xs text-slate-400 truncate">{subtitle}</p>
    </div>
    {status && (
      <span 
        className="px-2 py-0.5 rounded text-xs font-medium"
        style={{ backgroundColor: `${statusColor}20`, color: statusColor }}
      >
        {status}
      </span>
    )}
    <span className="text-xs text-slate-500 flex-shrink-0">{time}</span>
  </motion.div>
);

// ============================================================================
// MAIN DASHBOARD
// ============================================================================

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { activeCompany, activeCompanyType } = useEntityStore();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const theme = activeCompany.theme;

  useEffect(() => {
    loadDashboardData();
  }, [activeCompany.id]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [jobsData, invoicesData, clientsData] = await Promise.all([
        mockApi.getJobs(activeCompany.id),
        mockApi.getInvoices(activeCompany.id),
        mockApi.getClients(activeCompany.id),
      ]);
      setJobs(jobsData);
      setInvoices(invoicesData);
      setClients(clientsData);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate metrics
  const activeJobs = jobs.filter(j => ['Awaiting Action', 'In Progress', 'On Hold'].includes(j.status)).length;
  const completedThisMonth = jobs.filter(j => 
    j.status === 'Complete' && 
    j.actualCompletion && 
    new Date(j.actualCompletion).getMonth() === new Date().getMonth()
  ).length;
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const outstanding = totalInvoiced - totalPaid;
  const wipValue = jobs.reduce((sum, j) => sum + (j.value - j.invoiced), 0);

  // Recent activities
  const recentJobs = jobs.slice(0, 4);
  const recentInvoices = invoices.slice(0, 3);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          className="w-12 h-12 rounded-xl"
          style={{ background: theme.gradient }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
          <p className="text-slate-400">
            {activeCompany.shortName} • {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span 
            className="px-3 py-1.5 rounded-lg text-sm font-medium"
            style={{ backgroundColor: `${theme.primary}20`, color: theme.primary }}
          >
            {activeCompanyType === 'construction' ? 'Construction' : 'Environmental'} View
          </span>
        </div>
      </div>

      {/* Smart Tooltip */}
      <ContextualHint
        message={`You are currently viewing ${activeCompanyType === 'construction' ? 'Construction' : 'Environmental'} data. Toggle the switch in the header to view ${activeCompanyType === 'construction' ? 'Environmental' : 'Construction'} analytics.`}
      />

      {/* Bento Grid Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <GuidanceTooltip tooltipId="job-status-workflow" trigger="hover">
          <div data-tooltip="job-status-workflow">
            <BentoCard
              title="Active Jobs"
              value={activeJobs}
              subtitle={`${jobs.filter(j => j.status === 'Awaiting Action').length} awaiting action`}
              trend={8.5}
              icon={Briefcase}
              color={theme.primary}
              onClick={() => navigate('/jobs')}
            />
          </div>
        </GuidanceTooltip>

        <BentoCard
          title="Total Invoiced"
          value={`£${totalInvoiced.toLocaleString()}`}
          subtitle={`£${totalPaid.toLocaleString()} paid`}
          trend={12.3}
          icon={PoundSterling}
          color="#22C55E"
          onClick={() => navigate('/finance/invoices')}
        />

        <BentoCard
          title="Outstanding"
          value={`£${outstanding.toLocaleString()}`}
          subtitle={`${invoices.filter(i => i.status === 'Overdue').length} overdue`}
          trend={-5.2}
          icon={AlertCircle}
          color="#EF4444"
          onClick={() => navigate('/finance/invoices')}
        />

        <GuidanceTooltip tooltipId="cost-breakdown" trigger="hover">
          <div data-tooltip="cost-breakdown">
            <BentoCard
              title="WIP Value"
              value={`£${wipValue.toLocaleString()}`}
              subtitle={`${jobs.filter(j => j.status === 'In Progress').length} in progress`}
              trend={5.7}
              icon={TrendingUp}
              color="#EAB308"
              onClick={() => navigate('/jobs')}
            />
          </div>
        </GuidanceTooltip>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div 
          className="p-4 rounded-xl text-center cursor-pointer transition-all hover:scale-105"
          style={{ backgroundColor: 'rgba(30, 41, 59, 0.4)' }}
          onClick={() => navigate('/customers/clients')}
        >
          <Users className="w-6 h-6 mx-auto mb-2 text-slate-400" />
          <p className="text-xl font-bold text-white">{clients.length}</p>
          <p className="text-xs text-slate-400">Active Clients</p>
        </div>
        <div 
          className="p-4 rounded-xl text-center cursor-pointer transition-all hover:scale-105"
          style={{ backgroundColor: 'rgba(30, 41, 59, 0.4)' }}
          onClick={() => navigate('/workforce/employees')}
        >
          <HardHat className="w-6 h-6 mx-auto mb-2 text-slate-400" />
          <p className="text-xl font-bold text-white">12</p>
          <p className="text-xs text-slate-400">Field Engineers</p>
        </div>
        <div 
          className="p-4 rounded-xl text-center cursor-pointer transition-all hover:scale-105"
          style={{ backgroundColor: 'rgba(30, 41, 59, 0.4)' }}
          onClick={() => navigate('/supply-chain/suppliers')}
        >
          <Truck className="w-6 h-6 mx-auto mb-2 text-slate-400" />
          <p className="text-xl font-bold text-white">24</p>
          <p className="text-xs text-slate-400">Suppliers</p>
        </div>
        <div 
          className="p-4 rounded-xl text-center cursor-pointer transition-all hover:scale-105"
          style={{ backgroundColor: 'rgba(30, 41, 59, 0.4)' }}
          onClick={() => navigate('/workforce/planner')}
        >
          <Calendar className="w-6 h-6 mx-auto mb-2 text-slate-400" />
          <p className="text-xl font-bold text-white">8</p>
          <p className="text-xs text-slate-400">Visits Today</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <JobStatusChart />
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CostBreakdownChart />
        <WeeklyVisitsChart />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <div 
          className="rounded-2xl p-6"
          style={{ 
            backgroundColor: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(71, 85, 105, 0.3)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Recent Jobs</h3>
              <p className="text-sm text-slate-400">Latest job activity</p>
            </div>
            <button 
              onClick={() => navigate('/jobs')}
              className="flex items-center gap-1 text-sm transition-colors hover:opacity-80"
              style={{ color: theme.primary }}
            >
              View All <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            {recentJobs.map((job) => (
              <ActivityItem
                key={job.id}
                icon={Briefcase}
                iconColor={theme.primary}
                title={job.jobNumber}
                subtitle={job.clientName}
                status={job.status}
                statusColor={
                  job.status === 'Complete' ? '#22C55E' :
                  job.status === 'In Progress' ? '#3B82F6' :
                  job.status === 'On Hold' ? '#EF4444' :
                  '#EAB308'
                }
                time={job.inceptionDate}
              />
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Recent Invoices</h3>
              <p className="text-sm text-slate-400">Latest invoice activity</p>
            </div>
            <button 
              onClick={() => navigate('/finance/invoices')}
              className="flex items-center gap-1 text-sm transition-colors hover:opacity-80"
              style={{ color: theme.primary }}
            >
              View All <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            {recentInvoices.map((invoice) => (
              <ActivityItem
                key={invoice.id}
                icon={FileText}
                iconColor="#22C55E"
                title={invoice.invoiceNumber}
                subtitle={invoice.clientName}
                status={invoice.status}
                statusColor={
                  invoice.status === 'Paid' ? '#22C55E' :
                  invoice.status === 'Overdue' ? '#EF4444' :
                  '#EAB308'
                }
                time={invoice.invoiceDate}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'New Job', icon: Briefcase, color: theme.primary, action: () => navigate('/jobs', { state: { openModal: true } }) },
          { label: 'Create Invoice', icon: PoundSterling, color: '#22C55E', action: () => navigate('/finance/invoices', { state: { openModal: true } }) },
          { label: 'Add Client', icon: Users, color: '#EAB308', action: () => navigate('/customers/clients', { state: { openModal: true } }) },
          { label: 'Log Time', icon: Clock, color: '#8B5CF6', action: () => navigate('/workforce/labour', { state: { openModal: true } }) },
        ].map((action) => (
          <motion.button
            key={action.label}
            onClick={action.action}
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
      </div>
    </div>
  );
};

export default Dashboard;
