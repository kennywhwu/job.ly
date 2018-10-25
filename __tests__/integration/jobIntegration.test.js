/* Integration tests for job routes */

process.env.NODE_ENV = 'test'; // make sure we use test db!

const db = require('../../db');
const request = require('supertest');
const app = require('../../app');
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
  // delete seed data
  await db.query('DELETE FROM jobs');
  await db.query('DELETE FROM companies');
});

afterAll(async function() {
  // close connection to DB
  await db.end();
});

// Test GET request to /jobs
describe('GET /jobs', function() {
  // Test no query strings passed
  test('No query strings returns list of all jobs', async function() {
    const allJobs = await request(app).get('/jobs');

    // make sure list returns correct number of jobs, title is expected of first, and response code
    expect(allJobs.body.jobs.length).toBe(3);
    expect(allJobs.body.jobs[0].title).toBe('Back End');
    expect(allJobs.statusCode).toBe(200);
  });

  // Test all query strings passed and combine to return filtered list of jobs
  test('All query strings returns combined filtered list of all jobs', async function() {
    const filteredJobs = await request(app).get(
      '/jobs?search=back&min_salary=550000&min_equity=0.2'
    );

    // make sure list returns correct number of jobs, title is expected of first, and response code
    expect(filteredJobs.body.jobs.length).toBe(1);
    expect(filteredJobs.body.jobs[0].title).toBe('Back End2');
    expect(filteredJobs.statusCode).toBe(200);
  });

  // Test search with query strings passed for jobs that don't exist
  test('All query strings returns combined filtered list of all jobs', async function() {
    const filteredJobs = await request(app).get(
      '/jobs?search=fro&min_salary=1000000&min_equity=0.2'
    );

    // Validate error message and status code
    expect(filteredJobs.body.message).toEqual('Job does not exist');
    expect(filteredJobs.statusCode).toBe(404);
  });
});

// Test POST request to /jobs
describe('POST /jobs', function() {
  // Test posting valid job
  test('Post with valid job returns all the job information', async function() {
    const newJob = await request(app)
      .post('/jobs')
      .send({
        title: 'Software Developer',
        salary: 200000,
        equity: 0.03,
        company_handle: 'AMZN'
      });
    // Validate job title and status code are expected
    expect(newJob.body.job.title).toBe('Software Developer');
    expect(newJob.statusCode).toBe(200);
  });

  // Test with invalid fields
  test('Post with invalid fields returns errors', async function() {
    const invalidJob = await request(app)
      .post('/jobs')
      .send({
        title: 'Software Developer',
        salary: '200000',
        equity: -0.03,
        company_handle: 'AMZN'
      });

    // Validate error message and status code
    expect(invalidJob.body.message).toEqual([
      'instance.salary is not of a type(s) integer'
    ]);
    expect(invalidJob.statusCode).toBe(400);
  });

  // Test GET request to /jobs/:id
  describe('GET /jobs/:id', function() {
    // Test retrieving job info with valid id
    test('Retrieve job title and id by valid id', async function() {
      const specificJob = await request(app).get('/jobs/1');

      // Validate job title and status code are expected
      expect(specificJob.body.job.title).toBe('Back End');
      expect(specificJob.statusCode).toBe(200);
    });

    // Test retrieving job with invalid id integer
    test('Returns error if retrieve job by nonexisting id', async function() {
      const invalidJob = await request(app).get('/jobs/5');

      // Validate error message and status code
      expect(invalidJob.body.message).toBe('Job does not exist');
      expect(invalidJob.statusCode).toBe(404);
    });

    // Test retrieving job with non-integer id
    test('Returns error if retrieve job by nonexisting id', async function() {
      const invalidJob = await request(app).get('/jobs/AAPL');

      // Validate error message and status code
      expect(invalidJob.body.message).toBe(
        'invalid input syntax for integer: "AAPL"'
      );
      expect(invalidJob.statusCode).toBe(500);
    });
  });

  // Test PATCH request to /jobs/:id
  describe('PATCH /jobs/:id', function() {
    // Test updating job with valid id
    test('Update job information by valid id', async function() {
      const updatedJob = await request(app)
        .patch('/jobs/1')
        .send({
          salary: 8000
        });

      // Validate job title remains same, updated field is updated,and status code are expected
      expect(updatedJob.body.job.title).toBe('Back End');
      expect(updatedJob.body.job.salary).toBe(8000);
      expect(updatedJob.statusCode).toBe(200);
    });

    // Test updating job with invalid id
    test('Returns error if update job with nonexisting id', async function() {
      const invalidJob = await request(app)
        .patch('/jobs/5')
        .send({
          salary: 8000
        });

      // Validate error message and status code
      expect(invalidJob.body.message).toBe('Job does not exist');
      expect(invalidJob.statusCode).toBe(404);
    });

    // Test updating job with invalid inputs
    test('Returns error if update existing job with invalid inputs', async function() {
      const invalidJob = await request(app)
        .patch('/jobs/1')
        .send({
          salary: '8000'
        });

      // Validate error message and status code
      expect(invalidJob.body.message).toEqual([
        'instance.salary is not of a type(s) integer'
      ]);
      expect(invalidJob.statusCode).toBe(400);
    });
  });

  // Test DELETE request to /jobs/:id
  describe('DELETE /jobs/:id', function() {
    // Test deleting job with valid id
    test('Delete job with valid id', async function() {
      const deletedJob = await request(app).delete('/jobs/1');

      // Validate delete message and status code
      expect(deletedJob.body.message).toBe('Job deleted! :(');
      expect(deletedJob.statusCode).toBe(200);
    });

    // Test deleting job with invalid id
    test('Returns error if delete job with nonexistent id', async function() {
      const invalidJob = await request(app).delete('/jobs/5');

      // Validate error message
      expect(invalidJob.body.message).toBe('Job does not exist');
      expect(invalidJob.statusCode).toBe(404);
    });
  });
});
