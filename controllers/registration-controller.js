const HttpError = require('../models/http-error')
const League = require('../models/league')
const Team = require('../models/team')
const Roster = require('../models/roster')
const Player = require('../models/player')
const RosterPlayer = require('../models/rosterPlayer')
const RosterPlayerStatsPerGame = require('../models/rosterPlayerStatsPerGame')
const RegisteredPlayer = require('../models/registeredPlayer')
const LeagueRegistration = require('../models/leagueRegistration')

//*********************************************************************** */
//
//     This is for when a player registers for a league
//
//	   Here, we'll create a new RegisteredPlayer object
//
//************************************************************************ */
const playerRegistration = async (req, res, next) => {
	console.log('inside playerRegistration')
	const {
		type,
		registeredForWhat,
		firstName,
		middleInitial,
		lastName,
		phoneNumber,
		address,
		city,
		state,
		zip,
		email,
		email2,
		dateOfBirth,
		parentName,
		//country,
		//gender,
		//teeShirtSize,
		//goalie,
		//jerseyNumber,
		//position,
	} = req.body

	const firstNameTrimmed = firstName.trim().replace(/\s+/g, '-')
	const lastNameTrimmed = lastName.trim().replace(/\s+/g, '-')

	console.log(type)
	console.log(registeredForWhat)
	console.log(firstName)
	console.log(middleInitial)
	console.log(lastName)
	console.log(phoneNumber)
	console.log(address)
	console.log(city)
	console.log(state)
	console.log(zip)
	console.log(email)
	console.log(dateOfBirth)
	console.log(parentName)
	//console.log(goalie)
	//console.log(jerseyNumber)
	//console.log(position)
	//console.log(country)
	//console.log(gender)
	//console.log(teeShirtSize)
	//
	//
	//
	let registeredPlayer
	/* if (leagueExists) {
		console.log('league already exists')
		const error = new HttpError('League already exists', 409)
		return next(error)
	} else { */
	registeredPlayer = new RegisteredPlayer({
		registrationType: type,
		registeredForWhat: registeredForWhat,
		firstName: firstNameTrimmed,
		middleInitial: middleInitial,
		lastName: lastNameTrimmed,
		phoneNumber: phoneNumber,
		address: address,
		city: city,
		state: state,
		zip: zip,
		email: email,
		email2: email2,
		dateOfBirth: dateOfBirth,
		parentName: parentName,
		//country: country,
		//gender: gender,
		//teeShirtSize: teeShirtSize,
		//goalie: goalie,
		//jerseyNumber: jerseyNumber,
		//position: position,
	})
	//}

	try {
		await registeredPlayer.save()
	} catch (err) {
		const error = new HttpError(
			'Could not create new Registered Player: ' + err,
			500
		)
		return next(error)
	}

	//we created something new so conventionally, that'll be a 201
	res.status(201).json({ player: registeredPlayer })
}
//*********************************************************************** */
//
//	When admins add a league that they want users to register for,
//	we'll come here and create the league.  The leagues that are set up
//  through here will display on the registration form drop-down
//
//************************************************************************ */
const adminRegistrationLeagueSetup = async (req, res, next) => {
	console.log('inside adminRegistrationLeagueSetup')
	const { type, leagueNameAndDesc, leagueRegistrationCloseDate, leaguePrice } =
		req.body

	let createdLeagueRegistration

	createdLeagueRegistration = new LeagueRegistration({
		type: type,
		leagueNameAndDesc: leagueNameAndDesc.trim(),
		leagueRegistrationCloseDate: leagueRegistrationCloseDate,
		leaguePrice: leaguePrice,
	})

	try {
		await createdLeagueRegistration.save()
	} catch (err) {
		const error = new HttpError('Could not create new League Registration', 500)
		return next(error)
	}

	//we created something new so conventionally, that'll be a 201
	res.status(201).json({ leagueRegistration: createdLeagueRegistration })
}
//****************************************************************************************** */
//
// Get all LeagueRegistrations
//
//****************************************************************************************** */
const getRegistrationLeagues = async (req, res, next) => {
	console.log('inside getRegistrationLeagues')
	let allRegistrationLeagues
	try {
		const filter = {}
		allRegistrationLeagues = await LeagueRegistration.find(filter)
		/* allRegistrationLeagues.sort((a, b) =>
			a.venueName.localeCompare(b.venueName)
		) */
		res.json({ allRegistrationLeagues })
	} catch (err) {
		const error = new HttpError(
			'Cannot find any leagues for registration.  getLeagueRegistrations',
			404
		)
		return next(error)
	}
}
//****************************************************************************************** */
//
// Get all getRegisteredPlayersInLeague
//
// This will be used in admin Registration section.  They can click on the League Name/Details
// and a modal will pop up listing everyone that is signed up (registered).  This list will
// be printable
//
//
//****************************************************************************************** */
const getRegisteredPlayersInLeague = async (req, res, next) => {
	console.log('inside getRegisteredPlayersInLeague')
	const modalFor = req.params.modalFor

	console.log('modalFor: ' + modalFor)
	let allRegisteredPlayersInLeague
	try {
		allRegisteredPlayersInLeague = await RegisteredPlayer.find({
			registeredForWhat: modalFor,
		})
	} catch (err) {
		const error = new HttpError(
			'Cannot find any people that registered for this item.  getRegisteredPlayersInLeague',
			404
		)
		return next(error)
	}
	res.json({ allRegisteredPlayersInLeague })
}
//****************************************************************************************** */
//
// Get registration league data (leagueNameAndDesc, leagueRegistrationCloseDate, leaguePrice).
// I'll use this for when/if I need to edit any of this stuff
//
//****************************************************************************************** */
const getRegistrationLeagueData = async (req, res, next) => {
	console.log('inside getRegistrationLeagueData')
	const regLeagueId = req.params.regLeagueId
	let leagueNameAndDesc, leagueRegistrationCloseDate, leaguePrice
	let foundRegLeague

	console.log(regLeagueId)

	try {
		foundRegLeague = await LeagueRegistration.findById(regLeagueId)
	} catch (err) {
		const error = new HttpError(
			'Could not find registration league.  getRegistrationLeagueData',
			404
		)
		return next(error)
	}
	leagueNameAndDesc = foundRegLeague.leagueNameAndDesc
	leagueRegistrationCloseDate = foundRegLeague.leagueRegistrationCloseDate
	leaguePrice = foundRegLeague.leaguePrice

	res.json({ regLeague: foundRegLeague.toObject({ getters: true }) })
}
//
//
//
//****************************************************************************************** */
//
//PATCH request where we can edit the Name/Description, Closing date, and price of a league
//  for use in league registration
//
//******************************************************************************************* */
const editLeagueRegistration = async (req, res, next) => {
	console.log('inside editLeagueRegistration')
	/* const errors = validationResult(req)
	if (!errors.isEmpty()) {
		throw new HttpError(
			'Invalid inputs - something is empty.   editLeagueRegistration',
			422
		)
	} */

	const { type, leagueNameAndDesc, leagueRegistrationCloseDate, leaguePrice } =
		req.body

	const regLeagueId = req.params.regLeagueId

	let regLeague
	try {
		regLeague = await LeagueRegistration.findById(regLeagueId)
	} catch (err) {
		const error = new HttpError(err, 500)
		return next(error)
	}

	regLeague.type = type
	regLeague.leagueNameAndDesc = leagueNameAndDesc
	regLeague.leagueRegistrationCloseDate = leagueRegistrationCloseDate
	regLeague.leaguePrice = leaguePrice

	try {
		await regLeague.save()
	} catch (err) {
		const error = new HttpError(
			//'Something went wrong with saving the updated league registration.',
			err,
			500
		)
		return next(error)
	}

	//set it to 200 instead of 201 because we're not creating anything new
	res.status(200).json({ regLeague: regLeague.toObject({ getters: true }) })
}
//
//
//
//
exports.playerRegistration = playerRegistration
exports.adminRegistrationLeagueSetup = adminRegistrationLeagueSetup
exports.getRegistrationLeagues = getRegistrationLeagues
exports.getRegisteredPlayersInLeague = getRegisteredPlayersInLeague
exports.editLeagueRegistration = editLeagueRegistration
exports.getRegistrationLeagueData = getRegistrationLeagueData
