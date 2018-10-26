/* Routes for users */

// Set-up imports and files
const express = require('express');
const router = new express.Router();
const User = require('../models/usersModel');
const userCreationSchema = require('../schemas/userCreationSchema.json');
const userUpdateSchema = require('../schemas/userUpdateSchema.json');
const validateInputs = require('../helpers/validateInputs');
const {
  ensureLoggedIn,
  ensureCorrectUser
} = require('../middleware/authMiddleware');

// // POST route to add user
// router.post('/', async function(req, res, next) {
//   try {
//     validateInputs(req.body, userCreationSchema);
//     let result = await User.create(req.body);
//     return res.json({ user: result });
//   } catch (error) {
//     next(error);
//   }
// });

// POST route to add user (SMART)
router.post('/', async function(req, res, next) {
  try {
    validateInputs(req.body, userCreationSchema);
    let newUser = await User.create(req.body); // return new User()
    let token = newUser.login();
    return res.json({ token });
  } catch (error) {
    next(error);
  }
});

// GET route for users
router.get('/', async function(req, res, next) {
  try {
    let result = await User.listUsers(req.query);
    return res.json({ users: result });
  } catch (error) {
    next(error);
  }
});

// GET route to retrieve specific user by username
router.get('/:username', async function(req, res, next) {
  try {
    let result = await User.getOne(req.params.username);
    return res.json({ user: result });
  } catch (error) {
    next(error);
  }
});

// PATCH route to update specific user by username
router.patch('/:username', ensureCorrectUser, async function(req, res, next) {
  try {
    validateInputs(req.body, userUpdateSchema);
    let result = await User.update(req.params.username, req.body);
    return res.json({ user: result });
  } catch (error) {
    next(error);
  }
});

// DELETE route to delete specific user by username
router.delete('/:username', ensureCorrectUser, async function(req, res, next) {
  try {
    await User.delete(req.params.username);
    return res.json({ message: 'User deleted! :(' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
