const { Pool } = require("pg")
require("dotenv").config()

/* ***************
 * Connection Pool
 * SSL Object needed for local testing of app
 * *************** */
let pool
if (process.env.NODE_ENV == "development") {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  })
} else {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  })
}

// Intercept query to log it (optional, but keep it simple for now)
const originalQuery = pool.query;
pool.query = async function (text, params) {
  try {
    const res = await originalQuery.apply(this, [text, params]);
    // console.log("Executed query:", text);
    return res;
  } catch (error) {
    console.error("Error in query:", text);
    throw error;
  }
};

module.exports = pool