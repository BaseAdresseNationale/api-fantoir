#!/usr/bin/env node
require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const mongo = require('./lib/mongo')
const w = require('./lib/w')
const errorHandler = require('./lib/error-handler')
const {listCommunes, showCommune, listVoies, showVoie} = require('./lib/routes')

function createServer() {
  const app = express()

  // Enable server log when not in production mode
  if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'))
  }

  // Enable CORS headers and routes
  app.use(cors({origin: true}))

  /* Define routes */
  app.get('/departements/:codeDepartement/communes', w(listCommunes))
  app.get('/communes/:codeCommune', w(showCommune))
  app.get('/communes/:codeCommune/voies', w(listVoies))
  app.get('/voies/:idVoie', w(showVoie))
  app.get('/communes/:codeCommune/voies/:codeVoie', w(showVoie))

  // Setup error handler
  app.use(errorHandler)

  return app
}

async function main() {
  // Connect to database
  await mongo.connect()

  // Create server
  const server = createServer()

  // Start listening
  const port = process.env.PORT || 5000
  server.listen(5000, () => {
    console.log(`Start listening on port ${port}`)
  })
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
