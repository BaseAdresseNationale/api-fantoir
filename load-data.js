#!/usr/bin/env node
import 'dotenv/config.js'

import {createGunzip} from 'node:zlib'
import {Transform} from 'node:stream'
import {finished} from 'node:stream/promises'

import got from 'got'
import {createParser} from '@etalab/fantoir-parser'
import mongo from './lib/mongo.js'

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
          if (currentCommune) {
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
        if (currentCommune) {
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

  got.stream('https://adresse.data.gouv.fr/data/fantoir/latest')
    .pipe(createGunzip())
    .pipe(createParser({accept: ['commune', 'voie']}))
    .pipe(loader)

  await finished(loader)
  await mongo.disconnect()

  process.exit(0)
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
