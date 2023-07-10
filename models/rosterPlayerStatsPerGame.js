const mongoose = require('mongoose')

const Schema = mongoose.Schema

const rosterPlayerStatsPerGameSchema = new Schema({
	gameId: { type: String, required: true },
	rosterPlayerId: { type: String, required: true },
	goals: { type: Number },
	assists: { type: Number },
})

module.exports = mongoose.model(
	'RosterPlayerStatsPerGame',
	rosterPlayerStatsPerGameSchema
)
