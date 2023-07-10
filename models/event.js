const mongoose = require('mongoose')

const Schema = mongoose.Schema

const eventSchema = new Schema({
	//id: { type: String, required: true },
	eventName: { type: String, required: true },
	dayOfWeek: { type: String },
	date: { type: String, required: true },
	time: { type: String },
	endTime: { type: String },
	timeTBD: { type: Boolean },
	venueName: { type: String, required: true },
})

module.exports = mongoose.model('Event', eventSchema)
