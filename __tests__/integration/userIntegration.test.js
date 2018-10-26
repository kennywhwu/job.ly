/* Integration tests for user routes */

process.env.NODE_ENV = 'test'; // make sure we use test db!

const db = require('../../db');
const request = require('supertest');
const app = require('../../app');
const User = require('../../models/usersModel');

beforeEach(async function() {
  // seed with some data
  await db.query('DELETE FROM users');
  await db.query(
    `INSERT INTO users 
      (username,
      password,
      first_name,
      last_name,
      email,
      photo_url) 
    VALUES 
      ('glenn',
      'password',
      'Glenn',
      'Ramel',
      'glenn@glenn.com',
      'http://glenn.com')`
  );
});

afterEach(async function() {
  // delete seed data
  await db.query('DELETE FROM users');
});

afterAll(async function() {
  // close connection to DB
  await db.end();
});

// Test GET request to /users
describe('GET /users', function() {
  // Test retrieve entire list of users
  test('Should retrieve entire list of users', async function() {
    const allUsers = await request(app).get('/users');

    // make sure list returns correct number of users, username is expected of first, and response code
    expect(allUsers.body.users.length).toBe(1);
    expect(allUsers.body.users[0].username).toBe('glenn');
    expect(allUsers.statusCode).toBe(200);
  });
});

// // ORIGINAL POST TEST
// // Test POST request to /users
// describe('POST /users', function() {
//   // Test posting valid user
//   test('Post with valid user returns all the user information except for password/is_admin', async function() {
//     const newUser = await request(app)
//       .post('/users')
//       .send({
//         username: 'kenny1',
//         first_name: 'Kenny1',
//         last_name: 'Hwu1',
//         password: 'password',
//         email: 'kenny1@kenny.com',
//         photo_url: 'http://kenny1.com'
//       });
//     // Validate user username and status code are expected, and password/is_admin are not passed back
//     expect(newUser.body.user.username).toBe('kenny1');
//     expect(newUser.body.user.password).toBe(undefined);
//     expect(newUser.body.user.is_admin).toBe(undefined);
//     expect(newUser.statusCode).toBe(200);
//   });

//   // Test with invalid fields
//   test('Post with invalid fields returns errors', async function() {
//     const invalidUser = await request(app)
//       .post('/users')
//       .send({
//         username: 'kenny1',
//         first_name: 'Kenny1',
//         last_name: 'Hwu1',
//         password: 'password',
//         email: 1,
//         photo_url: true
//       });

//     // Validate error message and status code
//     expect(invalidUser.body.message).toEqual([
//       'instance.email is not of a type(s) string',
//       'instance.photo_url is not of a type(s) string'
//     ]);
//     expect(invalidUser.statusCode).toBe(400);
//   });
// });

// NEW POST TEST WITH LOGGING IN
// Test POST request to /users
describe('POST /users', function() {
  // Test posting valid user
  test('Post with valid user returns all the user information except for password/is_admin', async function() {
    const newUser = await request(app)
      .post('/users')
      .send({
        username: 'kenny1',
        first_name: 'Kenny1',
        last_name: 'Hwu1',
        password: 'password',
        email: 'kenny1@kenny.com',
        photo_url: 'http://kenny1.com'
      });
    // Validate user username and status code are expected, and password/is_admin are not passed back
    expect(newUser.body.token).toBeDefined();
    expect(newUser.statusCode).toBe(200);
  });

  // Test with invalid fields
  test('Post with invalid fields returns errors', async function() {
    const invalidUser = await request(app)
      .post('/users')
      .send({
        username: 'kenny1',
        first_name: 'Kenny1',
        last_name: 'Hwu1',
        password: 'password',
        email: 1,
        photo_url: true
      });

    // Validate error message and status code
    expect(invalidUser.body.message).toEqual([
      'instance.email is not of a type(s) string',
      'instance.photo_url is not of a type(s) string'
    ]);
    expect(invalidUser.statusCode).toBe(400);
  });
});

// Test GET request to /users/:username
describe('GET /users/:username', function() {
  // Test retrieving user info with valid username
  test('Retrieve user information by valid username', async function() {
    const specificUser = await request(app).get('/users/glenn');

    // Validate user first name and status code are expected
    expect(specificUser.body.user.first_name).toBe('Glenn');
    expect(specificUser.statusCode).toBe(200);
  });

  // Test retrieving user with invalid username text
  test('Returns error if retrieve user by nonexisting text username', async function() {
    const invalidUser = await request(app).get('/users/bob');

    // Validate error message and status code
    expect(invalidUser.body.message).toBe('User does not exist');
    expect(invalidUser.statusCode).toBe(404);
  });
});

// Test PATCH request to /users/:username
describe('PATCH /users/:username', function() {
  // Test updating user with valid username and logged in token
  test('Update user information by valid username when logged in as user', async function() {
    // Must register new user to hash password
    const registeredUser = await request(app)
      .post('/users')
      .send({
        username: 'kenny1',
        first_name: 'Kenny1',
        last_name: 'Hwu1',
        password: 'password1',
        email: 'kenny1@kenny.com',
        photo_url: 'http://kenny1.com'
      });

    // Define token from registered user login
    const token = registeredUser.body.token;

    // Update user with login token
    const updatedUser = await request(app)
      .patch('/users/kenny1')
      .send({
        email: 'kenny2@kenny.com',
        _token: token
      });

    // Validate user first name remains same, updated field is updated,and status code are expected
    expect(updatedUser.body.user.first_name).toBe('Kenny1');
    expect(updatedUser.body.user.email).toBe('kenny2@kenny.com');
    expect(updatedUser.statusCode).toBe(200);
  });

  // Test updating user with valid username without being logged in as user
  test('Returns error when updating user information by valid username without being logged in as user', async function() {
    const updatedUser = await request(app)
      .patch('/users/glenn')
      .send({
        email: 'glenn1@glenn.com'
      });

    // Validate user first name remains same, updated field is updated,and status code are expected
    expect(updatedUser.body.message).toBe('Unauthorized');
    expect(updatedUser.statusCode).toBe(401);
  });

  // Test updating user with invalid username
  test('Returns error if update user with nonexisting username', async function() {
    const invalidUser = await request(app)
      .patch('/users/bob')
      .send({
        email: 'bob@bob.com'
      });

    // Validate error message and status code
    expect(invalidUser.body.message).toBe('Unauthorized');
    expect(invalidUser.statusCode).toBe(401);
  });
});

// Test DELETE request to /users/:username
describe('DELETE /users/:username', function() {
  // Test deleting user with valid username while logged in as user
  test('Return delete message when deleting user with valid username with token from logging in as user', async function() {
    // Must register new user to hash password
    const registeredUser = await request(app)
      .post('/users')
      .send({
        username: 'kenny1',
        first_name: 'Kenny1',
        last_name: 'Hwu1',
        password: 'password1',
        email: 'kenny1@kenny.com',
        photo_url: 'http://kenny1.com'
      });

    // Define token from registered user login
    const token = registeredUser.body.token;

    // Make delete request while sending login token
    const deletedUser = await request(app)
      .delete('/users/kenny1')
      .send({
        _token: token
      });

    // Validate delete message and status code
    expect(deletedUser.body.message).toBe('User deleted! :(');
    expect(deletedUser.statusCode).toBe(200);
  });

  // Test deleting user with valid username when NOT logged in as user
  test('Return error when deleting user with valid username WITHOUT token from logging in as user', async function() {
    // Make delete request WITHOUT login token
    const deletedUser = await request(app).delete('/users/kenny1');

    // Validate error message
    expect(deletedUser.body.message).toBe('Unauthorized');
    expect(deletedUser.statusCode).toBe(401);
  });

  // Test deleting user with invalid username
  test('Returns error if delete user with nonexistent username', async function() {
    const invalidUser = await request(app).delete('/users/5');

    // Validate error message
    expect(invalidUser.body.message).toBe('Unauthorized');
    expect(invalidUser.statusCode).toBe(401);
  });
});
