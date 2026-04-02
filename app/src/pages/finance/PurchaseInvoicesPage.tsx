/**
 * Purchase Invoices Page
 * Supplier invoice management
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Plus, 
  Search, 
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { useEntityStore } from '@/store/entityStore';

interface PurchaseInvoice {
  id: string;
  invoiceNumber: string;
  supplierName: string;
  netAmount: number;
  vatAmount: number;
  totalAmount: number;
  status: 'Pending' | 'Approved' | 'Paid';
  invoiceDate: string;
  dueDate: string;
}

const MOCK_PURCHASE_INVOICES: PurchaseInvoice[] = [
  { id: '1', invoiceNumber: 'PI-001', supplierName: 'BuildBase Taunton', netAmount: 2500, vatAmount: 500, totalAmount: 3000, status: 'Paid', invoiceDate: '2024-02-01', dueDate: '2024-03-01' },
  { id: '2', invoiceNumber: 'PI-002', supplierName: 'Travis Perkins', netAmount: 1800, vatAmount: 360, totalAmount: 2160, status: 'Approved', invoiceDate: '2024-02-15', dueDate: '2024-03-15' },
  { id: '3', invoiceNumber: 'PI-003', supplierName: 'ABC Roofing Ltd', netAmount: 4200, vatAmount: 840, totalAmount: 5040, status: 'Pending', invoiceDate: '2024-03-01', dueDate: '2024-04-01' },
  { id: '4', invoiceNumber: 'PI-004', supplierName: 'Elite Electrical', netAmount: 1500, vatAmount: 300, totalAmount: 1800, status: 'Pending', invoiceDate: '2024-03-05', dueDate: '2024-04-05' },
];

export const PurchaseInvoicesPage: React.FC = () => {
  const { activeCompany } = useEntityStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const theme = activeCompany.theme;

  const filteredInvoices = MOCK_PURCHASE_INVOICES.filter(inv => {
    const matchesSearch = inv.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPending = filteredInvoices
    .filter(i => i.status === 'Pending' || i.status === 'Approved')
    .reduce((sum, i) => sum + i.totalAmount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return '#22C55E';
      case 'Approved': return '#3B82F6';
      case 'Pending': return '#EAB308';
      default: return '#94A3B8';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Purchase Invoices</h1>
          <p className="text-slate-400">Manage supplier invoices and payments</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-all hover:opacity-90"
          style={{ background: theme.gradient }}
        >
          <Plus className="w-4 h-4" />
          Add Invoice
        </button>
      </div>

      <div 
        className="p-6 rounded-2xl"
        style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)' }}
      >
        <p className="text-sm text-yellow-400 mb-1">Total Pending</p>
        <p className="text-3xl font-bold text-yellow-400">£{totalPending.toLocaleString()}</p>
      </div>

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
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Paid">Paid</option>
        </select>
      </div>

      <div 
        className="rounded-2xl overflow-hidden"
        style={{ 
          backgroundColor: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid rgba(71, 85, 105, 0.3)'
        }}
      >
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Invoice</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Supplier</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-400">Amount</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-slate-400">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Due Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((invoice) => (
              <tr key={invoice.id} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4" style={{ color: theme.primary }} />
                    <span className="text-white">{invoice.invoiceNumber}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-300">{invoice.supplierName}</td>
                <td className="px-4 py-3 text-right font-medium text-white">
                  £{invoice.totalAmount.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-center">
                  <span 
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{ 
                      backgroundColor: `${getStatusColor(invoice.status)}20`,
                      color: getStatusColor(invoice.status)
                    }}
                  >
                    {invoice.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-300">
                  {new Date(invoice.dueDate).toLocaleDateString('en-GB')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {isFormOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsFormOpen(false)} />
          <motion.div
            className="relative w-full max-w-md rounded-2xl p-6"
            style={{ 
              backgroundColor: 'rgba(15, 23, 42, 0.98)',
              border: '1px solid rgba(71, 85, 105, 0.5)'
            }}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Add Purchase Invoice</h2>
              <button onClick={() => setIsFormOpen(false)} className="p-2 rounded-lg hover:bg-slate-800">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                toast.success('Purchase invoice added');
                setIsFormOpen(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm text-slate-400 mb-1">Supplier</label>
                <select className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white">
                  <option>Select Supplier</option>
                  <option>BuildBase Taunton</option>
                  <option>Travis Perkins</option>
                  <option>ABC Roofing Ltd</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Invoice Number</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  placeholder="e.g., INV-12345"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Net Amount</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">VAT</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg font-medium text-white"
                  style={{ background: theme.gradient }}
                >
                  Add Invoice
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default PurchaseInvoicesPage;
