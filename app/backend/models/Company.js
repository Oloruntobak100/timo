/**
 * Company Model
 * Defines the two Phillips entities with their configurations
 */

// Company theme configurations
const CONSTRUCTION_THEME = {
  primary: '#3B82F6',
  secondary: '#1E40AF',
  accent: '#60A5FA',
  glow: 'rgba(59, 130, 246, 0.5)',
  gradient: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 50%, #06B6D4 100%)',
};

const ENVIRONMENTAL_THEME = {
  primary: '#14B8A6',
  secondary: '#0F766E',
  accent: '#2DD4BF',
  glow: 'rgba(20, 184, 166, 0.5)',
  gradient: 'linear-gradient(135deg, #134E4A 0%, #14B8A6 50%, #10B981 100%)',
};

// Company definitions
const COMPANIES = {
  construction: {
    id: 1,
    name: 'Phillips Construction Ltd',
    shortName: 'Phillips Construction',
    type: 'construction',
    logo: '/images/logo-construction.svg',
    address: 'The Cottage, Worthy Lane, Taunton, TA3 5EF',
    phone: '01823 213314',
    website: 'https://www.pphillipsconstruction.co.uk',
    companyRegNo: '06142552',
    vatRegNo: '840762233',
    bank: 'LLOYDS TSB BANK PLC',
    xeroTenantId: 'dda816eb-0b20-409d-a31a-c44e56f13f76',
    theme: CONSTRUCTION_THEME,
    isActive: true,
  },
  environmental: {
    id: 2,
    name: 'Phillips Barnes Environmental Ltd',
    shortName: 'Phillips Barnes Environmental',
    type: 'environmental',
    logo: '/images/logo-environmental.svg',
    address: 'The Cottage, Worthy Lane, Taunton, TA3 5EF',
    phone: '01823 213314',
    website: 'https://www.pphillipsconstruction.co.uk',
    companyRegNo: '14433186',
    vatRegNo: '427610703',
    bank: 'ANNA',
    xeroTenantId: 'd52d3570-9e7c-4f21-8b54-4cc8f5e05724',
    theme: ENVIRONMENTAL_THEME,
    isActive: true,
  },
};

/**
 * Get company by ID
 * @param {number} id - Company ID (1 or 2)
 */
const getCompanyById = (id) => {
  return id === 1 ? COMPANIES.construction : 
         id === 2 ? COMPANIES.environmental : 
         null;
};

/**
 * Get company by type
 * @param {string} type - 'construction' or 'environmental'
 */
const getCompanyByType = (type) => {
  return COMPANIES[type] || null;
};

/**
 * Get all companies
 */
const getAllCompanies = () => {
  return Object.values(COMPANIES);
};

/**
 * Get company theme by ID
 * @param {number} id - Company ID
 */
const getCompanyTheme = (id) => {
  const company = getCompanyById(id);
  return company ? company.theme : null;
};

module.exports = {
  COMPANIES,
  CONSTRUCTION_THEME,
  ENVIRONMENTAL_THEME,
  getCompanyById,
  getCompanyByType,
  getAllCompanies,
  getCompanyTheme,
};
