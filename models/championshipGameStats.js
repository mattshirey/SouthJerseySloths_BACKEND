const mongoose = require('mongoose')

const Schema = mongoose.Schema

const championshipGameStatsSchema = new Schema({
	gameId: { type: String, required: true },
	homeGoalsTotal: { type: Number, required: true },
	visitorGoalsTotal: { type: Number, required: true },
	//score: { type: String },
	winner: { type: String },
	loser: { type: String },
	//winnerTeamId: { type: String },
	//loserTeamId: { type: String },
	//status: { type: String },
	summary: { type: String },
})

module.exports = mongoose.model(
	'ChampionshipGameStats',
	championshipGameStatsSchema
)
