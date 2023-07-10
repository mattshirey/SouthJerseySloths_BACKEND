const mongoose = require('mongoose')

const Schema = mongoose.Schema

const registeredPlayerSchema = new Schema({
	registrationType: { type: String, required: true },
	registeredForWhat: { type: String, required: true },
	firstName: { type: String, required: true },
	lastName: { type: String, required: true },
	phoneNumber: { type: String, required: true },
	address: { type: String, required: true },
	city: { type: String, required: true },
	state: { type: String, required: true },
	zip: { type: String, required: true },
	country: { type: String, required: false },
	gender: { type: String, required: false },
	email: { type: String, required: true },
	dateOfBirth: { type: String, required: true },
	teeShirtSize: { type: String, required: false },
	parentName: { type: String, required: false },
	goalie: { type: String, required: false },
	jerseyNumber: { type: String, required: false },
	position: { type: String, required: false },
})

module.exports = mongoose.model('RegisteredPlayer', registeredPlayerSchema)
