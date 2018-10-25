/* Unit tests for methods on User Model */

process.env.NODE_ENV = 'test'; // make sure we use test db!

const db = require('../../db');
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
  // delete all seeded data
  await db.query('DELETE FROM users');
});

afterAll(async function() {
  // close connection to DB
  await db.end();
});

// Test listUsers method returns list of user objects with user information
describe('listUsers()', () => {
  it('should generate a list of user objects with user information', async function() {
    // Test no query string parameters passed
    expect(await User.listUsers({})).toEqual([
      {
        username: 'glenn',
        first_name: 'Glenn',
        last_name: 'Ramel',
        email: 'glenn@glenn.com'
      }
    ]);
  });
});
