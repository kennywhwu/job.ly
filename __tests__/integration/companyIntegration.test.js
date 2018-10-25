/* Integration tests for company routes */

process.env.NODE_ENV = 'test'; // make sure we use test db!

const db = require('../../db');
const request = require('supertest');
const app = require('../../app');
const Company = require('../../models/companiesModel');

beforeEach(async function() {
  // seed with some data
  await db.query('DELETE FROM companies');
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
  // Test no query strings passed
  test('No query strings returns list of all companies', async function() {
    const allCompanies = await request(app).get('/companies');

    // make sure list returns correct number of companies, name is expected of first, and response code
    expect(allCompanies.body.companies.length).toBe(3);
    expect(allCompanies.body.companies[0].name).toBe('Amazon');
    expect(allCompanies.statusCode).toBe(200);
  });

  // Test all query strings passed and combine to return filtered list of companies
  test('All query strings returns combined filtered list of all companies', async function() {
    const filteredCompanies = await request(app).get(
      '/companies?search=goo&min_employees=9500&max_employees=11000'
    );

    // make sure list returns correct number of companies, name is expected of first, and response code
    expect(filteredCompanies.body.companies.length).toBe(1);
    expect(filteredCompanies.body.companies[0].name).toBe('Google');
    expect(filteredCompanies.statusCode).toBe(200);
  });

  // Test return error if min employees > max employees
  test('Return error if min employees > max employees', async function() {
    const invalidMinMax = await request(app).get(
      '/companies?min_employees=9000&max_employees=6000'
    );

    // Validate error message and status code
    expect(invalidMinMax.body.message).toBe(
      'Min employees must be less than or equal to max employees'
    );
    expect(invalidMinMax.statusCode).toBe(400);
  });
});

// Test POST request to /companies
describe('POST /companies', function() {
  // Test posting valid company
  test('Post with valid company returns all the company information', async function() {
    const newCompany = await request(app)
      .post('/companies')
      .send({
        handle: 'FB',
        name: 'Facebook',
        num_employees: 7000,
        description: 'Social network'
      });

    // Validate company name and status code are expected
    expect(newCompany.body.company.name).toBe('Facebook');
    expect(newCompany.statusCode).toBe(200);
  });

  // Test with invalid fields
  test('Post with invalid fields returns errors', async function() {
    const invalidCompany = await request(app)
      .post('/companies')
      .send({
        name: 'Facebook',
        num_employees: '7000',
        description: 'Social network',
        logo_url: 'http://facebook.com'
      });

    // Validate error message and status code
    expect(invalidCompany.body.message).toEqual([
      'instance requires property "handle"',
      'instance.num_employees is not of a type(s) integer'
    ]);
    expect(invalidCompany.statusCode).toBe(400);
  });
});

// Test GET request to /companies/:handle
describe('GET /companies/:handle', function() {
  // Test retrieving company info with valid handle
  test('Retrieve company name and handle by valid handle', async function() {
    const specificCompany = await request(app).get('/companies/GOOG');
    console.log(specificCompany.body);
    // Validate company name and status code are expected
    expect(specificCompany.body.company.name).toBe('Google');
    expect(specificCompany.statusCode).toBe(200);
  });

  // Test retrieving company with invalid handle
  test('Returns error if retrieve company by nonexisting handle', async function() {
    const invalidCompany = await request(app).get('/companies/AAPL');

    // Validate error message and status code
    expect(invalidCompany.body.message).toBe('Company does not exist');
    expect(invalidCompany.statusCode).toBe(404);
  });
});

// Test PATCH request to /companies/:handle
describe('PATCH /companies/:handle', function() {
  // Test updating company with valid handle
  test('Update company information by valid handle', async function() {
    const updatedCompany = await request(app)
      .patch('/companies/NFLX')
      .send({
        num_employees: 8000
      });

    // Validate company name remains same, updated field is updated,and status code are expected
    expect(updatedCompany.body.company.name).toBe('Netflix');
    expect(updatedCompany.body.company.num_employees).toBe(8000);
    expect(updatedCompany.statusCode).toBe(200);
  });

  // Test updating company with invalid handle
  test('Returns error if update company with nonexisting handle', async function() {
    const invalidCompany = await request(app)
      .patch('/companies/AAPL')
      .send({
        num_employees: 8000
      });

    // Validate error message and status code
    expect(invalidCompany.body.message).toBe('Company does not exist');
    expect(invalidCompany.statusCode).toBe(404);
  });

  // Test updating company with invalid inputs
  test('Returns error if update existing company with invalid inputs', async function() {
    const invalidCompany = await request(app)
      .patch('/companies/NFLX')
      .send({
        num_employees: '8000'
      });

    // Validate error message and status code
    expect(invalidCompany.body.message).toEqual([
      'instance.num_employees is not of a type(s) integer'
    ]);
    expect(invalidCompany.statusCode).toBe(400);
  });
});

// Test DELETE request to /companies/:handle
describe('DELETE /companies/:handle', function() {
  // Test deleting company with valid handle
  test('Delete company with valid handle', async function() {
    const deletedCompany = await request(app).delete('/companies/NFLX');

    // Validate delete message and status code
    expect(deletedCompany.body.message).toBe('Company deleted! :(');
    expect(deletedCompany.statusCode).toBe(200);
  });

  // Test deleting company with invalid handle
  test('Returns error if delete company with nonexistent handle', async function() {
    const invalidCompany = await request(app).delete('/companies/AAPL');

    // Validate error message
    expect(invalidCompany.body.message).toBe('Company does not exist');
    expect(invalidCompany.statusCode).toBe(404);
  });
});
