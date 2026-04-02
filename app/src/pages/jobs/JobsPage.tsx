/**
 * Jobs Page
 * Full CRUD job management with data table and modals
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Edit3,
  Trash2,
  Eye,
  FileText,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useEntityStore } from '@/store/entityStore';
import { mockApi, mockData } from '@/lib/api';
import type { Job, JobStatus, JobType } from '@/types';

// ============================================================================
// JOB FORM MODAL
// ============================================================================

interface JobFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  job?: Job | null;
  onSave: (job: Partial<Job>) => void;
}

const JobFormModal: React.FC<JobFormModalProps> = ({ isOpen, onClose, job, onSave }) => {
  const { activeCompany } = useEntityStore();
  const [formData, setFormData] = useState<Partial<Job>>({
    type: 'Network Claims',
    status: 'Awaiting Action',
    description: '',
    clientId: '',
    managerId: '',
    value: 0,
    inceptionDate: new Date().toISOString().split('T')[0],
    plannedCompletion: '',
    analysisCategory: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (job) {
      setFormData({
        type: job.type,
        status: job.status,
        description: job.description,
        clientId: job.clientId,
        managerId: job.managerId,
        value: job.value,
        inceptionDate: job.inceptionDate,
        plannedCompletion: job.plannedCompletion,
        analysisCategory: job.analysisCategory,
      });
    }
  }, [job]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSave(formData);
      toast.success(job ? 'Job updated successfully' : 'Job created successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to save job');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          className="relative w-full max-w-2xl max-h-[90vh] overflow-auto rounded-2xl"
          style={{ 
            backgroundColor: 'rgba(15, 23, 42, 0.98)',
            border: '1px solid rgba(71, 85, 105, 0.5)'
          }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {job ? 'Edit Job' : 'Create New Job'}
              </h2>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-800">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Job Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as JobType })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  >
                    <option value="Network Claims">Network Claims</option>
                    <option value="Project Tender">Project Tender</option>
                    <option value="Intercompany">Intercompany</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as JobStatus })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  >
                    <option value="Awaiting Action">Awaiting Action</option>
                    <option value="Awaiting Authorisation">Awaiting Authorisation</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Complete">Complete</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white h-20"
                  placeholder="Enter job description..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Client</label>
                  <select
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                    required
                  >
                    <option value="">Select Client</option>
                    {mockData.clients.map(c => (
                      <option key={c.id} value={c.id}>{c.companyName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Manager</label>
                  <select
                    value={formData.managerId}
                    onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  >
                    <option value="">Select Manager</option>
                    {mockData.employees.filter(e => e.type === 'Salaried').map(e => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Job Value (£)</label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Inception Date</label>
                  <input
                    type="date"
                    value={formData.inceptionDate}
                    onChange={(e) => setFormData({ ...formData, inceptionDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Planned Completion</label>
                  <input
                    type="date"
                    value={formData.plannedCompletion}
                    onChange={(e) => setFormData({ ...formData, plannedCompletion: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Analysis Category</label>
                <select
                  value={formData.analysisCategory}
                  onChange={(e) => setFormData({ ...formData, analysisCategory: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                >
                  <option value="">Select Category</option>
                  <option value="Impact">Impact</option>
                  <option value="Subsidence">Subsidence</option>
                  <option value="Storm">Storm</option>
                  <option value="Escape Of Water">Escape Of Water</option>
                  <option value="Fire">Fire</option>
                  <option value="Accident Damage">Accident Damage</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Residential">Residential</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-lg font-medium text-white transition-all disabled:opacity-50"
                  style={{ background: activeCompany.theme.gradient }}
                >
                  {isSubmitting ? 'Saving...' : (job ? 'Update Job' : 'Create Job')}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================================================
// DELETE CONFIRMATION MODAL
// ============================================================================

const DeleteConfirmModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  jobName: string;
}> = ({ isOpen, onClose, onConfirm, jobName }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          className="relative w-full max-w-md rounded-2xl p-6"
          style={{ 
            backgroundColor: 'rgba(15, 23, 42, 0.98)',
            border: '1px solid rgba(71, 85, 105, 0.5)'
          }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Delete Job?</h3>
            <p className="text-slate-400 mb-6">
              Are you sure you want to delete <span className="text-white font-medium">{jobName}</span>? 
              This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-6 py-2 rounded-lg font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================================================
// MAIN JOBS PAGE
// ============================================================================

interface JobsPageProps {
  type?: 'all' | 'quotes' | 'contracts' | 'tracker';
}

export const JobsPage: React.FC<JobsPageProps> = ({ type = 'all' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeCompany } = useEntityStore();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof Job>('inceptionDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);

  const itemsPerPage = 10;
  const theme = activeCompany.theme;

  useEffect(() => {
    loadJobs();
    // Check if we should open modal from navigation state
    if (location.state?.openModal) {
      setIsFormOpen(true);
      // Clear the state
      navigate(location.pathname, { replace: true });
    }
  }, [activeCompany.id]);

  const loadJobs = async () => {
    setIsLoading(true);
    try {
      const data = await mockApi.getJobs(activeCompany.id);
      setJobs(data);
    } catch (error) {
      toast.error('Failed to load jobs');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort jobs
  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(job =>
        job.jobNumber.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        job.clientName?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(job => job.status === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

    return result;
  }, [jobs, searchQuery, statusFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: keyof Job) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSaveJob = async (jobData: Partial<Job>) => {
    if (selectedJob) {
      await mockApi.updateJob(selectedJob.id, jobData, activeCompany.id);
    } else {
      await mockApi.createJob(jobData, activeCompany.id);
    }
    await loadJobs();
  };

  const handleDeleteJob = async () => {
    if (jobToDelete) {
      await mockApi.deleteJob(jobToDelete.id, activeCompany.id);
      toast.success('Job deleted successfully');
      setIsDeleteOpen(false);
      setJobToDelete(null);
      await loadJobs();
    }
  };

  const openEditModal = (job: Job) => {
    setSelectedJob(job);
    setIsFormOpen(true);
  };

  const openCreateModal = () => {
    setSelectedJob(null);
    setIsFormOpen(true);
  };

  const confirmDelete = (job: Job) => {
    setJobToDelete(job);
    setIsDeleteOpen(true);
  };

  const exportToCSV = () => {
    const headers = ['Job Number', 'Type', 'Status', 'Description', 'Client', 'Value', 'Inception Date'];
    const csvContent = [
      headers.join(','),
      ...filteredJobs.map(job => [
        job.jobNumber,
        job.type,
        job.status,
        `"${job.description}"`,
        job.clientName,
        job.value,
        job.inceptionDate
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jobs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Jobs exported to CSV');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Jobs</h1>
          <p className="text-slate-400">Manage all jobs and projects</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-all hover:opacity-90"
            style={{ background: theme.gradient }}
          >
            <Plus className="w-4 h-4" />
            New Job
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
          >
            <option value="all">All Statuses</option>
            <option value="Awaiting Action">Awaiting Action</option>
            <option value="In Progress">In Progress</option>
            <option value="Complete">Complete</option>
            <option value="On Hold">On Hold</option>
            <option value="Invoiced">Invoiced</option>
            <option value="Paid">Paid</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div 
        className="rounded-2xl overflow-hidden"
        style={{ 
          backgroundColor: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid rgba(71, 85, 105, 0.3)'
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-slate-400 cursor-pointer hover:text-white"
                  onClick={() => handleSort('jobNumber')}
                >
                  <div className="flex items-center gap-1">
                    Job Number
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Client</th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-slate-400 cursor-pointer hover:text-white"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    Status
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-right text-xs font-medium text-slate-400 cursor-pointer hover:text-white"
                  onClick={() => handleSort('value')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Value
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    <motion.div
                      className="w-8 h-8 rounded-lg mx-auto"
                      style={{ background: theme.gradient }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  </td>
                </tr>
              ) : paginatedJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No jobs found
                  </td>
                </tr>
              ) : (
                paginatedJobs.map((job) => (
                  <motion.tr
                    key={job.id}
                    className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4" style={{ color: theme.primary }} />
                        <span className="font-medium text-white">{job.jobNumber}</span>
                      </div>
                      <span className="text-xs text-slate-500">{job.type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-white truncate max-w-xs">{job.description}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-300">{job.clientName}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span 
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{ 
                          backgroundColor: `${getStatusColor(job.status)}20`,
                          color: getStatusColor(job.status)
                        }}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="text-sm font-medium text-white">£{job.value.toLocaleString()}</p>
                      <p className="text-xs text-slate-500">
                        {job.invoiced > 0 ? `Invoiced: £${job.invoiced.toLocaleString()}` : 'Not invoiced'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => navigate(`/jobs/${job.id}`)}
                          className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(job)}
                          className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => confirmDelete(job)}
                          className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700">
            <p className="text-sm text-slate-400">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredJobs.length)} of {filteredJobs.length} jobs
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-slate-400">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <JobFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        job={selectedJob}
        onSave={handleSaveJob}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteJob}
        jobName={jobToDelete?.jobNumber || ''}
      />
    </div>
  );
};

export default JobsPage;
