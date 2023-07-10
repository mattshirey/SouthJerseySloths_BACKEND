const mongoose = require('mongoose')

const Schema = mongoose.Schema

const videoSchema = new Schema({
	//id: { type: String, required: true },
	videoTitle: { type: String, required: true },
	videoURL: { type: String, required: true },
	videoCaption: { type: String, required: false },
})

module.exports = mongoose.model('Video', videoSchema)
