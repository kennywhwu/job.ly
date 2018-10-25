/* Routes for authorization */

// Set-up imports and files
const express = require('express');
const router = new express.Router();
const User = require('../models/usersModel');
const userLoginSchema = require('../schemas/userLoginSchema.json');
const validateInputs = require('../helpers/validateInputs');

// POST route to authenticate and login user
router.post('/', async function(req, res, next) {
  try {
    validateInputs(req.body, userLoginSchema);
    let { username, password } = req.body;
    let token = await User.authenticate(username, password);
    return res.json({ token });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
