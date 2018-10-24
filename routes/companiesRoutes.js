/* Routes for companies */

// Set-up imports and files
const express = require('express');
const router = new express.Router();
const Company = require('../models/companiesModel');
const { validate } = require('jsonschema');
const companyCreationSchema = require('../schemas/companyCreationSchema.json');

// GET route for companies
router.get('/', async function(req, res, next){
  try {
    return res.json({companies:})
  } catch (error) {
    next(error)
  }
};

module.exports = router;
