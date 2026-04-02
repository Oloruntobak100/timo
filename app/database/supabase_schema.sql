-- ============================================================================
-- PHILLIPS DATA STREAM — SUPABASE SCHEMA
-- PostgreSQL for Supabase (Auth: auth.users). No password storage in public.
-- Run in Supabase SQL Editor after creating a project.
--
-- Relationship overview (see bottom of file for diagram):
--   auth.users 1 — 1 profiles
--   auth.users M — N companies via user_company_memberships
--   companies 1 — * (clients, jobs, invoices, …)  [tenant root]
--   profiles * — * jobs (manager_id) / contracts (manager_id) / audit_logs
-- ============================================================================

-- Extensions (Supabase usually has these enabled)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- COMPANIES (multi-tenant root)
-- ---------------------------------------------------------------------------
CREATE TABLE public.companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  short_name VARCHAR(100) NOT NULL,
  company_type VARCHAR(50) NOT NULL CHECK (company_type IN ('construction', 'environmental')),
  logo_url VARCHAR(500),
  address TEXT,
  phone VARCHAR(50),
  website VARCHAR(255),
  company_reg_no VARCHAR(50),
  vat_reg_no VARCHAR(50),
  bank_name VARCHAR(100),
  xero_tenant_id VARCHAR(100),
  theme_config JSONB NOT NULL DEFAULT '{
    "primary": "#3B82F6",
    "secondary": "#1E40AF",
    "accent": "#60A5FA",
    "glow": "rgba(59, 130, 246, 0.5)"
  }'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- PROFILES (1:1 with auth.users — app identity, no passwords here)
-- ---------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email TEXT,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url VARCHAR(500),
  phone VARCHAR(50),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_email ON public.profiles (email);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- New Supabase user → profile row (sync email from auth)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- USER ↔ COMPANY membership (which entities a user can switch to / access)
-- Replaces single company_id on users; supports both Phillips companies.
-- ---------------------------------------------------------------------------
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'user', 'employee');

CREATE TABLE public.user_company_memberships (
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  company_id INTEGER NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, company_id)
);

CREATE INDEX idx_memberships_company ON public.user_company_memberships (company_id);

-- ---------------------------------------------------------------------------
-- USER PREFERENCES (persist UI/session choices on Supabase, not localStorage)
-- ---------------------------------------------------------------------------
CREATE TABLE public.user_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.profiles (id) ON DELETE CASCADE,
  last_company_id INTEGER REFERENCES public.companies (id) ON DELETE SET NULL,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- CLIENTS
-- ---------------------------------------------------------------------------
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(255) NOT NULL,
  reference VARCHAR(100),
  tax_code VARCHAR(100) DEFAULT '20% (VAT on Income)',
  colour VARCHAR(7) DEFAULT '#3B82F6',
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  county VARCHAR(100),
  postcode VARCHAR(20) NOT NULL,
  country VARCHAR(100) DEFAULT 'United Kingdom',
  phone VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(255),
  company_id INTEGER NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_clients_company_id ON public.clients (company_id);

CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- POLICY HOLDERS
-- ---------------------------------------------------------------------------
CREATE TABLE public.policy_holders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  county VARCHAR(100),
  postcode VARCHAR(20) NOT NULL,
  country VARCHAR(100) DEFAULT 'United Kingdom',
  phone VARCHAR(50),
  email VARCHAR(255),
  company_id INTEGER NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_policy_holders_company_id ON public.policy_holders (company_id);

CREATE TRIGGER policy_holders_updated_at
  BEFORE UPDATE ON public.policy_holders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- CONTRACTS
-- ---------------------------------------------------------------------------
CREATE TABLE public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  contract_type VARCHAR(50) NOT NULL CHECK (contract_type IN ('Commercial', 'Residential')),
  analysis_category VARCHAR(50),
  manager_id UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  company_id INTEGER NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_contracts_company_id ON public.contracts (company_id);

CREATE TRIGGER contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- EMPLOYEES (workforce — not the same as auth profiles)
-- ---------------------------------------------------------------------------
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  employee_type VARCHAR(50) NOT NULL DEFAULT 'Hourly' CHECK (employee_type IN ('Hourly', 'Salaried')),
  pay_rates JSONB NOT NULL DEFAULT '[{"type": "Basic", "rate": 0}]'::jsonb,
  travel_allowance DECIMAL(8, 2) DEFAULT 0,
  company_id INTEGER NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  is_shared BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_employees_company_id ON public.employees (company_id);

CREATE TRIGGER employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- JOBS
-- ---------------------------------------------------------------------------
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_number VARCHAR(50) NOT NULL DEFAULT '',
  job_type VARCHAR(50) NOT NULL CHECK (job_type IN ('Network Claims', 'Project Tender', 'Intercompany')),
  job_status VARCHAR(50) NOT NULL DEFAULT 'Awaiting Action' CHECK (job_status IN (
    'Awaiting Action', 'Awaiting Authorisation', 'Awaiting Survey', 'In Progress',
    'On Hold', 'Complete', 'Invoiced', 'Paid', 'Cancelled'
  )),
  analysis_category VARCHAR(50),
  description TEXT NOT NULL,
  instructions TEXT,
  client_id UUID NOT NULL REFERENCES public.clients (id) ON DELETE RESTRICT,
  policy_holder_id UUID REFERENCES public.policy_holders (id) ON DELETE SET NULL,
  contract_id UUID REFERENCES public.contracts (id) ON DELETE SET NULL,
  manager_id UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  job_value DECIMAL(12, 2) DEFAULT 0,
  invoiced_amount DECIMAL(12, 2) DEFAULT 0,
  dying_value DECIMAL(12, 2) DEFAULT 0,
  total_scope_value DECIMAL(12, 2) DEFAULT 0,
  final_account_value DECIMAL(12, 2) DEFAULT 0,
  client_fee_percentage DECIMAL(5, 2),
  cost_labour DECIMAL(12, 2) DEFAULT 0,
  cost_materials DECIMAL(12, 2) DEFAULT 0,
  cost_subcontract DECIMAL(12, 2) DEFAULT 0,
  cost_plant DECIMAL(12, 2) DEFAULT 0,
  cost_waste DECIMAL(12, 2) DEFAULT 0,
  cost_other DECIMAL(12, 2) DEFAULT 0,
  inception_date DATE NOT NULL,
  start_date DATE,
  planned_completion_date DATE,
  actual_completion_date DATE,
  wip_date DATE,
  cvr_gross_margin DECIMAL(5, 2) DEFAULT 40,
  cvr_budgeted_cost DECIMAL(12, 2),
  cvr_actual_cost DECIMAL(12, 2),
  hide_from_notifications BOOLEAN NOT NULL DEFAULT false,
  company_id INTEGER NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (company_id, job_number)
);

CREATE INDEX idx_jobs_company_id ON public.jobs (company_id);
CREATE INDEX idx_jobs_client_id ON public.jobs (client_id);
CREATE INDEX idx_jobs_manager_id ON public.jobs (manager_id);
CREATE INDEX idx_jobs_status ON public.jobs (job_status);

CREATE TRIGGER jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.generate_job_number()
RETURNS TRIGGER AS $$
DECLARE
  prefix TEXT;
  next_number INTEGER;
BEGIN
  prefix := CASE NEW.job_type
    WHEN 'Network Claims' THEN 'N-'
    WHEN 'Project Tender' THEN 'P-'
    WHEN 'Intercompany' THEN 'I-'
    ELSE 'J-'
  END;
  SELECT COALESCE(MAX((substring(job_number FROM 3))::integer), 0) + 1
  INTO next_number
  FROM public.jobs
  WHERE job_number LIKE prefix || '%'
    AND company_id = NEW.company_id;
  NEW.job_number := prefix || lpad(next_number::text, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER jobs_generate_number
  BEFORE INSERT ON public.jobs
  FOR EACH ROW
  WHEN (NEW.job_number IS NULL OR NEW.job_number = '')
  EXECUTE FUNCTION public.generate_job_number();

-- ---------------------------------------------------------------------------
-- VISITS (employee = workforce row, not auth user)
-- ---------------------------------------------------------------------------
CREATE TABLE public.visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference VARCHAR(100),
  job_id UUID NOT NULL REFERENCES public.jobs (id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.employees (id) ON DELETE SET NULL,
  visit_status VARCHAR(50) NOT NULL DEFAULT 'Not Sent' CHECK (visit_status IN (
    'Not Sent', 'Allocated', 'Accepted', 'Declined', 'Travelling', 'On Site',
    'Work Break', 'On Hold', 'Complete', 'Cancelled'
  )),
  planned_start TIMESTAMPTZ NOT NULL,
  planned_end TIMESTAMPTZ NOT NULL,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  instructions TEXT,
  notes TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  company_id INTEGER NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_visits_company_id ON public.visits (company_id);
CREATE INDEX idx_visits_job_id ON public.visits (job_id);

CREATE TRIGGER visits_updated_at
  BEFORE UPDATE ON public.visits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- LABOUR ENTRIES
-- ---------------------------------------------------------------------------
CREATE TABLE public.labour_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees (id) ON DELETE RESTRICT,
  job_id UUID NOT NULL REFERENCES public.jobs (id) ON DELETE CASCADE,
  visit_id UUID REFERENCES public.visits (id) ON DELETE SET NULL,
  regular_hours DECIMAL(5, 2) DEFAULT 0,
  overtime_hours DECIMAL(5, 2) DEFAULT 0,
  holiday_hours DECIMAL(5, 2) DEFAULT 0,
  total_hours DECIMAL(5, 2) GENERATED ALWAYS AS (regular_hours + overtime_hours + holiday_hours) STORED,
  hourly_rate DECIMAL(8, 2) NOT NULL,
  total_cost DECIMAL(10, 2) GENERATED ALWAYS AS ((regular_hours + overtime_hours + holiday_hours) * hourly_rate) STORED,
  entry_date DATE NOT NULL,
  company_id INTEGER NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_labour_company_id ON public.labour_entries (company_id);

CREATE TRIGGER labour_entries_updated_at
  BEFORE UPDATE ON public.labour_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- SALES INVOICES & RECEIPTS
-- ---------------------------------------------------------------------------
CREATE TABLE public.sales_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(50) NOT NULL DEFAULT '',
  client_id UUID NOT NULL REFERENCES public.clients (id) ON DELETE RESTRICT,
  job_id UUID REFERENCES public.jobs (id) ON DELETE SET NULL,
  net_amount DECIMAL(12, 2) NOT NULL,
  vat_rate DECIMAL(5, 2) NOT NULL DEFAULT 20.00,
  vat_amount DECIMAL(12, 2) GENERATED ALWAYS AS (net_amount * (vat_rate / 100)) STORED,
  total_amount DECIMAL(12, 2) GENERATED ALWAYS AS (net_amount + (net_amount * (vat_rate / 100))) STORED,
  paid_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  invoice_status VARCHAR(50) NOT NULL DEFAULT 'Draft' CHECK (invoice_status IN ('Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled')),
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  company_id INTEGER NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (company_id, invoice_number)
);

CREATE INDEX idx_sales_invoices_company_id ON public.sales_invoices (company_id);

CREATE TRIGGER sales_invoices_updated_at
  BEFORE UPDATE ON public.sales_invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
  next_number INTEGER;
BEGIN
  SELECT COALESCE(MAX((substring(invoice_number FROM 5))::integer), 0) + 1
  INTO next_number
  FROM public.sales_invoices
  WHERE invoice_number LIKE 'INV-%'
    AND company_id = NEW.company_id;
  NEW.invoice_number := 'INV-' || lpad(next_number::text, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sales_invoices_generate_number
  BEFORE INSERT ON public.sales_invoices
  FOR EACH ROW
  WHEN (NEW.invoice_number IS NULL OR NEW.invoice_number = '')
  EXECUTE FUNCTION public.generate_invoice_number();

CREATE TABLE public.receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.sales_invoices (id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method VARCHAR(50),
  reference VARCHAR(255),
  notes TEXT,
  company_id INTEGER NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_receipts_invoice_id ON public.receipts (invoice_id);

-- ---------------------------------------------------------------------------
-- SUPPLIERS / SUBCONTRACTORS & PURCHASE INVOICES & CIS CERTIFICATES
-- ---------------------------------------------------------------------------
CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  supplier_type VARCHAR(50) NOT NULL DEFAULT 'Supplier' CHECK (supplier_type IN ('Supplier', 'Subcontractor')),
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  county VARCHAR(100),
  postcode VARCHAR(20),
  country VARCHAR(100) DEFAULT 'United Kingdom',
  phone VARCHAR(50),
  email VARCHAR(255),
  cis_status VARCHAR(50) CHECK (cis_status IN ('Verified', 'Unverified', 'No Verification', 'Gross')),
  cis_verification_number VARCHAR(100),
  cis_verification_date DATE,
  utr VARCHAR(50),
  company_id INTEGER NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  is_shared BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_suppliers_company_id ON public.suppliers (company_id);

CREATE TRIGGER suppliers_updated_at
  BEFORE UPDATE ON public.suppliers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.purchase_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(100),
  supplier_id UUID NOT NULL REFERENCES public.suppliers (id) ON DELETE RESTRICT,
  job_id UUID REFERENCES public.jobs (id) ON DELETE SET NULL,
  net_amount DECIMAL(12, 2) NOT NULL,
  vat_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(12, 2) GENERATED ALWAYS AS (net_amount + vat_amount) STORED,
  paid_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  invoice_status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (invoice_status IN ('Pending', 'Approved', 'Paid')),
  invoice_date DATE NOT NULL,
  due_date DATE,
  company_id INTEGER NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_purchase_invoices_company_id ON public.purchase_invoices (company_id);

CREATE TRIGGER purchase_invoices_updated_at
  BEFORE UPDATE ON public.purchase_invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.payment_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_number VARCHAR(50) NOT NULL DEFAULT '',
  subcontractor_id UUID NOT NULL REFERENCES public.suppliers (id) ON DELETE RESTRICT,
  gross_amount DECIMAL(12, 2) NOT NULL,
  cis_rate DECIMAL(5, 2) NOT NULL DEFAULT 20.00,
  cis_deduction DECIMAL(12, 2) GENERATED ALWAYS AS (gross_amount * (cis_rate / 100)) STORED,
  net_amount DECIMAL(12, 2) GENERATED ALWAYS AS (gross_amount - (gross_amount * (cis_rate / 100))) STORED,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  payment_date DATE,
  company_id INTEGER NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (company_id, certificate_number)
);

CREATE INDEX idx_payment_certificates_company_id ON public.payment_certificates (company_id);

CREATE TRIGGER payment_certificates_updated_at
  BEFORE UPDATE ON public.payment_certificates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.generate_certificate_number()
RETURNS TRIGGER AS $$
DECLARE
  next_number INTEGER;
BEGIN
  SELECT COALESCE(MAX((substring(certificate_number FROM 6))::integer), 0) + 1
  INTO next_number
  FROM public.payment_certificates
  WHERE certificate_number LIKE 'CERT-%'
    AND company_id = NEW.company_id;
  NEW.certificate_number := 'CERT-' || lpad(next_number::text, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_certificates_generate_number
  BEFORE INSERT ON public.payment_certificates
  FOR EACH ROW
  WHEN (NEW.certificate_number IS NULL OR NEW.certificate_number = '')
  EXECUTE FUNCTION public.generate_certificate_number();

-- ---------------------------------------------------------------------------
-- TIMESHEETS (app types — were not in legacy schema.sql)
-- ---------------------------------------------------------------------------
CREATE TABLE public.timesheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees (id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs (id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  hours DECIMAL(5, 2) NOT NULL DEFAULT 0,
  overtime_hours DECIMAL(5, 2) NOT NULL DEFAULT 0,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  approved_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  company_id INTEGER NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_timesheets_company_id ON public.timesheets (company_id);

CREATE TRIGGER timesheets_updated_at
  BEFORE UPDATE ON public.timesheets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- PLANNER EVENTS
-- ---------------------------------------------------------------------------
CREATE TABLE public.planner_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  event_type VARCHAR(50) NOT NULL DEFAULT 'other' CHECK (event_type IN ('site-visit', 'meeting', 'deadline', 'delivery', 'other')),
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  job_id UUID REFERENCES public.jobs (id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  location TEXT,
  notes TEXT,
  company_id INTEGER NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_planner_events_company_id ON public.planner_events (company_id);

CREATE TRIGGER planner_events_updated_at
  BEFORE UPDATE ON public.planner_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- CIS RETURNS (header + line items)
-- ---------------------------------------------------------------------------
CREATE TABLE public.cis_returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tax_month VARCHAR(20) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Submitted', 'Paid')),
  total_gross_amount DECIMAL(14, 2) NOT NULL DEFAULT 0,
  total_material_amount DECIMAL(14, 2) NOT NULL DEFAULT 0,
  total_labour_amount DECIMAL(14, 2) NOT NULL DEFAULT 0,
  total_cis_deduction DECIMAL(14, 2) NOT NULL DEFAULT 0,
  submitted_date DATE,
  paid_date DATE,
  company_id INTEGER NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (company_id, tax_month)
);

CREATE INDEX idx_cis_returns_company_id ON public.cis_returns (company_id);

CREATE TRIGGER cis_returns_updated_at
  BEFORE UPDATE ON public.cis_returns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.cis_return_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cis_return_id UUID NOT NULL REFERENCES public.cis_returns (id) ON DELETE CASCADE,
  subcontractor_id UUID NOT NULL REFERENCES public.suppliers (id) ON DELETE RESTRICT,
  gross_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  labour_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  material_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  cis_deduction DECIMAL(12, 2) NOT NULL DEFAULT 0,
  company_id INTEGER NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE
);

CREATE INDEX idx_cis_return_lines_return ON public.cis_return_lines (cis_return_id);

-- ---------------------------------------------------------------------------
-- AUDIT LOGS
-- ---------------------------------------------------------------------------
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  company_id INTEGER REFERENCES public.companies (id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_company_id ON public.audit_logs (company_id);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs (user_id);

-- ---------------------------------------------------------------------------
-- DASHBOARD VIEWS (optional)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.v_jobs_summary AS
SELECT company_id, job_status, COUNT(*) AS count,
       SUM(job_value) AS total_value, SUM(invoiced_amount) AS total_invoiced
FROM public.jobs
GROUP BY company_id, job_status;

CREATE OR REPLACE VIEW public.v_financial_summary AS
SELECT company_id,
       SUM(net_amount) AS total_invoiced,
       SUM(paid_amount) AS total_paid,
       SUM(total_amount - paid_amount) AS outstanding
FROM public.sales_invoices
WHERE invoice_status <> 'Cancelled'
GROUP BY company_id;

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY — tenant isolation via membership
-- ---------------------------------------------------------------------------
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_company_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_holders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labour_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planner_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cis_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cis_return_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper: company IDs the current user may access
CREATE OR REPLACE FUNCTION public.user_company_ids()
RETURNS SETOF INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM public.user_company_memberships WHERE user_id = auth.uid();
$$;

-- Profiles: user sees self; service role bypasses via bypass RLS in dashboard
CREATE POLICY profiles_select_own ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Memberships
CREATE POLICY memberships_select_own ON public.user_company_memberships FOR SELECT USING (user_id = auth.uid());

-- Preferences
CREATE POLICY user_preferences_all_own ON public.user_preferences FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Companies: visible if member
CREATE POLICY companies_select_member ON public.companies FOR SELECT USING (id IN (SELECT public.user_company_ids()));

-- Tenant tables: CRUD only when row.company_id is allowed
CREATE POLICY clients_tenant ON public.clients FOR ALL
  USING (company_id IN (SELECT public.user_company_ids()))
  WITH CHECK (company_id IN (SELECT public.user_company_ids()));

CREATE POLICY policy_holders_tenant ON public.policy_holders FOR ALL
  USING (company_id IN (SELECT public.user_company_ids()))
  WITH CHECK (company_id IN (SELECT public.user_company_ids()));

CREATE POLICY contracts_tenant ON public.contracts FOR ALL
  USING (company_id IN (SELECT public.user_company_ids()))
  WITH CHECK (company_id IN (SELECT public.user_company_ids()));

CREATE POLICY employees_tenant ON public.employees FOR ALL
  USING (company_id IN (SELECT public.user_company_ids()))
  WITH CHECK (company_id IN (SELECT public.user_company_ids()));

CREATE POLICY jobs_tenant ON public.jobs FOR ALL
  USING (company_id IN (SELECT public.user_company_ids()))
  WITH CHECK (company_id IN (SELECT public.user_company_ids()));

CREATE POLICY visits_tenant ON public.visits FOR ALL
  USING (company_id IN (SELECT public.user_company_ids()))
  WITH CHECK (company_id IN (SELECT public.user_company_ids()));

CREATE POLICY labour_tenant ON public.labour_entries FOR ALL
  USING (company_id IN (SELECT public.user_company_ids()))
  WITH CHECK (company_id IN (SELECT public.user_company_ids()));

CREATE POLICY sales_invoices_tenant ON public.sales_invoices FOR ALL
  USING (company_id IN (SELECT public.user_company_ids()))
  WITH CHECK (company_id IN (SELECT public.user_company_ids()));

CREATE POLICY receipts_tenant ON public.receipts FOR ALL
  USING (company_id IN (SELECT public.user_company_ids()))
  WITH CHECK (company_id IN (SELECT public.user_company_ids()));

CREATE POLICY suppliers_tenant ON public.suppliers FOR ALL
  USING (company_id IN (SELECT public.user_company_ids()))
  WITH CHECK (company_id IN (SELECT public.user_company_ids()));

CREATE POLICY purchase_invoices_tenant ON public.purchase_invoices FOR ALL
  USING (company_id IN (SELECT public.user_company_ids()))
  WITH CHECK (company_id IN (SELECT public.user_company_ids()));

CREATE POLICY payment_certificates_tenant ON public.payment_certificates FOR ALL
  USING (company_id IN (SELECT public.user_company_ids()))
  WITH CHECK (company_id IN (SELECT public.user_company_ids()));

CREATE POLICY timesheets_tenant ON public.timesheets FOR ALL
  USING (company_id IN (SELECT public.user_company_ids()))
  WITH CHECK (company_id IN (SELECT public.user_company_ids()));

CREATE POLICY planner_events_tenant ON public.planner_events FOR ALL
  USING (company_id IN (SELECT public.user_company_ids()))
  WITH CHECK (company_id IN (SELECT public.user_company_ids()));

CREATE POLICY cis_returns_tenant ON public.cis_returns FOR ALL
  USING (company_id IN (SELECT public.user_company_ids()))
  WITH CHECK (company_id IN (SELECT public.user_company_ids()));

CREATE POLICY cis_return_lines_tenant ON public.cis_return_lines FOR ALL
  USING (company_id IN (SELECT public.user_company_ids()))
  WITH CHECK (company_id IN (SELECT public.user_company_ids()));

CREATE POLICY audit_logs_tenant ON public.audit_logs FOR ALL
  USING (company_id IS NULL OR company_id IN (SELECT public.user_company_ids()))
  WITH CHECK (company_id IS NULL OR company_id IN (SELECT public.user_company_ids()));

-- ---------------------------------------------------------------------------
-- OPTIONAL SEED: two Phillips companies (adjust IDs if you already have data)
-- ---------------------------------------------------------------------------
-- INSERT INTO public.companies (name, short_name, company_type, address, phone, website, company_reg_no, vat_reg_no, bank_name, xero_tenant_id, theme_config)
-- VALUES
-- ('Phillips Construction Ltd', 'Phillips Construction', 'construction', 'The Cottage, Worthy Lane, Taunton, TA3 5EF', '01823 213314', 'https://www.pphillipsconstruction.co.uk', '06142552', '840762233', 'LLOYDS TSB BANK PLC', 'dda816eb-0b20-409d-a31a-c44e56f13f76', '{"primary":"#3B82F6","secondary":"#1E40AF","accent":"#60A5FA","glow":"rgba(59, 130, 246, 0.5)"}'::jsonb),
-- ('Phillips Barnes Environmental Ltd', 'Phillips Barnes Environmental', 'environmental', 'The Cottage, Worthy Lane, Taunton, TA3 5EF', '01823 213314', 'https://www.pphillipsconstruction.co.uk', '14433186', '427610703', 'ANNA', 'd52d3570-9e7c-4f21-8b54-4cc8f5e05724', '{"primary":"#14B8A6","secondary":"#0F766E","accent":"#2DD4BF","glow":"rgba(20, 184, 166, 0.5)"}'::jsonb);

-- ============================================================================
-- ENTITY RELATIONSHIP SUMMARY
-- ============================================================================
--
--  AUTH & ACCESS
--    auth.users (Supabase-managed)
--         │
--         ├─1:1─► profiles (id = auth.users.id)
--         │
--         ├─M:N─► companies  via  user_company_memberships (role per company)
--         │
--         └─1:1─► user_preferences (last_company_id, settings JSON — use instead of localStorage)
--
--  TENANT ROOT
--    companies
--         │
--         ├──► clients ──┐
--         ├──► policy_holders
--         ├──► contracts (manager_id → profiles)
--         ├──► employees (workforce; visits.labour use this, not auth)
--         ├──► suppliers
--         ├──► jobs ◄────┘ (client_id, optional policy_holder_id, contract_id, manager_id → profiles)
--         │       │
--         │       ├──► visits (employee_id → employees)
--         │       ├──► labour_entries (employee_id → employees, visit_id optional)
--         │       ├──► sales_invoices → receipts
--         │       ├──► purchase_invoices (supplier_id → suppliers)
--         │       ├──► timesheets (employee_id → employees, approved_by → profiles)
--         │       └──► planner_events (job_id optional, assigned_to → profiles)
--         │
--         ├──► payment_certificates (subcontractor_id → suppliers)
--         ├──► cis_returns → cis_return_lines (subcontractor_id → suppliers)
--         └──► audit_logs (user_id → profiles)
--
--  VIEWS: v_jobs_summary, v_financial_summary (read through RLS on base tables)
--
-- ============================================================================
