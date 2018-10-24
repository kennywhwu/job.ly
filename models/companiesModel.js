const db = require('../db');

/** Collection of related methods for companies. */

class Company {
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
}

module.exports = Company;
