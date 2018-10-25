const db = require('../db');
const partialUpdate = require('../helpers/partialUpdate');
const bcrypt = require('bcrypt');
const { BCRYPT_WORK_ROUNDS, SECRET } = require('../config');
const jwt = require('jsonwebtoken');

/** Collection of related methods for companies. */

class User {
  // Error handler if identifying user that doesn't exist in database
  static _404_errorIfNotFound(results) {
    if (results.rows.length === 0) {
      let error = new Error(`User does not exist`);
      error.status = 404;
      throw error;
    }
  }

  // Return list of users from database
  //=>
  //{
  //   "users": [
  //     {
  //       "username": "kenny",
  //       "first_name": "Kenny",
  //       "last_name": "Hwu",
  //       "email": "kenny2@kenny.com"
  //     },
  //     {
  //       "username": "kenny1",
  //       "first_name": "Kenny1",
  //       "last_name": "Hwu1",
  //       "email": "kenny1@kenny.com"
  //     }
  //   ]
  // }
  static async listUsers(queryObject) {
    const userResult = await db.query(
      `SELECT username,
              first_name,
              last_name,
              email
        FROM users`
    );
    return userResult.rows;
  }

  // Create method to insert new user into database and return inserted user data
  // Assume don't want to return password back
  // ASSUMING CLIENT-FACING; WOULD NEVER ASK IF THEY ARE ADMIN
  // {
  //   "username": "glenn",
  //   "password": "password",
  //   "first_name": "Glenn",
  //   "last_name": "Ramel",
  //   "email": "glenn@glenn.com",
  //   "photo_url": "http://glenn.com"
  // }
  // =>
  // {
  //   "user": {
  //     "username": "glenn",
  //     "first_name": "Glenn",
  //     "last_name": "Ramel",
  //     "email": "glenn@glenn.com",
  //     "photo_url": "http://glenn.com"
  //   }
  // }
  static async create({
    username,
    password,
    first_name,
    last_name,
    email,
    photo_url
  }) {
    let hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_ROUNDS);
    const result = await db.query(
      `INSERT INTO users (
            username,
            password,
            first_name,
            last_name,
            email,
            photo_url) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING username,
            first_name,
            last_name,
            email,
            photo_url`,
      [username, hashedPassword, first_name, last_name, email, photo_url]
    );
    return result.rows[0];
  }

  // Retrieve user from database by username
  // 'kenny'
  // =>
  // {
  // 	"user": {
  // 		"username": "kenny",
  // 		"first_name": "Kenny",
  // 		"last_name": "Hwu",
  // 		"email": "kenny@kenny.com",
  // 		"photo_url": "http://kenny.com"
  // 	}
  // }
  static async getOne(username) {
    const result = await db.query(
      `SELECT username,
              first_name,
              last_name,
              email,
              photo_url
        FROM users 
        WHERE username = $1
      `,
      [username]
    );
    this._404_errorIfNotFound(result);
    return result.rows[0];
  }

  // Update user information by username in database, only for columns specified
  // 'kenny',
  // {
  // 	"email": "kenny1@kenny.com",
  // 	"photo_url": "http://kenny1.com"
  // }
  // =>
  // {
  //   "user": {
  //     "username": "kenny",
  //     "first_name": "Kenny",
  //     "last_name": "Hwu",
  //     "email": "kenny1@kenny.com",
  //     "photo_url": "http://kenny1.com"
  //   }
  // }
  static async update(username, items) {
    const { query, values } = partialUpdate(
      'users',
      items,
      'username',
      username
    );
    const result = await db.query(query, values);
    this._404_errorIfNotFound(result);
    delete result.rows[0].password;
    delete result.rows[0].is_admin;
    return result.rows[0];
  }

  // Delete user by username from database
  // 'kenny' => don't return anything
  static async delete(username) {
    const result = await db.query(
      `DELETE
        FROM users
        WHERE username = $1
        RETURNING username
      `,
      [username]
    );
    this._404_errorIfNotFound(result);
    return;
  }

  // Check if user exists, and compare stored hashed password with entered hashed password
  static async authenticate(username, password) {
    const result = await db.query(
      'SELECT password, is_admin FROM users WHERE username = $1',
      [username]
    );
    let user = result.rows[0];
    if (user && (await bcrypt.compare(password, user.password))) {
      return this.login({ username, is_admin: user.is_admin });
    }
    let error = new Error(`Invalid username/password`);
    error.status = 401;
    throw error;
  }

  // Log user in after authenticating
  static login({ username, is_admin }) {
    let token = jwt.sign({ username, is_admin }, SECRET, {});
    return token;
  }
}

// router.post('/login', async function(req, res, next) {
//   try {
//     let { username, password } = req.body;
//     if (await User.authenticate(username, password)) {
//       let token = jwt.sign({ username }, SECRET_KEY, {});
//       User.updateLoginTimestamp(username);
//       return res.json({ token });
//     } else {
//       throw new Error('Invalid username/password');
//     }
//   } catch (err) {
//     return next(err);
//   }
// });

module.exports = User;
