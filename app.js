/** Express app for jobly. */

const express = require('express');
const app = express();
app.use(express.json());

// add logging system

const morgan = require('morgan');
app.use(morgan('tiny'));

// Import routes
const companiesRoutes = require('./routes/companiesRoutes');
const jobsRoutes = require('./routes/jobsRoutes');
const usersRoutes = require('./routes/usersRoutes');
const authRoutes = require('./routes/authRoutes');

// Define route prefixes
app.use('/companies', companiesRoutes);
app.use('/jobs', jobsRoutes);
app.use('/users', usersRoutes);
app.use('/login', authRoutes);

/** 404 handler */

app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;

  // pass the error to the next piece of middleware
  return next(err);
});

/** general error handler */

app.use(function(err, req, res, next) {
  res.status(err.status || 500);

  return res.json({
    error: err,
    message: err.message
  });
});

module.exports = app;
