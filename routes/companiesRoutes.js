/* Routes for companies */

// Set-up imports and files
const express = require('express');
const router = new express.Router();
const Company = require('../models/companiesModel');
const { validate } = require('jsonschema');
// const companyCreationSchema = require('../schemas/companyCreationSchema.json');

// GET route for companies
router.get('/', async function(req, res, next) {
  try {
    if (req.query.min_employees > req.query.max_employees) {
      let error = new Error(
        'Min employees must be less than or equal to max employees'
      );
      error.status = 400;
      throw error;
    }
    let result = await Company.filterAll(req.query);
    return res.json({ companies: result });
  } catch (error) {
    next(error);
  }
});

// POST route for companies
router.get('/', async function(req, res, next) {
  try {
    if (req.query.min_employees > req.query.max_employees) {
      let error = new Error(
        'Min employees must be less than or equal to max employees'
      );
      error.status = 400;
      throw error;
    }
    let result = await Company.filterAll(req.query);
    return res.json({ companies: result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
