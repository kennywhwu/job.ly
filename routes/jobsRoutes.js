/* Routes for jobs */

// Set-up imports and files
const express = require('express');
const router = new express.Router();
const Job = require('../models/jobsModel');
const { validate } = require('jsonschema');
const jobCreationSchema = require('../schemas/jobCreationSchema.json');
const jobUpdateSchema = require('../schemas/jobUpdateSchema.json');
const validateInputs = require('../helpers/validateInputs');

// POST route to add job
router.post('/', async function(req, res, next) {
  try {
    const validateResult = validate(req.body, jobCreationSchema);
    validateInputs(validateResult, next);
    let result = await Job.create(req.body);
    return res.json({ job: result });
  } catch (error) {
    next(error);
  }
});

// GET route for jobs
router.get('/', async function(req, res, next) {
  try {
    if (+req.query.min_employees > +req.query.max_employees) {
      let error = new Error(
        'Min employees must be less than or equal to max employees'
      );
      error.status = 400;
      throw error;
    }
    let result = await Company.filterAndListjobs(req.query);
    return res.json({ companies: result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
