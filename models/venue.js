const mongoose = require('mongoose')

const Schema = mongoose.Schema

const venueSchema = new Schema({
	//id: { type: String, required: true },
	venueName: { type: String, required: true },
	venueAddress: { type: String, required: true },
})

module.exports = mongoose.model('Venue', venueSchema)
