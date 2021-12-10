const {MongoClient, ObjectId} = require('mongodb')

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost'
const MONGODB_DBNAME = process.env.MONGODB_DBNAME || 'api-fantoir'

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
  }

  async disconnect(force) {
    const {client} = this
    this.client = undefined
    this.db = undefined
    return client.close(force)
  }
}

module.exports = new Mongo()
module.exports.ObjectId = ObjectId
