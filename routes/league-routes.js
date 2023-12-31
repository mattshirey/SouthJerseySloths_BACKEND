const express = require('express')
const leagueControllers = require('../controllers/league-controller')
const router = express.Router()

//So far, this is returning a list of teams in the league,
//sorted by amount of points
router.get('/leagues/:leagueId/standings', leagueControllers.getStandings)
//
//
//
//
//
router.get(
	'/:leagueId/scoringLeaders',
	leagueControllers.getScoringLeadersByLeagueId
)
//
//
//
//
//
router.get('/rosterAndSchedule', leagueControllers.getPlayersOnTeam)
//
//
//
//
//
router.get(
	'/oldRosterAndSchedule/:teamId',
	leagueControllers.getPlayersOnOldTeam
)
//
//
//
//
router.get('/schedule/:teamName/:year', leagueControllers.getTeamSchedule)
//This one below will be used to access team schedule from the main schedule page
//via the 'search by league/team' dropdown
//
//
//
//
router.get('/teamSchedule', leagueControllers.getTeamSchedule2)
//
//
//
//
//
//
router.get(
	'/schedule/admin/:leagueId',
	leagueControllers.getAdminLeagueSchedule
) //< - - - for ADMIN view
//
//
//
//
//
router.get('/schedule/:leagueId', leagueControllers.getLeagueSchedule) //< - - - for end user view
//
//
//
//
//
//
router.get('/:venueId/schedule', leagueControllers.getVenueSchedule)
//
//
//
//
//
//
//
//
router.get('/allCurrentTeams', leagueControllers.getAllCurrentTeams)
//
//
//
//
router.get('/previousLeagues', leagueControllers.getPreviousLeagues)
//
//
//
module.exports = router
