import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HardHat,
  Plus,
  Search,
  ArrowUpDown,
  Edit2,
  Trash2,
  MoreHorizontal,
  Phone,
  Mail,
  MapPin,
  FileSpreadsheet,
  Building2,
  Shield,
  AlertCircle,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  CreditCard,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { useEntityStore } from '@/store/entityStore';
import { mockApi } from '@/lib/api';
import { toast } from 'sonner';
import type { Supplier } from '@/types';

interface SubcontractorFormData {
  name: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    county?: string;
    postcode: string;
    country: string;
  };
  phone: string;
  email: string;
  utr: string;
  cisStatus: string;
  cisVerificationNumber?: string;
  cisRate: number;
  accountNumber?: string;
  paymentTerms?: string;
  isShared: boolean;
}

const SubcontractorsPage: React.FC = () => {
  const { activeCompany } = useEntityStore();
  const [subcontractors, setSubcontractors] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [cisFilter, setCisFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof Supplier>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubcontractor, setEditingSubcontractor] = useState<Supplier | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [subcontractorToDelete, setSubcontractorToDelete] = useState<Supplier | null>(null);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState<SubcontractorFormData>({
    name: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      county: '',
      postcode: '',
      country: 'UK',
    },
    phone: '',
    email: '',
    utr: '',
    cisStatus: 'Unverified',
    cisVerificationNumber: '',
    cisRate: 20,
    accountNumber: '',
    paymentTerms: '30 days',
    isShared: false,
  });

  const accentColor = activeCompany.id === 1 ? '#3B82F6' : '#14B8A6';

  useEffect(() => {
    loadSubcontractors();
  }, [activeCompany.id]);

  const loadSubcontractors = async () => {
    setIsLoading(true);
    try {
      const data = await mockApi.getSuppliers(activeCompany.id);
      setSubcontractors(data.filter((s) => s.type === 'Subcontractor'));
    } catch (error) {
      toast.error('Failed to load subcontractors');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field: keyof Supplier) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredSubcontractors = subcontractors.filter((sub) => {
    const matchesSearch =
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.utr?.includes(searchQuery);
    const matchesCis = cisFilter === 'all' || sub.cisStatus === cisFilter;
    return matchesSearch && matchesCis;
  });

  const sortedSubcontractors = [...filteredSubcontractors].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    if (typeof aValue === 'string') aValue = aValue.toLowerCase();
    if (typeof bValue === 'string') bValue = bValue.toLowerCase();
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedSubcontractors.length / itemsPerPage);
  const paginatedSubcontractors = sortedSubcontractors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenModal = (subcontractor?: Supplier) => {
    if (subcontractor) {
      setEditingSubcontractor(subcontractor);
      setFormData({
        name: subcontractor.name,
        address: { ...subcontractor.address },
        phone: subcontractor.phone,
        email: subcontractor.email,
        utr: subcontractor.utr || '',
        cisStatus: subcontractor.cisStatus || 'Unverified',
        cisVerificationNumber: subcontractor.cisVerificationNumber || '',
        cisRate: subcontractor.cisRate || 20,
        accountNumber: subcontractor.accountNumber || '',
        paymentTerms: subcontractor.paymentTerms || '30 days',
        isShared: subcontractor.isShared,
      });
    } else {
      setEditingSubcontractor(null);
      setFormData({
        name: '',
        address: {
          line1: '',
          line2: '',
          city: '',
          county: '',
          postcode: '',
          country: 'UK',
        },
        phone: '',
        email: '',
        utr: '',
        cisStatus: 'Unverified',
        cisVerificationNumber: '',
        cisRate: 20,
        accountNumber: '',
        paymentTerms: '30 days',
        isShared: false,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { 
        ...formData, 
        type: 'Subcontractor' as const,
        cisStatus: formData.cisStatus as any
      };
      if (editingSubcontractor) {
        await mockApi.updateSupplier(editingSubcontractor.id, data as any, activeCompany.id);
        toast.success('Subcontractor updated successfully');
      } else {
        await mockApi.createSupplier(data as any, activeCompany.id);
        toast.success('Subcontractor created successfully');
      }
      setIsModalOpen(false);
      loadSubcontractors();
    } catch (error) {
      toast.error('Failed to save subcontractor');
    }
  };

  const handleDeleteClick = (subcontractor: Supplier) => {
    setSubcontractorToDelete(subcontractor);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!subcontractorToDelete) return;
    try {
      await mockApi.deleteSupplier(subcontractorToDelete.id, activeCompany.id);
      toast.success('Subcontractor deleted successfully');
      setIsDeleteModalOpen(false);
      setSubcontractorToDelete(null);
      loadSubcontractors();
    } catch (error) {
      toast.error('Failed to delete subcontractor');
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'UTR', 'CIS Status', 'CIS Rate', 'Phone', 'Email', 'City', 'Postcode'];
    const csvContent = [
      headers.join(','),
      ...filteredSubcontractors.map((s) =>
        [
          s.name,
          s.utr || '',
          s.cisStatus || '',
          s.cisRate ? `${s.cisRate}%` : '',
          s.phone,
          s.email,
          s.address.city,
          s.address.postcode,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subcontractors-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Subcontractors exported successfully');
  };

  const getCisStatusColor = (status?: string) => {
    switch (status) {
      case 'Verified':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Gross':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Unverified':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const verifiedCount = subcontractors.filter((s) => s.cisStatus === 'Verified').length;
  const unverifiedCount = subcontractors.filter((s) => s.cisStatus === 'Unverified').length;
  const grossCount = subcontractors.filter((s) => s.cisStatus === 'Gross').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Subcontractors</h1>
          <p className="text-slate-400 mt-1">Manage CIS-registered subcontractors</p>
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
            Add Subcontractor
          </motion.button>
        </div>
      </div>

      {/* CIS Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Verified', value: verifiedCount, color: '#10B981', icon: CheckCircle2 },
          { label: 'Unverified', value: unverifiedCount, color: '#F59E0B', icon: AlertCircle },
          { label: 'Gross Status', value: grossCount, color: '#3B82F6', icon: Shield },
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
            placeholder="Search by name, UTR, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'Verified', 'Unverified', 'Gross'].map((status) => (
            <button
              key={status}
              onClick={() => setCisFilter(status)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                cisFilter === status
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
                  { key: 'name', label: 'Subcontractor' },
                  { key: 'utr', label: 'UTR' },
                  { key: 'cisStatus', label: 'CIS Status' },
                  { key: 'phone', label: 'Contact' },
                  { key: 'address', label: 'Location' },
                ].map((column) => (
                  <th
                    key={column.key}
                    onClick={() => handleSort(column.key as keyof Supplier)}
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
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-400">
                      <div className="w-5 h-5 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin" />
                      Loading subcontractors...
                    </div>
                  </td>
                </tr>
              ) : paginatedSubcontractors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    <HardHat className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                    <p>No subcontractors found</p>
                    <p className="text-sm mt-1">Add your first subcontractor to get started</p>
                  </td>
                </tr>
              ) : (
                paginatedSubcontractors.map((sub) => (
                  <motion.tr
                    key={sub.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${accentColor}20` }}
                        >
                          <HardHat className="w-5 h-5" style={{ color: accentColor }} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{sub.name}</p>
                          <p className="text-xs text-slate-400">{sub.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-300 font-mono">{sub.utr || '-'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getCisStatusColor(
                            sub.cisStatus
                          )}`}
                        >
                          <Shield className="w-3 h-3 mr-1" />
                          {sub.cisStatus || 'Unverified'}
                        </span>
                        {sub.cisStatus === 'Verified' && sub.cisRate !== undefined && (
                          <p className="text-xs text-slate-500">
                            {sub.cisRate}% deduction
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <Phone className="w-4 h-4 text-slate-500" />
                        {sub.phone}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <MapPin className="w-4 h-4 text-slate-500" />
                        {sub.address.city}, {sub.address.postcode}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleOpenModal(sub)}
                          className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteClick(sub)}
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
              {Math.min(currentPage * itemsPerPage, sortedSubcontractors.length)} of{' '}
              {sortedSubcontractors.length} subcontractors
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
              className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  {editingSubcontractor ? 'Edit Subcontractor' : 'Add New Subcontractor'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Company Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter company name"
                    required
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Phone number"
                      required
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Email address"
                      required
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                </div>

                {/* CIS Section */}
                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 space-y-4">
                  <h3 className="text-sm font-medium text-white flex items-center gap-2">
                    <Shield className="w-4 h-4" style={{ color: accentColor }} />
                    CIS Information
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">UTR Number</label>
                      <input
                        type="text"
                        value={formData.utr}
                        onChange={(e) => setFormData({ ...formData, utr: e.target.value })}
                        placeholder="Unique Taxpayer Reference"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">CIS Status</label>
                      <select
                        value={formData.cisStatus}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            cisStatus: e.target.value as 'Verified' | 'Unverified' | 'Gross',
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
                      >
                        <option value="Unverified">Unverified</option>
                        <option value="Verified">Verified</option>
                        <option value="Gross">Gross</option>
                      </select>
                    </div>
                  </div>

                  {formData.cisStatus === 'Verified' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Verification Number</label>
                        <input
                          type="text"
                          value={formData.cisVerificationNumber}
                          onChange={(e) =>
                            setFormData({ ...formData, cisVerificationNumber: e.target.value })
                          }
                          placeholder="CIS verification number"
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">CIS Deduction Rate</label>
                        <select
                          value={formData.cisRate}
                          onChange={(e) => setFormData({ ...formData, cisRate: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
                        >
                          <option value={20}>20% (Registered)</option>
                          <option value={30}>30% (Unregistered)</option>
                          <option value={0}>0% (Gross)</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Address Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-slate-300">Address</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={formData.address.line1}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: { ...formData.address, line1: e.target.value },
                          })
                        }
                        placeholder="Address Line 1"
                        required
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={formData.address.line2}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: { ...formData.address, line2: e.target.value },
                          })
                        }
                        placeholder="Address Line 2 (Optional)"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={formData.address.city}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: { ...formData.address, city: e.target.value },
                          })
                        }
                        placeholder="City"
                        required
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={formData.address.postcode}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: { ...formData.address, postcode: e.target.value },
                          })
                        }
                        placeholder="Postcode"
                        required
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                  <input
                    type="checkbox"
                    id="isShared"
                    checked={formData.isShared}
                    onChange={(e) => setFormData({ ...formData, isShared: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500/20"
                  />
                  <label htmlFor="isShared" className="text-sm text-slate-300">
                    Share this subcontractor across both companies
                  </label>
                </div>

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
                    {editingSubcontractor ? 'Update Subcontractor' : 'Add Subcontractor'}
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
                <h3 className="text-xl font-semibold text-white mb-2">Delete Subcontractor?</h3>
                <p className="text-slate-400 mb-6">
                  Are you sure you want to delete{' '}
                  <span className="text-white font-medium">{subcontractorToDelete?.name}</span>? This action cannot be undone.
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
                    Delete Subcontractor
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

export default SubcontractorsPage;
