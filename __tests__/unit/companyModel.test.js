process.env.NODE_ENV = 'test'; // make sure we use test db!

const db = require('../../db');
const request = require('supertest');
const app = require('../../app');
const Company = require('../../models/companiesModel');

beforeEach(async function() {
  // seed with some data
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
      'http://netflix.com')`
  );
});

afterEach(async function() {
  await db.query('DELETE FROM companies');
});

afterAll(async function() {
  // close connection to DB
  await db.end();
});

describe('filterAll()', () => {
  it('should generate a list of company objects with handle and name', function() {
    // Test no query string parameters passed
    expect(Company.filterAll({})).toEqual({
      query:
        'UPDATE companies SET description=$1, logo_url=$2 WHERE handle=$3 RETURNING *',
      values: ['Doing great!', 'http://netflix.com', 'NFLX']
    });
  });
});
