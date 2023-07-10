const mongoose = require('mongoose')

const Schema = mongoose.Schema

const teamSchema = new Schema({
	//id: { type: String, required: true },
	teamName: { type: String, required: true },
	leagueId: { type: String, required: true },
	divisionName: { type: String, required: false },
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
})

module.exports = mongoose.model('Team', teamSchema)
