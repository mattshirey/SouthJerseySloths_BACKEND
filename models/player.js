const mongoose = require('mongoose')

const Schema = mongoose.Schema

const playerSchema = new Schema({
	//id: { type: String, required: true },
	firstName: { type: String, required: true },
	middleInitial: { type: String, required: false },
	lastName: { type: String, required: true },
})

module.exports = mongoose.model('Player', playerSchema)
