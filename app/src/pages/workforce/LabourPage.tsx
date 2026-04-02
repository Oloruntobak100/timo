import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  Edit2,
  Trash2,
  FileSpreadsheet,
  DollarSign,
  Clock,
  Briefcase,
  TrendingUp,
  Calendar,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
} from 'lucide-react';
import { useEntityStore } from '@/store/entityStore';
import { mockApi } from '@/lib/api';
import { toast } from 'sonner';
import type { LabourEntry, Employee, Job } from '@/types';

interface LabourFormData {
  employeeId: string;
  jobId: string;
  date: string;
  hours: number;
  rateType: 'Basic' | 'Overtime';
  description: string;
}

const LabourPage: React.FC = () => {
  const { activeCompany } = useEntityStore();
  const [labourEntries, setLabourEntries] = useState<LabourEntry[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof LabourEntry>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<LabourEntry | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<LabourEntry | null>(null);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState<LabourFormData>({
    employeeId: '',
    jobId: '',
    date: new Date().toISOString().split('T')[0],
    hours: 8,
    rateType: 'Basic',
    description: '',
  });

  const accentColor = activeCompany.id === 1 ? '#3B82F6' : '#14B8A6';

  useEffect(() => {
    loadData();
  }, [activeCompany.id]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [entriesData, employeesData, jobsData] = await Promise.all([
        mockApi.getLabourEntries(activeCompany.id),
        mockApi.getEmployees(activeCompany.id),
        mockApi.getJobs(activeCompany.id),
      ]);
      setLabourEntries(entriesData);
      setEmployees(employeesData);
      setJobs(jobsData);
    } catch (error) {
      toast.error('Failed to load labour data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field: keyof LabourEntry) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getEmployeeRate = (employeeId: string, rateType: string): number => {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return 0;
    const rate = employee.payRates.find(r => r.type === rateType);
    return rate?.rate || employee.payRates[0]?.rate || 0;
  };

  const filteredEntries = labourEntries.filter((entry) => {
    const matchesSearch =
      entry.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.jobNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedEntries = [...filteredEntries].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    if (typeof aValue === 'string') aValue = aValue.toLowerCase();
    if (typeof bValue === 'string') bValue = bValue.toLowerCase();
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedEntries.length / itemsPerPage);
  const paginatedEntries = sortedEntries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenModal = (entry?: LabourEntry) => {
    if (entry) {
      setEditingEntry(entry);
      setFormData({
        employeeId: entry.employeeId,
        jobId: entry.jobId,
        date: entry.date,
        hours: entry.hours,
        rateType: entry.rateType,
        description: entry.description,
      });
    } else {
      setEditingEntry(null);
      setFormData({
        employeeId: '',
        jobId: '',
        date: new Date().toISOString().split('T')[0],
        hours: 8,
        rateType: 'Basic',
        description: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const employee = employees.find(e => e.id === formData.employeeId);
      const job = jobs.find(j => j.id === formData.jobId);
      const rate = getEmployeeRate(formData.employeeId, formData.rateType);
      const totalCost = rate * formData.hours;

      const entryData = {
        ...formData,
        employeeName: employee?.name || '',
        jobNumber: job?.jobNumber || '',
        rate,
        totalCost,
        status: 'Pending' as const,
      };

      if (editingEntry) {
        await mockApi.updateLabourEntry(editingEntry.id, entryData, activeCompany.id);
        toast.success('Labour entry updated successfully');
      } else {
        await mockApi.createLabourEntry(entryData, activeCompany.id);
        toast.success('Labour entry created successfully');
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      toast.error('Failed to save labour entry');
    }
  };

  const handleDeleteClick = (entry: LabourEntry) => {
    setEntryToDelete(entry);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!entryToDelete) return;
    try {
      await mockApi.deleteLabourEntry(entryToDelete.id, activeCompany.id);
      toast.success('Labour entry deleted successfully');
      setIsDeleteModalOpen(false);
      setEntryToDelete(null);
      loadData();
    } catch (error) {
      toast.error('Failed to delete labour entry');
    }
  };

  const handleApproveEntry = async (entry: LabourEntry) => {
    try {
      await mockApi.updateLabourEntry(entry.id, { status: 'Approved' }, activeCompany.id);
      toast.success('Labour entry approved');
      loadData();
    } catch (error) {
      toast.error('Failed to approve entry');
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Employee', 'Job', 'Hours', 'Rate Type', 'Rate', 'Total Cost', 'Status', 'Description'];
    const csvContent = [
      headers.join(','),
      ...filteredEntries.map(entry =>
        [
          entry.date,
          entry.employeeName,
          entry.jobNumber,
          entry.hours,
          entry.rateType,
          entry.rate.toFixed(2),
          entry.totalCost.toFixed(2),
          entry.status,
          `"${entry.description}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `labour-entries-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Labour entries exported successfully');
  };

  const totalHours = filteredEntries.reduce((sum, e) => sum + e.hours, 0);
  const totalCost = filteredEntries.reduce((sum, e) => sum + e.totalCost, 0);
  const pendingEntries = filteredEntries.filter(e => e.status === 'Pending').length;
  const approvedEntries = filteredEntries.filter(e => e.status === 'Approved').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Pending':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Labour Management</h1>
          <p className="text-slate-400 mt-1">Track and manage labour costs across all jobs</p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors border border-slate-700"
          >
            <Download className="w-4 h-4" />
            Export
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all"
            style={{ backgroundColor: accentColor }}
          >
            <Plus className="w-4 h-4" />
            Log Labour
          </motion.button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Hours', value: totalHours.toFixed(1), icon: Clock, color: '#3B82F6' },
          { label: 'Total Cost', value: `£${totalCost.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: '#10B981' },
          { label: 'Pending Entries', value: pendingEntries.toString(), icon: Briefcase, color: '#F59E0B' },
          { label: 'Approved Entries', value: approvedEntries.toString(), icon: CheckCircle2, color: '#8B5CF6' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative rounded-xl p-5 overflow-hidden"
            style={{ backgroundColor: 'rgba(30, 41, 59, 0.6)', border: `1px solid ${stat.color}30` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}20` }}
              >
                <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by employee, job, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50">
              <tr>
                {[
                  { key: 'date', label: 'Date' },
                  { key: 'employeeName', label: 'Employee' },
                  { key: 'jobNumber', label: 'Job' },
                  { key: 'hours', label: 'Hours' },
                  { key: 'rateType', label: 'Rate Type' },
                  { key: 'totalCost', label: 'Cost' },
                  { key: 'status', label: 'Status' },
                ].map((column) => (
                  <th
                    key={column.key}
                    onClick={() => handleSort(column.key as keyof LabourEntry)}
                    className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      {column.label}
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-400">
                      <div className="w-5 h-5 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin" />
                      Loading labour entries...
                    </div>
                  </td>
                </tr>
              ) : paginatedEntries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    <Users className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                    <p>No labour entries found</p>
                    <p className="text-sm mt-1">Create your first labour entry to get started</p>
                  </td>
                </tr>
              ) : (
                paginatedEntries.map((entry) => (
                  <motion.tr
                    key={entry.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-white">{entry.date}</td>
                    <td className="px-4 py-3 text-sm text-white">{entry.employeeName}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">{entry.jobNumber}</td>
                    <td className="px-4 py-3 text-sm text-white">{entry.hours}h</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        entry.rateType === 'Overtime' 
                          ? 'bg-purple-500/20 text-purple-400' 
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {entry.rateType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-white">
                      £{entry.totalCost.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(entry.status)}`}>
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {entry.status === 'Pending' && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleApproveEntry(entry)}
                            className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleOpenModal(entry)}
                          className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteClick(entry)}
                          className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
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
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700/50">
            <p className="text-sm text-slate-400">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, sortedEntries.length)} of{' '}
              {sortedEntries.length} entries
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 text-sm text-white">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  {editingEntry ? 'Edit Labour Entry' : 'Log Labour Hours'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Employee</label>
                    <select
                      value={formData.employeeId}
                      onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
                    >
                      <option value="">Select Employee</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Job</label>
                    <select
                      value={formData.jobId}
                      onChange={(e) => setFormData({ ...formData, jobId: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
                    >
                      <option value="">Select Job</option>
                      {jobs.map((job) => (
                        <option key={job.id} value={job.id}>{job.jobNumber} - {job.description.substring(0, 30)}...</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Hours</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="24"
                      value={formData.hours}
                      onChange={(e) => setFormData({ ...formData, hours: parseFloat(e.target.value) })}
                      required
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Rate Type</label>
                  <div className="flex gap-3">
                    {['Basic', 'Overtime'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, rateType: type as 'Basic' | 'Overtime' })}
                        className={`flex-1 py-2 px-4 rounded-lg border transition-all ${
                          formData.rateType === type
                            ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                            : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder="Describe the work performed..."
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 resize-none"
                  />
                </div>

                {formData.employeeId && (
                  <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                    <p className="text-sm text-slate-400">
                      Estimated Cost: {' '}
                      <span className="text-white font-medium">
                        £{((getEmployeeRate(formData.employeeId, formData.rateType) || 0) * formData.hours).toFixed(2)}
                      </span>
                      <span className="text-slate-500 ml-2">
                        (@ £{(getEmployeeRate(formData.employeeId, formData.rateType) || 0).toFixed(2)}/hr)
                      </span>
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors border border-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-lg text-white font-medium transition-all"
                    style={{ backgroundColor: accentColor }}
                  >
                    {editingEntry ? 'Update Entry' : 'Log Hours'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md p-6"
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Delete Labour Entry?</h3>
                <p className="text-slate-400 mb-6">
                  Are you sure you want to delete this labour entry for{' '}
                  <span className="text-white font-medium">{entryToDelete?.employeeName}</span>? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors border border-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                  >
                    Delete Entry
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LabourPage;
