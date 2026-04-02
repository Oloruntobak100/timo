/**
 * Job Detail Page
 * Comprehensive job view with costs, visits, and documents
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  ArrowLeft, 
  Edit3, 
  FileText, 
  PoundSterling,
  Calendar,
  User,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { useEntityStore } from '@/store/entityStore';
import { mockApi, mockData } from '@/lib/api';
import type { Job } from '@/types';

// ============================================================================
// COST BAR COMPONENT
// ============================================================================

const CostBar: React.FC<{ label: string; value: number; total: number; color: string }> = ({ 
  label, value, total, color 
}) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-400">{label}</span>
        <span className="text-white">£{value.toLocaleString()}</span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
      </div>
    </div>
  );
};

// ============================================================================
// MAIN JOB DETAIL PAGE
// ============================================================================

export const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeCompany } = useEntityStore();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'costs' | 'visits' | 'documents'>('overview');

  const theme = activeCompany.theme;

  useEffect(() => {
    if (id) {
      loadJob();
    }
  }, [id, activeCompany.id]);

  const loadJob = async () => {
    setIsLoading(true);
    try {
      const data = await mockApi.getJob(id!, activeCompany.id);
      if (data) {
        setJob(data);
      } else {
        toast.error('Job not found');
        navigate('/jobs');
      }
    } catch (error) {
      toast.error('Failed to load job');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Complete': return '#22C55E';
      case 'In Progress': return '#3B82F6';
      case 'Awaiting Action': return '#64748B';
      case 'On Hold': return '#EF4444';
      case 'Invoiced': return '#EAB308';
      case 'Paid': return '#14B8A6';
      default: return '#94A3B8';
    }
  };

  const totalCosts = job ? 
    job.costs.labour + job.costs.materials + job.costs.subcontract + 
    job.costs.plant + job.costs.waste + job.costs.other : 0;

  const profit = (job?.value || 0) - totalCosts;
  const profitMargin = job?.value ? (profit / job.value) * 100 : 0;

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

  if (!job) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/jobs')}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{job.jobNumber}</h1>
              <span 
                className="px-3 py-1 rounded-lg text-sm font-medium"
                style={{ 
                  backgroundColor: `${getStatusColor(job.status)}20`,
                  color: getStatusColor(job.status)
                }}
              >
                {job.status}
              </span>
            </div>
            <p className="text-slate-400">{job.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => toast.info('Edit functionality coming soon')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={() => toast.info('Invoice creation coming soon')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-all hover:opacity-90"
            style={{ background: theme.gradient }}
          >
            <FileText className="w-4 h-4" />
            Create Invoice
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700">
        {[
          { id: 'overview', label: 'Overview', icon: Briefcase },
          { id: 'costs', label: 'Costs & CVR', icon: PoundSterling },
          { id: 'visits', label: 'Visits', icon: Calendar },
          { id: 'documents', label: 'Documents', icon: FileText },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === tab.id 
                ? 'text-white border-current' 
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
            style={{ borderColor: activeTab === tab.id ? theme.primary : undefined }}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div 
              className="rounded-2xl p-6"
              style={{ 
                backgroundColor: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(71, 85, 105, 0.3)'
              }}
            >
              <h3 className="text-lg font-semibold text-white mb-4">Job Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Job Type</p>
                  <p className="text-white">{job.type}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Analysis Category</p>
                  <p className="text-white">{job.analysisCategory || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Client</p>
                  <p className="text-white">{job.clientName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Manager</p>
                  <p className="text-white">{job.managerName || 'Unassigned'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Inception Date</p>
                  <p className="text-white">{new Date(job.inceptionDate).toLocaleDateString('en-GB')}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Planned Completion</p>
                  <p className="text-white">
                    {job.plannedCompletion ? new Date(job.plannedCompletion).toLocaleDateString('en-GB') : 'Not set'}
                  </p>
                </div>
              </div>
            </div>

            <div 
              className="rounded-2xl p-6"
              style={{ 
                backgroundColor: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(71, 85, 105, 0.3)'
              }}
            >
              <h3 className="text-lg font-semibold text-white mb-4">Description</h3>
              <p className="text-slate-300">{job.description}</p>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="space-y-6">
            <div 
              className="rounded-2xl p-6"
              style={{ 
                backgroundColor: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(71, 85, 105, 0.3)'
              }}
            >
              <h3 className="text-lg font-semibold text-white mb-4">Financial Summary</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Job Value</span>
                  <span className="text-xl font-bold text-white">£{job.value.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Total Costs</span>
                  <span className="text-lg font-medium text-white">£{totalCosts.toLocaleString()}</span>
                </div>
                
                <div className="h-px bg-slate-700 my-3" />
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Profit</span>
                  <span className={`text-lg font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    £{profit.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Margin</span>
                  <span className={`text-sm font-medium ${profitMargin >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {profitMargin.toFixed(1)}%
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Invoiced</span>
                  <span className="text-white">£{job.invoiced.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div 
              className="rounded-2xl p-6"
              style={{ 
                backgroundColor: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(71, 85, 105, 0.3)'
              }}
            >
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => toast.info('Schedule visit coming soon')}
                  className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  Schedule Visit
                </button>
                <button 
                  onClick={() => toast.info('Add note coming soon')}
                  className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Add Note
                </button>
                <button 
                  onClick={() => toast.info('Upload document coming soon')}
                  className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Upload Document
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Costs Tab */}
      {activeTab === 'costs' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div 
            className="rounded-2xl p-6"
            style={{ 
              backgroundColor: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(71, 85, 105, 0.3)'
            }}
          >
            <h3 className="text-lg font-semibold text-white mb-4">Cost Breakdown</h3>
            <CostBar label="Labour" value={job.costs.labour} total={totalCosts} color="#3B82F6" />
            <CostBar label="Materials" value={job.costs.materials} total={totalCosts} color="#22C55E" />
            <CostBar label="Subcontract" value={job.costs.subcontract} total={totalCosts} color="#EAB308" />
            <CostBar label="Plant" value={job.costs.plant} total={totalCosts} color="#8B5CF6" />
            <CostBar label="Waste" value={job.costs.waste} total={totalCosts} color="#EF4444" />
            <CostBar label="Other" value={job.costs.other} total={totalCosts} color="#64748B" />
            
            <div className="mt-6 pt-4 border-t border-slate-700">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total Costs</span>
                <span className="text-xl font-bold text-white">£{totalCosts.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div 
            className="rounded-2xl p-6"
            style={{ 
              backgroundColor: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(71, 85, 105, 0.3)'
            }}
          >
            <h3 className="text-lg font-semibold text-white mb-4">Cost Value Reconciliation (CVR)</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Budgeted Cost</span>
                <span className="text-white">£{(job.value * 0.6).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Actual Cost</span>
                <span className="text-white">£{totalCosts.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Variance</span>
                <span className={totalCosts <= job.value * 0.6 ? 'text-green-400' : 'text-red-400'}>
                  £{(totalCosts - job.value * 0.6).toLocaleString()}
                </span>
              </div>
              <div className="h-px bg-slate-700 my-3" />
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Gross Margin Target</span>
                <span className="text-white">40%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Actual Margin</span>
                <span className={profitMargin >= 40 ? 'text-green-400' : 'text-yellow-400'}>
                  {profitMargin.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visits Tab */}
      {activeTab === 'visits' && (
        <div 
          className="rounded-2xl p-6 text-center"
          style={{ 
            backgroundColor: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(71, 85, 105, 0.3)'
          }}
        >
          <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-500" />
          <h3 className="text-lg font-semibold text-white mb-2">No Visits Scheduled</h3>
          <p className="text-slate-400 mb-4">Schedule visits to track field engineer activity</p>
          <button 
            onClick={() => toast.info('Schedule visit coming soon')}
            className="px-4 py-2 rounded-lg font-medium text-white transition-all hover:opacity-90"
            style={{ background: theme.gradient }}
          >
            Schedule First Visit
          </button>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div 
          className="rounded-2xl p-6 text-center"
          style={{ 
            backgroundColor: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(71, 85, 105, 0.3)'
          }}
        >
          <FileText className="w-16 h-16 mx-auto mb-4 text-slate-500" />
          <h3 className="text-lg font-semibold text-white mb-2">No Documents</h3>
          <p className="text-slate-400 mb-4">Upload documents related to this job</p>
          <button 
            onClick={() => toast.info('Upload document coming soon')}
            className="px-4 py-2 rounded-lg font-medium text-white transition-all hover:opacity-90"
            style={{ background: theme.gradient }}
          >
            Upload Document
          </button>
        </div>
      )}
    </div>
  );
};

export default JobDetailPage;
