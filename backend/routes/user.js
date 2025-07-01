import express from 'express';
import { body, validationResult } from 'express-validator';
import { query } from '../database/init.js';

const router = express.Router();

// Validation middleware
const validateUser = [
  body('name').trim().isLength({ min: 1, max: 255 }).withMessage('Name is required and must be less than 255 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
];

// Validate user and check usage limits
router.post('/validate', validateUser, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email } = req.body;

    // Start transaction
    const client = await query('BEGIN');

    try {
      // Check if user exists
      let userResult = await query(
        'SELECT id, name, email FROM users WHERE email = $1',
        [email]
      );

      let userId;
      if (userResult.rows.length === 0) {
        // Create new user
        const newUserResult = await query(
          'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id, name, email',
          [name, email]
        );
        userId = newUserResult.rows[0].id;
        
        // Initialize usage tracking
        await query(
          'INSERT INTO user_usage (user_id, email, report_count) VALUES ($1, $2, 0)',
          [userId, email]
        );
      } else {
        userId = userResult.rows[0].id;
        
        // Update user name if different
        if (userResult.rows[0].name !== name) {
          await query(
            'UPDATE users SET name = $1 WHERE id = $2',
            [name, userId]
          );
        }
      }

      // Get current usage
      const usageResult = await query(
        'SELECT report_count FROM user_usage WHERE email = $1',
        [email]
      );

      const reportCount = usageResult.rows[0]?.report_count || 0;
      const canGenerate = reportCount < 5;

      await query('COMMIT');

      res.json({
        success: true,
        canGenerate,
        usageCount: reportCount,
        message: canGenerate ? undefined : "You've reached your 5 free reports. Contact us to request more."
      });

    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('User validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate user'
    });
  }
});

// Check usage for a specific email
router.post('/check-usage', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    const usageResult = await query(
      'SELECT report_count FROM user_usage WHERE email = $1',
      [email]
    );

    const reportCount = usageResult.rows[0]?.report_count || 0;
    const canGenerate = reportCount < 5;

    res.json({
      success: true,
      canGenerate,
      usageCount: reportCount
    });

  } catch (error) {
    console.error('Usage check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check usage'
    });
  }
});

export default router;