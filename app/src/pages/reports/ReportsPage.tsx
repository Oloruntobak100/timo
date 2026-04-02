import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Briefcase,
  Calendar,
  Download,
  FileText,
  PieChart,
  Activity,
  Target,
  Clock,
  ArrowRight,
  Filter,
  ChevronDown,
} from 'lucide-react';
import { useEntityStore } from '@/store/entityStore';
import { mockApi } from '@/lib/api';
import { toast } from 'sonner';
import type { Job, Invoice } from '@/types';

const ReportsPage: React.FC = () => {
  const { activeCompany } = useEntityStore();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'month' | 'quarter' | 'year'>('month');

  const accentColor = activeCompany.id === 1 ? '#3B82F6' : '#14B8A6';

  useEffect(() => {
    loadData();
  }, [activeCompany.id]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [jobsData, invoicesData] = await Promise.all([
        mockApi.getJobs(activeCompany.id),
        mockApi.getInvoices(activeCompany.id),
      ]);
      setJobs(jobsData);
      setInvoices(invoicesData);
    } catch (error) {
      toast.error('Failed to load report data');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate metrics
  const totalJobValue = jobs.reduce((sum, j) => sum + j.value, 0);
  const totalInvoiced = jobs.reduce((sum, j) => sum + j.invoiced, 0);
  const totalCosts = jobs.reduce((sum, j) => sum + Object.values(j.costs).reduce((a, b) => a + b, 0), 0);
  const totalOutstanding = invoices.filter(i => i.status !== 'Paid').reduce((sum, i) => sum + (i.totalAmount - i.paidAmount), 0);
  
  const completedJobs = jobs.filter(j => j.status === 'Complete').length;
  const inProgressJobs = jobs.filter(j => j.status === 'In Progress').length;
  const pendingJobs = jobs.filter(j => j.status === 'Awaiting Action').length;

  // Cost breakdown
  const costBreakdown = jobs.reduce(
    (acc, job) => {
      acc.labour += job.costs.labour;
      acc.materials += job.costs.materials;
      acc.subcontract += job.costs.subcontract;
      acc.plant += job.costs.plant;
      acc.waste += job.costs.waste;
      acc.other += job.costs.other;
      return acc;
    },
    { labour: 0, materials: 0, subcontract: 0, plant: 0, waste: 0, other: 0 }
  );

  const totalCostBreakdown = Object.values(costBreakdown).reduce((a, b) => a + b, 0);

  const getCostPercentage = (value: number) => {
    return totalCostBreakdown > 0 ? (value / totalCostBreakdown) * 100 : 0;
  };

  const reports = [
    {
      title: 'Job Performance Report',
      description: 'Detailed analysis of job profitability and performance metrics',
      icon: Briefcase,
      color: '#3B82F6',
      action: () => toast.info('Job Performance Report - Download started'),
    },
    {
      title: 'Financial Summary',
      description: 'Revenue, costs, and profit analysis across all jobs',
      icon: DollarSign,
      color: '#10B981',
      action: () => toast.info('Financial Summary - Download started'),
    },
    {
      title: 'CIS Deductions Report',
      description: 'Monthly CIS deductions and subcontractor payments',
      icon: FileText,
      color: '#EF4444',
      action: () => toast.info('CIS Deductions Report - Download started'),
    },
    {
      title: 'Aged Debtors',
      description: 'Outstanding invoices by age and client',
      icon: Clock,
      color: '#F59E0B',
      action: () => toast.info('Aged Debtors Report - Download started'),
    },
    {
      title: 'Labour Analysis',
      description: 'Employee hours, costs, and productivity metrics',
      icon: Users,
      color: '#8B5CF6',
      action: () => toast.info('Labour Analysis - Download started'),
    },
    {
      title: 'Client Summary',
      description: 'Revenue and job count by client',
      icon: Target,
      color: '#14B8A6',
      action: () => toast.info('Client Summary - Download started'),
    },
  ];

  const quickStats = [
    { label: 'Total Jobs', value: jobs.length, trend: '+12%', positive: true },
    { label: 'Active Jobs', value: inProgressJobs, trend: '+5%', positive: true },
    { label: 'Completion Rate', value: `${jobs.length > 0 ? Math.round((completedJobs / jobs.length) * 100) : 0}%`, trend: '+8%', positive: true },
    { label: 'Avg Job Value', value: `£${jobs.length > 0 ? Math.round(totalJobValue / jobs.length).toLocaleString() : 0}`, trend: '-3%', positive: false },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Reports & Analytics</h1>
          <p className="text-slate-400 mt-1">Comprehensive business intelligence and reporting</p>
        </div>
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
          >
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5"
          >
            <p className="text-slate-400 text-sm">{stat.label}</p>
            <div className="flex items-end justify-between mt-2">
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <span className={`text-xs font-medium flex items-center gap-1 ${stat.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                {stat.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {stat.trend}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Revenue Overview</h3>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-400">Total Job Value</p>
              <p className="text-2xl font-bold text-white">
                £{totalJobValue.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="pt-4 border-t border-slate-700/50">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Invoiced</span>
                <span className="text-sm font-medium text-white">
                  £{totalInvoiced.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${totalJobValue > 0 ? (totalInvoiced / totalJobValue) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-sm text-slate-400">Outstanding</span>
              <span className="text-sm font-medium text-amber-400">
                £{totalOutstanding.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Job Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Job Status</h3>
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Complete', value: completedJobs, color: '#10B981' },
              { label: 'In Progress', value: inProgressJobs, color: '#3B82F6' },
              { label: 'Awaiting Action', value: pendingJobs, color: '#F59E0B' },
            ].map((status) => (
              <div key={status.label}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-slate-400">{status.label}</span>
                  <span className="text-sm font-medium text-white">{status.value}</span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${jobs.length > 0 ? (status.value / jobs.length) * 100 : 0}%`,
                      backgroundColor: status.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-700/50">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Total Jobs</span>
              <span className="text-lg font-bold text-white">{jobs.length}</span>
            </div>
          </div>
        </motion.div>

        {/* Cost Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Cost Breakdown</h3>
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <PieChart className="w-5 h-5 text-red-400" />
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Labour', value: costBreakdown.labour, color: '#3B82F6' },
              { label: 'Materials', value: costBreakdown.materials, color: '#10B981' },
              { label: 'Subcontract', value: costBreakdown.subcontract, color: '#F59E0B' },
              { label: 'Plant', value: costBreakdown.plant, color: '#8B5CF6' },
              { label: 'Waste', value: costBreakdown.waste, color: '#EF4444' },
              { label: 'Other', value: costBreakdown.other, color: '#6B7280' },
            ].map((cost) => (
              <div key={cost.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: cost.color }}
                  />
                  <span className="text-sm text-slate-400">{cost.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-white">
                    £{cost.value.toLocaleString('en-GB', { minimumFractionDigits: 0 })}
                  </span>
                  <span className="text-xs text-slate-500 w-10 text-right">
                    {getCostPercentage(cost.value).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-700/50">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Total Costs</span>
              <span className="text-lg font-bold text-red-400">
                £{totalCostBreakdown.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Available Reports */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Available Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report, index) => (
            <motion.div
              key={report.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              onClick={report.action}
              className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5 cursor-pointer hover:border-slate-600 transition-all group"
            >
              <div className="flex items-start justify-between">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${report.color}20` }}
                >
                  <report.icon className="w-6 h-6" style={{ color: report.color }} />
                </div>
                <motion.div
                  whileHover={{ x: 4 }}
                  className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </motion.div>
              </div>
              <h3 className="text-lg font-semibold text-white mt-4">{report.title}</h3>
              <p className="text-sm text-slate-400 mt-1">{report.description}</p>
              <div className="flex items-center gap-2 mt-4 text-sm" style={{ color: report.color }}>
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Activity Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Business Summary</h3>
          <Activity className="w-5 h-5 text-slate-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-white">
              £{(totalJobValue - totalCostBreakdown).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-slate-400 mt-1">Gross Profit</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-white">
              {totalJobValue > 0 ? ((totalJobValue - totalCostBreakdown) / totalJobValue * 100).toFixed(1) : 0}%
            </p>
            <p className="text-sm text-slate-400 mt-1">Profit Margin</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-white">
              £{Math.round(totalCostBreakdown / (jobs.length || 1)).toLocaleString()}
            </p>
            <p className="text-sm text-slate-400 mt-1">Avg Cost per Job</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-white">
              £{Math.round(totalInvoiced / (invoices.filter(i => i.status === 'Paid').length || 1)).toLocaleString()}
            </p>
            <p className="text-sm text-slate-400 mt-1">Avg Invoice Value</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ReportsPage;
