import express from 'express';
import { body, validationResult } from 'express-validator';
import { query } from '../database/init.js';
import { generateExcelReport } from '../services/excelService.js';
import { sendReportEmail } from '../services/emailService.js';

const router = express.Router();

// Validation middleware for report request
const validateReportRequest = [
  body('userData').isObject().withMessage('User data is required'),
  body('userData.email').isEmail().withMessage('Valid email is required'),
  body('userData.name').trim().isLength({ min: 1 }).withMessage('Name is required'),
  body('inputs').isObject().withMessage('Calculation inputs are required'),
  body('results').isObject().withMessage('Calculation results are required'),
];

// Request Excel report
router.post('/request', validateReportRequest, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { userData, inputs, results } = req.body;

    // Get user and check usage
    const userResult = await query(
      'SELECT id FROM users WHERE email = $1',
      [userData.email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userId = userResult.rows[0].id;

    // Check current usage
    const usageResult = await query(
      'SELECT report_count FROM user_usage WHERE email = $1',
      [userData.email]
    );

    const currentCount = usageResult.rows[0]?.report_count || 0;
    if (currentCount >= 5) {
      return res.status(403).json({
        success: false,
        message: "You've reached your 5 free reports. Contact us to request more."
      });
    }

    // Store calculation if not already stored
    const calculationResult = await query(
      `INSERT INTO calculations (user_id, business_price, funding_sources, sde_forecast, results) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [
        userId,
        inputs.businessPrice,
        JSON.stringify(inputs.fundingSources),
        JSON.stringify(inputs.sdeForecast),
        JSON.stringify(results)
      ]
    );

    const calculationId = calculationResult.rows[0].id;

    // Create report record
    const reportResult = await query(
      'INSERT INTO reports (user_id, calculation_id) VALUES ($1, $2) RETURNING id',
      [userId, calculationId]
    );

    const reportId = reportResult.rows[0].id;

    try {
      // Generate Excel report
      const excelBuffer = await generateExcelReport(userData, inputs, results);

      // Send email with report
      await sendReportEmail(userData, excelBuffer);

      // Update report as sent and increment usage
      await query('BEGIN');
      
      await query(
        'UPDATE reports SET email_sent = TRUE, email_sent_at = CURRENT_TIMESTAMP WHERE id = $1',
        [reportId]
      );

      await query(
        `UPDATE user_usage 
         SET report_count = report_count + 1, last_report_date = CURRENT_TIMESTAMP 
         WHERE email = $1`,
        [userData.email]
      );

      await query('COMMIT');

      res.json({
        success: true,
        message: `Excel report has been sent to ${userData.email}`
      });

    } catch (emailError) {
      console.error('Email sending error:', emailError);
      
      // Update report with error
      await query(
        'UPDATE reports SET error_message = $1 WHERE id = $2',
        [emailError.message, reportId]
      );

      res.status(500).json({
        success: false,
        message: 'Failed to send report email'
      });
    }

  } catch (error) {
    console.error('Report request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process report request'
    });
  }
});

// Get report history for a user
router.get('/history/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const reportsResult = await query(
      `SELECT r.id, r.email_sent, r.email_sent_at, r.error_message, r.created_at,
              c.business_price
       FROM reports r
       JOIN calculations c ON r.calculation_id = c.id
       JOIN users u ON r.user_id = u.id
       WHERE u.email = $1
       ORDER BY r.created_at DESC
       LIMIT 20`,
      [email]
    );

    res.json({
      success: true,
      reports: reportsResult.rows
    });

  } catch (error) {
    console.error('Report history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve report history'
    });
  }
});

export default router;