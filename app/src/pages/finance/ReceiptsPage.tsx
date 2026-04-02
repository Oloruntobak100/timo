/**
 * Receipts Page
 * Payment receipts and records
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  Plus, 
  Search, 
  CheckCircle2,
  Calendar,
  FileText,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { useEntityStore } from '@/store/entityStore';
import { mockData } from '@/lib/api';

interface Receipt {
  id: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  reference: string;
}

const MOCK_RECEIPTS: Receipt[] = [
  { id: '1', invoiceNumber: 'INV-0001', clientName: 'Aviva Insurance', amount: 12500, paymentDate: '2024-02-28', paymentMethod: 'BACS', reference: 'BACS-2024-001' },
  { id: '2', invoiceNumber: 'INV-0002', clientName: 'Aviva Insurance', amount: 10000, paymentDate: '2024-02-15', paymentMethod: 'BACS', reference: 'BACS-2024-002' },
  { id: '3', invoiceNumber: 'INV-0003', clientName: 'Private Client', amount: 25000, paymentDate: '2024-03-01', paymentMethod: 'Bank Transfer', reference: 'BT-2024-003' },
];

export const ReceiptsPage: React.FC = () => {
  const { activeCompany } = useEntityStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const theme = activeCompany.theme;

  const filteredReceipts = MOCK_RECEIPTS.filter(r =>
    r.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalReceived = filteredReceipts.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Receipts</h1>
          <p className="text-slate-400">Record and track payments received</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-all hover:opacity-90"
          style={{ background: theme.gradient }}
        >
          <Plus className="w-4 h-4" />
          Record Payment
        </button>
      </div>

      <div 
        className="p-6 rounded-2xl"
        style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)' }}
      >
        <p className="text-sm text-green-400 mb-1">Total Received</p>
        <p className="text-3xl font-bold text-green-400">£{totalReceived.toLocaleString()}</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search receipts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500"
        />
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
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Client</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-400">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Method</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Reference</th>
            </tr>
          </thead>
          <tbody>
            {filteredReceipts.map((receipt) => (
              <tr key={receipt.id} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="text-white">{receipt.invoiceNumber}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-300">{receipt.clientName}</td>
                <td className="px-4 py-3 text-right font-medium text-green-400">
                  £{receipt.amount.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-slate-300">
                  {new Date(receipt.paymentDate).toLocaleDateString('en-GB')}
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded text-xs bg-slate-700 text-slate-300">
                    {receipt.paymentMethod}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400 text-sm">{receipt.reference}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Receipt Modal */}
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
              <h2 className="text-xl font-bold text-white">Record Payment</h2>
              <button onClick={() => setIsFormOpen(false)} className="p-2 rounded-lg hover:bg-slate-800">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                toast.success('Payment recorded successfully');
                setIsFormOpen(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm text-slate-400 mb-1">Invoice</label>
                <select className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white">
                  <option>Select Invoice</option>
                  {mockData.invoices.filter(i => i.status !== 'Paid').map(i => (
                    <option key={i.id} value={i.id}>{i.invoiceNumber} - {i.clientName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Amount (£)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Payment Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Payment Method</label>
                <select className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white">
                  <option>BACS</option>
                  <option>Bank Transfer</option>
                  <option>Cheque</option>
                  <option>Cash</option>
                </select>
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
                  Record Payment
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ReceiptsPage;
