const db = require('../db');
const partialUpdate = require('../helpers/partialUpdate');

/** Collection of related methods for companies. */

class Job {
  // Error handler if identifying job that doesn't exist in database
  static _404_errorIfNotFound(results) {
    if (results.rows.length === 0) {
      let error = new Error(`Job does not exist`);
      error.status = 404;
      throw error;
    }
  }

  // Error handler if cannot return any general selection (query result is undefined)
  static _404_errorIfUndefined(results) {
    if (!results) {
      let error = new Error(`Jobs not returned`);
      error.status = 404;
      throw error;
    }
  }

  // Create method to insert new job into database and return inserted job data
  // {
  // "title": "Software Developer",
  // "salary": 300000,
  // "equity": 0.01,
  // "company_handle":"RITHM"
  // }
  // =>
  // {
  // "title": "Software Developer",
  // "salary": 300000,
  // "equity": 0.01,
  // "company_handle":"RITHM"
  // }
  static async create({ title, salary, equity, company_handle, date_posted }) {
    const result = await db.query(
      `INSERT INTO jobs (
            title,
            salary,
            equity,
            company_handle,
            date_posted) 
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) 
         RETURNING title,
         salary,
         equity,
         company_handle,
         date_posted`,
      [title, salary, equity, company_handle]
    );
    this._404_errorIfUndefined(result);
    return result.rows[0];
  }
}

module.exports = Job;
