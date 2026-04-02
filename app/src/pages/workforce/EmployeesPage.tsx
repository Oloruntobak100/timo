/**
 * Employees Page
 * Workforce management
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Search, 
  HardHat,
  Mail,
  Phone,
  PoundSterling,
  Clock,
  X,
  Edit3,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { useEntityStore } from '@/store/entityStore';
import { mockData } from '@/lib/api';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'Hourly' | 'Salaried';
  payRate: number;
  isActive: boolean;
}

export const EmployeesPage: React.FC = () => {
  const { activeCompany } = useEntityStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const theme = activeCompany.theme;

  const filteredEmployees = mockData.employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCreateModal = () => {
    setSelectedEmployee(null);
    setIsFormOpen(true);
  };

  const openEditModal = (emp: any) => {
    setSelectedEmployee(emp);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Employees</h1>
          <p className="text-slate-400">Manage your workforce and pay rates</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-all hover:opacity-90"
          style={{ background: theme.gradient }}
        >
          <Plus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search employees..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.map((employee) => (
          <motion.div
            key={employee.id}
            className="rounded-2xl p-5"
            style={{ 
              backgroundColor: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(71, 85, 105, 0.3)'
            }}
            whileHover={{ borderColor: `${theme.primary}50` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${theme.primary}20` }}
                >
                  <HardHat className="w-6 h-6" style={{ color: theme.primary }} />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{employee.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    employee.type === 'Salaried' 
                      ? 'bg-blue-500/20 text-blue-400' 
                      : 'bg-green-500/20 text-green-400'
                  }`}>
                    {employee.type}
                  </span>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => openEditModal(employee)}
                  className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {employee.email && (
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{employee.email}</span>
                </div>
              )}
              {employee.phone && (
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Phone className="w-4 h-4" />
                  <span>{employee.phone}</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PoundSterling className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-400">
                    {employee.type === 'Hourly' ? 'Hourly Rate' : 'Annual Salary'}
                  </span>
                </div>
                <span className="font-medium text-white">
                  {employee.type === 'Hourly' 
                    ? `£${employee.payRates[0]?.rate.toFixed(2)}/hr`
                    : `£${employee.payRates[0]?.rate.toLocaleString()}`
                  }
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Form Modal */}
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
              <h2 className="text-xl font-bold text-white">
                {selectedEmployee ? 'Edit Employee' : 'Add Employee'}
              </h2>
              <button onClick={() => setIsFormOpen(false)} className="p-2 rounded-lg hover:bg-slate-800">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                toast.success(selectedEmployee ? 'Employee updated' : 'Employee added');
                setIsFormOpen(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  defaultValue={selectedEmployee?.name}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  placeholder="Enter name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Type</label>
                  <select 
                    defaultValue={selectedEmployee?.type || 'Hourly'}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  >
                    <option value="Hourly">Hourly</option>
                    <option value="Salaried">Salaried</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Pay Rate (£)</label>
                  <input
                    type="number"
                    defaultValue={selectedEmployee?.payRates?.[0]?.rate}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Email</label>
                <input
                  type="email"
                  defaultValue={selectedEmployee?.email}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Phone</label>
                <input
                  type="tel"
                  defaultValue={selectedEmployee?.phone}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  placeholder="Phone number"
                />
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
                  {selectedEmployee ? 'Update' : 'Add'} Employee
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default EmployeesPage;
