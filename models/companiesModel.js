const db = require('../db');
const partialUpdate = require('../helpers/partialUpdate');

/** Collection of related methods for companies. */

class Company {
  // Error handler if identifying job that doesn't exist in database
  static _404_errorIfNotFound(results) {
    if (results.rows.length === 0) {
      let error = new Error(`Company does not exist`);
      error.status = 404;
      throw error;
    }
  }

  // Build out SQL query depending on which query string parameters are passed in
  static _buildQuery({ search, min_employees, max_employees }) {
    const BASE_QUERY = 'SELECT handle, name FROM companies';
    const ORDER_QUERY = ' ORDER BY handle';

    let whereQuery = '';

    let idx = 1;
    let columns = [];
    let queryArray = [];

    // Set query parts depending on which were fed into function
    if (search || min_employees || max_employees) {
      whereQuery = ' WHERE ';
    }
    if (search) {
      let searchQuery = `name ILIKE $${idx}`;
      idx++;
      columns.push(`%${search}%`);
      queryArray.push(searchQuery);
    }
    if (min_employees) {
      let minQuery = `num_employees >= $${idx}`;
      idx++;
      columns.push(min_employees);
      queryArray.push(minQuery);
    }
    if (max_employees) {
      let maxQuery = `num_employees <= $${idx}`;
      idx++;
      columns.push(max_employees);
      queryArray.push(maxQuery);
    }

    // Combine the query strings for filtering in SQL WHERE clause
    let filterQuery = queryArray.join(' AND ');
    // Combine all query parts
    const finalQuery = BASE_QUERY + whereQuery + filterQuery + ORDER_QUERY;
    return { query: finalQuery, columns };
  }

  /** given query strings, return list of companies from database that fulfill requirements */
  static async filterAndListCompanies(queryObject) {
    const { query, columns } = this._buildQuery(queryObject);
    const companiesResult = await db.query(query, columns);
    return companiesResult.rows;
  }

  // Create method to insert new company into database and return inserted company data
  // {
  //   "handle": "NFLX"
  //   "name": "Netflix",
  //   "num_employees": 5000,
  //   "description": "Media-streaming company",
  //   "logo_url": "http://netflix.com"
  // }
  // =>
  // {
  //   "handle": "NFLX"
  //   "name": "Netflix",
  //   "num_employees": 5000,
  //   "description": "Media-streaming company",
  //   "logo_url": "http://netflix.com"
  // }
  static async create({ handle, name, num_employees, description, logo_url }) {
    const result = await db.query(
      `INSERT INTO companies (
            handle,
            name,
            num_employees,
            description,
            logo_url) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING handle,
         name,
         num_employees,
         description,
         logo_url`,
      [handle, name, num_employees, description, logo_url]
    );
    return result.rows[0];
  }

  // Retrieve company from database by handle
  // 'NFLX'
  // =>
  // {
  //   "handle": "NFLX"
  //   "name": "Netflix"
  // }
  static async getOne(handle) {
    const result = await db.query(
      `SELECT handle,
              name
        FROM companies
        WHERE handle = $1
      `,
      [handle]
    );
    this._404_errorIfNotFound(result);
    return result.rows[0];
  }

  static async getOne(handle) {
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
        FROM companies c
        LEFT JOIN jobs j
          ON c.handle = j.company_handle
        WHERE c.handle = $1
      `,
      [handle]
    );
    this._404_errorIfNotFound(result);
    let { name, num_employees, description, logo_url } = result.rows[0];

    let jobArray;
    if (result.rows[0].id === null) {
      jobArray = [];
    } else {
      jobArray = result.rows.map(j => ({
        id: j.id,
        title: j.title,
        salary: j.salary,
        equity: j.equity,
        date_posted: j.date_posted
      }));
    }

    let companyObject = {
      handle,
      name,
      num_employees,
      description,
      logo_url,
      jobs: jobArray
    };
    return companyObject;
  }

  // Update company information by handle in database, only for columns specified
  // ('NFLX',
  // {
  //   "name": "Netflix",
  //   "num_employees": 4000,
  //   "description": "Media-streaming company",
  //   "logo_url": "http://netflix.com"
  // }
  // =>
  // {
  //   "name": "Netflix",
  //   "num_employees": 4000,
  //   "description": "Media-streaming company",
  //   "logo_url": "http://netflix.com"
  // }
  static async update(handle, items) {
    const { query, values } = partialUpdate(
      'companies',
      items,
      'handle',
      handle
    );
    const result = await db.query(query, values);
    this._404_errorIfNotFound(result);
    return result.rows[0];
  }

  // Delete company by handle from database
  // 'NFLX' => don't return anything
  static async delete(handle) {
    const result = await db.query(
      `DELETE
        FROM companies
        WHERE handle = $1
        RETURNING handle
      `,
      [handle]
    );
    this._404_errorIfNotFound(result);
    return;
  }
}

module.exports = Company;
