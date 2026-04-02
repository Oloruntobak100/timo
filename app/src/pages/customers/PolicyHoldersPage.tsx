/**
 * Policy Holders Page
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Search, Home, Phone, Mail, MapPin } from 'lucide-react';
import { useEntityStore } from '@/store/entityStore';
import { toast } from 'sonner';

const MOCK_POLICY_HOLDERS = [
  { id: '1', name: 'John Smith', address: '15 Oak Avenue, Taunton, TA1 2BC', phone: '07700 123456', email: 'john.smith@email.com' },
  { id: '2', name: 'Sarah Johnson', address: '42 High Street, Wellington, TA21 8QY', phone: '07700 234567', email: 'sarah.j@email.com' },
  { id: '3', name: 'Michael Brown', address: '7 Station Road, Bridgwater, TA6 5DE', phone: '07700 345678', email: 'm.brown@email.com' },
  { id: '4', name: 'Emma Wilson', address: '23 Church Lane, Taunton, TA3 7FG', phone: '07700 456789', email: 'emma.w@email.com' },
];

export const PolicyHoldersPage: React.FC = () => {
  const { activeCompany } = useEntityStore();
  const theme = activeCompany.theme;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Policy Holders</h1>
          <p className="text-slate-400">Manage property owners and policy holders</p>
        </div>
        <button
          onClick={() => toast.info('Add policy holder coming soon')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-all hover:opacity-90"
          style={{ background: theme.gradient }}
        >
          <Plus className="w-4 h-4" />
          Add Policy Holder
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search policy holders..."
          className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_POLICY_HOLDERS.map((holder) => (
          <motion.div
            key={holder.id}
            className="rounded-2xl p-5"
            style={{ 
              backgroundColor: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(71, 85, 105, 0.3)'
            }}
            whileHover={{ borderColor: `${theme.primary}50` }}
          >
            <div className="flex items-start gap-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${theme.primary}20` }}
              >
                <Home className="w-6 h-6" style={{ color: theme.primary }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white">{holder.name}</h3>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{holder.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Phone className="w-4 h-4" />
                    <span>{holder.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{holder.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PolicyHoldersPage;
