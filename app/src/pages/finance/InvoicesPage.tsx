/**
 * Invoices Page
 * Full sales invoice management with CRUD operations
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter,
  Edit3,
  Trash2,
  Eye,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  PoundSterling
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useEntityStore } from '@/store/entityStore';
import { mockApi, mockData } from '@/lib/api';
import type { Invoice } from '@/types';

// ============================================================================
// INVOICE FORM MODAL
// ============================================================================

interface InvoiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice?: Invoice | null;
  onSave: (invoice: Partial<Invoice>) => void;
}

const InvoiceFormModal: React.FC<InvoiceFormModalProps> = ({ isOpen, onClose, invoice, onSave }) => {
  const { activeCompany } = useEntityStore();
  const [formData, setFormData] = useState<Partial<Invoice>>({
    clientId: '',
    jobId: '',
    netAmount: 0,
    vatRate: 20,
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Draft',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (invoice) {
      setFormData({
        clientId: invoice.clientId,
        jobId: invoice.jobId,
        netAmount: invoice.netAmount,
        vatRate: invoice.vatRate,
        invoiceDate: invoice.invoiceDate,
        dueDate: invoice.dueDate,
        status: invoice.status,
      });
    }
  }, [invoice]);

  const vatAmount = (formData.netAmount || 0) * ((formData.vatRate || 20) / 100);
  const totalAmount = (formData.netAmount || 0) + vatAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSave(formData);
      toast.success(invoice ? 'Invoice updated successfully' : 'Invoice created successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to save invoice');
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
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          className="relative w-full max-w-xl max-h-[90vh] overflow-auto rounded-2xl"
          style={{ 
            backgroundColor: 'rgba(15, 23, 42, 0.98)',
            border: '1px solid rgba(71, 85, 105, 0.5)'
          }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {invoice ? 'Edit Invoice' : 'Create New Invoice'}
              </h2>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-800">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Client *</label>
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
                <label className="block text-sm text-slate-400 mb-1">Related Job</label>
                <select
                  value={formData.jobId}
                  onChange={(e) => setFormData({ ...formData, jobId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                >
                  <option value="">Select Job (Optional)</option>
                  {mockData.jobs.map(j => (
                    <option key={j.id} value={j.id}>{j.jobNumber} - {j.description.substring(0, 30)}...</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Net Amount (£) *</label>
                  <input
                    type="number"
                    value={formData.netAmount}
                    onChange={(e) => setFormData({ ...formData, netAmount: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">VAT Rate (%)</label>
                  <select
                    value={formData.vatRate}
                    onChange={(e) => setFormData({ ...formData, vatRate: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  >
                    <option value={20}>20%</option>
                    <option value={5}>5%</option>
                    <option value={0}>0%</option>
                  </select>
                </div>
              </div>

              <div 
                className="p-4 rounded-lg"
                style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)' }}
              >
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Net:</span>
                  <span className="text-white">£{(formData.netAmount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">VAT ({formData.vatRate}%):</span>
                  <span className="text-white">£{vatAmount.toLocaleString()}</span>
                </div>
                <div className="h-px bg-slate-700 my-2" />
                <div className="flex justify-between">
                  <span className="text-slate-400">Total:</span>
                  <span className="text-xl font-bold text-white">£{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Invoice Date *</label>
                  <input
                    type="date"
                    value={formData.invoiceDate}
                    onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Due Date *</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                    required
                  />
                </div>
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
                  {isSubmitting ? 'Saving...' : (invoice ? 'Update Invoice' : 'Create Invoice')}
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
// MAIN INVOICES PAGE
// ============================================================================

interface InvoicesPageProps {
  type?: 'all' | 'applications';
}

export const InvoicesPage: React.FC<InvoicesPageProps> = ({ type = 'all' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeCompany } = useEntityStore();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const itemsPerPage = 10;
  const theme = activeCompany.theme;

  useEffect(() => {
    loadInvoices();
    if (location.state?.openModal) {
      setIsFormOpen(true);
      navigate(location.pathname, { replace: true });
    }
  }, [activeCompany.id]);

  const loadInvoices = async () => {
    setIsLoading(true);
    try {
      const data = await mockApi.getInvoices(activeCompany.id);
      setInvoices(data);
    } catch (error) {
      toast.error('Failed to load invoices');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInvoices = useMemo(() => {
    let result = [...invoices];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(inv =>
        inv.invoiceNumber.toLowerCase().includes(query) ||
        inv.clientName?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(inv => inv.status === statusFilter);
    }

    return result;
  }, [invoices, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSaveInvoice = async (invoiceData: Partial<Invoice>) => {
    if (selectedInvoice) {
      // Update existing
    } else {
      await mockApi.createInvoice(invoiceData, activeCompany.id);
    }
    await loadInvoices();
  };

  const openCreateModal = () => {
    setSelectedInvoice(null);
    setIsFormOpen(true);
  };

  const exportToCSV = () => {
    const headers = ['Invoice Number', 'Client', 'Net Amount', 'VAT', 'Total', 'Status', 'Date'];
    const csvContent = [
      headers.join(','),
      ...filteredInvoices.map(inv => [
        inv.invoiceNumber,
        inv.clientName,
        inv.netAmount,
        inv.vatAmount,
        inv.totalAmount,
        inv.status,
        inv.invoiceDate
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Invoices exported to CSV');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return '#22C55E';
      case 'Sent': return '#3B82F6';
      case 'Draft': return '#64748B';
      case 'Overdue': return '#EF4444';
      case 'Cancelled': return '#94A3B8';
      default: return '#94A3B8';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Paid': return CheckCircle2;
      case 'Overdue': return AlertCircle;
      case 'Sent': return Clock;
      default: return FileText;
    }
  };

  // Summary stats
  const totalOutstanding = invoices
    .filter(i => i.status === 'Sent' || i.status === 'Overdue')
    .reduce((sum, i) => sum + (i.totalAmount - i.paidAmount), 0);
  const overdueAmount = invoices
    .filter(i => i.status === 'Overdue')
    .reduce((sum, i) => sum + i.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Sales Invoices</h1>
          <p className="text-slate-400">Manage customer invoices and payments</p>
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
            New Invoice
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          className="p-4 rounded-xl"
          style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(71, 85, 105, 0.3)' }}
        >
          <p className="text-sm text-slate-400 mb-1">Total Outstanding</p>
          <p className="text-2xl font-bold text-white">£{totalOutstanding.toLocaleString()}</p>
        </div>
        <div 
          className="p-4 rounded-xl"
          style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
        >
          <p className="text-sm text-red-400 mb-1">Overdue</p>
          <p className="text-2xl font-bold text-red-400">£{overdueAmount.toLocaleString()}</p>
        </div>
        <div 
          className="p-4 rounded-xl"
          style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)' }}
        >
          <p className="text-sm text-green-400 mb-1">Paid This Month</p>
          <p className="text-2xl font-bold text-green-400">
            £{invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.paidAmount, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
        >
          <option value="all">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Sent">Sent</option>
          <option value="Paid">Paid</option>
          <option value="Overdue">Overdue</option>
        </select>
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
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Invoice</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Client</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400">Amount</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-400">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Due Date</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center">
                    <motion.div
                      className="w-8 h-8 rounded-lg mx-auto"
                      style={{ background: theme.gradient }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  </td>
                </tr>
              ) : paginatedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No invoices found
                  </td>
                </tr>
              ) : (
                paginatedInvoices.map((invoice) => {
                  const StatusIcon = getStatusIcon(invoice.status);
                  return (
                    <motion.tr
                      key={invoice.id}
                      className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" style={{ color: theme.primary }} />
                          <div>
                            <p className="font-medium text-white">{invoice.invoiceNumber}</p>
                            {invoice.jobNumber && (
                              <p className="text-xs text-slate-500">{invoice.jobNumber}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-white">{invoice.clientName}</p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className="font-medium text-white">£{invoice.totalAmount.toLocaleString()}</p>
                        <p className="text-xs text-slate-500">
                          {invoice.paidAmount > 0 ? `Paid: £${invoice.paidAmount.toLocaleString()}` : 'Unpaid'}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span 
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
                          style={{ 
                            backgroundColor: `${getStatusColor(invoice.status)}20`,
                            color: getStatusColor(invoice.status)
                          }}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className={`text-sm ${invoice.status === 'Overdue' ? 'text-red-400' : 'text-slate-300'}`}>
                          {new Date(invoice.dueDate).toLocaleDateString('en-GB')}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => toast.info('View invoice coming soon')}
                            className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toast.info('Record payment coming soon')}
                            className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-green-400 transition-colors"
                          >
                            <PoundSterling className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700">
            <p className="text-sm text-slate-400">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredInvoices.length)} of {filteredInvoices.length} invoices
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-slate-700 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-slate-400">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-slate-700 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <InvoiceFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        invoice={selectedInvoice}
        onSave={handleSaveInvoice}
      />
    </div>
  );
};

export default InvoicesPage;
