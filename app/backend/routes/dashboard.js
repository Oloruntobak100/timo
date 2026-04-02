/**
 * Dashboard Routes
 * API endpoints for dashboard metrics and analytics
 */

const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

/**
 * GET /api/dashboard/metrics
 * Get dashboard metrics for current company
 */
router.get('/metrics', async (req, res) => {
  try {
    const companyId = req.companyId;
    
    // Job metrics
    const jobMetricsQuery = `
      SELECT 
        COUNT(*) as total_jobs,
        COUNT(CASE WHEN job_status IN ('Awaiting Action', 'In Progress', 'On Hold') THEN 1 END) as active_jobs,
        COUNT(CASE WHEN job_status = 'Complete' AND actual_completion_date >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) as completed_this_month,
        COUNT(CASE WHEN job_status = 'Complete' AND invoice_status != 'Paid' THEN 1 END) as awaiting_invoicing,
        SUM(job_value) as total_value,
        SUM(invoiced_amount) as total_invoiced
      FROM jobs
      WHERE company_id = $1
    `;
    
    // Financial metrics
    const financialMetricsQuery = `
      SELECT 
        SUM(net_amount) as total_invoiced,
        SUM(paid_amount) as total_paid,
        SUM(total_amount - paid_amount) as outstanding_amount
      FROM sales_invoices
      WHERE company_id = $1 AND invoice_status != 'Cancelled'
    `;
    
    // WIP (Work in Progress) value
    const wipQuery = `
      SELECT COALESCE(SUM(job_value - invoiced_amount), 0) as wip_value
      FROM jobs
      WHERE company_id = $1 AND job_status IN ('In Progress', 'On Hold', 'Complete')
    `;
    
    // Cost breakdown
    const costBreakdownQuery = `
      SELECT 
        SUM(cost_labour) as labour,
        SUM(cost_materials) as materials,
        SUM(cost_subcontract) as subcontract,
        SUM(cost_plant) as plant,
        SUM(cost_waste) as waste,
        SUM(cost_other) as other
      FROM jobs
      WHERE company_id = $1
    `;
    
    // Execute queries in parallel
    const [
      jobMetrics,
      financialMetrics,
      wipResult,
      costBreakdown
    ] = await Promise.all([
      query(jobMetricsQuery, [companyId], companyId),
      query(financialMetricsQuery, [companyId], companyId),
      query(wipQuery, [companyId], companyId),
      query(costBreakdownQuery, [companyId], companyId),
    ]);
    
    const metrics = {
      jobs: {
        total: parseInt(jobMetrics.rows[0]?.total_jobs || 0),
        active: parseInt(jobMetrics.rows[0]?.active_jobs || 0),
        completedThisMonth: parseInt(jobMetrics.rows[0]?.completed_this_month || 0),
        awaitingInvoicing: parseInt(jobMetrics.rows[0]?.awaiting_invoicing || 0),
      },
      financial: {
        totalInvoiced: parseFloat(financialMetrics.rows[0]?.total_invoiced || 0),
        totalPaid: parseFloat(financialMetrics.rows[0]?.total_paid || 0),
        outstanding: parseFloat(financialMetrics.rows[0]?.outstanding_amount || 0),
      },
      wip: {
        value: parseFloat(wipResult.rows[0]?.wip_value || 0),
      },
      costs: {
        labour: parseFloat(costBreakdown.rows[0]?.labour || 0),
        materials: parseFloat(costBreakdown.rows[0]?.materials || 0),
        subcontract: parseFloat(costBreakdown.rows[0]?.subcontract || 0),
        plant: parseFloat(costBreakdown.rows[0]?.plant || 0),
        waste: parseFloat(costBreakdown.rows[0]?.waste || 0),
        other: parseFloat(costBreakdown.rows[0]?.other || 0),
      },
    };
    
    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error('[Dashboard] Error fetching metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard metrics',
    });
  }
});

/**
 * GET /api/dashboard/revenue-chart
 * Get revenue data for chart
 */
router.get('/revenue-chart', async (req, res) => {
  try {
    const companyId = req.companyId;
    
    const query_text = `
      SELECT 
        DATE_TRUNC('month', invoice_date) as month,
        SUM(net_amount) as invoiced,
        SUM(paid_amount) as paid,
        50000 as target
      FROM sales_invoices
      WHERE company_id = $1 
        AND invoice_date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '5 months')
        AND invoice_status != 'Cancelled'
      GROUP BY DATE_TRUNC('month', invoice_date)
      ORDER BY month ASC
    `;
    
    const result = await query(query_text, [companyId], companyId);
    
    // Format data for chart
    const chartData = result.rows.map(row => ({
      month: new Date(row.month).toLocaleDateString('en-GB', { month: 'short' }),
      invoiced: parseFloat(row.invoiced || 0),
      paid: parseFloat(row.paid || 0),
      target: row.target,
    }));
    
    res.json({
      success: true,
      data: chartData,
    });
  } catch (error) {
    console.error('[Dashboard] Error fetching revenue chart:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch revenue chart data',
    });
  }
});

/**
 * GET /api/dashboard/job-status-chart
 * Get job status distribution for chart
 */
router.get('/job-status-chart', async (req, res) => {
  try {
    const companyId = req.companyId;
    
    const query_text = `
      SELECT 
        job_status as name,
        COUNT(*) as value
      FROM jobs
      WHERE company_id = $1
      GROUP BY job_status
      ORDER BY value DESC
    `;
    
    const result = await query(query_text, [companyId], companyId);
    
    // Define colors for each status
    const statusColors = {
      'Awaiting Action': '#64748B',
      'Awaiting Authorisation': '#94A3B8',
      'Awaiting Survey': '#CBD5E1',
      'In Progress': '#3B82F6',
      'On Hold': '#F59E0B',
      'Complete': '#22C55E',
      'Invoiced': '#EAB308',
      'Paid': '#14B8A6',
      'Cancelled': '#EF4444',
    };
    
    const chartData = result.rows.map(row => ({
      name: row.name,
      value: parseInt(row.value),
      color: statusColors[row.name] || '#94A3B8',
    }));
    
    res.json({
      success: true,
      data: chartData,
    });
  } catch (error) {
    console.error('[Dashboard] Error fetching job status chart:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch job status chart data',
    });
  }
});

/**
 * GET /api/dashboard/recent-activity
 * Get recent jobs and invoices
 */
router.get('/recent-activity', async (req, res) => {
  try {
    const companyId = req.companyId;
    const limit = parseInt(req.query.limit) || 5;
    
    // Recent jobs
    const jobsQuery = `
      SELECT 
        j.id,
        j.job_number as number,
        j.job_status as status,
        j.job_value as value,
        c.company_name as client,
        j.created_at
      FROM jobs j
      JOIN clients c ON j.client_id = c.id
      WHERE j.company_id = $1
      ORDER BY j.created_at DESC
      LIMIT $2
    `;
    
    // Recent invoices
    const invoicesQuery = `
      SELECT 
        i.id,
        i.invoice_number as number,
        i.invoice_status as status,
        i.total_amount as amount,
        c.company_name as client,
        i.created_at
      FROM sales_invoices i
      JOIN clients c ON i.client_id = c.id
      WHERE i.company_id = $1
      ORDER BY i.created_at DESC
      LIMIT $2
    `;
    
    const [jobsResult, invoicesResult] = await Promise.all([
      query(jobsQuery, [companyId, limit], companyId),
      query(invoicesQuery, [companyId, limit], companyId),
    ]);
    
    res.json({
      success: true,
      data: {
        jobs: jobsResult.rows,
        invoices: invoicesResult.rows,
      },
    });
  } catch (error) {
    console.error('[Dashboard] Error fetching recent activity:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent activity',
    });
  }
});

module.exports = router;
