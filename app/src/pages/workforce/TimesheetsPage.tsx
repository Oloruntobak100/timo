/**
 * Timesheets Page
 * Employee time tracking
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Plus, 
  Search, 
  Clock,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { useEntityStore } from '@/store/entityStore';
import { mockData } from '@/lib/api';

interface TimesheetEntry {
  id: string;
  employeeName: string;
  date: string;
  hours: number;
  jobNumber: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

const MOCK_TIMESHEETS: TimesheetEntry[] = [
  { id: '1', employeeName: 'Ian Jones', date: '2024-03-15', hours: 8, jobNumber: 'N-001234', status: 'Approved' },
  { id: '2', employeeName: 'Mark Smith', date: '2024-03-15', hours: 7.5, jobNumber: 'N-001235', status: 'Pending' },
  { id: '3', employeeName: 'Tom Wilson', date: '2024-03-14', hours: 8, jobNumber: 'N-001234', status: 'Approved' },
  { id: '4', employeeName: 'Ian Jones', date: '2024-03-14', hours: 6, jobNumber: 'P-001089', status: 'Pending' },
];

export const TimesheetsPage: React.FC = () => {
  const { activeCompany } = useEntityStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const theme = activeCompany.theme;

  const filteredTimesheets = MOCK_TIMESHEETS.filter(ts =>
    ts.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ts.jobNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalHours = filteredTimesheets.reduce((sum, ts) => sum + ts.hours, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return '#22C55E';
      case 'Pending': return '#EAB308';
      case 'Rejected': return '#EF4444';
      default: return '#94A3B8';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Timesheets</h1>
          <p className="text-slate-400">Track employee hours and attendance</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-all hover:opacity-90"
          style={{ background: theme.gradient }}
        >
          <Plus className="w-4 h-4" />
          Log Hours
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          className="p-4 rounded-xl"
          style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(71, 85, 105, 0.3)' }}
        >
          <p className="text-sm text-slate-400 mb-1">Total Hours (This Week)</p>
          <p className="text-2xl font-bold text-white">{totalHours.toFixed(1)}</p>
        </div>
        <div 
          className="p-4 rounded-xl"
          style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)' }}
        >
          <p className="text-sm text-yellow-400 mb-1">Pending Approval</p>
          <p className="text-2xl font-bold text-yellow-400">
            {filteredTimesheets.filter(t => t.status === 'Pending').length}
          </p>
        </div>
        <div 
          className="p-4 rounded-xl"
          style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)' }}
        >
          <p className="text-sm text-green-400 mb-1">Approved</p>
          <p className="text-2xl font-bold text-green-400">
            {filteredTimesheets.filter(t => t.status === 'Approved').length}
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search timesheets..."
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
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Employee</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Date</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-400">Hours</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Job</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-slate-400">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredTimesheets.map((entry) => (
              <tr key={entry.id} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                <td className="px-4 py-3 text-white">{entry.employeeName}</td>
                <td className="px-4 py-3 text-slate-300">
                  {new Date(entry.date).toLocaleDateString('en-GB')}
                </td>
                <td className="px-4 py-3 text-right font-medium text-white">{entry.hours}</td>
                <td className="px-4 py-3">
                  <span className="text-sm" style={{ color: theme.primary }}>{entry.jobNumber}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span 
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{ 
                      backgroundColor: `${getStatusColor(entry.status)}20`,
                      color: getStatusColor(entry.status)
                    }}
                  >
                    {entry.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Log Hours Modal */}
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
              <h2 className="text-xl font-bold text-white">Log Hours</h2>
              <button onClick={() => setIsFormOpen(false)} className="p-2 rounded-lg hover:bg-slate-800">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                toast.success('Hours logged successfully');
                setIsFormOpen(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm text-slate-400 mb-1">Employee</label>
                <select className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white">
                  {mockData.employees.map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Job</label>
                <select className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white">
                  {mockData.jobs.map(j => (
                    <option key={j.id} value={j.id}>{j.jobNumber}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                    placeholder="8.0"
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
                  Log Hours
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default TimesheetsPage;
