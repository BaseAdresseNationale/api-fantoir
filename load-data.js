#!/usr/bin/env node
import 'dotenv/config.js'

import process from 'node:process'
import {createGunzip} from 'node:zlib'
import {Transform} from 'node:stream'
import {finished} from 'node:stream/promises'
import {createReadStream} from 'node:fs'

import got from 'got'
import {createParser} from '@etalab/fantoir-parser'
import mongo from './lib/mongo.js'

const FANTOIR_PATH = process.env.FANTOIR_PATH || 'https://adresse.data.gouv.fr/data/fantoir/latest'
const TERRITOIRES = process.env.TERRITOIRES ? process.env.TERRITOIRES.split(',') : undefined

function createFantoirStream() {
  if (FANTOIR_PATH.startsWith('http')) {
    return got.stream(FANTOIR_PATH)
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
  let currentVoies

  return new Transform({
    async transform(item, enc, cb) {
      if (item.type === 'voie') {
        currentVoies.push(item)
        cb()
      }

      if (item.type === 'commune') {
        try {
          if (currentCommune && conformToTerritoiresConfig(currentCommune.codeCommune) && currentVoies.length > 0) {
            console.log(`Inserting ${currentCommune.codeCommune}`)
            await mongo.db.collection('voies').insertMany(currentVoies)
          }

          currentVoies = []
          currentCommune = item
          communes.push(item)
          cb()
        } catch (error) {
          cb(error)
        }
      }
    },

    async flush(cb) {
      try {
        if (currentCommune && conformToTerritoiresConfig(currentCommune.codeCommune) && currentVoies.length > 0) {
          console.log(`Inserting ${currentCommune.codeCommune}`)
          await mongo.db.collection('voies').insertMany(currentVoies)
        }

        await mongo.db.collection('communes').insertMany(communes)
        cb()
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

  createFantoirStream()
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
