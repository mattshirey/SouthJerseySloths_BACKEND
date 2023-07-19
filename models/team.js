const mongoose = require('mongoose')

const Schema = mongoose.Schema

const teamSchema = new Schema({
	teamName: { type: String, required: true },
	year: { type: Number, required: true },
	wins: { type: Number },
	losses: { type: Number },
	ties: { type: Number },
	overtimeLosses: { type: Number },
	shootoutLosses: { type: Number },
	goalsFor: { type: Number },
	goalsAgainst: { type: Number },
	points: { type: Number },
	assignedPlayers: { type: Number },
	seed: { type: Number },
	isCurrent: { type: Boolean },
})

module.exports = mongoose.model('Team', teamSchema)
