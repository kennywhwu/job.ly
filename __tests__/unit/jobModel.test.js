/* Unit tests for methods on Job Model */

process.env.NODE_ENV = 'test'; // make sure we use test db!

const db = require('../../db');
const Job = require('../../models/jobsModel');

beforeEach(async function() {
  // seed with some data
  await db.query('DELETE FROM jobs');
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
  await db.query(
    `INSERT INTO jobs 
      (id,
      title,
      salary,
      equity,
      company_handle) 
    VALUES 
      (1,
      'Back End',
      500000,
      0.1,
      'GOOG'),
      (2,
      'Back End2',
      600000,
      0.5,
      'NFLX'),
      (3,
      'Front End',
      100000,
      0.005,
      'NFLX')`
  );
});

afterEach(async function() {
  // delete all seeded data
  await db.query('DELETE FROM jobs');
  await db.query('DELETE FROM companies');
});

afterAll(async function() {
  // close connection to DB
  await db.end();
});

// Test buildQuery method returns built out query and column of parameters
describe('buildQuery()', () => {
  it('should generate a query to return list of job title and company handles filtered by passed in parameters', async function() {
    // Test no query string parameters passed
    expect(await Job._buildQuery({})).toEqual({
      query: `SELECT title, company_handle FROM jobs ORDER BY title`,
      columns: []
    });
    // Test query string parameters passed
    expect(
      await Job._buildQuery({
        search: 'fro',
        min_salary: 500,
        min_equity: 0.05
      })
    ).toEqual({
      query: `SELECT title, company_handle FROM jobs WHERE title ILIKE $1 AND salary >= $2 AND equity >= $3 ORDER BY title`,
      columns: ['%fro%', 500, 0.05]
    });
  });
});

// Test filterAndListJobs method returns list of job objects with title and company_handle
describe('filterAndListJobs()', () => {
  it('should generate a list of job objects with title and company_handle', async function() {
    // Test no query string parameters passed
    expect(await Job.filterAndListJobs({})).toEqual([
      { title: 'Back End', company_handle: 'GOOG' },
      { title: 'Back End2', company_handle: 'NFLX' },
      { title: 'Front End', company_handle: 'NFLX' }
    ]);

    // Test search query string parameter passed
    expect(await Job.filterAndListJobs({ search: 'bac' })).toEqual([
      { title: 'Back End', company_handle: 'GOOG' },
      { title: 'Back End2', company_handle: 'NFLX' }
    ]);

    // Test min_salary query string parameter passed
    expect(await Job.filterAndListJobs({ min_salary: 120000 })).toEqual([
      { title: 'Back End', company_handle: 'GOOG' },
      { title: 'Back End2', company_handle: 'NFLX' }
    ]);

    // Test min_equity query string parameter passed
    expect(await Job.filterAndListJobs({ min_equity: 0.2 })).toEqual([
      { title: 'Back End2', company_handle: 'NFLX' }
    ]);

    // Test all query string parameter passed
    expect(
      await Job.filterAndListJobs({
        search: '2',
        min_salary: 200000,
        min_equity: 0.2
      })
    ).toEqual([{ title: 'Back End2', company_handle: 'NFLX' }]);

    // Test when no qualified job is found
    // HELPPPPPP

    // let result = await Job.filterAndListJobs({
    //   min_salary: 1000000,
    //   min_equity: 0.2
    // });

    // let errorFunction = async function() {
    //   return await Job.filterAndListJobs({
    //     min_salary: 1000000,
    //     min_equity: 0.2
    //   });
    // };

    // console.log('error result', result);
    // expect(result).toEqual(`Job does not exist`);
    // expect(errorFunction).toThrowError(`Job does not exist`);
  });
});

// test('error thrown', () => {
//   async function throwError() {
//     await Job.filterAndListJobs({
//       min_salary: 1000000,
//       min_equity: 0.2
//     });
//   }

//   expect(throwError).toThrow();
// });
