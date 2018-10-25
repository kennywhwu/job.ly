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

  // Build out SQL query depending on which query string parameters are passed in
  static _buildQuery({ search, min_salary, min_equity }) {
    const BASE_QUERY = 'SELECT id,title, company_handle FROM jobs';
    const ORDER_QUERY = ' ORDER BY title';

    let whereQuery = '';

    let idx = 1;
    let columns = [];
    let queryArray = [];

    // Set query parts depending on which were fed into function
    if (search || min_salary || min_equity) {
      whereQuery = ' WHERE ';
    }
    if (search) {
      let searchQuery = `title ILIKE $${idx}`;
      idx++;
      columns.push(`%${search}%`);
      queryArray.push(searchQuery);
    }
    if (min_salary) {
      let minSalaryQuery = `salary >= $${idx}`;
      idx++;
      columns.push(min_salary);
      queryArray.push(minSalaryQuery);
    }
    if (min_equity) {
      let minEquityQuery = `equity >= $${idx}`;
      idx++;
      columns.push(min_equity);
      queryArray.push(minEquityQuery);
    }

    // Combine the query strings for filtering in SQL WHERE clause
    let filterQuery = queryArray.join(' AND ');
    // Combine all query parts
    const finalQuery = BASE_QUERY + whereQuery + filterQuery + ORDER_QUERY;
    return { query: finalQuery, columns };
  }

  /** given query strings, return list of jobs from database that fulfill requirements */
  static async filterAndListJobs(queryObject) {
    const { query, columns } = this._buildQuery(queryObject);
    const jobResult = await db.query(query, columns);
    this._404_errorIfUndefined(jobResult);
    return jobResult.rows;
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

  // Retrieve job from database by id
  // 1
  // =>
  // {
  // 	"job": {
  // 		"id": "1",
  // 		"title": "Software Developer",
  // 		"salary": 300000,
  // 		"equity": 0.01,
  // 		"date_posted": "2018-10-24 16:38:08.262763-07",
  // 		"company": {
  // 			"handle": "RITHM",
  // 			"name": "Rithm School",
  // 			"num_employees": 14,
  // 			"description": null,
  // 			"logo_url": null
  // 		}
  // 	}
  // }
  static async getOne(id) {
    const result = await db.query(
      `SELECT j.id,
              j.title,
              j.salary,
              j.equity,
              j.date_posted,
              c.handle,
              c.name,
              c.num_employees,
              c.description,
              c.logo_url
        FROM jobs j
        JOIN companies c
          ON c.handle = j.company_handle
        WHERE j.id = $1
      `,
      [id]
    );
    this._404_errorIfNotFound(result);
    let {
      title,
      salary,
      equity,
      date_posted,
      handle,
      name,
      num_employees,
      description,
      logo_url
    } = result.rows[0];

    let jobObject = {
      id,
      title,
      salary,
      equity,
      date_posted,
      company: { handle, name, num_employees, description, logo_url }
    };
    return jobObject;
  }

  // Update job information by id in database, only for columns specified
  // (1,
  // {
  // "title": "Back End",
  // "salary": 600005,
  // "company_handle":"GOOG"
  // }
  // =>
  // {
  // "title": "Back End",
  // "salary": 600005,
  // "company_handle":"GOOG"
  // }
  static async update(id, items) {
    const { query, values } = partialUpdate('jobs', items, 'id', id);
    const result = await db.query(query, values);
    this._404_errorIfNotFound(result);
    return result.rows[0];
  }

  // Delete job by id from database
  // 1 => don't return anything
  static async delete(id) {
    const result = await db.query(
      `DELETE
        FROM jobs
        WHERE id = $1
        RETURNING id
      `,
      [id]
    );
    this._404_errorIfNotFound(result);
    return;
  }
}

module.exports = Job;
