/**
 * Charts Component
 * High-fidelity data visualizations using Recharts
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ============================================================================
// MOCK DATA
// ============================================================================

const revenueData = [
  { month: 'Jan', invoiced: 45000, paid: 38000, target: 50000 },
  { month: 'Feb', invoiced: 52000, paid: 42000, target: 50000 },
  { month: 'Mar', invoiced: 48000, paid: 45000, target: 50000 },
  { month: 'Apr', invoiced: 61000, paid: 52000, target: 55000 },
  { month: 'May', invoiced: 55000, paid: 48000, target: 55000 },
  { month: 'Jun', invoiced: 67000, paid: 58000, target: 60000 },
];

const jobStatusData = [
  { name: 'Awaiting Action', value: 12, color: '#64748B' },
  { name: 'In Progress', value: 8, color: '#3B82F6' },
  { name: 'Complete', value: 15, color: '#22C55E' },
  { name: 'Invoiced', value: 6, color: '#EAB308' },
  { name: 'Paid', value: 23, color: '#14B8A6' },
];

const costBreakdownData = [
  { category: 'Labour', amount: 45000, percentage: 35 },
  { category: 'Materials', amount: 32000, percentage: 25 },
  { category: 'Subcontract', amount: 28000, percentage: 22 },
  { category: 'Plant', amount: 12000, percentage: 9 },
  { category: 'Waste', amount: 6000, percentage: 5 },
  { category: 'Other', amount: 5000, percentage: 4 },
];

const weeklyVisitsData = [
  { day: 'Mon', visits: 8, completed: 6 },
  { day: 'Tue', visits: 12, completed: 10 },
  { day: 'Wed', visits: 10, completed: 9 },
  { day: 'Thu', visits: 14, completed: 12 },
  { day: 'Fri', visits: 11, completed: 8 },
  { day: 'Sat', visits: 4, completed: 4 },
  { day: 'Sun', visits: 2, completed: 2 },
];

// ============================================================================
// CUSTOM TOOLTIP
// ============================================================================

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div 
        className="rounded-xl p-3 border"
        style={{ 
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          borderColor: 'rgba(71, 85, 105, 0.5)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <p className="text-sm font-medium text-white mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-slate-400">{entry.name}:</span>
            <span className="text-white font-medium">
              {typeof entry.value === 'number' 
                ? entry.value.toLocaleString('en-GB', { 
                    style: 'currency', 
                    currency: 'GBP',
                    maximumFractionDigits: 0 
                  })
                : entry.value
              }
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ============================================================================
// REVENUE CHART
// ============================================================================

export const RevenueChart: React.FC = () => {
  const theme = { primary: '#3B82F6', accent: '#60A5FA' };
  
  return (
    <motion.div
      className="rounded-2xl p-6"
      style={{ 
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        border: '1px solid rgba(71, 85, 105, 0.3)',
        backdropFilter: 'blur(10px)'
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Revenue Overview</h3>
          <p className="text-sm text-slate-400">Invoiced vs Paid vs Target</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: theme.primary }}
            />
            <span className="text-xs text-slate-400">Invoiced</span>
          </div>
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: theme.accent }}
            />
            <span className="text-xs text-slate-400">Paid</span>
          </div>
        </div>
      </div>
      
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorInvoiced" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={theme.primary} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={theme.primary} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={theme.accent} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={theme.accent} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="rgba(71, 85, 105, 0.2)" 
              vertical={false}
            />
            <XAxis 
              dataKey="month" 
              stroke="#64748B"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#64748B"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `£${value / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="invoiced"
              name="Invoiced"
              stroke={theme.primary}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorInvoiced)"
            />
            <Area
              type="monotone"
              dataKey="paid"
              name="Paid"
              stroke={theme.accent}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPaid)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

// ============================================================================
// JOB STATUS CHART
// ============================================================================

export const JobStatusChart: React.FC = () => {
  return (
    <motion.div
      className="rounded-2xl p-6"
      style={{ 
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        border: '1px solid rgba(71, 85, 105, 0.3)',
        backdropFilter: 'blur(10px)'
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white">Job Status Distribution</h3>
        <p className="text-sm text-slate-400">Current job breakdown by status</p>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={jobStatusData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
            >
              {jobStatusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mt-4">
        {jobStatusData.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-slate-400">{item.name}</span>
            <span className="text-xs text-white font-medium ml-auto">{item.value}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// ============================================================================
// COST BREAKDOWN CHART
// ============================================================================

export const CostBreakdownChart: React.FC = () => {
  const theme = { primary: '#3B82F6' };
  
  return (
    <motion.div
      className="rounded-2xl p-6"
      style={{ 
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        border: '1px solid rgba(71, 85, 105, 0.3)',
        backdropFilter: 'blur(10px)'
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white">Cost Breakdown</h3>
        <p className="text-sm text-slate-400">Job costs by category</p>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={costBreakdownData} 
            layout="vertical"
            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="rgba(71, 85, 105, 0.2)" 
              horizontal={true}
              vertical={false}
            />
            <XAxis 
              type="number"
              stroke="#64748B"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `£${value / 1000}k`}
            />
            <YAxis 
              type="category"
              dataKey="category"
              stroke="#94A3B8"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="amount" 
              name="Amount"
              radius={[0, 4, 4, 0]}
              fill={theme.primary}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

// ============================================================================
// WEEKLY VISITS CHART
// ============================================================================

export const WeeklyVisitsChart: React.FC = () => {
  const theme = { primary: '#3B82F6', accent: '#14B8A6' };
  
  return (
    <motion.div
      className="rounded-2xl p-6"
      style={{ 
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        border: '1px solid rgba(71, 85, 105, 0.3)',
        backdropFilter: 'blur(10px)'
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Weekly Visits</h3>
          <p className="text-sm text-slate-400">Field engineer activity</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: theme.primary }}
            />
            <span className="text-xs text-slate-400">Scheduled</span>
          </div>
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: theme.accent }}
            />
            <span className="text-xs text-slate-400">Completed</span>
          </div>
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyVisitsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="rgba(71, 85, 105, 0.2)" 
              vertical={false}
            />
            <XAxis 
              dataKey="day" 
              stroke="#64748B"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#64748B"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="visits" name="Scheduled" fill={theme.primary} radius={[4, 4, 0, 0]} />
            <Bar dataKey="completed" name="Completed" fill={theme.accent} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default RevenueChart;
