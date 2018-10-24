const db = require('../db');
const partialUpdate = require('../helpers/partialUpdate');

/** Collection of related methods for companies. */

class Company {
  static _404Error(results) {
    if (results.rows.length === 0) {
      let error = new Error(`Company does not exist.`);
      error.status = 404;
      throw error;
    }
  }

  /** given query strings, return list of companies from database that fulfill requirements */
  static async filterAll({ search, min_employees, max_employees }) {
    const BASE_QUERY = `SELECT handle,
                               name
                        FROM companies`;

    let whereQuery = '';
    let searchQuery = '';
    let minQuery = '';
    let maxQuery = '';

    let idx = 1;
    let columns = [];
    let queryArray = [];

    if (search || min_employees || max_employees) {
      whereQuery = ' WHERE ';
    }
    if (search) {
      searchQuery = `name ILIKE $${idx}`;
      idx++;
      columns.push(`%${search}%`);
      queryArray.push(searchQuery);
    }
    if (min_employees) {
      minQuery = `num_employees >= $${idx}`;
      idx++;
      columns.push(min_employees);
      queryArray.push(minQuery);
    }
    if (max_employees) {
      maxQuery = `num_employees <= $${idx}`;
      idx++;
      columns.push(max_employees);
      queryArray.push(maxQuery);
    }

    let filterJoinString = '';
    for (let i = 0; i < queryArray.length; i++) {
      filterJoinString += queryArray[i] + ' and ';
    }

    const filterQuery = filterJoinString.slice(0, filterJoinString.length - 5);
    const finalQuery = BASE_QUERY + whereQuery + filterQuery;

    const companiesResult = await db.query(finalQuery, columns);

    return companiesResult.rows;
  }

  // Create method to insert new company into database and return inserted company name and handle
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
  //   "name": "Netflix"
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
    this._404Error(result);
    return result.rows[0];
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
    this._404Error(result);
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
    this._404Error(result);
    return;
  }
}

module.exports = Company;
