#!/usr/bin/env node
require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const mongo = require('./lib/mongo')

function createServer() {
  const app = express()

  // Enable server log when not in production mode
  if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'))
  }

  // Enable CORS headers and routes
  app.use(cors({origin: true}))

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
