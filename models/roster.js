const mongoose = require('mongoose')

const Schema = mongoose.Schema

const rosterSchema = new Schema({
	//id: { type: String, required: true },
	//leagueId: { type: String, required: true },
	//divisionName: { type: String, required: false },
	teamId: { type: String, required: true },
})

module.exports = mongoose.model('Roster', rosterSchema)
