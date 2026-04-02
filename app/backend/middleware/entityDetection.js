/**
 * Entity Detection Middleware
 * Detects active company from request headers and sets context for data isolation
 */

const { COMPANIES } = require('../models/Company');

/**
 * Middleware to detect and validate company from request headers
 * Expected header: X-Company-ID (1 for Construction, 2 for Environmental)
 */
const entityDetectionMiddleware = (req, res, next) => {
  // Get company ID from header (preferred) or query parameter
  const companyId = req.headers['x-company-id'] || req.query.companyId;
  
  // Validate company ID
  if (!companyId) {
    // Default to Construction (ID: 1) if not specified
    req.companyId = 1;
    req.company = COMPANIES.construction;
    console.log(`[EntityDetection] No company specified, defaulting to Construction (ID: 1)`);
    return next();
  }
  
  const parsedCompanyId = parseInt(companyId, 10);
  
  // Validate company exists
  if (parsedCompanyId !== 1 && parsedCompanyId !== 2) {
    return res.status(400).json({
      success: false,
      error: 'Invalid company ID. Must be 1 (Construction) or 2 (Environmental)',
    });
  }
  
  // Set company context on request
  req.companyId = parsedCompanyId;
  req.company = parsedCompanyId === 1 
    ? COMPANIES.construction 
    : COMPANIES.environmental;
  
  console.log(`[EntityDetection] Company detected: ${req.company.name} (ID: ${parsedCompanyId})`);
  
  next();
};

/**
 * Middleware to require specific company type
 * @param {string} requiredType - 'construction' or 'environmental'
 */
const requireCompanyType = (requiredType) => {
  return (req, res, next) => {
    if (!req.company) {
      return res.status(400).json({
        success: false,
        error: 'Company context not set',
      });
    }
    
    if (req.company.type !== requiredType) {
      return res.status(403).json({
        success: false,
        error: `This endpoint requires ${requiredType} company context`,
      });
    }
    
    next();
  };
};

/**
 * Middleware to validate company access for user
 * Ensures user has access to the requested company
 */
const validateCompanyAccess = (req, res, next) => {
  // If user is admin, allow access to any company
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  
  // If user is assigned to a specific company, validate access
  if (req.user && req.user.companyId) {
    if (req.user.companyId !== req.companyId) {
      // Check if resource is shared (suppliers, employees)
      // For now, block access
      return res.status(403).json({
        success: false,
        error: 'You do not have access to this company\'s data',
      });
    }
  }
  
  next();
};

module.exports = {
  entityDetectionMiddleware,
  requireCompanyType,
  validateCompanyAccess,
};
