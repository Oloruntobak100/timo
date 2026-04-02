/**
 * Job Routes
 * API endpoints for job management
 */

const express = require('express');
const router = express.Router();
const { query, transaction } = require('../config/database');

/**
 * GET /api/jobs
 * Get all jobs for current company
 */
router.get('/', async (req, res) => {
  try {
    const companyId = req.companyId;
    const { status, limit = 50, offset = 0 } = req.query;
    
    let query_text = `
      SELECT 
        j.*,
        c.company_name as client_name,
        u.first_name || ' ' || u.last_name as manager_name
      FROM jobs j
      LEFT JOIN clients c ON j.client_id = c.id
      LEFT JOIN users u ON j.manager_id = u.id
      WHERE j.company_id = $1
    `;
    
    const params = [companyId];
    
    if (status) {
      query_text += ` AND j.job_status = $2`;
      params.push(status);
    }
    
    query_text += `
      ORDER BY j.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    params.push(limit, offset);
    
    const result = await query(query_text, params, companyId);
    
    res.json({
      success: true,
      data: result.rows,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: result.rowCount, // In production, use a separate count query
      },
    });
  } catch (error) {
    console.error('[Jobs] Error fetching jobs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch jobs',
    });
  }
});

/**
 * GET /api/jobs/:id
 * Get job by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const companyId = req.companyId;
    const jobId = req.params.id;
    
    const query_text = `
      SELECT 
        j.*,
        c.company_name as client_name,
        c.phone as client_phone,
        c.email as client_email,
        ph.name as policy_holder_name,
        u.first_name || ' ' || u.last_name as manager_name
      FROM jobs j
      LEFT JOIN clients c ON j.client_id = c.id
      LEFT JOIN policy_holders ph ON j.policy_holder_id = ph.id
      LEFT JOIN users u ON j.manager_id = u.id
      WHERE j.id = $1 AND j.company_id = $2
    `;
    
    const result = await query(query_text, [jobId, companyId], companyId);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Job not found',
      });
    }
    
    // Fetch visits for this job
    const visitsQuery = `
      SELECT v.*, e.name as employee_name
      FROM visits v
      LEFT JOIN employees e ON v.employee_id = e.id
      WHERE v.job_id = $1 AND v.company_id = $2
      ORDER BY v.planned_start ASC
    `;
    
    const visitsResult = await query(visitsQuery, [jobId, companyId], companyId);
    
    const job = {
      ...result.rows[0],
      visits: visitsResult.rows,
    };
    
    res.json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error('[Jobs] Error fetching job:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch job',
    });
  }
});

/**
 * POST /api/jobs
 * Create a new job
 */
router.post('/', async (req, res) => {
  try {
    const companyId = req.companyId;
    const {
      jobType,
      description,
      instructions,
      clientId,
      policyHolderId,
      contractId,
      managerId,
      jobValue,
      inceptionDate,
      plannedCompletionDate,
      analysisCategory,
    } = req.body;
    
    // Validation
    if (!jobType || !description || !clientId || !inceptionDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: jobType, description, clientId, inceptionDate',
      });
    }
    
    const query_text = `
      INSERT INTO jobs (
        job_type, job_status, description, instructions,
        client_id, policy_holder_id, contract_id, manager_id,
        job_value, inception_date, planned_completion_date,
        analysis_category, company_id
      ) VALUES ($1, 'Awaiting Action', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
    
    const params = [
      jobType,
      description,
      instructions,
      clientId,
      policyHolderId || null,
      contractId || null,
      managerId || null,
      jobValue || 0,
      inceptionDate,
      plannedCompletionDate || null,
      analysisCategory || null,
      companyId,
    ];
    
    const result = await query(query_text, params, companyId);
    
    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('[Jobs] Error creating job:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create job',
    });
  }
});

/**
 * PUT /api/jobs/:id
 * Update a job
 */
router.put('/:id', async (req, res) => {
  try {
    const companyId = req.companyId;
    const jobId = req.params.id;
    const updates = req.body;
    
    // Build dynamic update query
    const allowedFields = [
      'job_status', 'description', 'instructions', 'client_id',
      'policy_holder_id', 'contract_id', 'manager_id', 'job_value',
      'invoiced_amount', 'cost_labour', 'cost_materials', 'cost_subcontract',
      'cost_plant', 'cost_waste', 'cost_other', 'start_date',
      'planned_completion_date', 'actual_completion_date', 'analysis_category'
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
    
    values.push(jobId, companyId);
    
    const query_text = `
      UPDATE jobs
      SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${values.length - 1} AND company_id = $${values.length}
      RETURNING *
    `;
    
    const result = await query(query_text, values, companyId);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Job not found',
      });
    }
    
    res.json({
      success: true,
      message: 'Job updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('[Jobs] Error updating job:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update job',
    });
  }
});

/**
 * DELETE /api/jobs/:id
 * Delete a job
 */
router.delete('/:id', async (req, res) => {
  try {
    const companyId = req.companyId;
    const jobId = req.params.id;
    
    const query_text = `
      DELETE FROM jobs
      WHERE id = $1 AND company_id = $2
      RETURNING id
    `;
    
    const result = await query(query_text, [jobId, companyId], companyId);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Job not found',
      });
    }
    
    res.json({
      success: true,
      message: 'Job deleted successfully',
    });
  } catch (error) {
    console.error('[Jobs] Error deleting job:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete job',
    });
  }
});

module.exports = router;
