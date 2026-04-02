/**
 * API Client
 * Handles all backend communication with entity context
 */

import { useEntityStore } from '@/store/entityStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ============================================================================
// API CLIENT
// ============================================================================

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getHeaders(): HeadersInit {
    const companyId = useEntityStore.getState().activeCompany.id;
    return {
      'Content-Type': 'application/json',
      'X-Company-ID': companyId.toString(),
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.getHeaders();

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error: ${endpoint}`, error);
      throw error;
    }
  }

  // GET request
  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request
  post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // PATCH request
  patch<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient(API_BASE_URL);

// ============================================================================
// MOCK DATA STORE (Fallback when API is unavailable)
// ============================================================================

import type { Job, Client, Invoice, Employee, Supplier, Timesheet, LabourEntry, PlannerEvent, CISReturn } from '@/types';

export const mockData = {
  jobs: [
    {
      id: '1',
      jobNumber: 'N-001234',
      type: 'Network Claims',
      status: 'Complete',
      description: 'Water damage repair - Main Street property',
      clientId: '1',
      clientName: 'Aviva Insurance',
      managerId: '1',
      managerName: 'Mike Johnson',
      value: 12500,
      invoiced: 12500,
      costs: { labour: 4500, materials: 3200, subcontract: 2800, plant: 1200, waste: 500, other: 300 },
      inceptionDate: '2024-01-15',
      plannedCompletion: '2024-02-15',
      actualCompletion: '2024-02-10',
      analysisCategory: 'Escape Of Water',
      companyId: 1,
    },
    {
      id: '2',
      jobNumber: 'N-001235',
      type: 'Network Claims',
      status: 'In Progress',
      description: 'Storm damage roof repair',
      clientId: '2',
      clientName: 'Direct Line',
      managerId: '2',
      managerName: 'Sarah Williams',
      value: 8750,
      invoiced: 0,
      costs: { labour: 2500, materials: 1800, subcontract: 0, plant: 800, waste: 200, other: 0 },
      inceptionDate: '2024-02-01',
      plannedCompletion: '2024-03-01',
      actualCompletion: null,
      analysisCategory: 'Storm',
      companyId: 1,
    },
    {
      id: '3',
      jobNumber: 'P-001089',
      type: 'Project Tender',
      status: 'Awaiting Action',
      description: 'Commercial building renovation',
      clientId: '3',
      clientName: 'Taunton Council',
      managerId: '1',
      managerName: 'Mike Johnson',
      value: 45000,
      invoiced: 0,
      costs: { labour: 0, materials: 0, subcontract: 0, plant: 0, waste: 0, other: 0 },
      inceptionDate: '2024-03-01',
      plannedCompletion: '2024-06-01',
      actualCompletion: null,
      analysisCategory: 'Commercial',
      companyId: 1,
    },
    {
      id: '4',
      jobNumber: 'N-001236',
      type: 'Network Claims',
      status: 'On Hold',
      description: 'Fire damage restoration',
      clientId: '4',
      clientName: 'AXA Insurance',
      managerId: '3',
      managerName: 'David Brown',
      value: 32000,
      invoiced: 0,
      costs: { labour: 5000, materials: 3000, subcontract: 0, plant: 1000, waste: 500, other: 0 },
      inceptionDate: '2024-01-20',
      plannedCompletion: '2024-04-01',
      actualCompletion: null,
      analysisCategory: 'Fire',
      companyId: 1,
    },
    {
      id: '5',
      jobNumber: 'N-001237',
      type: 'Network Claims',
      status: 'Invoiced',
      description: 'Subsidence repair works',
      clientId: '1',
      clientName: 'Aviva Insurance',
      managerId: '2',
      managerName: 'Sarah Williams',
      value: 18500,
      invoiced: 18500,
      costs: { labour: 6500, materials: 4200, subcontract: 3800, plant: 2200, waste: 1000, other: 800 },
      inceptionDate: '2023-12-01',
      plannedCompletion: '2024-01-31',
      actualCompletion: '2024-01-28',
      analysisCategory: 'Subsidence',
      companyId: 1,
    },
    {
      id: '6',
      jobNumber: 'P-001090',
      type: 'Project Tender',
      status: 'In Progress',
      description: 'Residential extension build',
      clientId: '5',
      clientName: 'Private Client',
      managerId: '1',
      managerName: 'Mike Johnson',
      value: 67500,
      invoiced: 25000,
      costs: { labour: 15000, materials: 22000, subcontract: 8000, plant: 3000, waste: 1500, other: 2000 },
      inceptionDate: '2024-01-10',
      plannedCompletion: '2024-05-10',
      actualCompletion: null,
      analysisCategory: 'Residential',
      companyId: 1,
    },
  ] as Job[],

  clients: [
    { id: '1', companyName: 'Aviva Insurance', reference: 'AVI-001', taxCode: '20% (VAT on Income)', colour: '#3B82F6', address: { line1: 'Aviva House', city: 'London', postcode: 'EC2R 8AW', country: 'UK' }, phone: '0800 158 2424', email: 'claims@aviva.co.uk', totalJobs: 12, totalValue: 145000, companyId: 1 },
    { id: '2', companyName: 'Direct Line', reference: 'DL-002', taxCode: '20% (VAT on Income)', colour: '#EF4444', address: { line1: 'Churchill Court', city: 'London', postcode: 'W1H 6EG', country: 'UK' }, phone: '0345 246 8534', email: 'claims@directline.com', totalJobs: 8, totalValue: 78000, companyId: 1 },
    { id: '3', companyName: 'Taunton Council', reference: 'TC-003', taxCode: 'Exempt Income', colour: '#22C55E', address: { line1: 'Deane House', city: 'Taunton', postcode: 'TA1 4HE', country: 'UK' }, phone: '01823 356010', email: 'procurement@taunton.gov.uk', totalJobs: 3, totalValue: 125000, companyId: 1 },
    { id: '4', companyName: 'AXA Insurance', reference: 'AXA-004', taxCode: '20% (VAT on Income)', colour: '#8B5CF6', address: { line1: '5 Old Broad Street', city: 'London', postcode: 'EC2N 1AD', country: 'UK' }, phone: '0330 024 1235', email: 'claims@axa.co.uk', totalJobs: 6, totalValue: 92000, companyId: 1 },
    { id: '5', companyName: 'Private Client', reference: 'PC-005', taxCode: '20% (VAT on Income)', colour: '#F59E0B', address: { line1: '12 Worthy Lane', city: 'Taunton', postcode: 'TA3 5EF', country: 'UK' }, phone: '01823 213314', email: 'client@example.com', totalJobs: 1, totalValue: 67500, companyId: 1 },
  ] as Client[],

  invoices: [
    { id: '1', invoiceNumber: 'INV-0001', clientId: '1', clientName: 'Aviva Insurance', jobId: '1', jobNumber: 'N-001234', netAmount: 10417, vatRate: 20, vatAmount: 2083, totalAmount: 12500, paidAmount: 12500, status: 'Paid', invoiceDate: '2024-02-15', dueDate: '2024-03-15', paidDate: '2024-02-28', companyId: 1 },
    { id: '2', invoiceNumber: 'INV-0002', clientId: '1', clientName: 'Aviva Insurance', jobId: '5', jobNumber: 'N-001237', netAmount: 15417, vatRate: 20, vatAmount: 3083, totalAmount: 18500, paidAmount: 10000, status: 'Paid', invoiceDate: '2024-02-01', dueDate: '2024-03-01', paidDate: '2024-02-15', companyId: 1 },
    { id: '3', invoiceNumber: 'INV-0003', clientId: '5', clientName: 'Private Client', jobId: '6', jobNumber: 'P-001090', netAmount: 20833, vatRate: 20, vatAmount: 4167, totalAmount: 25000, paidAmount: 25000, status: 'Paid', invoiceDate: '2024-02-20', dueDate: '2024-03-20', paidDate: '2024-03-01', companyId: 1 },
    { id: '4', invoiceNumber: 'INV-0004', clientId: '2', clientName: 'Direct Line', jobId: '2', jobNumber: 'N-001235', netAmount: 7292, vatRate: 20, vatAmount: 1458, totalAmount: 8750, paidAmount: 0, status: 'Sent', invoiceDate: '2024-03-01', dueDate: '2024-04-01', paidDate: null, companyId: 1 },
    { id: '5', invoiceNumber: 'INV-0005', clientId: '4', clientName: 'AXA Insurance', jobId: '4', jobNumber: 'N-001236', netAmount: 26667, vatRate: 20, vatAmount: 5333, totalAmount: 32000, paidAmount: 0, status: 'Overdue', invoiceDate: '2024-02-10', dueDate: '2024-03-10', paidDate: null, companyId: 1 },
  ] as Invoice[],

  employees: [
    { id: '1', name: 'Ian Jones', email: 'ian.jones@phillips.co.uk', phone: '07700 900001', type: 'Hourly', payRates: [{ type: 'Basic', rate: 18.50 }, { type: 'Overtime', rate: 27.75 }], travelAllowance: 0.45, companyId: 1, isActive: true },
    { id: '2', name: 'Mark Smith', email: 'mark.smith@phillips.co.uk', phone: '07700 900002', type: 'Hourly', payRates: [{ type: 'Basic', rate: 16.00 }, { type: 'Overtime', rate: 24.00 }], travelAllowance: 0.45, companyId: 1, isActive: true },
    { id: '3', name: 'Tom Wilson', email: 'tom.wilson@phillips.co.uk', phone: '07700 900003', type: 'Hourly', payRates: [{ type: 'Basic', rate: 19.00 }, { type: 'Overtime', rate: 28.50 }], travelAllowance: 0.45, companyId: 1, isActive: true },
    { id: '4', name: 'Sarah Williams', email: 'sarah.williams@phillips.co.uk', phone: '07700 900004', type: 'Salaried', payRates: [{ type: 'Basic', rate: 45000 }], travelAllowance: 0.45, companyId: 1, isActive: true },
    { id: '5', name: 'David Brown', email: 'david.brown@phillips.co.uk', phone: '07700 900005', type: 'Salaried', payRates: [{ type: 'Basic', rate: 38000 }], travelAllowance: 0.45, companyId: 1, isActive: true },
  ] as Employee[],

  suppliers: [
    { id: '1', name: 'BuildBase Taunton', type: 'Supplier', address: { line1: 'Unit 1, Crown Industrial Estate', city: 'Taunton', postcode: 'TA2 8RX', country: 'UK' }, phone: '01823 330044', email: 'taunton@buildbase.co.uk', cisStatus: null, companyId: 1, isShared: true },
    { id: '2', name: 'Travis Perkins', type: 'Supplier', address: { line1: 'Priorswood Road', city: 'Taunton', postcode: 'TA2 8DN', country: 'UK' }, phone: '01823 323232', email: 'taunton@travisperkins.co.uk', cisStatus: null, companyId: 1, isShared: true },
    { id: '3', name: 'ABC Roofing Ltd', type: 'Subcontractor', address: { line1: '12 Industrial Way', city: 'Bridgwater', postcode: 'TA6 4NZ', country: 'UK' }, phone: '01278 423456', email: 'info@abcroofing.co.uk', cisStatus: 'Verified', cisVerificationNumber: 'V12345678', utr: '1234567890', cisRate: 20, companyId: 1, isShared: false },
    { id: '4', name: 'Elite Electrical', type: 'Subcontractor', address: { line1: '45 High Street', city: 'Wellington', postcode: 'TA21 8QY', country: 'UK' }, phone: '01823 662233', email: 'jobs@eliteelectrical.co.uk', cisStatus: 'Unverified', cisVerificationNumber: null, utr: '0987654321', cisRate: 30, companyId: 1, isShared: false },
    { id: '5', name: 'Premier Plumbing', type: 'Subcontractor', address: { line1: '3 Station Road', city: 'Taunton', postcode: 'TA1 1NH', country: 'UK' }, phone: '01823 272727', email: 'info@premierplumbing.co.uk', cisStatus: 'Verified', cisVerificationNumber: 'V87654321', utr: '1122334455', cisRate: 20, companyId: 1, isShared: false },
  ] as Supplier[],

  timesheets: [
    { id: '1', employeeId: '1', employeeName: 'Ian Jones', jobId: '1', jobNumber: 'N-001234', date: '2024-03-18', hours: 8, overtimeHours: 0, description: 'Water damage repair work', status: 'Approved', companyId: 1, createdAt: '2024-03-18T17:00:00Z' },
    { id: '2', employeeId: '2', employeeName: 'Mark Smith', jobId: '1', jobNumber: 'N-001234', date: '2024-03-18', hours: 8, overtimeHours: 2, description: 'Assisting with repairs', status: 'Pending', companyId: 1, createdAt: '2024-03-18T17:00:00Z' },
    { id: '3', employeeId: '3', employeeName: 'Tom Wilson', jobId: '2', jobNumber: 'N-001235', date: '2024-03-18', hours: 7.5, overtimeHours: 0, description: 'Roof inspection', status: 'Approved', companyId: 1, createdAt: '2024-03-18T17:00:00Z' },
    { id: '4', employeeId: '1', employeeName: 'Ian Jones', jobId: '2', jobNumber: 'N-001235', date: '2024-03-19', hours: 8, overtimeHours: 0, description: 'Storm damage repairs', status: 'Pending', companyId: 1, createdAt: '2024-03-19T17:00:00Z' },
    { id: '5', employeeId: '4', employeeName: 'Sarah Williams', jobId: '3', jobNumber: 'P-001089', date: '2024-03-19', hours: 6, overtimeHours: 0, description: 'Project planning meeting', status: 'Approved', companyId: 1, createdAt: '2024-03-19T17:00:00Z' },
  ] as Timesheet[],

  labourEntries: [
    { id: '1', employeeId: '1', employeeName: 'Ian Jones', jobId: '1', jobNumber: 'N-001234', date: '2024-03-18', hours: 8, rateType: 'Basic', rate: 18.50, totalCost: 148, description: 'Water damage repair', status: 'Approved', companyId: 1, createdAt: '2024-03-18T17:00:00Z' },
    { id: '2', employeeId: '2', employeeName: 'Mark Smith', jobId: '1', jobNumber: 'N-001234', date: '2024-03-18', hours: 8, rateType: 'Basic', rate: 16.00, totalCost: 128, description: 'Assisting with repairs', status: 'Approved', companyId: 1, createdAt: '2024-03-18T17:00:00Z' },
    { id: '3', employeeId: '2', employeeName: 'Mark Smith', jobId: '1', jobNumber: 'N-001234', date: '2024-03-18', hours: 2, rateType: 'Overtime', rate: 24.00, totalCost: 48, description: 'Overtime work', status: 'Pending', companyId: 1, createdAt: '2024-03-18T17:00:00Z' },
    { id: '4', employeeId: '3', employeeName: 'Tom Wilson', jobId: '2', jobNumber: 'N-001235', date: '2024-03-18', hours: 7.5, rateType: 'Basic', rate: 19.00, totalCost: 142.50, description: 'Roof inspection and repair', status: 'Approved', companyId: 1, createdAt: '2024-03-18T17:00:00Z' },
    { id: '5', employeeId: '1', employeeName: 'Ian Jones', jobId: '2', jobNumber: 'N-001235', date: '2024-03-19', hours: 8, rateType: 'Basic', rate: 18.50, totalCost: 148, description: 'Storm damage repairs', status: 'Pending', companyId: 1, createdAt: '2024-03-19T17:00:00Z' },
  ] as LabourEntry[],

  plannerEvents: [
    { id: '1', title: 'Site Survey - Main St', type: 'site-visit', date: '2024-03-20', startTime: '09:00', endTime: '11:00', jobId: '1', jobNumber: 'N-001234', assignedTo: '1', assignedName: 'Ian Jones', location: '123 Main Street, Taunton', notes: 'Initial damage assessment', companyId: 1, createdAt: '2024-03-15T10:00:00Z' },
    { id: '2', title: 'Client Meeting - Aviva', type: 'meeting', date: '2024-03-21', startTime: '14:00', endTime: '15:30', assignedTo: '4', assignedName: 'Sarah Williams', location: 'Aviva House, London', notes: 'Quarterly review meeting', companyId: 1, createdAt: '2024-03-15T10:00:00Z' },
    { id: '3', title: 'Material Delivery', type: 'delivery', date: '2024-03-22', startTime: '08:00', endTime: '09:00', jobId: '2', jobNumber: 'N-001235', location: 'Site address', notes: 'Roofing materials delivery', companyId: 1, createdAt: '2024-03-15T10:00:00Z' },
    { id: '4', title: 'Project Deadline', type: 'deadline', date: '2024-03-25', jobId: '1', jobNumber: 'N-001234', notes: 'Target completion date', companyId: 1, createdAt: '2024-03-15T10:00:00Z' },
    { id: '5', title: 'Team Safety Meeting', type: 'meeting', date: '2024-03-26', startTime: '08:00', endTime: '09:00', location: 'Head Office', notes: 'Monthly safety briefing', companyId: 1, createdAt: '2024-03-15T10:00:00Z' },
  ] as PlannerEvent[],

  cisReturns: [
    { 
      id: '1', 
      taxMonth: '2024-01', 
      status: 'Paid', 
      submissions: [
        { subcontractorId: '3', subcontractorName: 'ABC Roofing Ltd', grossAmount: 5000, labourAmount: 4500, materialAmount: 500, cisDeduction: 900 },
        { subcontractorId: '5', subcontractorName: 'Premier Plumbing', grossAmount: 3200, labourAmount: 2800, materialAmount: 400, cisDeduction: 560 },
      ],
      totalGrossAmount: 8200,
      totalMaterialAmount: 900,
      totalLabourAmount: 7300,
      totalCISDeduction: 1460,
      submittedDate: '2024-02-05',
      paidDate: '2024-02-19',
      companyId: 1, 
      createdAt: '2024-02-01T00:00:00Z' 
    },
    { 
      id: '2', 
      taxMonth: '2024-02', 
      status: 'Submitted', 
      submissions: [
        { subcontractorId: '3', subcontractorName: 'ABC Roofing Ltd', grossAmount: 4200, labourAmount: 3800, materialAmount: 400, cisDeduction: 760 },
        { subcontractorId: '4', subcontractorName: 'Elite Electrical', grossAmount: 2800, labourAmount: 2500, materialAmount: 300, cisDeduction: 750 },
      ],
      totalGrossAmount: 7000,
      totalMaterialAmount: 700,
      totalLabourAmount: 6300,
      totalCISDeduction: 1510,
      submittedDate: '2024-03-05',
      companyId: 1, 
      createdAt: '2024-03-01T00:00:00Z' 
    },
    { 
      id: '3', 
      taxMonth: '2024-03', 
      status: 'Draft', 
      submissions: [
        { subcontractorId: '3', subcontractorName: 'ABC Roofing Ltd', grossAmount: 3500, labourAmount: 3200, materialAmount: 300, cisDeduction: 640 },
      ],
      totalGrossAmount: 3500,
      totalMaterialAmount: 300,
      totalLabourAmount: 3200,
      totalCISDeduction: 640,
      companyId: 1, 
      createdAt: '2024-04-01T00:00:00Z' 
    },
  ] as CISReturn[],
};

// ============================================================================
// MOCK API FUNCTIONS (Used when backend is unavailable)
// ============================================================================

export const mockApi = {
  // Jobs
  getJobs: (companyId: number, filters?: any): Promise<Job[]> => {
    return Promise.resolve(
      mockData.jobs.filter(j => j.companyId === companyId)
    );
  },
  
  getJob: (id: string, companyId: number): Promise<Job | undefined> => {
    return Promise.resolve(
      mockData.jobs.find(j => j.id === id && j.companyId === companyId)
    );
  },
  
  createJob: (data: Partial<Job>, companyId: number): Promise<Job> => {
    const newJob: Job = {
      ...data as Job,
      id: Math.random().toString(36).substr(2, 9),
      jobNumber: `N-${String(mockData.jobs.length + 1).padStart(6, '0')}`,
      companyId,
    };
    mockData.jobs.push(newJob);
    return Promise.resolve(newJob);
  },
  
  updateJob: (id: string, data: Partial<Job>, companyId: number): Promise<Job> => {
    const index = mockData.jobs.findIndex(j => j.id === id);
    if (index === -1) throw new Error('Job not found');
    mockData.jobs[index] = { ...mockData.jobs[index], ...data };
    return Promise.resolve(mockData.jobs[index]);
  },
  
  deleteJob: (id: string, companyId: number): Promise<void> => {
    const index = mockData.jobs.findIndex(j => j.id === id);
    if (index !== -1) mockData.jobs.splice(index, 1);
    return Promise.resolve();
  },

  // Clients
  getClients: (companyId: number): Promise<Client[]> => {
    return Promise.resolve(
      mockData.clients.filter(c => c.companyId === companyId)
    );
  },
  
  createClient: (data: Partial<Client>, companyId: number): Promise<Client> => {
    const newClient: Client = {
      ...data as Client,
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      totalJobs: 0,
      totalValue: 0,
    };
    mockData.clients.push(newClient);
    return Promise.resolve(newClient);
  },
  
  updateClient: (id: string, data: Partial<Client>, companyId: number): Promise<Client> => {
    const index = mockData.clients.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Client not found');
    mockData.clients[index] = { ...mockData.clients[index], ...data };
    return Promise.resolve(mockData.clients[index]);
  },
  
  deleteClient: (id: string, companyId: number): Promise<void> => {
    const index = mockData.clients.findIndex(c => c.id === id);
    if (index !== -1) mockData.clients.splice(index, 1);
    return Promise.resolve();
  },

  // Invoices
  getInvoices: (companyId: number): Promise<Invoice[]> => {
    return Promise.resolve(
      mockData.invoices.filter(i => i.companyId === companyId)
    );
  },
  
  createInvoice: (data: Partial<Invoice>, companyId: number): Promise<Invoice> => {
    const vatAmount = (data.netAmount || 0) * ((data.vatRate || 20) / 100);
    const newInvoice: Invoice = {
      ...data as Invoice,
      id: Math.random().toString(36).substr(2, 9),
      invoiceNumber: `INV-${String(mockData.invoices.length + 1).padStart(4, '0')}`,
      vatAmount,
      totalAmount: (data.netAmount || 0) + vatAmount,
      paidAmount: 0,
      companyId,
    };
    mockData.invoices.push(newInvoice);
    return Promise.resolve(newInvoice);
  },

  // Employees
  getEmployees: (companyId: number): Promise<Employee[]> => {
    return Promise.resolve(
      mockData.employees.filter(e => e.companyId === companyId || e.isShared)
    );
  },

  // Suppliers
  getSuppliers: (companyId: number): Promise<Supplier[]> => {
    return Promise.resolve(
      mockData.suppliers.filter(s => s.companyId === companyId || s.isShared)
    );
  },
  
  createSupplier: (data: Partial<Supplier>, companyId: number): Promise<Supplier> => {
    const newSupplier: Supplier = {
      ...data as Supplier,
      id: Math.random().toString(36).substr(2, 9),
      companyId,
    };
    mockData.suppliers.push(newSupplier);
    return Promise.resolve(newSupplier);
  },
  
  updateSupplier: (id: string, data: Partial<Supplier>, companyId: number): Promise<Supplier> => {
    const index = mockData.suppliers.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Supplier not found');
    mockData.suppliers[index] = { ...mockData.suppliers[index], ...data };
    return Promise.resolve(mockData.suppliers[index]);
  },
  
  deleteSupplier: (id: string, companyId: number): Promise<void> => {
    const index = mockData.suppliers.findIndex(s => s.id === id);
    if (index !== -1) mockData.suppliers.splice(index, 1);
    return Promise.resolve();
  },

  // Timesheets
  getTimesheets: (companyId: number): Promise<Timesheet[]> => {
    return Promise.resolve(
      mockData.timesheets.filter(t => t.companyId === companyId)
    );
  },
  
  createTimesheet: (data: Partial<Timesheet>, companyId: number): Promise<Timesheet> => {
    const newTimesheet: Timesheet = {
      ...data as Timesheet,
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      createdAt: new Date().toISOString(),
    };
    mockData.timesheets.push(newTimesheet);
    return Promise.resolve(newTimesheet);
  },
  
  updateTimesheet: (id: string, data: Partial<Timesheet>, companyId: number): Promise<Timesheet> => {
    const index = mockData.timesheets.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Timesheet not found');
    mockData.timesheets[index] = { ...mockData.timesheets[index], ...data };
    return Promise.resolve(mockData.timesheets[index]);
  },
  
  deleteTimesheet: (id: string, companyId: number): Promise<void> => {
    const index = mockData.timesheets.findIndex(t => t.id === id);
    if (index !== -1) mockData.timesheets.splice(index, 1);
    return Promise.resolve();
  },

  // Labour Entries
  getLabourEntries: (companyId: number): Promise<LabourEntry[]> => {
    return Promise.resolve(
      mockData.labourEntries.filter(l => l.companyId === companyId)
    );
  },
  
  createLabourEntry: (data: Partial<LabourEntry>, companyId: number): Promise<LabourEntry> => {
    const newEntry: LabourEntry = {
      ...data as LabourEntry,
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      createdAt: new Date().toISOString(),
    };
    mockData.labourEntries.push(newEntry);
    return Promise.resolve(newEntry);
  },
  
  updateLabourEntry: (id: string, data: Partial<LabourEntry>, companyId: number): Promise<LabourEntry> => {
    const index = mockData.labourEntries.findIndex(l => l.id === id);
    if (index === -1) throw new Error('Labour entry not found');
    mockData.labourEntries[index] = { ...mockData.labourEntries[index], ...data };
    return Promise.resolve(mockData.labourEntries[index]);
  },
  
  deleteLabourEntry: (id: string, companyId: number): Promise<void> => {
    const index = mockData.labourEntries.findIndex(l => l.id === id);
    if (index !== -1) mockData.labourEntries.splice(index, 1);
    return Promise.resolve();
  },

  // Planner Events
  getPlannerEvents: (companyId: number): Promise<PlannerEvent[]> => {
    return Promise.resolve(
      mockData.plannerEvents.filter(e => e.companyId === companyId)
    );
  },
  
  createPlannerEvent: (data: Partial<PlannerEvent>, companyId: number): Promise<PlannerEvent> => {
    const newEvent: PlannerEvent = {
      ...data as PlannerEvent,
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      createdAt: new Date().toISOString(),
    };
    mockData.plannerEvents.push(newEvent);
    return Promise.resolve(newEvent);
  },
  
  updatePlannerEvent: (id: string, data: Partial<PlannerEvent>, companyId: number): Promise<PlannerEvent> => {
    const index = mockData.plannerEvents.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Event not found');
    mockData.plannerEvents[index] = { ...mockData.plannerEvents[index], ...data };
    return Promise.resolve(mockData.plannerEvents[index]);
  },
  
  deletePlannerEvent: (id: string, companyId: number): Promise<void> => {
    const index = mockData.plannerEvents.findIndex(e => e.id === id);
    if (index !== -1) mockData.plannerEvents.splice(index, 1);
    return Promise.resolve();
  },

  // CIS Returns
  getCISReturns: (companyId: number): Promise<CISReturn[]> => {
    return Promise.resolve(
      mockData.cisReturns.filter(c => c.companyId === companyId)
    );
  },
  
  createCISReturn: (data: Partial<CISReturn>, companyId: number): Promise<CISReturn> => {
    const newReturn: CISReturn = {
      ...data as CISReturn,
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      createdAt: new Date().toISOString(),
    };
    mockData.cisReturns.push(newReturn);
    return Promise.resolve(newReturn);
  },
  
  updateCISReturn: (id: string, data: Partial<CISReturn>, companyId: number): Promise<CISReturn> => {
    const index = mockData.cisReturns.findIndex(c => c.id === id);
    if (index === -1) throw new Error('CIS return not found');
    mockData.cisReturns[index] = { ...mockData.cisReturns[index], ...data };
    return Promise.resolve(mockData.cisReturns[index]);
  },
  
  deleteCISReturn: (id: string, companyId: number): Promise<void> => {
    const index = mockData.cisReturns.findIndex(c => c.id === id);
    if (index !== -1) mockData.cisReturns.splice(index, 1);
    return Promise.resolve();
  },
};
