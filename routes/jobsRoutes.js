/* Routes for jobs */

// Set-up imports and files
const express = require('express');
const router = new express.Router();
const Job = require('../models/jobsModel');
const jobCreationSchema = require('../schemas/jobCreationSchema.json');
const jobUpdateSchema = require('../schemas/jobUpdateSchema.json');
const validateInputs = require('../helpers/validateInputs');

// function goSayHi(next) {
//   throw "hi";;
// }

// router.get('/foo', function(req, res, next) {
//   try {
//     goSayHi(next);
//   console.log('OH NO');
//   res.json('there');
//   } catch (err) {
//     next(err);
//   }
// });

// POST route to add job
router.post('/', async function(req, res, next) {
  try {
    validateInputs(req.body, jobCreationSchema);
    let result = await Job.create(req.body);
    return res.json({ job: result });
  } catch (error) {
    next(error);
  }
});

// GET route for jobs
router.get('/', async function(req, res, next) {
  try {
    let result = await Job.filterAndListJobs(req.query);
    return res.json({ jobs: result });
  } catch (error) {
    next(error);
  }
});

// GET route to retrieve specific job by id
router.get('/:id', async function(req, res, next) {
  try {
    let result = await Job.getOne(req.params.id);
    return res.json({ job: result });
  } catch (error) {
    next(error);
  }
});

// PATCH route to update specific job by id
router.patch('/:id', async function(req, res, next) {
  try {
    validateInputs(req.body, jobUpdateSchema);
    let result = await Job.update(req.params.id, req.body);
    return res.json({ job: result });
  } catch (error) {
    next(error);
  }
});

// DELETE route to delete specific job by id
router.delete('/:id', async function(req, res, next) {
  try {
    await Job.delete(req.params.id);
    return res.json({ message: 'Job deleted! :(' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
