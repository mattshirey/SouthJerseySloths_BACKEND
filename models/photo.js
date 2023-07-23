const mongoose = require('mongoose')

const Schema = mongoose.Schema

const photoSchema = new Schema({
	photo: { type: String },
})

module.exports = mongoose.model('Photo', photoSchema)
