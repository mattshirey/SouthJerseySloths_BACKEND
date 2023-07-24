const HttpError = require('../models/http-error')
const League = require('../models/league')
const Team = require('../models/team')
const Roster = require('../models/roster')
const Player = require('../models/player')
const RosterPlayer = require('../models/rosterPlayer')
const RosterPlayerStatsPerGame = require('../models/rosterPlayerStatsPerGame')
const fileUpload = require('../middleware/file-upload')
const Photo = require('../models/photo')

const getPlayerHistoryByPlayerId = async (req, res, next) => {
	console.log('inside getPlayerHistoryByPlayer')
	const playerId = req.params.playerId

	//First, we need to find how many different rosters this player has been on
	let firstName, lastName, middleInitial
	let listOfRosters
	try {
		listOfRosters = await RosterPlayer.find({
			playerId: playerId,
		}).orFail()
	} catch {}

	JSON.stringify(listOfRosters.reverse())

	if (listOfRosters) {
		firstName = listOfRosters[0].firstName
		lastName = listOfRosters[0].lastName
		middleInitial = listOfRosters[0].middleInitial
	}

	res.json({ listOfRosters, firstName, lastName, middleInitial })
}
//
//
//
//
const uploadPhoto = async (req, res, next) => {
	console.log('inside uploadPhoto: ' + JSON.stringify(req))
	const playerId = req.params.playerId
	//const photo = req.file.filename
	//const newUserData = photo

	//const newPhoto = new Photo(newUserData)

	newPhoto
		.save()
		.then(() => res.json('Photo added'))
		.catch((err) => res.status(400).json('Error: ' + err))
}
//
//
//
exports.getPlayerHistoryByPlayerId = getPlayerHistoryByPlayerId
exports.uploadPhoto = uploadPhoto
