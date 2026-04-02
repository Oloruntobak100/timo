/**
 * Phillips Data Stream - Type Definitions
 * Shared types for Construction and Environmental entities
 */

// ============================================================================
// ENTITY TYPES
// ============================================================================

export type CompanyType = 'construction' | 'environmental';

export interface Company {
  id: number;
  name: string;
  shortName: string;
  type: CompanyType;
  logo: string;
  address: string;
  phone: string;
  website: string;
  companyRegNo: string;
  vatRegNo: string;
  bank: string;
  xeroTenantId: string;
  theme: ThemeConfig;
}

export interface ThemeConfig {
  primary: string;
  secondary: string;
  accent: string;
  glow: string;
  gradient: string;
}

// ============================================================================
// USER TYPES
// ============================================================================

export type UserRole = 'admin' | 'manager' | 'user' | 'employee';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyId: number;
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
}

// ============================================================================
// JOB MANAGEMENT TYPES
// ============================================================================

export type JobType = 'Network Claims' | 'Project Tender' | 'Intercompany';

export type JobStatus = 
  | 'Awaiting Action' 
  | 'Awaiting Authorisation' 
  | 'Awaiting Survey' 
  | 'In Progress' 
  | 'On Hold' 
  | 'Complete' 
  | 'Invoiced' 
  | 'Paid' 
  | 'Cancelled';

export type JobAnalysisCategory =
  | 'Impact'
  | 'Subsidence'
  | 'Storm'
  | 'Escape Of Water'
  | 'Escape Of Oil'
  | 'Accident Damage'
  | 'Accident Breakage'
  | 'Phillips Ltd Defects'
  | 'Fire'
  | 'Overhead'
  | 'Poor Workmanship'
  | 'Warranty'
  | 'Other'
  | 'NONE';

export interface Job {
  id: string;
  jobNumber: string;
  type: JobType;
  status: JobStatus;
  description: string;
  instructions?: string;
  clientId: string;
  clientName?: string;
  policyHolderId?: string;
  contractId?: string;
  managerId: string;
  managerName?: string;
  companyId: number;
  
  // Financial tracking
  value: number;
  invoiced: number;
  dyingValue?: number;
  totalScopeValue?: number;
  finalAccountValue?: number;
  clientFeePercentage?: number;
  
  // Cost breakdown
  costs: JobCosts;
  
  // Dates
  inceptionDate: string;
  startDate?: string;
  plannedCompletion?: string;
  actualCompletion?: string | null;
  wipDate?: string;
  
  // Analysis
  analysisCategory?: string;
  
  // CVR
  cvr?: CostValueReconciliation;
  
  // Relations
  visits?: Visit[];
  invoices?: SalesInvoice[];
  
  createdAt?: string;
  updatedAt?: string;
}

export interface JobCosts {
  labour: number;
  materials: number;
  subcontract: number;
  plant: number;
  waste: number;
  other: number;
}

export interface CostValueReconciliation {
  id: string;
  jobId: string;
  grossMargin: number;
  clientFee: number;
  budgetedCost: number;
  actualCost: number;
  variance: number;
  createdAt: string;
}

// ============================================================================
// VISIT TYPES
// ============================================================================

export type VisitStatus =
  | 'Not Sent'
  | 'Allocated'
  | 'Accepted'
  | 'Declined'
  | 'Travelling'
  | 'On Site'
  | 'Work Break'
  | 'On Hold'
  | 'Complete'
  | 'Cancelled';

export interface Visit {
  id: string;
  jobId: string;
  reference: string;
  employeeId: string;
  status: VisitStatus;
  
  // Planned times
  plannedStart: string;
  plannedEnd: string;
  
  // Actual times
  actualStart?: string;
  actualEnd?: string;
  
  // Instructions
  instructions?: string;
  notes?: string;
  
  // Location tracking
  latitude?: number;
  longitude?: number;
  
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// CUSTOMER TYPES
// ============================================================================

export interface Client {
  id: string;
  companyName: string;
  reference?: string;
  taxCode: TaxCode | string;
  colour?: string;
  
  // Contact info
  address: Address;
  phone?: string;
  email?: string;
  website?: string;
  
  // Stats
  totalJobs?: number;
  totalValue?: number;
  
  // Relations
  companyId: number;
  jobs?: Job[];
  invoices?: SalesInvoice[];
  
  createdAt?: string;
  updatedAt?: string;
}

export interface PolicyHolder {
  id: string;
  name: string;
  address: Address;
  phone?: string;
  email?: string;
  companyId: number;
  jobs: Job[];
  createdAt: string;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  county?: string;
  postcode: string;
  country: string;
}

export type TaxCode =
  | '20% (VAT on Income)'
  | '20% (VAT on Expenses)'
  | '5% (VAT on Income)'
  | '5% (VAT on Expenses)'
  | 'Zero Rated Income'
  | 'Zero Rated Expenses'
  | 'Exempt Income'
  | 'Exempt Expenses'
  | 'Zero Rated EC Goods Income'
  | 'Reverse Charge Expenses (20%)'
  | 'Domestic Reverse Charge @ 20% (VAT on Income)'
  | 'Domestic Reverse Charge @ 20% (VAT on Expenses)'
  | 'Domestic Reverse Charge @ 5% (VAT on Expenses)'
  | 'No VAT';

// ============================================================================
// FINANCIAL TYPES
// ============================================================================

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName?: string;
  jobId?: string;
  jobNumber?: string;
  
  // Amounts
  netAmount: number;
  vatRate?: number;
  vatAmount: number;
  totalAmount: number;
  paidAmount: number;
  
  // Status
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled';
  
  // Dates
  invoiceDate: string;
  dueDate: string;
  paidDate?: string | null;
  
  // Relations
  companyId: number;
  receipts?: Receipt[];
  
  createdAt?: string;
  updatedAt?: string;
}

// Alias for backward compatibility
export type SalesInvoice = Invoice;

export interface Receipt {
  id: string;
  invoiceId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  reference?: string;
  notes?: string;
  createdAt: string;
}

export interface PurchaseInvoice {
  id: string;
  supplierId: string;
  jobId?: string;
  
  // Amounts
  netAmount: number;
  vatAmount: number;
  totalAmount: number;
  paidAmount: number;
  
  // Status
  status: 'Pending' | 'Approved' | 'Paid';
  
  // Dates
  invoiceDate: string;
  dueDate: string;
  
  // Relations
  companyId: number;
  
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// WORKFORCE TYPES
// ============================================================================

export type EmployeeType = 'Hourly' | 'Salaried';
export type PayRateType = 'Basic' | 'Holiday' | 'Overtime';

export interface Employee {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  type: EmployeeType;
  
  // Pay rates
  payRates: PayRate[];
  travelAllowance?: number;
  
  // Status
  isActive?: boolean;
  isShared?: boolean;
  
  // Relations
  companyId: number;
  visits?: Visit[];
  labourEntries?: Labour[];
  
  createdAt?: string;
  updatedAt?: string;
}

export interface PayRate {
  id: string;
  employeeId: string;
  type: PayRateType;
  rate: number;
  effectiveFrom: string;
  effectiveTo?: string;
}

export interface Labour {
  id: string;
  employeeId: string;
  jobId: string;
  visitId?: string;
  
  // Hours
  regularHours: number;
  overtimeHours: number;
  holidayHours: number;
  totalHours: number;
  
  // Cost
  hourlyRate: number;
  totalCost: number;
  
  // Date
  date: string;
  
  // Relations
  companyId: number;
  
  createdAt: string;
}

// ============================================================================
// SUPPLY CHAIN TYPES
// ============================================================================

export type SupplierType = 'Supplier' | 'Subcontractor';
export type CISStatus = 'Verified' | 'Unverified' | 'No Verification' | 'Gross';

export interface Supplier {
  id: string;
  name: string;
  type: SupplierType;
  
  // Contact
  address: Address;
  phone?: string;
  email?: string;
  
  // CIS (for subcontractors)
  cisStatus?: CISStatus | null;
  cisVerificationNumber?: string;
  cisVerificationDate?: string;
  cisRate?: number;
  utr?: string;
  
  // Account
  accountNumber?: string;
  paymentTerms?: string;
  
  // Sharing
  isShared?: boolean;
  
  // Relations
  companyId: number;
  purchaseInvoices?: PurchaseInvoice[];
  paymentCertificates?: PaymentCertificate[];
  
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentCertificate {
  id: string;
  subcontractorId: string;
  
  // Amounts
  grossAmount: number;
  cisDeduction: number;
  netAmount: number;
  
  // CIS details
  cisRate: number;
  
  // Dates
  periodStart: string;
  periodEnd: string;
  paymentDate: string;
  
  // Relations
  companyId: number;
  
  createdAt: string;
}

// ============================================================================
// DASHBOARD TYPES
// ============================================================================

export interface DashboardMetrics {
  // Job metrics
  totalJobs: number;
  activeJobs: number;
  completedThisMonth: number;
  awaitingInvoicing: number;
  
  // Financial metrics
  totalInvoiced: number;
  totalPaid: number;
  outstandingAmount: number;
  wipValue: number;
  
  // Workforce metrics
  totalEmployees: number;
  visitsToday: number;
  visitsThisWeek: number;
  
  // Cost breakdown
  costs: JobCosts;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

// ============================================================================
// GUIDANCE TYPES
// ============================================================================

export interface TooltipGuidance {
  id: string;
  targetElement: string;
  title: string;
  message: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  trigger: 'hover' | 'click' | 'auto';
  showOnce?: boolean;
  condition?: () => boolean;
}

export interface UserJourneyStep {
  id: string;
  title: string;
  description: string;
  actionText: string;
  targetRoute: string;
  completed: boolean;
}

// ============================================================================
// TIMESHEET TYPES
// ============================================================================

export type TimesheetStatus = 'Pending' | 'Approved' | 'Rejected';

export interface Timesheet {
  id: string;
  employeeId: string;
  employeeName: string;
  jobId: string;
  jobNumber: string;
  date: string;
  hours: number;
  overtimeHours: number;
  description: string;
  status: TimesheetStatus;
  approvedBy?: string;
  approvedAt?: string;
  companyId: number;
  createdAt: string;
}

// ============================================================================
// LABOUR ENTRY TYPES
// ============================================================================

export interface LabourEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  jobId: string;
  jobNumber: string;
  date: string;
  hours: number;
  rateType: 'Basic' | 'Overtime';
  rate: number;
  totalCost: number;
  description: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  companyId: number;
  createdAt: string;
}

// ============================================================================
// PLANNER EVENT TYPES
// ============================================================================

export type PlannerEventType = 'site-visit' | 'meeting' | 'deadline' | 'delivery' | 'other';

export interface PlannerEvent {
  id: string;
  title: string;
  type: PlannerEventType;
  date: string;
  startTime?: string;
  endTime?: string;
  jobId?: string;
  jobNumber?: string;
  assignedTo?: string;
  assignedName?: string;
  location?: string;
  notes?: string;
  companyId: number;
  createdAt: string;
}

// ============================================================================
// CIS RETURN TYPES
// ============================================================================

export type CISReturnStatus = 'Draft' | 'Submitted' | 'Paid';

export interface CISSubmission {
  subcontractorId: string;
  subcontractorName: string;
  grossAmount: number;
  labourAmount: number;
  materialAmount: number;
  cisDeduction: number;
}

export interface CISReturn {
  id: string;
  taxMonth: string;
  status: CISReturnStatus;
  submissions: CISSubmission[];
  totalGrossAmount: number;
  totalMaterialAmount: number;
  totalLabourAmount: number;
  totalCISDeduction: number;
  submittedDate?: string;
  paidDate?: string;
  companyId: number;
  createdAt: string;
}

// ============================================================================
// API TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
