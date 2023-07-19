const mongoose = require('mongoose')

const Schema = mongoose.Schema

const rosterSchema = new Schema({
	teamId: { type: String, required: true },
})

module.exports = mongoose.model('Roster', rosterSchema)
