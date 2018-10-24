/* Unit tests for methods on Company Model */

process.env.NODE_ENV = 'test'; // make sure we use test db!

const db = require('../../db');
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
  // delete all seeded data
  await db.query('DELETE FROM companies');
});

afterAll(async function() {
  // close connection to DB
  await db.end();
});

// Test buildQuery method returns built out query and column of parameters
describe('buildQuery()', () => {
  it('should generate a query to return list of company handles and names filtered by passed in parameters', async function() {
    // Test no query string parameters passed
    expect(await Company.buildQuery({})).toEqual({
      query: `SELECT handle, name FROM companies ORDER BY handle`,
      columns: []
    });
    // Test query string parameters passed
    expect(
      await Company.buildQuery({
        search: 'ama',
        min_employees: 7000,
        max_employees: 9500
      })
    ).toEqual({
      query: `SELECT handle, name FROM companies WHERE name ILIKE $1 AND num_employees >= $2 AND num_employees <= $3 ORDER BY handle`,
      columns: ['%ama%', 7000, 9500]
    });
  });
});

// Test filterAll method returns list of company objects with handle and name
describe('filterAll()', () => {
  it('should generate a list of company objects with handle and name', async function() {
    // Test no query string parameters passed
    expect(await Company.filterAll({})).toEqual([
      { handle: 'AMZN', name: 'Amazon' },
      { handle: 'GOOG', name: 'Google' },
      { handle: 'NFLX', name: 'Netflix' }
    ]);

    // Test search query string parameter passed
    expect(await Company.filterAll({ search: 'goo' })).toEqual([
      { handle: 'GOOG', name: 'Google' }
    ]);

    // Test min_employees query string parameter passed
    expect(await Company.filterAll({ min_employees: 6000 })).toEqual([
      { handle: 'AMZN', name: 'Amazon' },
      { handle: 'GOOG', name: 'Google' }
    ]);

    // Test max_employees query string parameter passed
    expect(await Company.filterAll({ max_employees: 9500 })).toEqual([
      { handle: 'AMZN', name: 'Amazon' },
      { handle: 'NFLX', name: 'Netflix' }
    ]);

    // Test all query string parameter passed
    expect(
      await Company.filterAll({
        seach: 'a',
        min_employees: 6000,
        max_employees: 9500
      })
    ).toEqual([{ handle: 'AMZN', name: 'Amazon' }]);

    //SHOULD WE TEST MIN EMPLOYEES HIGHER THAN MAX EMPLOYEES?
  });
});
