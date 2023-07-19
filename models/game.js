const mongoose = require('mongoose')

const Schema = mongoose.Schema

const gameSchema = new Schema({
	//id: { type: String, required: true },
	teamName: { type: String, required: true },
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
	opponent: { type: String, required: true },
	venueName: { type: String, required: true },
	isCurrent: { type: Boolean },
})

module.exports = mongoose.model('Game', gameSchema)
