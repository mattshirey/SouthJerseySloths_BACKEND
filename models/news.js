const mongoose = require('mongoose')
const Schema = mongoose.Schema

const newsSchema = new Schema({
	//id: { type: String, required: true },
	newsHeading: { type: String, required: true },
	newsSubheading: { type: String, required: false },
	newsDate: { type: String, required: false },
	newsContent: { type: Date, required: false },
	newsCaption: { type: Date, required: false },
})

module.exports = mongoose.model('News', newsSchema)
