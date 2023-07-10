const mongoose = require('mongoose')

const Schema = mongoose.Schema

const leagueRegistrationSchema = new Schema({
	type: { type: String, required: true },
	leagueNameAndDesc: { type: String, required: true },
	leagueRegistrationCloseDate: { type: String, required: false },
	leaguePrice: { type: String, required: false },
})

module.exports = mongoose.model('LeagueRegistration', leagueRegistrationSchema)
