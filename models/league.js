const mongoose = require('mongoose')

const Schema = mongoose.Schema

const leagueSchema = new Schema({
	//id: { type: String, required: true },
	leagueName: { type: String, required: true },
	divisionName: { type: String, required: false },
	year: { type: Number, required: true },
	session: { type: String, required: true },
	isCurrent: { type: Boolean },
	numberOfTeams: { type: Number },
})

module.exports = mongoose.model('League', leagueSchema)
