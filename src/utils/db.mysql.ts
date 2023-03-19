import {createPool, Pool} from 'mysql';
import dotenv from 'dotenv';

dotenv.config({path: `.env.${process.env.NODE_ENV}`});

let pool: Pool;

/**
 * generates pool connection to be used throughout the app
 */
export const init = () => {
  try {
    pool = createPool({
      connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT),
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USERNAME,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DB,
    });

    console.debug('MySql Adapter Pool generated successfully');
  } catch (error) {
    console.error('[mysql.connector][init][Error]: ', error);
    throw new Error('failed to initialized pool');
  }
};

/**
 * executes SQL queries in MySQL db
 *
 * @param {string} query - provide a valid SQL query
 * @param {string[] | Object} params - provide the parameterized values used
 * in the query
 * @return {Promise<T>} the results of query
 */
export const execute = <T>(
  query: string,
  params: string[] | Object): Promise<T> => {
  try {
    if (!pool) {
      throw new Error('Pool was not created.');
    }

    return new Promise<T>((resolve, reject) => {
      pool.query(query, params, (error, results) => {
        if (error) reject(error);
        else resolve(results);
      });
    });
  } catch (error) {
    console.error('[mysql.connector][execute][Error]: ', error);
    throw new Error('failed to execute MySQL query');
  }
};
