/* Routes for companies */

// Set-up imports and files
const express = require('express');
const router = new express.Router();
const Company = require('../models/companiesModel');
const { validate } = require('jsonschema');
const companyCreationSchema = require('../schemas/companyCreationSchema.json');
const companyUpdateSchema = require('../schemas/companyUpdateSchema.json');
const validateInputs = require('../helpers/validateInputs');
const {
  ensureLoggedIn,
  ensureCorrectUser,
  ensureIsAdmin
} = require('../middleware/authMiddleware');

// GET route for companies
router.get('/', ensureLoggedIn, async function(req, res, next) {
  try {
    if (+req.query.min_employees > +req.query.max_employees) {
      let error = new Error(
        'Min employees must be less than or equal to max employees'
      );
      error.status = 400;
      throw error;
    }
    let result = await Company.filterAndListCompanies(req.query);
    return res.json({ companies: result });
  } catch (error) {
    next(error);
  }
});

// POST route to add company
router.post('/', ensureIsAdmin, async function(req, res, next) {
  try {
    validateInputs(req.body, companyCreationSchema);
    let result = await Company.create(req.body);
    return res.json({ company: result });
  } catch (error) {
    next(error);
  }
});

// GET route to retrieve specific company by handle
router.get('/:handle', ensureLoggedIn, async function(req, res, next) {
  try {
    let result = await Company.getOne(req.params.handle);
    return res.json({ company: result });
  } catch (error) {
    next(error);
  }
});

// PATCH route to update specific company by handle
router.patch('/:handle', ensureIsAdmin, async function(req, res, next) {
  try {
    validateInputs(req.body, companyUpdateSchema);
    let result = await Company.update(req.params.handle, req.body);
    return res.json({ company: result });
  } catch (error) {
    next(error);
  }
});

// DELETE route to delete specific company by handle
router.delete('/:handle', ensureIsAdmin, async function(req, res, next) {
  try {
    await Company.delete(req.params.handle);
    return res.json({ message: 'Company deleted! :(' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
