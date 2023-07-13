const mongoose = require('mongoose')

const Schema = mongoose.Schema

const rosterPlayerSchema = new Schema({
	//id: { type: String, required: true },
	//leagueId: { type: String, required: true },
	teamId: { type: String, required: true },
	playerId: { type: String, required: true },
	firstName: { type: String, required: true },
	middleInitial: { type: String },
	lastName: { type: String, required: true },
	rosterId: { type: String, required: true },
	teamName: { type: String, required: true },
	leagueName: { type: String, required: true },
	divisionName: { type: String, required: false },
	session: { type: String, required: true },
	year: { type: String, required: true },
	number: { type: String, required: true },
	goals: { type: Number },
	assists: { type: Number },
})

module.exports = mongoose.model('RosterPlayer', rosterPlayerSchema)
