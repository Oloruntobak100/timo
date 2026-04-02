/**
 * Company Routes
 * API endpoints for company management and switching
 */

const express = require('express');
const router = express.Router();
const { COMPANIES, getAllCompanies, getCompanyById } = require('../models/Company');

/**
 * GET /api/companies
 * Get all companies
 */
router.get('/', (req, res) => {
  try {
    const companies = getAllCompanies().map(company => ({
      id: company.id,
      name: company.name,
      shortName: company.shortName,
      type: company.type,
      logo: company.logo,
      theme: company.theme,
      isActive: company.isActive,
    }));
    
    res.json({
      success: true,
      data: companies,
    });
  } catch (error) {
    console.error('[Companies] Error fetching companies:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch companies',
    });
  }
});

/**
 * GET /api/companies/current
 * Get current company based on request context
 */
router.get('/current', (req, res) => {
  try {
    const company = req.company;
    
    if (!company) {
      return res.status(400).json({
        success: false,
        error: 'No company context found',
      });
    }
    
    res.json({
      success: true,
      data: {
        id: company.id,
        name: company.name,
        shortName: company.shortName,
        type: company.type,
        logo: company.logo,
        address: company.address,
        phone: company.phone,
        website: company.website,
        companyRegNo: company.companyRegNo,
        vatRegNo: company.vatRegNo,
        bank: company.bank,
        xeroTenantId: company.xeroTenantId,
        theme: company.theme,
      },
    });
  } catch (error) {
    console.error('[Companies] Error fetching current company:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch current company',
    });
  }
});

/**
 * GET /api/companies/:id
 * Get company by ID
 */
router.get('/:id', (req, res) => {
  try {
    const companyId = parseInt(req.params.id, 10);
    const company = getCompanyById(companyId);
    
    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Company not found',
      });
    }
    
    res.json({
      success: true,
      data: {
        id: company.id,
        name: company.name,
        shortName: company.shortName,
        type: company.type,
        logo: company.logo,
        theme: company.theme,
        isActive: company.isActive,
      },
    });
  } catch (error) {
    console.error('[Companies] Error fetching company:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch company',
    });
  }
});

/**
 * POST /api/companies/switch
 * Switch active company (for session management)
 */
router.post('/switch', (req, res) => {
  try {
    const { companyId } = req.body;
    
    if (!companyId || (companyId !== 1 && companyId !== 2)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid company ID. Must be 1 (Construction) or 2 (Environmental)',
      });
    }
    
    const company = getCompanyById(companyId);
    
    // In a real implementation, you would update the user's session
    // For now, we just return the new company context
    res.json({
      success: true,
      message: `Switched to ${company.name}`,
      data: {
        id: company.id,
        name: company.name,
        shortName: company.shortName,
        type: company.type,
        theme: company.theme,
      },
    });
  } catch (error) {
    console.error('[Companies] Error switching company:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to switch company',
    });
  }
});

module.exports = router;
