import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  Search,
  ArrowUpDown,
  Edit2,
  Trash2,
  Calendar,
  HardHat,
  PoundSterling,
  CheckCircle2,
  AlertCircle,
  Clock,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Send,
  Eye,
  TrendingUp,
  TrendingDown,
  Calculator,
} from 'lucide-react';
import { useEntityStore } from '@/store/entityStore';
import { mockApi } from '@/lib/api';
import { toast } from 'sonner';
import type { CISReturn, Supplier } from '@/types';

interface CISReturnFormData {
  taxMonth: string;
  submissions: {
    subcontractorId: string;
    grossAmount: number;
    labourAmount: number;
    materialAmount: number;
    cisDeduction: number;
  }[];
}

const CISReturnsPage: React.FC = () => {
  const { activeCompany } = useEntityStore();
  const [cisReturns, setCISReturns] = useState<CISReturn[]>([]);
  const [subcontractors, setSubcontractors] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof CISReturn>('taxMonth');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingReturn, setViewingReturn] = useState<CISReturn | null>(null);
  const itemsPerPage = 10;

  const accentColor = activeCompany.id === 1 ? '#3B82F6' : '#14B8A6';

  useEffect(() => {
    loadData();
  }, [activeCompany.id]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [returnsData, suppliersData] = await Promise.all([
        mockApi.getCISReturns(activeCompany.id),
        mockApi.getSuppliers(activeCompany.id),
      ]);
      setCISReturns(returnsData);
      setSubcontractors(suppliersData.filter((s) => s.type === 'Subcontractor'));
    } catch (error) {
      toast.error('Failed to load CIS returns');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field: keyof CISReturn) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredReturns = cisReturns.filter((returnItem) => {
    const matchesSearch = returnItem.taxMonth.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || returnItem.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedReturns = [...filteredReturns].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    if (typeof aValue === 'string') aValue = aValue.toLowerCase();
    if (typeof bValue === 'string') bValue = bValue.toLowerCase();
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedReturns.length / itemsPerPage);
  const paginatedReturns = sortedReturns.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSubmitReturn = async (returnId: string) => {
    try {
      await mockApi.updateCISReturn(returnId, { status: 'Submitted', submittedDate: new Date().toISOString() }, activeCompany.id);
      toast.success('CIS return submitted successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to submit CIS return');
    }
  };

  const handleMarkAsPaid = async (returnId: string) => {
    try {
      await mockApi.updateCISReturn(returnId, { status: 'Paid', paidDate: new Date().toISOString() }, activeCompany.id);
      toast.success('CIS return marked as paid');
      loadData();
    } catch (error) {
      toast.error('Failed to update CIS return');
    }
  };

  const exportToCSV = () => {
    const headers = ['Tax Month', 'Status', 'Submissions', 'Total Gross', 'Total CIS', 'Submitted Date', 'Paid Date'];
    const csvContent = [
      headers.join(','),
      ...filteredReturns.map((r) =>
        [
          r.taxMonth,
          r.status,
          r.submissions.length,
          r.totalGrossAmount.toFixed(2),
          r.totalCISDeduction.toFixed(2),
          r.submittedDate || '',
          r.paidDate || '',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cis-returns-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('CIS returns exported successfully');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Submitted':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Draft':
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const totalGross = cisReturns.reduce((sum, r) => sum + r.totalGrossAmount, 0);
  const totalCIS = cisReturns.reduce((sum, r) => sum + r.totalCISDeduction, 0);
  const pendingReturns = cisReturns.filter((r) => r.status === 'Draft').length;
  const submittedReturns = cisReturns.filter((r) => r.status === 'Submitted').length;

  const formatTaxMonth = (taxMonth: string) => {
    const [year, month] = taxMonth.split('-');
    const monthNames = ['', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'];
    const monthNum = parseInt(month);
    return `${monthNames[monthNum]} ${year}`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">CIS Returns</h1>
          <p className="text-slate-400 mt-1">Manage Construction Industry Scheme monthly returns</p>
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
            onClick={() => toast.info('Create CIS Return - Coming in next update')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all"
            style={{ backgroundColor: accentColor }}
          >
            <Plus className="w-4 h-4" />
            New Return
          </motion.button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Gross', value: `£${totalGross.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: '#3B82F6' },
          { label: 'Total CIS Deducted', value: `£${totalCIS.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`, icon: Calculator, color: '#EF4444' },
          { label: 'Pending Returns', value: pendingReturns.toString(), icon: Clock, color: '#F59E0B' },
          { label: 'Submitted', value: submittedReturns.toString(), icon: CheckCircle2, color: '#10B981' },
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
            placeholder="Search by tax month..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'Draft', 'Submitted', 'Paid'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                statusFilter === status
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:text-white'
              }`}
            >
              {status === 'all' ? 'All' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50">
              <tr>
                {[
                  { key: 'taxMonth', label: 'Tax Month' },
                  { key: 'status', label: 'Status' },
                  { key: 'submissions', label: 'Submissions' },
                  { key: 'totalGrossAmount', label: 'Gross Amount' },
                  { key: 'totalCISDeduction', label: 'CIS Deducted' },
                  { key: 'submittedDate', label: 'Submitted' },
                ].map((column) => (
                  <th
                    key={column.key}
                    onClick={() => handleSort(column.key as keyof CISReturn)}
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
                      Loading CIS returns...
                    </div>
                  </td>
                </tr>
              ) : paginatedReturns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                    <p>No CIS returns found</p>
                    <p className="text-sm mt-1">Create your first CIS return to get started</p>
                  </td>
                </tr>
              ) : (
                paginatedReturns.map((returnItem) => (
                  <motion.tr
                    key={returnItem.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-medium text-white">
                          {formatTaxMonth(returnItem.taxMonth)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          returnItem.status
                        )}`}
                      >
                        {returnItem.status === 'Draft' && <Clock className="w-3 h-3 mr-1" />}
                        {returnItem.status === 'Submitted' && <Send className="w-3 h-3 mr-1" />}
                        {returnItem.status === 'Paid' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                        {returnItem.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <HardHat className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-white">{returnItem.submissions.length}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-white">
                      £{returnItem.totalGrossAmount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-sm text-red-400">
                      £{returnItem.totalCISDeduction.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {returnItem.submittedDate
                        ? new Date(returnItem.submittedDate).toLocaleDateString('en-GB')
                        : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setViewingReturn(returnItem)}
                          className="p-1.5 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                        {returnItem.status === 'Draft' && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleSubmitReturn(returnItem.id)}
                            className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                            title="Submit to HMRC"
                          >
                            <Send className="w-4 h-4" />
                          </motion.button>
                        )}
                        {returnItem.status === 'Submitted' && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleMarkAsPaid(returnItem.id)}
                            className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                            title="Mark as Paid"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </motion.button>
                        )}
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
              {Math.min(currentPage * itemsPerPage, sortedReturns.length)} of{' '}
              {sortedReturns.length} returns
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

      {/* View Details Modal */}
      <AnimatePresence>
        {viewingReturn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setViewingReturn(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    CIS Return - {formatTaxMonth(viewingReturn.taxMonth)}
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Status: {' '}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(viewingReturn.status)}`}>
                      {viewingReturn.status}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => setViewingReturn(null)}
                  className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Summary */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <p className="text-sm text-slate-400">Total Gross</p>
                    <p className="text-xl font-bold text-white">
                      £{viewingReturn.totalGrossAmount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <p className="text-sm text-slate-400">Materials</p>
                    <p className="text-xl font-bold text-white">
                      £{viewingReturn.totalMaterialAmount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <p className="text-sm text-slate-400">CIS Deducted</p>
                    <p className="text-xl font-bold text-red-400">
                      £{viewingReturn.totalCISDeduction.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                {/* Submissions Table */}
                <div>
                  <h3 className="text-sm font-medium text-slate-300 mb-3">Subcontractor Submissions</h3>
                  <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-slate-900/50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400">Subcontractor</th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-slate-400">Gross</th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-slate-400">Materials</th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-slate-400">Labour</th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-slate-400">CIS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50">
                        {viewingReturn.submissions.map((sub, index) => (
                          <tr key={index} className="hover:bg-slate-700/30">
                            <td className="px-4 py-2 text-sm text-white">{sub.subcontractorName}</td>
                            <td className="px-4 py-2 text-sm text-right text-white">
                              £{sub.grossAmount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-4 py-2 text-sm text-right text-slate-400">
                              £{sub.materialAmount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-4 py-2 text-sm text-right text-white">
                              £{sub.labourAmount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-4 py-2 text-sm text-right text-red-400">
                              £{sub.cisDeduction.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Dates */}
                <div className="flex gap-6 text-sm">
                  {viewingReturn.submittedDate && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Send className="w-4 h-4" />
                      Submitted: {new Date(viewingReturn.submittedDate).toLocaleDateString('en-GB')}
                    </div>
                  )}
                  {viewingReturn.paidDate && (
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      Paid: {new Date(viewingReturn.paidDate).toLocaleDateString('en-GB')}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setViewingReturn(null)}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors border border-slate-700"
                  >
                    Close
                  </button>
                  {viewingReturn.status === 'Draft' && (
                    <button
                      onClick={() => {
                        handleSubmitReturn(viewingReturn.id);
                        setViewingReturn(null);
                      }}
                      className="flex-1 px-4 py-2.5 rounded-lg text-white font-medium transition-all"
                      style={{ backgroundColor: accentColor }}
                    >
                      Submit to HMRC
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CISReturnsPage;
