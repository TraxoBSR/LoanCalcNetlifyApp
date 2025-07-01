import express from 'express';
import { body, validationResult } from 'express-validator';
import { query } from '../database/init.js';

const router = express.Router();

// Validation middleware for calculation inputs
const validateCalculationInputs = [
  body('businessPrice').isNumeric().withMessage('Business price must be a number'),
  body('fundingSources').isArray().withMessage('Funding sources must be an array'),
  body('sdeForecast').isObject().withMessage('SDE forecast must be an object'),
  body('userData').isObject().withMessage('User data is required'),
  body('userData.email').isEmail().withMessage('Valid email is required'),
];

// Submit calculation inputs and store results
router.post('/submit-inputs', validateCalculationInputs, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { businessPrice, fundingSources, sdeForecast, userData, results } = req.body;

    // Get user ID
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

    // Store calculation
    const calculationResult = await query(
      `INSERT INTO calculations (user_id, business_price, funding_sources, sde_forecast, results) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [
        userId,
        businessPrice,
        JSON.stringify(fundingSources),
        JSON.stringify(sdeForecast),
        JSON.stringify(results)
      ]
    );

    res.json({
      success: true,
      calculationId: calculationResult.rows[0].id,
      message: 'Calculation stored successfully'
    });

  } catch (error) {
    console.error('Calculation submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to store calculation'
    });
  }
});

// Get calculation history for a user
router.get('/history/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const calculationsResult = await query(
      `SELECT c.id, c.business_price, c.funding_sources, c.sde_forecast, c.results, c.created_at
       FROM calculations c
       JOIN users u ON c.user_id = u.id
       WHERE u.email = $1
       ORDER BY c.created_at DESC
       LIMIT 10`,
      [email]
    );

    res.json({
      success: true,
      calculations: calculationsResult.rows
    });

  } catch (error) {
    console.error('Calculation history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve calculation history'
    });
  }
});

export default router;