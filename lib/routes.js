const createError = require('http-errors')
const mongo = require('./mongo')

async function listCommunes(req, res) {
  const {codeDepartement} = req.params

  const communes = await mongo.db.collection('communes')
    .find({codeDepartement})
    .project({_id: 0})
    .toArray()

  res.send(communes)
}

async function showCommune(req, res) {
  const {codeCommune} = req.params

  const commune = await mongo.db.collection('communes')
    .findOne({codeCommune}, {projection: {_id: 0, codeDepartement: 0}})

  if (!commune) {
    throw createError(404, 'Commune non trouvée')
  }

  res.send(commune)
}

async function listVoies(req, res) {
  const {codeCommune} = req.params

  const voies = await mongo.db.collection('voies')
    .find({codeCommune})
    .project({_id: 0, codeCommune: 0, codeDepartement: 0})
    .toArray()

  res.send(voies)
}

async function showVoie(req, res) {
  const idVoie = req.params.idVoie || `${req.params.codeCommune}-${req.params.codeVoie}`

  const voie = await mongo.db.collection('voies')
    .findOne({id: idVoie}, {projection: {_id: 0, codeCommune: 0, codeDepartement: 0}})

  if (!voie) {
    throw createError(404, 'Voie ou lieu-dit non trouvé')
  }

  res.send(voie)
}

module.exports = {
  listCommunes,
  showCommune,
  listVoies,
  showVoie
}
