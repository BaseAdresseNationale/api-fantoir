import {MongoClient, ObjectId} from 'mongodb'

const MONGODB_HOST = process.env.MONGODB_HOST || 'localhost'
const MONGODB_PORT = process.env.MONGODB_PORT || '27017'
const MONGODB_DBNAME = process.env.MONGODB_DBNAME || 'api-fantoir'

const MONGODB_USER = process.env.MONGODB_USER
const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD

let MONGODB_URL

if (MONGODB_USER && MONGODB_PASSWORD) {
  MONGODB_URL = `mongodb://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DBNAME}`
} else {
  MONGODB_URL = `mongodb://${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DBNAME}`
}

class Mongo {
  async connect(connectionString) {
    if (this.db) {
      throw new Error('mongo.connect() must not be called twice')
    }

    this.client = new MongoClient(connectionString || MONGODB_URL)
    await this.client.connect()
    this.dbName = MONGODB_DBNAME
    this.db = this.client.db(this.dbName)

    await this.createIndexes()
  }

  async createIndexes() {
    await this.db.collection('voies').createIndex({id: 1}, {unique: true})
    await this.db.collection('voies').createIndex({codeCommune: 1})

    await this.db.collection('communes').createIndex({id: 1}, {unique: true})
    await this.db.collection('communes').createIndex({codeCommune: 1}, {unique: true})
    await this.db.collection('communes').createIndex({codeDepartement: 1})
  }

  async disconnect(force) {
    const {client} = this
    this.client = undefined
    this.db = undefined
    return client.close(force)
  }
}

const mongo = new Mongo()
mongo.ObjectId = ObjectId

export default mongo
