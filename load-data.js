#!/usr/bin/env node
import 'dotenv/config.js'

import process from 'node:process'
import {createGunzip} from 'node:zlib'
import {Transform, Readable} from 'node:stream'
import {finished} from 'node:stream/promises'
import {createReadStream} from 'node:fs'
import fetch from 'node-fetch'
import {HttpsProxyAgent} from 'https-proxy-agent'
import async from 'async'

import {createParser} from '@etalab/fantoir-parser'
import mongo from './lib/mongo.js'

const {
  HTTP_PROXY,
} = process.env

const FANTOIR_PATH = process.env.FANTOIR_PATH || 'https://adresse.data.gouv.fr/data/fantoir/latest'
const TERRITOIRES = process.env.TERRITOIRES ? process.env.TERRITOIRES.split(',') : undefined

async function createFantoirStream() {
  if (FANTOIR_PATH.startsWith('http')) {
    const agent = HTTP_PROXY ? new HttpsProxyAgent(HTTP_PROXY) : undefined
    const response = await fetch(FANTOIR_PATH, {agent})

    if (!response.ok) {
      throw new Error(`Failed to fetch ${FANTOIR_PATH}: ${response.status} ${response.statusText}`)
    }

    return Readable.from(response.body)
  }

  return createReadStream(FANTOIR_PATH)
}

function conformToTerritoiresConfig(codeCommune) {
  if (!TERRITOIRES) {
    return true
  }

  return TERRITOIRES.some(codeTerritoire => codeCommune.startsWith(codeTerritoire))
}

function createLoader(mongo) {
  const communes = []
  let currentCommune
  let currentVoies = []

  // Create an async queue with concurrency = 1 (one task at a time)
  const dbQueue = async.queue(async (task, done) => {
    try {
      await task()
      done()
    } catch (error) {
      done(error)
    }
  }, 1)

  const insertVoies = async (voies, codeCommune) => {
    if (voies.length > 0) {
      console.log(`Inserting ${voies.length} voies for commune ${codeCommune}`)
      await mongo.db.collection('voies').insertMany(voies)
    }
  }

  const insertCommunes = async communesToInsert => {
    if (communesToInsert.length > 0) {
      console.log(`Inserting ${communesToInsert.length} communes`)
      await mongo.db.collection('communes').insertMany(communesToInsert)
    }
  }

  return new Transform({
    transform(item, enc, cb) {
      if (item.type === 'voie') {
        currentVoies.push(item)
        cb()
      }

      if (item.type === 'commune') {
        try {
          if (currentCommune && conformToTerritoiresConfig(currentCommune.codeCommune) && currentVoies.length > 0) {
            const voiesCopy = [...currentVoies]
            const communeCopy = {...currentCommune}
            dbQueue.push(() => insertVoies(voiesCopy, communeCopy.codeCommune))
          }

          currentCommune = item
          communes.push(item)
          currentVoies = []
          cb()
        } catch (error) {
          cb(error)
        }
      }
    },

    flush(cb) {
      try {
        if (currentCommune && conformToTerritoiresConfig(currentCommune.codeCommune) && currentVoies.length > 0) {
          const voiesCopy = [...currentVoies]
          const communeCopy = {...currentCommune}
          dbQueue.push(() => insertVoies(voiesCopy, communeCopy.codeCommune))
        }

        if (communes.length > 0) {
          const communesCopy = [...communes]
          dbQueue.push(() => insertCommunes(communesCopy))
        }

        dbQueue.drain(cb)
      } catch (error) {
        cb(error)
      }
    },

    objectMode: true
  })
}

async function main() {
  // Connect to database
  await mongo.connect()

  // Cleaning existing collections
  await mongo.db.collection('voies').deleteMany({})
  await mongo.db.collection('communes').deleteMany({})

  const loader = createLoader(mongo)

  const fantoirStream = await createFantoirStream()
  fantoirStream
    .pipe(createGunzip())
    .pipe(createParser({accept: ['commune', 'voie']}))
    .pipe(loader)

  await finished(loader, {readable: false})
  await mongo.disconnect()

  process.exit(0)
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
