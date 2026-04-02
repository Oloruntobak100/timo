/**
 * Clients Page
 * Full CRUD client management
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
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
  ArrowUpDown,
  Building2,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useEntityStore } from '@/store/entityStore';
import { mockApi, mockData } from '@/lib/api';
import type { Client, Address } from '@/types';

// ============================================================================
// CLIENT FORM MODAL
// ============================================================================

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client | null;
  onSave: (client: Partial<Client>) => void;
}

const ClientFormModal: React.FC<ClientFormModalProps> = ({ isOpen, onClose, client, onSave }) => {
  const { activeCompany } = useEntityStore();
  const [formData, setFormData] = useState<Partial<Client>>({
    companyName: '',
    reference: '',
    taxCode: '20% (VAT on Income)',
    colour: '#3B82F6',
    address: { line1: '', city: '', postcode: '', country: 'United Kingdom' } as Address,
    phone: '',
    email: '',
    website: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (client) {
      setFormData({
        companyName: client.companyName,
        reference: client.reference,
        taxCode: client.taxCode,
        colour: client.colour,
        address: client.address,
        phone: client.phone,
        email: client.email,
        website: client.website,
      });
    }
  }, [client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSave(formData);
      toast.success(client ? 'Client updated successfully' : 'Client created successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to save client');
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
          className="relative w-full max-w-2xl max-h-[90vh] overflow-auto rounded-2xl"
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
                {client ? 'Edit Client' : 'Add New Client'}
              </h2>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-800">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Company Name *</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                    placeholder="Enter company name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Reference</label>
                  <input
                    type="text"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                    placeholder="e.g., CLI-001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Tax Code</label>
                  <select
                    value={formData.taxCode}
                    onChange={(e) => setFormData({ ...formData, taxCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  >
                    <option value="20% (VAT on Income)">20% (VAT on Income)</option>
                    <option value="20% (VAT on Expenses)">20% (VAT on Expenses)</option>
                    <option value="5% (VAT on Income)">5% (VAT on Income)</option>
                    <option value="Zero Rated Income">Zero Rated Income</option>
                    <option value="Exempt Income">Exempt Income</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Colour</label>
                  <div className="flex gap-2">
                    {['#3B82F6', '#EF4444', '#22C55E', '#EAB308', '#8B5CF6', '#F59E0B'].map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, colour: color })}
                        className={`w-8 h-8 rounded-lg transition-all ${
                          formData.colour === color ? 'ring-2 ring-white' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-700 pt-4">
                <h4 className="text-sm font-medium text-white mb-3">Address</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={formData.address?.line1}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      address: { ...formData.address!, line1: e.target.value } 
                    })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                    placeholder="Address Line 1 *"
                    required
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={formData.address?.city}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        address: { ...formData.address!, city: e.target.value } 
                      })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                      placeholder="City *"
                      required
                    />
                    <input
                      type="text"
                      value={formData.address?.postcode}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        address: { ...formData.address!, postcode: e.target.value } 
                      })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                      placeholder="Postcode *"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                    placeholder="Phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                    placeholder="Email address"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  placeholder="https://..."
                />
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
                  {isSubmitting ? 'Saving...' : (client ? 'Update Client' : 'Create Client')}
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
// MAIN CLIENTS PAGE
// ============================================================================

export const ClientsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeCompany } = useEntityStore();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  const itemsPerPage = 10;
  const theme = activeCompany.theme;

  useEffect(() => {
    loadClients();
    if (location.state?.openModal) {
      setIsFormOpen(true);
      navigate(location.pathname, { replace: true });
    }
  }, [activeCompany.id]);

  const loadClients = async () => {
    setIsLoading(true);
    try {
      const data = await mockApi.getClients(activeCompany.id);
      setClients(data);
    } catch (error) {
      toast.error('Failed to load clients');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredClients = useMemo(() => {
    if (!searchQuery) return clients;
    const query = searchQuery.toLowerCase();
    return clients.filter(client =>
      client.companyName.toLowerCase().includes(query) ||
      client.reference?.toLowerCase().includes(query) ||
      client.email?.toLowerCase().includes(query)
    );
  }, [clients, searchQuery]);

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSaveClient = async (clientData: Partial<Client>) => {
    if (selectedClient) {
      await mockApi.updateClient(selectedClient.id, clientData, activeCompany.id);
    } else {
      await mockApi.createClient(clientData, activeCompany.id);
    }
    await loadClients();
  };

  const handleDeleteClient = async () => {
    if (clientToDelete) {
      await mockApi.deleteClient(clientToDelete.id, activeCompany.id);
      toast.success('Client deleted successfully');
      setIsDeleteOpen(false);
      setClientToDelete(null);
      await loadClients();
    }
  };

  const openEditModal = (client: Client) => {
    setSelectedClient(client);
    setIsFormOpen(true);
  };

  const openCreateModal = () => {
    setSelectedClient(null);
    setIsFormOpen(true);
  };

  const confirmDelete = (client: Client) => {
    setClientToDelete(client);
    setIsDeleteOpen(true);
  };

  const exportToCSV = () => {
    const headers = ['Company Name', 'Reference', 'Tax Code', 'Phone', 'Email', 'Total Jobs', 'Total Value'];
    const csvContent = [
      headers.join(','),
      ...filteredClients.map(c => [
        `"${c.companyName}"`,
        c.reference,
        c.taxCode,
        c.phone,
        c.email,
        c.totalJobs,
        c.totalValue
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clients-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Clients exported to CSV');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Clients</h1>
          <p className="text-slate-400">Manage your customer relationships</p>
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
            Add Client
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search clients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500"
        />
      </div>

      {/* Clients Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <motion.div
            className="w-12 h-12 rounded-xl"
            style={{ background: theme.gradient }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      ) : paginatedClients.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 mx-auto mb-4 text-slate-600" />
          <h3 className="text-lg font-medium text-white mb-2">No clients found</h3>
          <p className="text-slate-400">Add your first client to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedClients.map((client) => (
            <motion.div
              key={client.id}
              className="rounded-2xl p-5 transition-all"
              style={{ 
                backgroundColor: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(71, 85, 105, 0.3)'
              }}
              whileHover={{ 
                borderColor: `${client.colour}50`,
                boxShadow: `0 0 20px ${client.colour}10`
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${client.colour}20` }}
                  >
                    <Building2 className="w-5 h-5" style={{ color: client.colour }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{client.companyName}</h3>
                    {client.reference && (
                      <p className="text-xs text-slate-500">{client.reference}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEditModal(client)}
                    className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => confirmDelete(client)}
                    className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {client.address && (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{client.address.line1}, {client.address.city}</span>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Phone className="w-4 h-4" />
                    <span>{client.phone}</span>
                  </div>
                )}
                {client.email && (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                <div className="text-sm">
                  <span className="text-slate-500">{client.totalJobs} jobs</span>
                </div>
                <div className="text-sm font-medium text-white">
                  £{client.totalValue?.toLocaleString()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredClients.length)} of {filteredClients.length} clients
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

      {/* Modals */}
      <ClientFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        client={selectedClient}
        onSave={handleSaveClient}
      />

      {/* Delete Confirmation */}
      <AnimatePresence>
        {isDeleteOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsDeleteOpen(false)} />
            <motion.div
              className="relative w-full max-w-md rounded-2xl p-6 text-center"
              style={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.98)',
                border: '1px solid rgba(71, 85, 105, 0.5)'
              }}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Client?</h3>
              <p className="text-slate-400 mb-6">
                Are you sure you want to delete <span className="text-white">{clientToDelete?.companyName}</span>?
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setIsDeleteOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteClient}
                  className="px-6 py-2 rounded-lg font-medium text-white bg-red-500 hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientsPage;
