const mongoose = require('mongoose')

const Schema = mongoose.Schema

const gameFromCSVSchema = new Schema({
	leagueName: { type: String, required: true },
	//session: { type: String, required: true },
	year: { type: Number, required: true },
	dayOfWeek: { type: String },
	date: { type: String },
	time: { type: String },
	timeTBD: { type: Boolean },
	playoff: { type: Boolean },
	championship: { type: Boolean },
	status: { type: String },
	score: { type: String },
	winner: { type: String },
	loser: { type: String },
	homeTeamName: { type: String, required: true },
	homeTeamId: { type: String, required: false },
	homeRosterId: { type: String, required: false },
	homeTeamSeed: { type: String },
	visitorTeamName: { type: String, required: true },
	visitorTeamId: { type: String, required: false },
	visitorRosterId: { type: String, required: false },
	visitorTeamSeed: { type: String },
	venueName: { type: String, required: true },
	isCurrent: { type: Boolean },
})

module.exports = mongoose.model('GameFromCSV', gameFromCSVSchema)
