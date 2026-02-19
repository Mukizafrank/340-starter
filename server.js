//* ******************************************
//  This server.js file is the primary file of the 
//* application. It is used to control the project.
// *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const path = require("path")
const bodyParser = require("body-parser")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const accountRoute = require("./routes/accountRoute")
const favoritesRoute = require("./routes/favoritesRoute")
const utilities = require("./utilities/")
const session = require("express-session")
const pool = require('./database/')
const cookieParser = require("cookie-parser")

/* ***********************
 * Middleware
 * ************************/
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET || "secret",
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))


// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res)
  next()
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(cookieParser())
app.use(utilities.checkJWTToken)



/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root

/* ***********************
 * Static File Routes
 *************************/
// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')))
app.use('/css', express.static(path.join(__dirname, 'public/css')))
app.use('/js', express.static(path.join(__dirname, 'public/js')))
app.use('/images', express.static(path.join(__dirname, 'public/images')))

/* ***********************
 * Routes
 *************************/
// Home route with error handling
app.get("/", utilities.handleErrors(baseController.buildHome))

// Inventory routes
app.use("/inv", inventoryRoute)
// Account routes
app.use("/account", accountRoute)
// Favorites routes
app.use("/favorites", favoritesRoute)

/* ***********************
 * Permanent 500 Error Route
 * This route always returns a 500 Server Error
 *************************/
app.get("/trigger-error", (req, res, next) => {
  // Create a permanent 500 Server Error
  const error = new Error("500 - Internal Server Error")
  error.status = 500

  // Detailed error information
  error.details = {
    message: "Server encountered an unexpected condition",
    code: "INTERNAL_SERVER_ERROR",
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  }

  // This will always throw a 500 error - not a test
  next(error)
})

// File Not Found Route - MUST BE LAST ROUTE IN LIST
app.use(async (req, res, next) => {
  console.log(`404: Route not found - ${req.originalUrl}`)
  const error = new Error(`Sorry, the page "${req.originalUrl}" was not found.`)
  error.status = 404
  next(error)
})

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  try {
    // Get navigation with current request
    const nav = await utilities.getNav(req)

    // Log the error with details
    console.error(`[${err.status || 500}] ${req.method} ${req.originalUrl}`)
    console.error(`Message: ${err.message}`)

    // Determine status code
    const statusCode = err.status || 500

    // Handle 404 errors - render errors/error.ejs
    if (statusCode === 404) {
      return res.status(404).render("errors/error", {
        title: "404 - Page Not Found",
        message: err.message,
        nav: nav,
        statusCode: 404,
        is404Error: true,
        originalUrl: req.originalUrl
      })
    }

    // Handle 500 errors - render errors/500error.ejs
    if (statusCode === 500) {
      return res.status(500).render("errors/500error", {
        title: "500 - Internal Server Error",
        message: "The server encountered an unexpected condition.",
        nav: nav,
        errorDetails: err.details || null,
        originalUrl: req.originalUrl
      })
    }

    // For other errors, use the generic error template
    res.status(statusCode).render("errors/error", {
      title: `${statusCode} Error`,
      message: err.message,
      nav: nav,
      statusCode: statusCode,
      originalUrl: req.originalUrl
    })
  } catch (handlerError) {
    // Fallback if error handler itself fails
    console.error("Error handler failed:", handlerError)
    res.status(500).send(`
      <h1>500 - Critical Error</h1>
      <p>An error occurred, and the error handler also failed.</p>
      <p><a href="/">Return to Home Page</a></p>
    `)
  }
})

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 3000
const host = process.env.HOST || "localhost"

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
  console.log(`Public folder path: ${path.join(__dirname, 'public')}`)
})