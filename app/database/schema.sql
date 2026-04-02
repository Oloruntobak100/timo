-- ============================================================================
-- PHILLIPS DATA STREAM - DATABASE SCHEMA
-- PostgreSQL Schema with Shared Schema + Entity Partitioning Approach
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================================
-- COMPANIES TABLE (Multi-tenancy root)
-- ============================================================================

CREATE TABLE companies (
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
    
    -- Theme configuration (stored as JSONB for flexibility)
    theme_config JSONB DEFAULT '{
        "primary": "#3B82F6",
        "secondary": "#1E40AF", 
        "accent": "#60A5FA",
        "glow": "rgba(59, 130, 246, 0.5)
    }'::jsonb,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert the two Phillips entities
INSERT INTO companies (id, name, short_name, company_type, address, phone, website, company_reg_no, vat_reg_no, bank_name, xero_tenant_id, theme_config) VALUES
(1, 'Phillips Construction Ltd', 'Phillips Construction', 'construction', 'The Cottage, Worthy Lane, Taunton, TA3 5EF', '01823 213314', 'https://www.pphillipsconstruction.co.uk', '06142552', '840762233', 'LLOYDS TSB BANK PLC', 'dda816eb-0b20-409d-a31a-c44e56f13f76', '{"primary": "#3B82F6", "secondary": "#1E40AF", "accent": "#60A5FA", "glow": "rgba(59, 130, 246, 0.5)"}'),
(2, 'Phillips Barnes Environmental Ltd', 'Phillips Barnes Environmental', 'environmental', 'The Cottage, Worthy Lane, Taunton, TA3 5EF', '01823 213314', 'https://www.pphillipsconstruction.co.uk', '14433186', '427610703', 'ANNA', 'd52d3570-9e7c-4f21-8b54-4cc8f5e05724', '{"primary": "#14B8A6", "secondary": "#0F766E", "accent": "#2DD4BF", "glow": "rgba(20, 184, 166, 0.5)"}');

-- Trigger for updated_at
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- USERS TABLE
-- ============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    
    -- Role-based access
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'user', 'employee')),
    
    -- Company association (users belong to one company)
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Profile
    avatar_url VARCHAR(500),
    phone VARCHAR(50),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Index for company-based queries
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_email ON users(email);

-- ============================================================================
-- CLIENTS TABLE (Company-specific)
-- ============================================================================

CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL,
    reference VARCHAR(100),
    
    -- Tax code (VAT)
    tax_code VARCHAR(100) DEFAULT '20% (VAT on Income)',
    
    -- Colour coding for reports
    colour VARCHAR(7) DEFAULT '#3B82F6',
    
    -- Address
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    county VARCHAR(100),
    postcode VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'United Kingdom',
    
    -- Contact
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    
    -- Company association (data isolation)
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for updated_at
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_clients_company_id ON clients(company_id);
CREATE INDEX idx_clients_company_name ON clients(company_name);

-- ============================================================================
-- POLICY HOLDERS TABLE (Company-specific)
-- ============================================================================

CREATE TABLE policy_holders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    
    -- Address
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    county VARCHAR(100),
    postcode VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'United Kingdom',
    
    -- Contact
    phone VARCHAR(50),
    email VARCHAR(255),
    
    -- Company association
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for updated_at
CREATE TRIGGER update_policy_holders_updated_at
    BEFORE UPDATE ON policy_holders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_policy_holders_company_id ON policy_holders(company_id);

-- ============================================================================
-- CONTRACTS TABLE (Company-specific)
-- ============================================================================

CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    contract_type VARCHAR(50) NOT NULL CHECK (contract_type IN ('Commercial', 'Residential')),
    
    -- Classification
    analysis_category VARCHAR(50),
    
    -- Manager assignment
    manager_id UUID REFERENCES users(id),
    
    -- Company association
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for updated_at
CREATE TRIGGER update_contracts_updated_at
    BEFORE UPDATE ON contracts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_contracts_company_id ON contracts(company_id);

-- ============================================================================
-- JOBS TABLE (Company-specific - Core Entity)
-- ============================================================================

CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- Job classification
    job_type VARCHAR(50) NOT NULL CHECK (job_type IN ('Network Claims', 'Project Tender', 'Intercompany')),
    job_status VARCHAR(50) NOT NULL DEFAULT 'Awaiting Action' CHECK (job_status IN ('Awaiting Action', 'Awaiting Authorisation', 'Awaiting Survey', 'In Progress', 'On Hold', 'Complete', 'Invoiced', 'Paid', 'Cancelled')),
    analysis_category VARCHAR(50),
    
    -- Descriptions
    description TEXT NOT NULL,
    instructions TEXT,
    
    -- Relations
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    policy_holder_id UUID REFERENCES policy_holders(id) ON DELETE SET NULL,
    contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL,
    manager_id UUID REFERENCES users(id),
    
    -- Financial tracking
    job_value DECIMAL(12, 2) DEFAULT 0,
    invoiced_amount DECIMAL(12, 2) DEFAULT 0,
    dying_value DECIMAL(12, 2) DEFAULT 0,
    total_scope_value DECIMAL(12, 2) DEFAULT 0,
    final_account_value DECIMAL(12, 2) DEFAULT 0,
    client_fee_percentage DECIMAL(5, 2),
    
    -- Cost breakdown
    cost_labour DECIMAL(12, 2) DEFAULT 0,
    cost_materials DECIMAL(12, 2) DEFAULT 0,
    cost_subcontract DECIMAL(12, 2) DEFAULT 0,
    cost_plant DECIMAL(12, 2) DEFAULT 0,
    cost_waste DECIMAL(12, 2) DEFAULT 0,
    cost_other DECIMAL(12, 2) DEFAULT 0,
    
    -- Dates
    inception_date DATE NOT NULL,
    start_date DATE,
    planned_completion_date DATE,
    actual_completion_date DATE,
    wip_date DATE,
    
    -- CVR (Cost Value Reconciliation)
    cvr_gross_margin DECIMAL(5, 2) DEFAULT 40,
    cvr_budgeted_cost DECIMAL(12, 2),
    cvr_actual_cost DECIMAL(12, 2),
    
    -- Notifications
    hide_from_notifications BOOLEAN DEFAULT false,
    
    -- Company association (CRITICAL for data isolation)
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for updated_at
CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_status ON jobs(job_status);
CREATE INDEX idx_jobs_client_id ON jobs(client_id);
CREATE INDEX idx_jobs_manager_id ON jobs(manager_id);
CREATE INDEX idx_jobs_created_at ON jobs(created_at);

-- Auto-generate job number based on type
CREATE OR REPLACE FUNCTION generate_job_number()
RETURNS TRIGGER AS $$
DECLARE
    prefix VARCHAR(2);
    next_number INTEGER;
    new_number VARCHAR(50);
BEGIN
    -- Determine prefix based on job type
    prefix := CASE NEW.job_type
        WHEN 'Network Claims' THEN 'N-'
        WHEN 'Project Tender' THEN 'P-'
        WHEN 'Intercompany' THEN 'I-'
        ELSE 'J-'
    END;
    
    -- Get next number for this prefix and company
    SELECT COALESCE(MAX(CAST(SUBSTRING(job_number FROM 3) AS INTEGER)), 0) + 1
    INTO next_number
    FROM jobs
    WHERE job_number LIKE prefix || '%'
    AND company_id = NEW.company_id;
    
    -- Format new number with leading zeros
    new_number := prefix || LPAD(next_number::TEXT, 6, '0');
    
    NEW.job_number := new_number;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_job_number
    BEFORE INSERT ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION generate_job_number();

-- ============================================================================
-- VISITS TABLE (Mobile Workforce)
-- ============================================================================

CREATE TABLE visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference VARCHAR(100),
    
    -- Relations
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES users(id),
    
    -- Status workflow
    visit_status VARCHAR(50) NOT NULL DEFAULT 'Not Sent' CHECK (visit_status IN ('Not Sent', 'Allocated', 'Accepted', 'Declined', 'Travelling', 'On Site', 'Work Break', 'On Hold', 'Complete', 'Cancelled')),
    
    -- Planned times
    planned_start TIMESTAMP WITH TIME ZONE NOT NULL,
    planned_end TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Actual times
    actual_start TIMESTAMP WITH TIME ZONE,
    actual_end TIMESTAMP WITH TIME ZONE,
    
    -- Instructions
    instructions TEXT,
    notes TEXT,
    
    -- Location (for mobile tracking)
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Company association (inherited from job, but stored for queries)
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for updated_at
CREATE TRIGGER update_visits_updated_at
    BEFORE UPDATE ON visits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_visits_company_id ON visits(company_id);
CREATE INDEX idx_visits_job_id ON visits(job_id);
CREATE INDEX idx_visits_employee_id ON visits(employee_id);
CREATE INDEX idx_visits_status ON visits(visit_status);
CREATE INDEX idx_visits_planned_start ON visits(planned_start);

-- ============================================================================
-- EMPLOYEES TABLE (Shared resource with company visibility)
-- ============================================================================

CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    
    -- Type
    employee_type VARCHAR(50) NOT NULL DEFAULT 'Hourly' CHECK (employee_type IN ('Hourly', 'Salaried')),
    
    -- Pay rates (stored as JSONB for flexibility)
    pay_rates JSONB DEFAULT '[{"type": "Basic", "rate": 0}]'::jsonb,
    travel_allowance DECIMAL(8, 2) DEFAULT 0,
    
    -- Company association (employees can be shared)
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    is_shared BOOLEAN DEFAULT false, -- If true, visible to both companies
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for updated_at
CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON employees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_employees_company_id ON employees(company_id);
CREATE INDEX idx_employees_is_shared ON employees(is_shared);

-- ============================================================================
-- LABOUR ENTRIES TABLE
-- ============================================================================

CREATE TABLE labour_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relations
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    visit_id UUID REFERENCES visits(id) ON DELETE SET NULL,
    
    -- Hours
    regular_hours DECIMAL(5, 2) DEFAULT 0,
    overtime_hours DECIMAL(5, 2) DEFAULT 0,
    holiday_hours DECIMAL(5, 2) DEFAULT 0,
    total_hours DECIMAL(5, 2) GENERATED ALWAYS AS (regular_hours + overtime_hours + holiday_hours) STORED,
    
    -- Cost
    hourly_rate DECIMAL(8, 2) NOT NULL,
    total_cost DECIMAL(10, 2) GENERATED ALWAYS AS (total_hours * hourly_rate) STORED,
    
    -- Date
    entry_date DATE NOT NULL,
    
    -- Company association
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for updated_at
CREATE TRIGGER update_labour_entries_updated_at
    BEFORE UPDATE ON labour_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_labour_company_id ON labour_entries(company_id);
CREATE INDEX idx_labour_employee_id ON labour_entries(employee_id);
CREATE INDEX idx_labour_job_id ON labour_entries(job_id);
CREATE INDEX idx_labour_entry_date ON labour_entries(entry_date);

-- ============================================================================
-- SALES INVOICES TABLE (Company-specific)
-- ============================================================================

CREATE TABLE sales_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- Relations
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    
    -- Amounts
    net_amount DECIMAL(12, 2) NOT NULL,
    vat_rate DECIMAL(5, 2) DEFAULT 20.00,
    vat_amount DECIMAL(12, 2) GENERATED ALWAYS AS (net_amount * (vat_rate / 100)) STORED,
    total_amount DECIMAL(12, 2) GENERATED ALWAYS AS (net_amount + (net_amount * (vat_rate / 100))) STORED,
    paid_amount DECIMAL(12, 2) DEFAULT 0,
    
    -- Status
    invoice_status VARCHAR(50) NOT NULL DEFAULT 'Draft' CHECK (invoice_status IN ('Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled')),
    
    -- Dates
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    
    -- Company association
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for updated_at
CREATE TRIGGER update_sales_invoices_updated_at
    BEFORE UPDATE ON sales_invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_sales_invoices_company_id ON sales_invoices(company_id);
CREATE INDEX idx_sales_invoices_client_id ON sales_invoices(client_id);
CREATE INDEX idx_sales_invoices_status ON sales_invoices(invoice_status);
CREATE INDEX idx_sales_invoices_invoice_date ON sales_invoices(invoice_date);

-- Auto-generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
    next_number INTEGER;
    new_number VARCHAR(50);
BEGIN
    -- Get next number for this company
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 5) AS INTEGER)), 0) + 1
    INTO next_number
    FROM sales_invoices
    WHERE invoice_number LIKE 'INV-%'
    AND company_id = NEW.company_id;
    
    -- Format new number with leading zeros
    new_number := 'INV-' || LPAD(next_number::TEXT, 4, '0');
    
    NEW.invoice_number := new_number;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_invoice_number
    BEFORE INSERT ON sales_invoices
    FOR EACH ROW
    EXECUTE FUNCTION generate_invoice_number();

-- ============================================================================
-- RECEIPTS TABLE (Payments received)
-- ============================================================================

CREATE TABLE receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relations
    invoice_id UUID NOT NULL REFERENCES sales_invoices(id) ON DELETE CASCADE,
    
    -- Amount
    amount DECIMAL(12, 2) NOT NULL,
    
    -- Payment details
    payment_date DATE NOT NULL,
    payment_method VARCHAR(50),
    reference VARCHAR(255),
    notes TEXT,
    
    -- Company association
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_receipts_company_id ON receipts(company_id);
CREATE INDEX idx_receipts_invoice_id ON receipts(invoice_id);

-- ============================================================================
-- SUPPLIERS TABLE (Shared resource)
-- ============================================================================

CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    supplier_type VARCHAR(50) NOT NULL DEFAULT 'Supplier' CHECK (supplier_type IN ('Supplier', 'Subcontractor')),
    
    -- Address
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    county VARCHAR(100),
    postcode VARCHAR(20),
    country VARCHAR(100) DEFAULT 'United Kingdom',
    
    -- Contact
    phone VARCHAR(50),
    email VARCHAR(255),
    
    -- CIS (for subcontractors)
    cis_status VARCHAR(50) CHECK (cis_status IN ('Verified', 'Unverified', 'No Verification', 'Gross')),
    cis_verification_number VARCHAR(100),
    cis_verification_date DATE,
    utr VARCHAR(50), -- Unique Taxpayer Reference
    
    -- Company association (suppliers can be shared)
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    is_shared BOOLEAN DEFAULT true, -- Most suppliers are shared
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_archived BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for updated_at
CREATE TRIGGER update_suppliers_updated_at
    BEFORE UPDATE ON suppliers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_suppliers_company_id ON suppliers(company_id);
CREATE INDEX idx_suppliers_is_shared ON suppliers(is_shared);
CREATE INDEX idx_suppliers_type ON suppliers(supplier_type);
CREATE INDEX idx_suppliers_cis_status ON suppliers(cis_status);

-- ============================================================================
-- PURCHASE INVOICES TABLE (Shared resource)
-- ============================================================================

CREATE TABLE purchase_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(100),
    
    -- Relations
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    
    -- Amounts
    net_amount DECIMAL(12, 2) NOT NULL,
    vat_amount DECIMAL(12, 2) DEFAULT 0,
    total_amount DECIMAL(12, 2) GENERATED ALWAYS AS (net_amount + vat_amount) STORED,
    paid_amount DECIMAL(12, 2) DEFAULT 0,
    
    -- Status
    invoice_status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (invoice_status IN ('Pending', 'Approved', 'Paid')),
    
    -- Dates
    invoice_date DATE NOT NULL,
    due_date DATE,
    
    -- Company association
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for updated_at
CREATE TRIGGER update_purchase_invoices_updated_at
    BEFORE UPDATE ON purchase_invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_purchase_invoices_company_id ON purchase_invoices(company_id);
CREATE INDEX idx_purchase_invoices_supplier_id ON purchase_invoices(supplier_id);
CREATE INDEX idx_purchase_invoices_status ON purchase_invoices(invoice_status);

-- ============================================================================
-- PAYMENT CERTIFICATES TABLE (CIS for subcontractors)
-- ============================================================================

CREATE TABLE payment_certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    certificate_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- Relations
    subcontractor_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    
    -- Amounts
    gross_amount DECIMAL(12, 2) NOT NULL,
    cis_rate DECIMAL(5, 2) NOT NULL DEFAULT 20.00,
    cis_deduction DECIMAL(12, 2) GENERATED ALWAYS AS (gross_amount * (cis_rate / 100)) STORED,
    net_amount DECIMAL(12, 2) GENERATED ALWAYS AS (gross_amount - (gross_amount * (cis_rate / 100))) STORED,
    
    -- Period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    payment_date DATE,
    
    -- Company association
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for updated_at
CREATE TRIGGER update_payment_certificates_updated_at
    BEFORE UPDATE ON payment_certificates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_payment_certificates_company_id ON payment_certificates(company_id);
CREATE INDEX idx_payment_certificates_subcontractor_id ON payment_certificates(subcontractor_id);

-- Auto-generate certificate number
CREATE OR REPLACE FUNCTION generate_certificate_number()
RETURNS TRIGGER AS $$
DECLARE
    next_number INTEGER;
    new_number VARCHAR(50);
BEGIN
    -- Get next number for this company
    SELECT COALESCE(MAX(CAST(SUBSTRING(certificate_number FROM 5) AS INTEGER)), 0) + 1
    INTO next_number
    FROM payment_certificates
    WHERE certificate_number LIKE 'CERT-%'
    AND company_id = NEW.company_id;
    
    -- Format new number with leading zeros
    new_number := 'CERT-' || LPAD(next_number::TEXT, 4, '0');
    
    NEW.certificate_number := new_number;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_certificate_number
    BEFORE INSERT ON payment_certificates
    FOR EACH ROW
    EXECUTE FUNCTION generate_certificate_number();

-- ============================================================================
-- AUDIT LOG TABLE (For compliance)
-- ============================================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Action details
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    
    -- Data
    old_data JSONB,
    new_data JSONB,
    
    -- Metadata
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_audit_logs_company_id ON audit_logs(company_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- ============================================================================
-- VIEWS FOR DASHBOARD METRICS
-- ============================================================================

-- Jobs summary by company
CREATE VIEW v_jobs_summary AS
SELECT 
    company_id,
    job_status,
    COUNT(*) as count,
    SUM(job_value) as total_value,
    SUM(invoiced_amount) as total_invoiced
FROM jobs
GROUP BY company_id, job_status;

-- Financial summary by company
CREATE VIEW v_financial_summary AS
SELECT 
    company_id,
    SUM(net_amount) as total_invoiced,
    SUM(paid_amount) as total_paid,
    SUM(total_amount - paid_amount) as outstanding
FROM sales_invoices
WHERE invoice_status != 'Cancelled'
GROUP BY company_id;

-- Monthly revenue by company
CREATE VIEW v_monthly_revenue AS
SELECT 
    company_id,
    DATE_TRUNC('month', invoice_date) as month,
    SUM(net_amount) as revenue
FROM sales_invoices
WHERE invoice_status != 'Cancelled'
GROUP BY company_id, DATE_TRUNC('month', invoice_date)
ORDER BY company_id, month DESC;

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on tables
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_holders ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE labour_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_certificates ENABLE ROW LEVEL SECURITY;

-- Create policy function
CREATE OR REPLACE FUNCTION get_current_company_id()
RETURNS INTEGER AS $$
BEGIN
    -- This will be set by the application via SET command
    RETURN NULLIF(current_setting('app.current_company_id', true), '')::INTEGER;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Jobs policy
CREATE POLICY jobs_company_isolation ON jobs
    FOR ALL
    USING (company_id = get_current_company_id());

-- Clients policy
CREATE POLICY clients_company_isolation ON clients
    FOR ALL
    USING (company_id = get_current_company_id());

-- Policy holders policy
CREATE POLICY policy_holders_company_isolation ON policy_holders
    FOR ALL
    USING (company_id = get_current_company_id());

-- Contracts policy
CREATE POLICY contracts_company_isolation ON contracts
    FOR ALL
    USING (company_id = get_current_company_id());

-- Sales invoices policy
CREATE POLICY sales_invoices_company_isolation ON sales_invoices
    FOR ALL
    USING (company_id = get_current_company_id());

-- Visits policy
CREATE POLICY visits_company_isolation ON visits
    FOR ALL
    USING (company_id = get_current_company_id());

-- Labour entries policy
CREATE POLICY labour_entries_company_isolation ON labour_entries
    FOR ALL
    USING (company_id = get_current_company_id());

-- Purchase invoices policy (includes shared suppliers)
CREATE POLICY purchase_invoices_company_isolation ON purchase_invoices
    FOR ALL
    USING (company_id = get_current_company_id());

-- Payment certificates policy
CREATE POLICY payment_certificates_company_isolation ON payment_certificates
    FOR ALL
    USING (company_id = get_current_company_id());

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE companies IS 'Multi-tenancy root table. Contains Phillips Construction and Phillips Barnes Environmental.';
COMMENT ON TABLE jobs IS 'Core job entity. Data is isolated by company_id using RLS policies.';
COMMENT ON COLUMN jobs.company_id IS 'CRITICAL: This column determines data visibility through Row Level Security';
COMMENT ON FUNCTION get_current_company_id() IS 'Returns the current company ID set by the application. Used for RLS policies.';
