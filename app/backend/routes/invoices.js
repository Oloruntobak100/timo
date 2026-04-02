/**
 * Invoice Routes
 * API endpoints for sales invoice management
 */

const express = require('express');
const router = express.Router();
const { query, transaction } = require('../config/database');

/**
 * GET /api/invoices
 * Get all sales invoices for current company
 */
router.get('/', async (req, res) => {
  try {
    const companyId = req.companyId;
    const { status, limit = 50, offset = 0 } = req.query;
    
    let query_text = `
      SELECT 
        i.*,
        c.company_name as client_name,
        j.job_number
      FROM sales_invoices i
      LEFT JOIN clients c ON i.client_id = c.id
      LEFT JOIN jobs j ON i.job_id = j.id
      WHERE i.company_id = $1
    `;
    
    const params = [companyId];
    
    if (status) {
      query_text += ` AND i.invoice_status = $2`;
      params.push(status);
    }
    
    query_text += `
      ORDER BY i.invoice_date DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    params.push(limit, offset);
    
    const result = await query(query_text, params, companyId);
    
    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('[Invoices] Error fetching invoices:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch invoices',
    });
  }
});

/**
 * GET /api/invoices/:id
 * Get invoice by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const companyId = req.companyId;
    const invoiceId = req.params.id;
    
    const query_text = `
      SELECT 
        i.*,
        c.company_name as client_name,
        c.address_line1, c.address_line2, c.city, c.county, c.postcode,
        j.job_number
      FROM sales_invoices i
      LEFT JOIN clients c ON i.client_id = c.id
      LEFT JOIN jobs j ON i.job_id = j.id
      WHERE i.id = $1 AND i.company_id = $2
    `;
    
    const result = await query(query_text, [invoiceId, companyId], companyId);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found',
      });
    }
    
    // Get receipts for this invoice
    const receiptsQuery = `
      SELECT *
      FROM receipts
      WHERE invoice_id = $1 AND company_id = $2
      ORDER BY payment_date DESC
    `;
    
    const receiptsResult = await query(receiptsQuery, [invoiceId, companyId], companyId);
    
    const invoice = {
      ...result.rows[0],
      receipts: receiptsResult.rows,
    };
    
    res.json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    console.error('[Invoices] Error fetching invoice:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch invoice',
    });
  }
});

/**
 * POST /api/invoices
 * Create a new sales invoice
 */
router.post('/', async (req, res) => {
  try {
    const companyId = req.companyId;
    const {
      clientId,
      jobId,
      netAmount,
      vatRate,
      invoiceDate,
      dueDate,
    } = req.body;
    
    // Validation
    if (!clientId || !netAmount || !invoiceDate || !dueDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: clientId, netAmount, invoiceDate, dueDate',
      });
    }
    
    const query_text = `
      INSERT INTO sales_invoices (
        client_id, job_id, net_amount, vat_rate,
        invoice_date, due_date, company_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const params = [
      clientId,
      jobId || null,
      netAmount,
      vatRate || 20.00,
      invoiceDate,
      dueDate,
      companyId,
    ];
    
    const result = await query(query_text, params, companyId);
    
    // Update job invoiced amount if jobId is provided
    if (jobId) {
      const updateJobQuery = `
        UPDATE jobs
        SET invoiced_amount = invoiced_amount + $1,
            job_status = CASE WHEN invoiced_amount + $1 >= job_value THEN 'Invoiced' ELSE job_status END
        WHERE id = $2 AND company_id = $3
      `;
      await query(updateJobQuery, [netAmount, jobId, companyId], companyId);
    }
    
    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('[Invoices] Error creating invoice:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create invoice',
    });
  }
});

/**
 * POST /api/invoices/:id/receipts
 * Record a payment/receipt for an invoice
 */
router.post('/:id/receipts', async (req, res) => {
  try {
    const companyId = req.companyId;
    const invoiceId = req.params.id;
    const { amount, paymentDate, paymentMethod, reference, notes } = req.body;
    
    // Validation
    if (!amount || !paymentDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: amount, paymentDate',
      });
    }
    
    // Start transaction
    const result = await transaction(async (client) => {
      // Insert receipt
      const receiptQuery = `
        INSERT INTO receipts (
          invoice_id, amount, payment_date, payment_method, reference, notes, company_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      
      const receiptResult = await client.query(receiptQuery, [
        invoiceId, amount, paymentDate, paymentMethod, reference, notes, companyId
      ]);
      
      // Update invoice paid amount
      const updateInvoiceQuery = `
        UPDATE sales_invoices
        SET paid_amount = paid_amount + $1,
            invoice_status = CASE 
              WHEN paid_amount + $1 >= total_amount THEN 'Paid'
              WHEN paid_amount + $1 > 0 THEN 'Sent'
              ELSE invoice_status
            END,
            paid_date = CASE 
              WHEN paid_amount + $1 >= total_amount THEN $2
              ELSE paid_date
            END
        WHERE id = $3 AND company_id = $4
        RETURNING *
      `;
      
      await client.query(updateInvoiceQuery, [amount, paymentDate, invoiceId, companyId]);
      
      return receiptResult.rows[0];
    }, companyId);
    
    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: result,
    });
  } catch (error) {
    console.error('[Invoices] Error recording receipt:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record payment',
    });
  }
});

/**
 * GET /api/invoices/awaiting-payment
 * Get invoices awaiting payment
 */
router.get('/stats/awaiting-payment', async (req, res) => {
  try {
    const companyId = req.companyId;
    
    const query_text = `
      SELECT 
        COUNT(*) as count,
        SUM(total_amount - paid_amount) as total
      FROM sales_invoices
      WHERE company_id = $1 
        AND invoice_status IN ('Sent', 'Overdue')
        AND total_amount > paid_amount
    `;
    
    const result = await query(query_text, [companyId], companyId);
    
    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('[Invoices] Error fetching awaiting payment stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch awaiting payment stats',
    });
  }
});

module.exports = router;
