const express = require('express')
const { check } = require('express-validator')
const adminControllers = require('../controllers/admin-controller')
const router = express.Router()
const checkAuth = require('../middleware/check-auth')

//Matt: watch Max's video '180: Backend Route Protection with Auth Middleware.
//This checkAuth call here should go in between the router calls that are
//non-admin, and admin.  This way, these calls cant be made by someone that is
//not authorized.  Once again, watch the video
//router.use(checkAuth)

router.get('/team/current', adminControllers.getCurrentTeam)
//
//
router.get('/teams/archive', adminControllers.getArchivedTeams)
//
//
router.get('/venues', adminControllers.getVenues)
//
//
router.get('/videos', adminControllers.getVideos)
//
//
router.get('/:teamName/:year/roster', adminControllers.getPlayersOnTeam)
//
//
//
//
router.get(
	'/:gameId/rostersAndPoints',
	adminControllers.getGameRostersAndPointsPerPeriod
)
//
//
router.get('/team/:teamId', adminControllers.getTeamData)
//
//
//
router.get('/venues/:venueId', adminControllers.getVenueData)
//
//
router.get('/videos/:videoId', adminControllers.getVideoData)
//
//
//
//
router.get('/:teamName/:year/:playerId', adminControllers.getPlayerNumber)
//
//
router.get('/players/:playerId', adminControllers.getPlayerData)
//
//
router.get(
	'/players/rosterPlayer/:rosterPlayerId',
	adminControllers.getPlayerDataByRosterId
)
//
//
router.get('/game/:gameId', adminControllers.getGameData)
//
//
router.get('/event/:gameId', adminControllers.getEventData)
//
//
router.get('/getAllRosters', adminControllers.getAllRosters)
//
//
router.get('/getAllPlayers', adminControllers.getAllPlayers)
//
//
router.get('/allGamesAndEvents', adminControllers.allGamesAndEvents)
//
//
//
//
//changed this from league/new to team/new for Sloths
router.post(
	'/team/new',
	[check('teamName').not().isEmpty(), check('year').not().isEmpty()],
	adminControllers.createNewTeam
)
//
//
router.post(
	'/league/copy/:leagueId',
	[
		check('leagueToCopy').not().isEmpty(),
		check('leagueName').not().isEmpty(),
		check('year').not().isEmpty(),
		check('session').not().isEmpty(),
	],
	adminControllers.copyLeague
)
//
//
router.post(
	'/venue/new',
	[check('venueName').not().isEmpty(), check('venueAddress').not().isEmpty()],
	adminControllers.createNewVenue
)
//
//
//
router.post(
	'/video/new',
	[
		check('videoURL').not().isEmpty(),
		check('videoTitle').not().isEmpty(),
		check('videoCaption').not().isEmpty(),
	],
	adminControllers.createNewVideo
)
//
//
//
//
router.post(
	'/newPlayer',
	[
		check('firstName1').not().isEmpty(),
		check('middleInitial1'),
		check('lastName1').not().isEmpty(),
	],
	adminControllers.createNewPlayer
)
//
//
//
//
//I commented this out on 7/18/23 to make sure it's not getting
//confused with addPlayerToTeam
/* router.post(
	'/:teamName/:year/newPlayer',
	check('playerFirstName1').not().isEmpty(),
	adminControllers.newPlayerOnTeam
) */
//
//
router.post(
	'/:teamName/:year/addPlayers',
	[
		check('lastName1').not().isEmpty(),
		check('firstName1').not().isEmpty(),
		check('playerNumber1').not().isEmpty(),
	],
	adminControllers.addPlayerToTeam
)
//
//
//
//
router.post(
	'/createGames',
	[check('venue1').not().isEmpty()],
	adminControllers.createGames
)
//
//
//
//
//
router.patch('/gameStats/:gameId', adminControllers.createGameStats)
//
//
//
router.patch(
	'/playoffGameStats/:gameId',
	adminControllers.createPlayoffGameStats
)
//
//
//
router.patch(
	'/championshipGameStats/:gameId',
	adminControllers.createChampionshipGameStats
)
//
//
//
//
router.post(
	'/createEvents',
	[
		check('eventName1').not().isEmpty(),
		check('date1').not().isEmpty(),
		check('venue1').not().isEmpty(),
	],
	adminControllers.createEvents
)
//
//
router.post(
	'/login',
	[
		check('email').not().isEmpty(),
		check('email').normalizeEmail().isEmail(),
		check('password').not().isEmpty(),
	],
	adminControllers.login
)
//
//
//
router.patch(
	'/:leagueName/:session/:year/updateTeam/:teamId',
	check('teamName').not().isEmpty(),
	adminControllers.editTeamName
)
//
//
//
//
//
router.patch(
	'/:teamName/:year/:playerId/changeNumber',
	check('number').not().isEmpty(),
	adminControllers.editPlayerNumber
)
//
//
//
router.patch(
	'/updateTeam/:teamId',
	[check('teamName').not().isEmpty(), check('year').not().isEmpty()],
	adminControllers.editTeam
)
//
//
router.patch(
	'/:teamId/archiveCurrentToggleTeam',
	[check('teamId').not().isEmpty()],
	adminControllers.archiveCurrentToggleTeam
)
//
//
router.patch(
	'/updateVenue/:venueId',
	[check('venueName').not().isEmpty(), check('venueAddress').not().isEmpty()],
	adminControllers.editVenue
)
//
//
router.patch(
	'/updateVideo/:videoId',
	[
		check('videoURL').not().isEmpty(),
		check('videoTitle').not().isEmpty(),
		check('videoCaption').not().isEmpty(),
	],
	adminControllers.editVideo
)
//
//
router.patch(
	'/updatePlayer/:playerId',
	[check('playerId').not().isEmpty()],
	adminControllers.editPlayerName
)
//
//
router.patch(
	'/editGame/:gameId',
	[check('gameId').not().isEmpty()],
	adminControllers.editGame
)
//
//
router.patch(
	'/editEvent/:gameId',
	[check('gameId').not().isEmpty()],
	adminControllers.editEvent
)

router.delete('/:playerId/removePlayer', adminControllers.removePlayer)

router.delete('/:deletedVideoId/removeVideo', adminControllers.removeVideo)

router.delete('/:teamId/removeTeam', adminControllers.removeTeam)

router.delete('/:itemId/removeEvent', adminControllers.removeEvent) //deletes a game or event

//For testing purposes (use in PostMan):
router.delete(
	'/delete/deleteAllRosterPlayerStatsPerGame',
	adminControllers.deleteAllRosterPlayerStatsPerGame
)

module.exports = router
