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
	email: { type: String, required: true },
	email2: { type: String, required: false },
	dateOfBirth: { type: String, required: true },
	parentName: { type: String, required: false },
})

module.exports = mongoose.model('RegisteredPlayer', registeredPlayerSchema)
