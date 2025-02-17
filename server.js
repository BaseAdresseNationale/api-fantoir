#!/usr/bin/env node
import 'dotenv/config.js'

import express from 'express'
import morgan from 'morgan'
import cors from 'cors'

import mongo from './lib/mongo.js'
import w from './lib/w.js'
import errorHandler from './lib/error-handler.js'
import {listCommunes, showCommune, listVoies, listVoiesCsv, showVoie, health} from './lib/routes.js'

function createServer() {
  const app = express()

  // Enable server log when not in production mode
  if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'))
  }

  // Enable CORS headers and routes
  app.use(cors({origin: true}))

  /* Define routes */
  app.get('/health', w(health)) 
  app.get('/departements/:codeDepartement/communes', w(listCommunes))
  app.get('/communes/:codeCommune', w(showCommune))
  app.get('/communes/:codeCommune/voies', w(listVoies))
  app.get('/communes/:codeCommune/voies.csv', w(listVoiesCsv))
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
  server.listen(port, () => {
    console.log(`Start listening on port ${port}`)
  })
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
