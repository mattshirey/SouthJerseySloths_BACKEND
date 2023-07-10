const mongoose = require('mongoose')

const Schema = mongoose.Schema

const gameStatsSchema = new Schema({
	//id: { type: String, required: true },
	gameId: { type: String, required: true },
	homeGoalsPeriod1: { type: Number },
	homeGoalsPeriod2: { type: Number },
	homeGoalsPeriod3: { type: Number },
	homeGoalsPeriod4: { type: Number },
	homeGoalsPeriod5: { type: Number },
	homeGoalsPeriod6: { type: Number },
	homeGoalsTotal: { type: Number, required: true },
	visitorGoalsPeriod1: { type: Number },
	visitorGoalsPeriod2: { type: Number },
	visitorGoalsPeriod3: { type: Number },
	visitorGoalsPeriod4: { type: Number },
	visitorGoalsPeriod5: { type: Number },
	visitorGoalsPeriod6: { type: Number },
	visitorGoalsTotal: { type: Number, required: true },
	winner: { type: String },
	loser: { type: String },
	status: { type: String },
	summary: { type: String },
})

module.exports = mongoose.model('GameStats', gameStatsSchema)
