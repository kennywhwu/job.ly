/* Integration tests for company routes */

process.env.NODE_ENV = 'test'; // make sure we use test db!

const db = require('../../db');
const request = require('supertest');
const app = require('../../app');
const Company = require('../../models/companiesModel');
let token;
let adminToken;

beforeEach(async function() {
  // seed with some data
  await db.query('DELETE FROM companies');
  await db.query('DELETE FROM users');
  await db.query(
    `INSERT INTO companies 
      (handle,
      name,
      num_employees,
      description,
      logo_url) 
    VALUES 
      ('NFLX',
      'Netflix',
      5000,
      'Media-streaming company',
      'http://netflix.com'),
      ('GOOG',
      'Google',
      10000,
      'Ad King',
      'http://google.com'),
      ('AMZN',
      'Amazon',
      9000,
      'Taking over the world',
      'http://amazon.com')`
  );

  // Register new user to hash password
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
  // Set global token for test use
  token = registeredUser.body.token;

  // Register admin
  let adminUser = await request(app)
    .post('/users')
    .send({
      username: 'admin',
      first_name: 'Admin',
      last_name: 'Istrator',
      password: 'adminpassword',
      email: 'admin@admin.com',
      photo_url: 'http://admin.com'
    });
  // Set admin rights in database and log admin in to create token
  await db.query(`UPDATE users SET is_admin = true WHERE username = 'admin'`);
  const admin = await request(app)
    .post('/login')
    .send({ username: 'admin', password: 'adminpassword' });
  // Set global admin token for admin privileges when testing
  adminToken = admin.body.token;
});

afterEach(async function() {
  // delete seed data
  await db.query('DELETE FROM companies');
});

afterAll(async function() {
  // close connection to DB
  await db.end();
});

// Test GET request to /companies
describe('GET /companies', function() {
  // Test no query strings passed while logged in
  test('No query strings returns list of all companies while logged in', async function() {
    const allCompanies = await request(app)
      .get('/companies')
      .send({ _token: token });

    // make sure list returns correct number of companies, name is expected of first, and response code
    expect(allCompanies.body.companies.length).toBe(3);
    expect(allCompanies.body.companies[0].name).toBe('Amazon');
    expect(allCompanies.statusCode).toBe(200);
  });

  // Test all query strings passed and combine to return filtered list of companies while logged in
  test('All query strings returns combined filtered list of all companies while logged in', async function() {
    const filteredCompanies = await request(app)
      .get('/companies?search=goo&min_employees=9500&max_employees=11000')
      .send({ _token: token });

    // make sure list returns correct number of companies, name is expected of first, and response code
    expect(filteredCompanies.body.companies.length).toBe(1);
    expect(filteredCompanies.body.companies[0].name).toBe('Google');
    expect(filteredCompanies.statusCode).toBe(200);
  });

  // Test return error if min employees > max employees while logged in
  test('Return error if min employees > max employees while logged in', async function() {
    const invalidMinMax = await request(app)
      .get('/companies?min_employees=9000&max_employees=6000')
      .send({ _token: token });

    // Validate error message and status code
    expect(invalidMinMax.body.message).toBe(
      'Min employees must be less than or equal to max employees'
    );
    expect(invalidMinMax.statusCode).toBe(400);
  });

  // Test no query strings passed while NOT logged in
  test('Return error while NOT logged in', async function() {
    const invalidCompanies = await request(app).get('/companies');

    // Validate error message and status code
    expect(invalidCompanies.body.message).toBe('Unauthorized');
    expect(invalidCompanies.statusCode).toBe(401);
  });
});

// Test POST request to /companies
describe('POST /companies', function() {
  // Test posting valid company while logged in
  test('Post with valid company returns all the company information while logged in', async function() {
    const newCompany = await request(app)
      .post('/companies')
      .send({
        handle: 'FB',
        name: 'Facebook',
        num_employees: 7000,
        description: 'Social network',
        _token: adminToken
      });

    // Validate company name and status code are expected
    expect(newCompany.body.company.name).toBe('Facebook');
    expect(newCompany.statusCode).toBe(200);
  });

  // Test with invalid fields while logged in
  test('Post with invalid fields returns error while logged in', async function() {
    const invalidCompany = await request(app)
      .post('/companies')
      .send({
        name: 'Facebook',
        num_employees: '7000',
        description: 'Social network',
        logo_url: 'http://facebook.com',
        _token: adminToken
      });

    // Validate error message and status code
    expect(invalidCompany.body.message).toEqual([
      'instance requires property "handle"',
      'instance.num_employees is not of a type(s) integer'
    ]);
    expect(invalidCompany.statusCode).toBe(400);
  });

  // Test posting valid company while NOT logged in
  test('Return error while NOT logged in', async function() {
    const invalidCompany = await request(app)
      .post('/companies')
      .send({
        handle: 'FB',
        name: 'Facebook',
        num_employees: 7000,
        description: 'Social network'
      });

    // Validate error message and status code
    expect(invalidCompany.body.message).toEqual('Unauthorized');
    expect(invalidCompany.statusCode).toBe(401);
  });
});

// Test GET request to /companies/:handle
describe('GET /companies/:handle', function() {
  // Test retrieving company info with valid handle while logged in
  test('Retrieve company name and handle by valid handle while logged in', async function() {
    const specificCompany = await request(app)
      .get('/companies/GOOG')
      .send({ _token: token });

    // Validate company name and status code are expected
    expect(specificCompany.body.company.name).toBe('Google');
    expect(specificCompany.statusCode).toBe(200);
  });

  // Test retrieving company with invalid handle while logged in
  test('Returns error if retrieve company by nonexisting handle while logged in', async function() {
    const invalidCompany = await request(app)
      .get('/companies/AAPL')
      .send({ _token: token });

    // Validate error message and status code
    expect(invalidCompany.body.message).toBe('Company does not exist');
    expect(invalidCompany.statusCode).toBe(404);
  });

  // Test retrieving company info with valid handle while NOT logged in
  test('Return error while NOT logged in', async function() {
    const invalidCompany = await request(app).get('/companies/GOOG');
    // Validate error message and status code
    expect(invalidCompany.body.message).toBe('Unauthorized');
    expect(invalidCompany.statusCode).toBe(401);
  });
});

// Test PATCH request to /companies/:handle
describe('PATCH /companies/:handle', function() {
  // Test updating company with valid handle while logged in
  test('Update company information by valid handle while logged in', async function() {
    const updatedCompany = await request(app)
      .patch('/companies/NFLX')
      .send({
        num_employees: 8000,
        _token: adminToken
      });

    // Validate company name remains same, updated field is updated,and status code are expected
    expect(updatedCompany.body.company.name).toBe('Netflix');
    expect(updatedCompany.body.company.num_employees).toBe(8000);
    expect(updatedCompany.statusCode).toBe(200);
  });

  // Test updating company with invalid handle while logged in
  test('Returns error if update company with nonexisting handle', async function() {
    const invalidCompany = await request(app)
      .patch('/companies/AAPL')
      .send({
        num_employees: 8000,
        _token: adminToken
      });

    // Validate error message and status code
    expect(invalidCompany.body.message).toBe('Company does not exist');
    expect(invalidCompany.statusCode).toBe(404);
  });

  // Test updating company with invalid inputs while logged in
  test('Returns error if update existing company with invalid inputs while logged in', async function() {
    const invalidCompany = await request(app)
      .patch('/companies/NFLX')
      .send({
        num_employees: '8000',
        _token: adminToken
      });

    // Validate error message and status code
    expect(invalidCompany.body.message).toEqual([
      'instance.num_employees is not of a type(s) integer'
    ]);
    expect(invalidCompany.statusCode).toBe(400);
  });

  // Test updating company with valid handle while NOT logged in
  test('Return error while NOT logged in', async function() {
    const invalidCompany = await request(app)
      .patch('/companies/NFLX')
      .send({
        num_employees: 8000
      });

    // Validate error message and status code
    expect(invalidCompany.body.message).toEqual('Unauthorized');
    expect(invalidCompany.statusCode).toBe(401);
  });
});

// Test DELETE request to /companies/:handle
describe('DELETE /companies/:handle', function() {
  // Test deleting company with valid handle while logged in
  test('Delete company with valid handle while logged in', async function() {
    const deletedCompany = await request(app)
      .delete('/companies/NFLX')
      .send({ _token: adminToken });

    // Validate delete message and status code
    expect(deletedCompany.body.message).toBe('Company deleted! :(');
    expect(deletedCompany.statusCode).toBe(200);
  });

  // Test deleting company with invalid handle while logged in
  test('Returns error if delete company with nonexistent handle while logged in', async function() {
    const invalidCompany = await request(app)
      .delete('/companies/AAPL')
      .send({ _token: adminToken });

    // Validate error message
    expect(invalidCompany.body.message).toBe('Company does not exist');
    expect(invalidCompany.statusCode).toBe(404);
  });

  // Test deleting company with valid handle while NOT logged in
  test('Return error while NOT logged in', async function() {
    const invalidCompany = await request(app).delete('/companies/NFLX');

    // Validate error message
    expect(invalidCompany.body.message).toBe('Unauthorized');
    expect(invalidCompany.statusCode).toBe(401);
  });
});
