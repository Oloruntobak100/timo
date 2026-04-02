/**
 * Client Routes
 * API endpoints for client management
 */

const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

/**
 * GET /api/clients
 * Get all clients for current company
 */
router.get('/', async (req, res) => {
  try {
    const companyId = req.companyId;
    const { search, limit = 50, offset = 0 } = req.query;
    
    let query_text = `
      SELECT 
        c.*,
        COUNT(j.id) as total_jobs,
        COALESCE(SUM(j.job_value), 0) as total_value
      FROM clients c
      LEFT JOIN jobs j ON c.id = j.client_id
      WHERE c.company_id = $1
    `;
    
    const params = [companyId];
    
    if (search) {
      query_text += ` AND (
        c.company_name ILIKE $${params.length + 1} OR
        c.email ILIKE $${params.length + 1} OR
        c.postcode ILIKE $${params.length + 1}
      )`;
      params.push(`%${search}%`);
    }
    
    query_text += `
      GROUP BY c.id
      ORDER BY c.company_name ASC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    params.push(limit, offset);
    
    const result = await query(query_text, params, companyId);
    
    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('[Clients] Error fetching clients:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch clients',
    });
  }
});

/**
 * GET /api/clients/:id
 * Get client by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const companyId = req.companyId;
    const clientId = req.params.id;
    
    const query_text = `
      SELECT c.*
      FROM clients c
      WHERE c.id = $1 AND c.company_id = $2
    `;
    
    const result = await query(query_text, [clientId, companyId], companyId);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Client not found',
      });
    }
    
    // Get client's jobs
    const jobsQuery = `
      SELECT 
        j.id, j.job_number, j.job_status, j.job_value, j.inception_date
      FROM jobs j
      WHERE j.client_id = $1 AND j.company_id = $2
      ORDER BY j.created_at DESC
      LIMIT 10
    `;
    
    const jobsResult = await query(jobsQuery, [clientId, companyId], companyId);
    
    const client = {
      ...result.rows[0],
      recentJobs: jobsResult.rows,
    };
    
    res.json({
      success: true,
      data: client,
    });
  } catch (error) {
    console.error('[Clients] Error fetching client:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch client',
    });
  }
});

/**
 * POST /api/clients
 * Create a new client
 */
router.post('/', async (req, res) => {
  try {
    const companyId = req.companyId;
    const {
      companyName,
      reference,
      taxCode,
      colour,
      addressLine1,
      addressLine2,
      city,
      county,
      postcode,
      phone,
      email,
      website,
    } = req.body;
    
    // Validation
    if (!companyName || !addressLine1 || !city || !postcode) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: companyName, addressLine1, city, postcode',
      });
    }
    
    const query_text = `
      INSERT INTO clients (
        company_name, reference, tax_code, colour,
        address_line1, address_line2, city, county, postcode,
        phone, email, website, company_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;
    
    const params = [
      companyName,
      reference || null,
      taxCode || '20% (VAT on Income)',
      colour || '#3B82F6',
      addressLine1,
      addressLine2 || null,
      city,
      county || null,
      postcode,
      phone || null,
      email || null,
      website || null,
      companyId,
    ];
    
    const result = await query(query_text, params, companyId);
    
    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('[Clients] Error creating client:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create client',
    });
  }
});

/**
 * PUT /api/clients/:id
 * Update a client
 */
router.put('/:id', async (req, res) => {
  try {
    const companyId = req.companyId;
    const clientId = req.params.id;
    const updates = req.body;
    
    const allowedFields = [
      'company_name', 'reference', 'tax_code', 'colour',
      'address_line1', 'address_line2', 'city', 'county', 'postcode',
      'phone', 'email', 'website'
    ];
    
    const setClauses = [];
    const values = [];
    
    Object.keys(updates).forEach((key, index) => {
      if (allowedFields.includes(key)) {
        setClauses.push(`${key} = $${index + 1}`);
        values.push(updates[key]);
      }
    });
    
    if (setClauses.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update',
      });
    }
    
    values.push(clientId, companyId);
    
    const query_text = `
      UPDATE clients
      SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${values.length - 1} AND company_id = $${values.length}
      RETURNING *
    `;
    
    const result = await query(query_text, values, companyId);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Client not found',
      });
    }
    
    res.json({
      success: true,
      message: 'Client updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('[Clients] Error updating client:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update client',
    });
  }
});

/**
 * DELETE /api/clients/:id
 * Delete a client
 */
router.delete('/:id', async (req, res) => {
  try {
    const companyId = req.companyId;
    const clientId = req.params.id;
    
    // Check if client has jobs
    const checkQuery = `
      SELECT COUNT(*) as job_count
      FROM jobs
      WHERE client_id = $1 AND company_id = $2
    `;
    
    const checkResult = await query(checkQuery, [clientId, companyId], companyId);
    
    if (parseInt(checkResult.rows[0].job_count) > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete client with existing jobs',
      });
    }
    
    const deleteQuery = `
      DELETE FROM clients
      WHERE id = $1 AND company_id = $2
      RETURNING id
    `;
    
    const result = await query(deleteQuery, [clientId, companyId], companyId);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Client not found',
      });
    }
    
    res.json({
      success: true,
      message: 'Client deleted successfully',
    });
  } catch (error) {
    console.error('[Clients] Error deleting client:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete client',
    });
  }
});

module.exports = router;
