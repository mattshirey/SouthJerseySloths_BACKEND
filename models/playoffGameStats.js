const mongoose = require('mongoose')

const Schema = mongoose.Schema

const playoffGameStatsSchema = new Schema({
	gameId: { type: String, required: true },
	homeGoalsTotal: { type: Number, required: true },
	visitorGoalsTotal: { type: Number, required: true },
	winner: { type: String },
	loser: { type: String },
	summary: { type: String },
})

module.exports = mongoose.model('PlayoffGameStats', playoffGameStatsSchema)
