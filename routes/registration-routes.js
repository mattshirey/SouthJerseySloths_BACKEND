const express = require('express')
const registrationControllers = require('../controllers/registration-controller')
const router = express.Router()

//
//
//
router.get(
	'/registrationLeagues',
	registrationControllers.getRegistrationLeagues
)
//
//
//
router.get(
	'/registrationLeague/:regLeagueId',
	registrationControllers.getRegistrationLeagueData
)
//
//
//
router.get('/:modalFor', registrationControllers.getRegisteredPlayersInLeague)
//
//
//
router.post(
	'/playerRegistration',
	//check('teamName1').not().isEmpty(),
	registrationControllers.playerRegistration
)
//
//
router.post(
	'/registrationLeague/new',
	//check('teamName1').not().isEmpty(),
	registrationControllers.adminRegistrationLeagueSetup
)
//
//
router.patch(
	'/updateLeagueRegistration/:regLeagueId',
	//[check('venueName').not().isEmpty(), check('venueAddress').not().isEmpty()],
	registrationControllers.editLeagueRegistration
)
//
//
//
//
//
module.exports = router
