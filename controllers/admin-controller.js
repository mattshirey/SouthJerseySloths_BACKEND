const { v4: uuidv4 } = require('uuid')
const { validationResult } = require('express-validator')
const HttpError = require('../models/http-error')
const League = require('../models/league')
const Team = require('../models/team')
const Roster = require('../models/roster')
const Player = require('../models/player')
const Venue = require('../models/venue')
const RosterPlayer = require('../models/rosterPlayer')
const Game = require('../models/game')
const Event = require('../models/event')
const GameStats = require('../models/gameStats')
const ChampionshipGameStats = require('../models/championshipGameStats')
const PlayoffGameStats = require('../models/playoffGameStats')
const RosterPlayerStatsPerGame = require('../models/rosterPlayerStatsPerGame')
const rosterPlayerStatsPerGame = require('../models/rosterPlayerStatsPerGame')
const Video = require('../models/video')
const gameFromCSV = require('../models/gameFromCSV')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const league = require('../models/league')
//
//
//
//****************************************************************************************** */
//
//  Get all archived sloth teams
//
//****************************************************************************************** */
const getArchivedTeams = async (req, res, next) => {
	let archivedTeams
	try {
		archivedTeams = await Team.find({
			isCurrent: false,
		}).orFail()
	} catch (err) {
		const error = new HttpError(
			'Cannot find any archived teams.  getArchivedTeams',
			404
		)
	}

	archivedTeams && archivedTeams.reverse()

	res.json({ archivedTeams })
}
//
//
//
//
//****************************************************************************************** */
//
// Get Current Team
//
//
//****************************************************************************************** */
const getCurrentTeam = async (req, res, next) => {
	let currentTeam, teamName, year
	try {
		currentTeam = await Team.findOne({
			isCurrent: true,
		}).orFail()
	} catch (err) {
		const error = new HttpError(
			'Cannot find a current team.  getCurrentTeam',
			404
		)
	}

	if (currentTeam) {
		teamName = currentTeam.teamName
		year = currentTeam.year
	}
	/* 
	currentLeagues &&
		(currentLeaguesSorted = currentLeagues.sort((a, b) =>
			a.leagueName.localeCompare(b.leagueName)
		))

	let currentLeaguesSortedNoDuplicates

	currentLeagues &&
		(currentLeaguesSortedNoDuplicates = [
			...new Map(currentLeaguesSorted.map((m) => [m.leagueName, m])).values(),
		]) */

	res.json({ currentTeam, teamName: teamName, year: year })
}
//
//
//
//****************************************************************************************** */
//
// Get all Venues
//
//****************************************************************************************** */
const getVenues = async (req, res, next) => {
	let allVenues
	try {
		const filter = {}
		allVenues = await Venue.find(filter)
		allVenues.sort((a, b) => a.venueName.localeCompare(b.venueName))
		res.json({ allVenues })
	} catch (err) {
		const error = new HttpError('Cannot find any venues.  getVenues', 404)
		return next(error)
	}
}
//
//
//
//****************************************************************************************** */
//
// Get all Videos
//
//****************************************************************************************** */
const getVideos = async (req, res, next) => {
	let allVideos
	try {
		const filter = {}
		allVideos = await Video.find(filter)
		allVideos.sort((a, b) => a.videoTitle.localeCompare(b.videoTitle))
		res.json({ allVideos })
	} catch (err) {
		const error = new HttpError('Cannot find any videos.  getVideos', 404)
		return next(error)
	}
}
//
//****************************************************************************************** */
//
// Get team data (teamName, year).
// I'll use this for when/if I need to edit any of this stuff
//
//****************************************************************************************** */
const getTeamData = async (req, res, next) => {
	const teamId = req.params.teamId
	let teamName
	let year

	//console.log('You are here 1')

	try {
		foundTeam = await Team.findById(teamId)
	} catch (err) {
		const error = new HttpError(
			'Could not find team to obtain teamName, or year.  getTeamData',
			404
		)
		return next(error)
	}
	teamName = foundTeam.teamName
	year = foundTeam.year

	res.json({ team: foundTeam.toObject({ getters: true }) })
	//res.json({ leagueName, session, year })
}
//****************************************************************************************** */
//
// Get league id
// Using leagueName, session, and year, get the leagueId
// This is used in UpdateGameForm.
//
//****************************************************************************************** */
/* const getLeagueId = async (req, res, next) => {
	const leagueName = req.params.leagueName1
	const session = req.params.session1
	const year = req.params.year1

	let leagueId

	console.log('searching for league id')

	try {
		foundLeague = await League.findOne({
			leagueName: leagueName,
			session: session,
			year: year,
		})
	} catch (err) {
		const error = new HttpError(
			'Could not find league to obtain leagueId.  getLeagueId',
			404
		)
		return next(error)
	}

	leagueId = foundLeague._id

	res.json({ leagueId: foundLeague.toObject({ getters: true }) })
} */
//
//
//
//
//
//****************************************************************************************** */
//
// Get venue data (venueName, venueAddress).
// I'll use this for when/if I need to edit any of this stuff
//
//****************************************************************************************** */
const getVenueData = async (req, res, next) => {
	const venueId = req.params.venueId
	let venueName
	let venueAddress

	try {
		foundVenue = await Venue.findById(venueId)
	} catch (err) {
		const error = new HttpError(
			'Could not find league to obtain venueName or address.  getVenueData',
			404
		)
		return next(error)
	}
	venueName = foundVenue.venueName
	venueAddress = foundVenue.venueAddress

	res.json({ venue: foundVenue.toObject({ getters: true }) })
}
//
//
//
//
//****************************************************************************************** */
//
// Get video data (videoTitle, videoURL, videoCaption).
// I'll use this for when/if I need to edit any of this stuff
//
//****************************************************************************************** */
const getVideoData = async (req, res, next) => {
	const videoId = req.params.videoId
	let videoTitle
	let videoURL
	let videoCaption

	try {
		foundVideo = await Video.findById(videoId)
	} catch (err) {
		const error = new HttpError(
			'Could not find video to obtain video data.  getVideoData',
			404
		)
		return next(error)
	}
	videoTitle = foundVideo.videoTitle
	videoURL = foundVideo.videoURL
	videoCaption = foundVideo.videoCaption

	res.json({ video: foundVideo.toObject({ getters: true }) })
}
//
//
//****************************************************************************************** */
//
// Get Team data (teamName).
// I'll use this for when/if I need to edit a team name.
// UPDATE: this is also where we can change the division of a team, if needed
//
//****************************************************************************************** */
/* const getTeamData = async (req, res, next) => {
	const teamId = req.params.teamId
	let teamName, divisionName, leagueId

	try {
		foundTeam = await Team.findById(teamId)
	} catch (err) {
		const error = new HttpError(
			'Could not find team to obtain teamName.  getTeamData',
			404
		)
		return next(error)
	}
	teamName = foundTeam.teamName
	leagueId = foundTeam.leagueId
	divisionName = foundTeam.divisionName

	//Now that we have the leagueId, let's tap into it and get the leagueName, session,
	//and year.  We'll use this info to find all divisions in that league.

	let session, year, leagueName

	try {
		foundLeague = await League.findById(leagueId)
	} catch (err) {
		const error = new HttpError('Could not find league.  getTeamData', 404)
		return next(error)
	}

	leagueName = foundLeague.leagueName
	session = foundLeague.session
	year = foundLeague.year

	//If there's a divisionName, we need to find all the other divisions in the league that
	//this particular division belongs to, return it, and turn it into a dropdown on the
	//'Edit Team' page

	let allDivisions, divisions

	if (divisionName) {
		try {
			allDivisions = await League.find({
				leagueName: leagueName,
				session: session,
				year: year,
			}).orFail()
		} catch (err) {
			const error = new HttpError(
				'Could not find any divisions for this league.  getTeamData',
				404
			)
			return next(error)
		}

		console.log('allDivisions: ' + allDivisions)

		//let divisions
		divisions = []

		allDivisions.forEach(async (league) => {
			divisions.push(league.divisionName)
		})

		console.log('divisions: ' + divisions)
	}

	if (divisionName) {
		res.json({ divisions, team: foundTeam.toObject({ getters: true }) })
	} else {
		res.json({ team: foundTeam.toObject({ getters: true }) })
	}
} */
//****************************************************************************************** */
//
// Get player's jersey Number.
// I'll use this for when/if I need to edit a players jersey number
//
//****************************************************************************************** */
const getPlayerNumber = async (req, res, next) => {
	//const session = req.params.session
	const year = req.params.year
	const teamName = req.params.teamName
	const playerId = req.params.playerId

	console.log('teamName: ' + teamName)

	let number
	let foundRosterPlayer, firstName, lastName, playerName
	try {
		foundRosterPlayer = await RosterPlayer.findOne({
			//session: session,
			year: year,
			teamName: teamName,
			playerId: playerId,
		})
	} catch (err) {
		const error = new HttpError(
			'Could not find roster player to obtain number.  getPlayerNumber',
			404
		)
		return next(error)
	}
	console.log('you are here 2')
	console.log('foundRosterPlayer: ' + foundRosterPlayer)
	number = foundRosterPlayer.number
	firstName = foundRosterPlayer.firstName
	lastName = foundRosterPlayer.lastName
	playerName = firstName + ' ' + lastName

	res.json({ number, playerName })
}
//****************************************************************************************** */
//
// Get Player data (firstName, middleInitial, lastName).
// I'll use this for when/if I need to edit a players first, middle, or last name in
// the All Players section in admin.
//
//****************************************************************************************** */
const getPlayerData = async (req, res, next) => {
	const playerId = req.params.playerId
	let playerName

	try {
		foundPlayer = await Player.findById(playerId)
	} catch (err) {
		const error = new HttpError(
			'Could not find player to obtain player name.  getPlayerData',
			404
		)
		return next(error)
	}
	firstName = foundPlayer.firstName
	middleInitial = foundPlayer.middleInitial
	lastName = foundPlayer.lastName

	res.json({ player: foundPlayer.toObject({ getters: true }) })
}
//****************************************************************************************** */
//
// Get Player data by rosterId (firstName, middleInitial, lastName).
// I'll use this for when/if I need to edit a players first, middle, or last name in
// the All Players section in admin.
//
//****************************************************************************************** */
const getPlayerDataByRosterId = async (req, res, next) => {
	const rosterPlayerId = req.params.rosterPlayerId
	let foundPlayer

	try {
		foundPlayer = await RosterPlayer.findById(rosterPlayerId)
	} catch (err) {
		const error = new HttpError(
			'Could not find player to obtain player name.  getPlayerData',
			404
		)
		return next(error)
	}
	firstName = foundPlayer.firstName
	middleInitial = foundPlayer.middleInitial
	lastName = foundPlayer.lastName

	res.json({ player: foundPlayer.toObject({ getters: true }) })
}
//
//
//
//****************************************************************************************** */
//
// Get Game data (date, start time, end time, TBD, playoff/championship?, opponent, venue).
// I'll use this for when/if I need to edit a game
//
// We also want to get the gameStats info and send it to the GameSummary page
//
//****************************************************************************************** */
const getGameData = async (req, res, next) => {
	const gameId = req.params.gameId
	let game, leagueId

	console.log('inside getGameData!!')

	try {
		foundGame = await Game.findById(gameId)
	} catch (err) {
		const error = new HttpError(
			'Could not find game to obtain game data.  getGameData',
			404
		)
		return next(error)
	}

	let foundPlayoffGameStats,
		foundChampionshipGameStats,
		foundGameStats,
		winner,
		loser,
		winnerTeamName
	if (foundGame.playoff) {
		console.log('this must be a playoff game')
		try {
			foundPlayoffGameStats = await PlayoffGameStats.findOne({
				gameId: gameId,
			})
		} catch (err) {
			const error = new HttpError('error 1: ' + err)
			return next(error)
		}
	} else if (foundGame.championship) {
		console.log('this must be a championship game')
		try {
			foundChampionshipGameStats = await ChampionshipGameStats.findOne({
				gameId: gameId,
			})
		} catch (err) {
			const error = new HttpError('error 2: ' + err)
			return next(error)
		}
	} else {
		//If it's NOT a playoff game or championship game
		try {
			foundGameStats = await GameStats.findOne({
				gameId: gameId,
			})
		} catch (err) {
			const error = new HttpError('error 3: ' + err)
			return next(error)
		}
	}

	if (foundGameStats) {
		winner = foundGameStats.winner
	}
	if (foundPlayoffGameStats) {
		winner = foundPlayoffGameStats.winner
	}
	if (foundChampionshipGameStats) {
		winner = foundChampionshipGameStats.winner
	}

	console.log('and the winner is HERE: ' + winner)
	//let foundWinner
	//So we got the game stats (if there are any) and we got the teamId of the winner
	//Let's use that teamId to get the teamName
	/* try {
		foundWinner = await Team.findById(winner)
	} catch (err) {
		const error = new HttpError('error 4: ' + err)
		return next(error)
	}

	console.log('foundWinner: ' + foundWinner)

	if (foundWinner) {
		winnerTeamName = foundWinner.teamName
		console.log('winner: ' + winnerTeamName)
	}
	if (!foundWinner) {
		winnerTeamName = foundGame.opponent
	} */

	//console.log('fucking winnerTeamName: ' + winnerTeamName)

	//
	//7-6-2023  NBHL.  Got rid of session finder and replaced with isCurrent
	//
	//
	/* try {
		foundLeague = await League.findOne({
			leagueName: foundGame.leagueName,
			//session: foundGame.session,
			isCurrent: true,
			year: foundGame.year,
		}).orFail()
	} catch (err) {
		const error = new HttpError(
			'Could not find league to obtain leagueId.  getGameData ' + err,
			404
		)
		return next(error)
	}

	leagueId = foundLeague._id */

	//Let's rearrange the date format here so we send it back the way
	//we want it, (to auto-populate the update form correctly)
	const gameDateMonth = foundGame.date.substr(0, 2)
	const gameDateDay = foundGame.date.substr(3, 2)
	const gameDateYear = foundGame.date.substr(6, 4)
	const rearrangedDate = gameDateYear + '-' + gameDateMonth + '-' + gameDateDay

	//console.log(rearrangedDate)

	//leagueId = leagueId
	//leagueName = foundGame.leagueName
	//session = foundGame.session
	teamName = foundGame.teamName
	year = foundGame.year
	date = rearrangedDate
	dayOfWeek = foundGame.dayOfWeek
	time = foundGame.time
	//endTime = foundGame.endTime
	timeTBD = foundGame.timeTBD
	playoff = foundGame.playoff
	championship = foundGame.championship
	opponent = foundGame.opponent
	//homeTeamName = foundGame.homeTeamName
	//homeTeamId = foundGame.homeTeamId
	//homeRosterId = foundGame.homeRosterId
	//visitorTeamName = foundGame.visitorTeamName
	//visitorTeamId = foundGame.visitorTeamId
	//visitorRosterId = foundGame.visitorRosterId
	venueName = foundGame.venueName

	if (foundPlayoffGameStats) {
		res.json({
			//leagueId: leagueId,
			game: foundGame.toObject({ getters: true }),
			gameStats: foundPlayoffGameStats,
			//winner: winnerTeamName,
			winner: winner,
		})
	} else if (foundChampionshipGameStats) {
		res.json({
			//leagueId: leagueId,
			game: foundGame.toObject({ getters: true }),
			gameStats: foundChampionshipGameStats,
			//winner: winnerTeamName,
			winner: winner,
		})
	} else {
		res.json({
			//leagueId: leagueId,
			game: foundGame.toObject({ getters: true }),
			gameStats: foundGameStats,
			//winner: winnerTeamName,
			winner: winner,
		})
	}
}
//****************************************************************************************** */
//
// Get Event data (date, start time, end time, TBD, eventName, venue).
// I'll use this for when/if I need to edit a game
//
//****************************************************************************************** */
const getEventData = async (req, res, next) => {
	const gameId = req.params.gameId
	let event

	try {
		foundEvent = await Event.findById(gameId)
	} catch (err) {
		const error = new HttpError(
			'Could not find event to obtain event data.  getEventData',
			404
		)
		return next(error)
	}

	//Let's rearrange the date format here so we send it back the way
	//we want it, (to auto-populate the update form correctly)
	const eventDateMonth = foundEvent.date.substr(0, 2)
	const eventDateDay = foundEvent.date.substr(3, 2)
	const eventDateYear = foundEvent.date.substr(6, 4)
	const rearrangedDate =
		eventDateYear + '-' + eventDateMonth + '-' + eventDateDay

	//console.log(rearrangedDate)

	date = rearrangedDate
	time = foundEvent.time
	endTime = foundEvent.endTime
	timeTBD = foundEvent.timeTBD
	eventName = foundEvent.eventName
	venueName = foundEvent.venueName

	res.json({ event: foundEvent.toObject({ getters: true }) })
}
//****************************************************************************************** */
//
//  Get all players on a sloth team
//
//****************************************************************************************** */
const getPlayersOnTeam = async (req, res, next) => {
	console.log('inside getPlayersOnTeam')
	const teamName = req.params.teamName
	const year = req.params.year

	console.log('inside getPlayersOnTeam for ' + teamName + ' ' + year)
	//Here, once we tapped into the params, we'll match the leagueName, session, and year
	//against the LeagueDatabasTable and get the league id.
	//We also want to know if the league is current so that, if so, we can edit a team name
	//We don't really need to edit the team name of an archived team
	let teamId
	let foundTeam
	let isCurrent
	console.log(teamName + ' ' + year)
	try {
		foundTeam = await Team.findOne({
			teamName: teamName,
			//session: session,
			year: year,
		}).orFail()
	} catch (err) {
		const error = new HttpError(
			'Could not find team to obtain teamId.  getPlayersOnTeam',
			404
		)
		return next(error)
	}
	console.log('foundTeam: ' + foundTeam)
	//
	teamId = foundTeam.id
	isCurrent = foundTeam.isCurrent
	//console.log('leagueId: ' + leagueId)
	//
	//
	//
	//Now let's get the rosterId for that team.  We'll need it to find all the rosterPlayers
	//that have that rosterId
	let rosterId
	let foundRoster
	console.log('lets find roster using ' + teamId)
	try {
		foundRoster = await Roster.findOne({
			teamId: teamId,
		}).orFail()
	} catch (err) {
		const error = new HttpError(
			'Could not find roster to obtain rosterId.  getPlayersOnTeam',
			404
		)
		return next(error)
	}
	rosterId = foundRoster.id
	console.log('rosterId is ' + rosterId)
	//
	//
	//
	let listOfPlayers
	try {
		listOfPlayers = await RosterPlayer.find({
			rosterId: rosterId,
		})
	} catch {}

	console.log('listOfPlayers: ' + listOfPlayers)

	res.json({
		isCurrent: isCurrent,
		listOfPlayers,
	})
}
//
//
//****************************************************************************************** */
//
//  Get all teams in a league THE CONTAIN A DIVISION
//
//****************************************************************************************** */
const getTeamsInLeagueWithDivision = async (req, res, next) => {
	const leagueName = req.params.leagueName
	const divisionName = req.params.divisionName
	const session = req.params.session
	const year = req.params.year
	//Here, once we tapped into the params, we'll match the leagueName, session, and year
	//against the LeagueDatabasTable and get the league id.
	//We also want to know if the league is current so that, if so, we can edit a team name
	//We don't really need to edit the team name of an archived team
	let leagueId
	let foundLeague
	let isCurrent
	try {
		foundLeague = await League.findOne({
			leagueName: leagueName,
			divisionName: divisionName,
			session: session,
			year: year,
		}).orFail()
	} catch (err) {
		const error = new HttpError(
			'Could not find leaguewith division to obtain leagueId.  getTeamsInLeagueWithDivision',
			404
		)
		return next(error)
	}
	leagueId = foundLeague.id
	isCurrent = foundLeague.isCurrent
	//console.log('leagueId: ' + leagueId)
	//
	//
	//Now that we have the leagueId, we want to tap into the TeamsDatabaseTable and find all the
	//teams with that leagueId
	//I put an empty catch bracket here, because I don't want to throw an error if
	//there are no teams.
	let listOfTeams
	try {
		listOfTeams = await Team.find({
			leagueId: leagueId,
		}).orFail()
	} catch {}

	res.json({
		isCurrent: isCurrent,
		listOfTeams,
	})
}
//
//
//****************************************************************************************** */
//
//  Get all teams in a league JUST BY THE LEAGUE ID
//
//****************************************************************************************** */
const getTeamsInLeagueByLeagueId = async (req, res, next) => {
	const leagueId = req.params.leagueId
	//console.log('MATTTTTTTTTTTTTTTTTTT')

	//Since we have the leagueId, we want to tap into the TeamsDatabaseTable and find all the
	//teams with that leagueId
	//I put an empty catch bracket here, because I don't want to throw an error if
	//there are no teams.

	let league, leagueName, session, year
	try {
		league = await League.findById(leagueId)
	} catch (err) {
		const error = new HttpError('could not find league by leagueId', 404)
		return next(error)
	}

	leagueName = league.leagueName
	session = league.session
	year = league.year

	//console.log('Inside getTeamsInLeagueByLeagueId for leagueId ' + leagueId)
	let listOfTeams
	try {
		listOfTeams = await Team.find({
			leagueId: leagueId,
		}).orFail()
	} catch {}

	//console.log('listOfTeams: ' + listOfTeams)

	res.json({
		listOfTeams,
		leagueName,
		session,
		year,
	})
}
//
//
//****************************************************************************************** */
//
//  Get all teams in a league JUST BY THE LEAGUE Name
//
//  This is used in the Create Games form once a league is selected.
//
//****************************************************************************************** */
const getTeamsInLeagueByLeagueName = async (req, res, next) => {
	//console.log('hi matt')
	const leagueName = req.params.leagueName
	const leagueId = req.params.leagueId
	const session = req.params.session
	const year = req.params.year
	console.log('leagueName: ' + leagueName)
	console.log('session: ' + session)
	console.log('year: ' + year)

	//First, let's see if there's more than 1 league with the same name
	let listOfSameLeagues
	//
	//7-6-2023  NBHL.  Got rid of session finder and replaced with isCurrent
	//
	//
	try {
		listOfSameLeagues = await League.find({
			leagueName: leagueName,
			//session: session,
			isCurrent: true,
			year: year,
		}).orFail()
	} catch (err) {
		const error = new HttpError(
			'Got a problem here.  getTeamsInLeagueByLeagueName ' + err
		)
	}

	console.log('listOfSameLeagues: ' + listOfSameLeagues)

	//If there are more than 1 leagues of the same name, this means we have divisions set up.
	//So...we want to grab ALL the teams from each league, and file them all under
	//the same league
	let listOfDivisionalTeams, divisionTeams
	listOfDivisionalTeams = []

	if (listOfSameLeagues.length > 1) {
		/* console.log(
			'WE HAVE MORE THAN ONE LEAGUE OF SAME NAME!! ' + listOfSameLeagues.length
		) */

		for (let i = 0; i < listOfSameLeagues.length; i++) {
			try {
				//console.log('NEW ITERATION ' + listOfSameLeagues[i]._id)
				divisionTeams = await Team.find({
					leagueId: listOfSameLeagues[i]._id,
				}).orFail()
			} catch (err) {
				const error = new HttpError(
					'No teams listed in first league in the list.  Maybe add some teams' +
						' to the league first  ' +
						err
				)
				return next(error)
			}
			//console.log('divisionTeams: ' + divisionTeams)
			divisionTeams.forEach((team) => {
				listOfDivisionalTeams.push(team)
			})
		}
	}

	//console.log('FINAL listOfDivisionalTeams: ' + listOfDivisionalTeams.length)

	//Since we have the leagueId, we want to tap into the TeamsDatabaseTable and find all the
	//teams with that leagueId
	//I put an empty catch bracket here, because I don't want to throw an error if
	//there are no teams.
	let listOfTeams, teams
	listOfTeams = []
	if (listOfDivisionalTeams.length === 0) {
		console.log('found no divisional teams')
		try {
			teams = await Team.find({
				leagueId: leagueId,
			}).orFail()
		} catch {}
		teams.forEach((team) => {
			listOfTeams.push(team)
		})
	}

	//alphabetized
	listOfTeams.sort((a, b) => a.teamName.localeCompare(b.teamName))

	listOfDivisionalTeams.sort((a, b) => a.teamName.localeCompare(b.teamName))

	//console.log('listOfTeams: ' + listOfTeams.length)
	if (listOfTeams.length === 0 && listOfDivisionalTeams === 0) {
		console.log('there are no teams in this league yet!')
		res.json({})
	} else if (listOfTeams.length > 0) {
		console.log('returning list of NON-divisional teams')
		res.json({
			listOfTeams,
		})
	} else if (listOfDivisionalTeams.length > 0) {
		console.log('returning list of divisional teams')
		res.json({
			listOfDivisionalTeams,
		})
	}
}
//
//
//****************************************************************************************** */
//
//  Get all players on a team
//
//
//****************************************************************************************** */
/* const getPlayersOnTeam = async (req, res, next) => {
	const leagueName = req.params.leagueName
	const session = req.params.session
	const year = req.params.year
	const teamName = req.params.teamName


	let leagueId
	let foundLeague
	let isCurrent
	try {
		foundLeague = await League.findOne({
			leagueName: leagueName,
			session: session,
			year: year,
		}).orFail()
	} catch (err) {
		const error = new HttpError(
			'Could not find league to obtain leagueId 1.  getPlayersOnTeam',
			404
		)
		return next(error)
	}
	leagueId = foundLeague.id
	isCurrent = foundLeague.isCurrent

	let teamId
	let foundTeam

	try {
		foundTeam = await Team.findOne({
			leagueId: leagueId,
			teamName: teamName,
		}).orFail()
	} catch (err) {
		const error = new HttpError(
			'Could not find team to obtain teamId 2.  getPlayersOnTeam',
			404
		)
		return next(error)
	}

	teamId = foundTeam.id

	let rosterId
	let foundRoster
	try {
		foundRoster = await Roster.findOne({
			leagueId: leagueId,
			teamId: teamId,
		}).orFail()
	} catch (err) {
		const error = new HttpError(
			'Could not find roster to obtain rosterId.  getPlayersOnTeam',
			404
		)
		return next(error)
	}
	rosterId = foundRoster.id
	
	let rosteredPlayers
	try {
		rosteredPlayers = await RosterPlayer.find({
			rosterId: rosterId,
		})
	} catch (err) {
		const error = new HttpError('Trouble finding players for this team', 404)
		return next(error)
	}

	res.json({ isCurrent: isCurrent, rosteredPlayers })
} */
//
//
//
//****************************************************************************************** */
//
//  Get all players on a team with a Division
//
//
//****************************************************************************************** */
const getPlayersOnTeamWithDivision = async (req, res, next) => {
	const leagueName = req.params.leagueName
	const divisionName = req.params.divisionName
	const session = req.params.session
	const year = req.params.year
	const teamName = req.params.teamName

	console.log('divisionName: ' + divisionName)

	//GET THE LEAGUE ID
	//to get the players, I need to find the leagueId.  Figure that out based
	//off what we get in useParams()
	//Here, once we tapped into the params, we'll match the leaguename, session, and year
	//against the LeagueDatabasTable and get the league id.
	//We want to know if the team is current so that if so, we can remove a player
	//from the team.  We don't want to be able to remove a player from an archived
	let leagueId
	let foundLeague
	let isCurrent
	try {
		foundLeague = await League.findOne({
			leagueName: leagueName,
			session: session,
			divisionName: divisionName,
			year: year,
		}).orFail()
	} catch (err) {
		const error = new HttpError(
			'Could not find league to obtain leagueId 1.  getPlayersOnTeamWithDivision',
			404
		)
		return next(error)
	}
	leagueId = foundLeague.id
	isCurrent = foundLeague.isCurrent
	//
	//
	//GET THE TEAM ID
	//We have the leagueId, and we have the teams name from the params.
	//So lets get the teamId
	let teamId
	let foundTeam

	try {
		foundTeam = await Team.findOne({
			leagueId: leagueId,
			teamName: teamName,
		}).orFail()
	} catch (err) {
		const error = new HttpError(
			'Could not find team to obtain teamId 2.  getPlayersOnTeamWithDivision',
			404
		)
		return next(error)
	}

	teamId = foundTeam.id
	//
	//
	//Now let's get the rosterId for that team.  We'll need it to find all the rosterPlayers
	//that have that rosterId
	let rosterId
	let foundRoster
	try {
		foundRoster = await Roster.findOne({
			leagueId: leagueId,
			teamId: teamId,
		}).orFail()
	} catch (err) {
		const error = new HttpError(
			'Could not find roster to obtain rosterId.  getPlayersOnTeamWithDivision',
			404
		)
		return next(error)
	}
	rosterId = foundRoster.id
	//
	//
	//
	//
	//Get all players in that roster.  This is where player id's and jersey numbers will be
	let rosteredPlayers
	try {
		rosteredPlayers = await RosterPlayer.find({
			rosterId: rosterId,
		})
	} catch (err) {
		const error = new HttpError(
			'Trouble finding players for this team.  getPlayersOnTeamWithDivision',
			404
		)
		return next(error)
	}
	//I don't think I want an error if there's no players.
	/* if (rosteredPlayers.length === 0) {
		return next(
			new HttpError('Could not find any players for the provided teamId', 404)
		)
	} */

	/* rosteredPlayers.sort((a, b) =>
		a.goals + a.assists < b.goals + b.assists ? 1 : -1
	) */

	res.json({ isCurrent: isCurrent, rosteredPlayers })
}
//
//
//
//****************************************************************************************** */
//
//  Get both rosters (home and visitor) and points per period for a specific game
//
//
//****************************************************************************************** */
const getGameRostersAndPointsPerPeriod = async (req, res, next) => {
	const gameId = req.params.gameId

	let homeRosterId, visitorRosterId, dayOfWeek, date, time, venue, opponent
	let foundGame
	let homeTeamId, foundHomeRoster
	try {
		foundGame = await Game.findById(gameId)
	} catch (err) {
		const error = new HttpError(
			'Could not find game to obtain home and visitor roster Ids.  getGameRostersAndPointsPerPeriod',
			404
		)
		return next(error)
	}
	//
	//
	teamName = foundGame.teamName
	opponent = foundGame.opponent
	//visitorRosterId = foundGame.visitorRosterId
	dayOfWeek = foundGame.dayOfWeek
	date = foundGame.date
	time = foundGame.time
	venue = foundGame.venueName
	//leagueName = foundGame.leagueName
	//
	//
	//let's get the most current Sloth team's id
	let foundTeam, teamNameId
	try {
		foundTeam = await Team.findOne({
			teamName: teamName,
			isCurrent: true,
		})
	} catch (err) {
		const error = new HttpError(
			'Trouble finding teamName.  getGameRostersAndPointsPerPeriod',
			404
		)
		return next(error)
	}
	foundTeam && console.log('foundTeam: ' + foundTeam)
	teamNameId = foundTeam._id
	console.log('foundTeam.id: ' + teamNameId)
	//
	//
	//Next, using this current sloths team teamId, let's get their rosterId
	//
	let foundRoster, rosterId
	try {
		foundRoster = await Roster.findOne({
			teamId: teamNameId,
		})
	} catch (err) {
		const error = new HttpError(
			'Trouble finding Roster.  getGameRostersAndPointsPerPeriod',
			404
		)
		return next(error)
	}
	rosterId = foundRoster._id
	console.log('foundRoster.id: ' + rosterId)
	//
	//Now that we have rosterId's, let's tap into the Roster record and grab teamId
	//let homeTeamId, foundHomeRoster
	/* console.log('homeRosterId: ' + homeRosterId)
	try {
		foundHomeRoster = await Roster.findById(homeRosterId)
	} catch (err) {
		const error = new HttpError(
			'Could not find roster to obtain home team id.  getGameRostersAndPointsPerPeriod',
			404
		)
		return next(error)
	}
	homeTeamId = foundHomeRoster.teamId */
	//
	//
	//
	/* let visitorTeamId, foundVisitorRoster
	try {
		foundVisitorRoster = await Roster.findById(visitorRosterId)
	} catch (err) {
		const error = new HttpError(
			'Could not find roster to obtain visitor team id.  getGameRostersAndPointsPerPeriod',
			404
		)
		return next(error)
	}
	visitorTeamId = foundVisitorRoster.teamId */
	//
	//
	//
	//Now that we have team id's, let's get the team names
	/* let homeTeamName, foundHomeTeam
	try {
		foundHomeTeam = await Team.findById(homeTeamId)
	} catch (err) {
		const error = new HttpError(
			'Could not find team to obtain home team name.  getGameRostersAndPointsPerPeriod',
			404
		)
		return next(error)
	}
	homeTeamName = foundHomeTeam.teamName */
	//
	//
	//
	/* let visitorTeamName, foundVisitorTeam
	try {
		foundVisitorTeam = await Team.findById(visitorTeamId)
	} catch (err) {
		const error = new HttpError(
			'Could not find team to obtain visitor team name.  getGameRostersAndPointsPerPeriod',
			404
		)
		return next(error)
	}
	visitorTeamName = foundVisitorTeam.teamName */
	//
	//Get all players on current sloths team.  This is where player id's and jersey numbers will be
	let currentSlothPlayers
	try {
		currentSlothPlayers = await RosterPlayer.find({
			rosterId: rosterId,
		})
	} catch (err) {
		const error = new HttpError(
			'Trouble finding players for current Sloths team.  getGameRostersAndPointsPerPeriod',
			404
		)
		return next(error)
	}
	//
	//
	//
	//Get all players on home roster.  This is where player id's and jersey numbers will be
	/* let visitorRosteredPlayers
	try {
		visitorRosteredPlayers = await RosterPlayer.find({
			rosterId: visitorRosterId,
		})
	} catch (err) {
		const error = new HttpError(
			'Trouble finding players for visiting team.  getGameRostersAndPointsPerPeriod',
			404
		)
		return next(error)
	} */
	//
	//
	//I think here, we want to see if we already HAVE player stats for this game.
	//For example, we already entered stats for this game, but realized we gave the
	//wrong person a goal.  We want to go in and fix that.  So we'd need to pre-populate
	//the form with stats data.  We'll need to tap into the rosterPlayerStatsPerGame
	//table to find any and all data
	let rosterPlayerGameStats
	try {
		rosterPlayerGameStats = await RosterPlayerStatsPerGame.find({
			gameId: gameId,
		})
	} catch (err) {
		const error = new HttpError(
			'Trouble finding players stats for this game.  getGameRostersAndPointsPerPeriod',
			404
		)
		return next(error)
	}

	//Finally, I think I want to get all the points per period for each team for this game
	//Later, I added in a search for playoff stats or championship game stats.  For the same
	//reason.  Like, they entered playoff/ship stats but they want to go back and correct.

	let gameStats
	if (foundGame.playoff) {
		try {
			gameStats = await PlayoffGameStats.find({ gameId: gameId })
		} catch (err) {
			const error = new HttpError(
				'Trouble finding PLAYOFF GAME stats for this game.  getGameRostersAndPointsPerPeriod',
				404
			)
			return next(error)
		}
	} else if (foundGame.championship) {
		try {
			gameStats = await ChampionshipGameStats.find({
				gameId: gameId,
			})
		} catch (err) {
			const error = new HttpError(
				'Trouble finding CHAMPIONSHIP GAME stats for this game.  getGameRostersAndPointsPerPeriod',
				404
			)
			return next(error)
		}
	} else {
		try {
			gameStats = await GameStats.find({
				gameId: gameId,
			})
		} catch (err) {
			const error = new HttpError(
				'Trouble finding GAME stats for this game.  getGameRostersAndPointsPerPeriod',
				404
			)
			return next(error)
		}
	}

	currentSlothPlayers.sort((a, b) => a.lastName.localeCompare(b.lastName))
	//visitorRosteredPlayers.sort((a, b) => a.lastName.localeCompare(b.lastName))

	res.json({
		homeRoster: currentSlothPlayers,
		//visitorRoster: visitorRosteredPlayers,
		teamName,
		//visitorTeamName,
		rosterPlayerGameStats,
		gameStats,
		dayOfWeek,
		date,
		time,
		venue,
		opponent,
		//leagueName,
	})
}
//
//
//
//****************************************************************************************** */
//
//I basically created these two API call to test my removeTeam and removePlayer calls
//
//****************************************************************************************** */
const getAllRosters = async (req, res, next) => {
	try {
		const filter = {}
		const all = await Roster.find(filter)
		res.json({ all })
	} catch (err) {
		const error = new HttpError('Something is wrong with getAllRosters', 500)
		return next(error)
	}
}
//
//
//This list is not sorted.  Might need to do that eventually
const getAllPlayers = async (req, res, next) => {
	try {
		const filter = {}
		const allPlayers = await Player.find(filter)
		res.json({ allPlayers })
	} catch (err) {
		const error = new HttpError('Something is wrong with getAllPlayers', 500)
		return next(error)
	}
}
//****************************************************************************************** */
//
// Get All Games and Events
// This will collect all scheduled games and events and return them as one big
// array, sorted by date
//
//****************************************************************************************** */
const allGamesAndEvents = async (req, res, next) => {
	let allEvents, allGames
	let allGamesAndEventsArray
	allGamesAndEventsArray = []

	try {
		//console.log('getting all events')
		const filter = {}
		allEvents = await Event.find(filter)
	} catch (err) {
		const error = new HttpError('Error getting all events', 500)
		return next(error)
	}

	for (let i = 0; i < allEvents.length; i++) {
		allGamesAndEventsArray.push(allEvents[i])
	}
	//
	//
	//
	//getting all games THAT ARE CURRENT
	try {
		allGames = await Game.find({
			isCurrent: true,
		})
	} catch (err) {
		const error = new HttpError('Error getting all (current) Games', 500)
		return next(error)
	}
	//
	//
	//
	//
	for (let i = 0; i < allGames.length; i++) {
		allGamesAndEventsArray.push(allGames[i])
	}

	//This little algorithm will sort all games and events based on first the
	//date, then the times
	allGamesAndEventsArray.sort(function (a, b) {
		if (a.date === b.date) {
			return a.time < b.time ? -1 : a.time > b.time ? 1 : 0
		} else {
			return new Date(b.date) < new Date(a.date) ? 1 : -1
		}
	})

	//Here, I want to return all games and events just from the previous 5 days on.
	//No need to go back in time forever...

	let currentDate = new Date()
	const before7Daysdate = new Date(
		currentDate.setDate(currentDate.getDate() - 2)
	)
	let allGamesAndEventsArrayFilteredByOneWeek
	allGamesAndEventsArrayFilteredByOneWeek = []

	for (let i = 0; i < allGamesAndEventsArray.length; i++) {
		const split = allGamesAndEventsArray[i].date.split('-')
		const month = split[0]
		const day = split[1]
		const year = split[2]
		const stringDate = '"' + year + '-' + month + '-' + day + '"'
		const convertedDate = new Date(stringDate)
		if (convertedDate > before7Daysdate || convertedDate === before7Daysdate) {
			allGamesAndEventsArrayFilteredByOneWeek.push(allGamesAndEventsArray[i])
		}
	}
	//res.json({ allItemsThisWeek: allGamesAndEventsArrayFilteredByOneWeek })
	//console.log('allItems: ' + allGamesAndEventsArray)

	//
	//
	//

	res.json({
		allItems: allGamesAndEventsArray,
		allItemsThisWeek: allGamesAndEventsArrayFilteredByOneWeek,
	})
}
//
//
//
//****************************************************************************************** */
//
// Get All Games and Events This Week
// Just like allGamesAndEvents, but just for this week
//
//
//****************************************************************************************** */
const allGamesAndEventsWeek = async (req, res, next) => {
	let allEvents, allGames
	let allGamesAndEventsArray
	allGamesAndEventsArray = []

	try {
		//console.log('getting all events')
		const filter = {}
		allEvents = await Event.find(filter)
	} catch (err) {
		const error = new HttpError('Error getting all events', 500)
		return next(error)
	}

	for (let i = 0; i < allEvents.length; i++) {
		allGamesAndEventsArray.push(allEvents[i])
	}
	//
	//
	//
	//getting all games THAT ARE CURRENT
	try {
		allGames = await Game.find({
			isCurrent: true,
		})
	} catch (err) {
		const error = new HttpError('Error getting all (current) Games', 500)
		return next(error)
	}
	//
	//
	//
	//
	for (let i = 0; i < allGames.length; i++) {
		allGamesAndEventsArray.push(allGames[i])
	}

	//This little algorithm will sort all games and events based on first the
	//date, then the times
	allGamesAndEventsArray.sort(function (a, b) {
		if (a.date === b.date) {
			return a.time < b.time ? -1 : a.time > b.time ? 1 : 0
		} else {
			return new Date(b.date) < new Date(a.date) ? 1 : -1
		}
	})

	//Here, I want to return all games and events just from the previous 5 days on.
	//No need to go back in time forever...

	let today = new Date()
	let currentDate = new Date()
	const sevenDaysLater = new Date(
		currentDate.setDate(currentDate.getDate() + 7)
	)
	let allGamesAndEventsArrayFilteredByOneWeek
	allGamesAndEventsArrayFilteredByOneWeek = []

	for (let i = 0; i < allGamesAndEventsArray.length; i++) {
		const split = allGamesAndEventsArray[i].date.split('-')
		const month = split[0]
		const day = split[1]
		const year = split[2]
		const stringDate = '"' + year + '-' + month + '-' + day + '"'
		const convertedDate = new Date(stringDate)

		//console.log('currentDate: ' + today)
		//console.log('sevenDaysLater: ' + sevenDaysLater)

		if (
			(convertedDate > today || convertedDate === today) &&
			(convertedDate < sevenDaysLater || convertedDate === sevenDaysLater)
		) {
			allGamesAndEventsArrayFilteredByOneWeek.push(allGamesAndEventsArray[i])
		}
	}

	res.json({ allItems: allGamesAndEventsArrayFilteredByOneWeek })

	//res.json({ allItems: allGamesAndEventsArray })
}
//
//
//
//****************************************************************************************** */
//
//POST request to create a new sloths team for the year
//
//****************************************************************************************** */
const createNewTeam = async (req, res, next) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		throw new HttpError('Invalid inputs - something is empty', 422)
	}

	const { teamName, year } = req.body

	console.log('inside createNewTeam for ' + teamName + ' ' + year)

	//First, let's check to see if the team already exists...
	let teamExists

	teamExists = await Team.findOne({
		teamName: teamName,
		year: year,
	})

	let createdTeam
	if (teamExists) {
		console.log('team already exists')
		const error = new HttpError('Team already exists', 409)
		return next(error)
	} else {
		createdTeam = new Team({
			teamName: teamName.trim(),
			wins: 0,
			losses: 0,
			ties: 0,
			overtimeLosses: 0,
			shootoutLosses: 0,
			goalsFor: 0,
			goalsAgainst: 0,
			assignedPlayers: 0,
			year: year,
			isCurrent: true,
		})
	}

	try {
		await createdTeam.save()
	} catch (err) {
		const error = new HttpError('Could not create new Team', 500)
		return next(error)
	}

	console.log('now lets create a new roster ' + createdTeam.id)
	const createdRoster1 = new Roster({
		//id: uuidv4(),
		//leagueId,
		teamId: createdTeam.id,
	})

	try {
		await createdRoster1.save()
	} catch (err) {
		const error = new HttpError(err, 500)
		return next(error)
	}

	console.log('new roster created...')

	//we created something new so conventionally, that'll be a 201
	res.status(201).json({ team: createdTeam })
}
//
//
//
//
//****************************************************************************************** */
//
//POST request to create a new league by COPYING an alread-exisiting league
//
//****************************************************************************************** */
const copyLeague = async (req, res, next) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		throw new HttpError(
			'Invalid inputs - something is empty in copyLeague',
			422
		)
	}
	console.log('Inside copyLeague')
	const { leagueToCopy, leagueName, divisionName, year, session } = req.body

	const previousLeagueId = leagueToCopy._id
	const previousLeagueName = leagueToCopy.leagueName
	const previousDivisionName = leagueToCopy.divisionName
	const previousSession = leagueToCopy.session
	const previousYear = leagueToCopy.year

	//First, let's check to see if the league already exists...
	let leagueExists
	if (divisionName) {
		leagueExists = await League.findOne({
			leagueName: leagueName,
			year: year,
			divisionName: divisionName,
			session: session,
		})
	}
	if (!divisionName) {
		leagueExists = await League.findOne({
			leagueName: leagueName,
			year: year,
			session: session,
		})
	}

	let createdLeague
	if (leagueExists) {
		console.log('copyLeague - league already exists')
		const error = new HttpError('League already exists', 409)
		return next(error)
	} else {
		createdLeague = new League({
			id: uuidv4(),
			leagueName: leagueName.trim(),
			divisionName: divisionName,
			year: year,
			session: session.trim(),
			isCurrent: true,
			numberOfTeams: 0,
		})
	}

	try {
		await createdLeague.save()
	} catch (err) {
		const error = new HttpError('Could not create new League', 500)
		return next(error)
	}

	//Next, we want to find all the teams from the previous league and copy them into
	//this new league
	console.log('leagueToCopy: ' + JSON.stringify(leagueToCopy))
	let listOfTeams, teamNameArray, oldRosterIds
	oldRosterIds = []
	teamNameArray = []
	//
	//
	//
	//
	//
	if (!leagueExists) {
		//We have the leagueId, we want to find all the teams with that leagueId
		//
		//I put an empty catch bracket here, because I don't want to throw an error if
		//there are no teams.
		//
		//
		//
		if (!divisionName) {
			try {
				listOfTeams = await Team.find({
					leagueId: previousLeagueId,
				}).orFail()
			} catch {}
		}
		if (divisionName) {
			try {
				listOfTeams = await Team.find({
					leagueId: previousLeagueId,
					divisionName: previousDivisionName,
				}).orFail()
			} catch {}
		}
		//
		// Next, we need to get a list of all the old roster ids
		// We'll pair this array up with the upcoming teamNameArray so
		// we can populate this new league with the same players on the same
		// team from before.
		//
		console.log('listOfTeams: ' + listOfTeams)
		//
		let oldRosterId
		if (listOfTeams.length > 0) {
			for (let i = 0; i < listOfTeams.length; i++) {
				/* console.log(
					'looking for old rosterid for ' +
						listOfTeams[i].teamName +
						', ' +
						listOfTeams[i]._id +
						', ' +
						previousLeagueId +
						', ' +
						previousDivisionName
				) */
				oldRosterId = await Roster.findOne({
					leagueId: previousLeagueId,
					//divisionName: previousDivisionName && previousDivisionName,
					teamId: listOfTeams[i]._id,
				})
				//console.log('you are here ' + oldRosterId)
				oldRosterIds.push(oldRosterId._id)
			}
		}
		//
		//
		console.log('oldRosterIds: ' + oldRosterIds)

		//for each team in our old league, we want to create new versions of them in this new league.
		//We've got team names, we've got the teams previous roster ids.  So, for each team that we create, we need
		//to add all the players from the PREVIOUS roster into the new roster.
		//So...I think we'll start by making an array of all the team names.
		if (listOfTeams.length > 0) {
			listOfTeams.forEach((team) => {
				teamNameArray.push(team.teamName)
			})
		}
		//console.log('teamNameArray: ' + teamNameArray)
		//console.log('new league id: ' + createdLeague._id)

		let copiedTeam, copiedRoster, copiedRosterPlayer
		//
		//
		//
		//
		//
		let previousPlayers, previousRosterPlayers
		previousRosterPlayers = []
		//
		for (let i = 0; i < teamNameArray.length; i++) {
			console.log('creating new team: ' + listOfTeams[i].teamName)
			copiedTeam = new Team({
				teamName: listOfTeams[i].teamName,
				leagueId: createdLeague._id,
				wins: 0,
				losses: 0,
				ties: 0,
				overtimeLosses: 0,
				shootoutLosses: 0,
				goalsFor: 0,
				goalsAgainst: 0,
				assignedPlayers: 0,
				seed: 0,
			})
			try {
				await copiedTeam.save()
			} catch (err) {
				const error = new HttpError(
					'Could not create new team from copied league: ' + err,
					500
				)
				return next(error)
			}
			copiedRoster = new Roster({
				id: uuidv4(),
				leagueId: createdLeague._id,
				teamId: copiedTeam.id,
			})
			//remember to create a new roster every time you create a new league
			try {
				await copiedRoster.save()
			} catch (err) {
				const error = new HttpError(
					'Could not create new roster from copied league: ' + err,
					500
				)
				return next(error)
			}
			//Now let's increment the number of teams in this new league by 1
			createdLeague.numberOfTeams = createdLeague.numberOfTeams + 1
			try {
				await createdLeague.save()
			} catch (err) {
				const error = new HttpError(
					'Could not save league after incrementing number of teams: ' + err,
					500
				)
				return next(error)
			}
			/* console.log(
				'old rosterId for this team: ' +
					oldRosterIds[i] +
					' ' +
					listOfTeams[i].teamName
			) */

			previousPlayers = await RosterPlayer.find({
				leagueId: previousLeagueId,
				//divisionName: previousDivisionName,
				teamName: listOfTeams[i].teamName,
			})
			//console.log('previousPlayers: ' + previousPlayers)
			previousRosterPlayers.push(previousPlayers)
			//
			//
			for (let i = 0; i < previousPlayers.length; i++) {
				if (previousPlayers[i].teamName === copiedTeam.teamName) {
					console.log(
						'we have a match: ' +
							previousPlayers[i].firstName +
							' ' +
							previousPlayers[i].lastName +
							' ' +
							copiedTeam.teamName
					)

					copiedRosterPlayer = new RosterPlayer({
						leagueId: createdLeague._id,
						playerId: previousPlayers[i].playerId,
						firstName: previousPlayers[i].firstName,
						middleInitital: previousPlayers[i].middleInitial,
						lastName: previousPlayers[i].lastName,
						rosterId: copiedRoster.id,
						teamName: copiedTeam.teamName,
						leagueName: leagueName,
						divisionName: divisionName,
						session: session,
						year: year,
						number: previousPlayers[i].number,
						goals: 0,
						assists: 0,
					})
					try {
						await copiedRosterPlayer.save()
					} catch (err) {
						const error = new HttpError(
							'Could not create new rosterPlayer from copied roster players: ' +
								err,
							500
						)
						return next(error)
					}
					copiedTeam.assignedPlayers = copiedTeam.assignedPlayers + 1
					try {
						await copiedTeam.save()
					} catch (err) {
						const error = new HttpError(
							'Could not save new team.  copyLeague: ' + err,
							500
						)
						return next(error)
					}
				}
			}
		}
	}
	res.status(201).json({ league: createdLeague })
}
//
//****************************************************************************************** */
//
//POST request to create a new VENUE
//
//****************************************************************************************** */
const createNewVenue = async (req, res, next) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		throw new HttpError(
			'Invalid inputs - something is empty.  createNewVenue',
			422
		)
	}

	const { venueName, venueAddress } = req.body

	//First, let's check to see if the venue already exists...
	const venueExists = await Venue.findOne({
		venueName: venueName.trim(),
		venueAddress: venueAddress.trim(),
	})

	let createdVenue
	if (venueExists) {
		console.log('venue already exists')
		const error = new HttpError('Venue already exists', 409)
		return next(error)
	} else {
		createdVenue = new Venue({
			id: uuidv4(),
			venueName: venueName.trim(),
			venueAddress: venueAddress.trim(),
		})
	}

	try {
		await createdVenue.save()
	} catch (err) {
		const error = new HttpError('Could not create new Venue', 500)
		return next(error)
	}

	//we created something new so conventionally, that'll be a 201
	res.status(201).json({ venue: createdVenue })
}
//
//
//
//****************************************************************************************** */
//
//POST request to create a new Video
//
//****************************************************************************************** */
const createNewVideo = async (req, res, next) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		throw new HttpError(
			'Invalid inputs - something is empty.  createNewVideo',
			422
		)
	}

	const { videoTitle, videoURL, videoCaption } = req.body

	//First, let's check to see if the venue already exists...
	const videoExists = await Venue.findOne({
		videoTitle: videoTitle.trim(),
		videoURL: videoURL.trim(),
	})

	let createdVideo
	if (videoExists) {
		console.log('video already exists')
		const error = new HttpError('Video already exists', 409)
		return next(error)
	} else {
		createdVideo = new Video({
			id: uuidv4(),
			videoTitle: videoTitle.trim(),
			videoURL: videoURL.trim(),
			videoCaption: videoCaption.trim(),
		})
	}

	try {
		await createdVideo.save()
	} catch (err) {
		const error = new HttpError('Could not create new Video', 500)
		return next(error)
	}

	//we created something new so conventionally, that'll be a 201
	res.status(201).json({ video: createdVideo })
}
//
//
//
//****************************************************************************************** */
//
//This is for adding a new player to the SYSTEM
//It is NOT for adding an already-existing player to a team.
//
//****************************************************************************************** */
const createNewPlayer = async (req, res, next) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		throw new HttpError('Invalid inputs - something is empty', 422)
	}

	const {
		firstName1,
		middleInitial1,
		lastName1,
		firstName2,
		middleInitial2,
		lastName2,
		firstName3,
		middleInitial3,
		lastName3,
		firstName4,
		middleInitial4,
		lastName4,
		firstName5,
		middleInitial5,
		lastName5,
		firstName6,
		middleInitial6,
		lastName6,
		firstName7,
		middleInitial7,
		lastName7,
		firstName8,
		middleInitial8,
		lastName8,
		firstName9,
		middleInitial9,
		lastName9,
		firstName10,
		middleInitial10,
		lastName10,
	} = req.body

	let createdPlayer1,
		createdPlayer2,
		createdPlayer3,
		createdPlayer4,
		createdPlayer5,
		createdPlayer6,
		createdPlayer7,
		createdPlayer8,
		createdPlayer9,
		createdPlayer10
	//********************************************************************************* *
	//
	//    BRAND NEW PLAYER 1
	//
	//*********************************************************************************/
	//First, let's check to see if the player already exists...
	//console.log(firstName1 + ' ' + lastName1)
	let player1Exists

	const firstName1v2 = firstName1.trim().replace(/\s+/g, '-')
	const lastName1v2 = lastName1.trim().replace(/\s+/g, '-')
	//This line below is in case someone doesnt accidentally put a space in as a middle name.
	//that will confuse the system.  So if there's a space as a middle name, this will trim it.
	const middleInitial1v2 = middleInitial1 && middleInitial1.trim()

	if (middleInitial1v2) {
		player1Exists = await Player.findOne({
			firstName: firstName1v2,
			middleInitial: middleInitial1v2,
			lastName: lastName1v2,
		})
	} else {
		player1Exists = await Player.findOne({
			firstName: firstName1v2,
			lastName: lastName1v2,
		})
	}

	if (player1Exists) {
		console.log('player 1 already exists')
		const error = new HttpError('Player 1 already exists', 409)
		return next(error)
	} else {
		if (!middleInitial1v2) {
			createdPlayer1 = new Player({
				firstName: firstName1v2,
				middleInitial: '',
				lastName: lastName1v2,
			})
		} else {
			createdPlayer1 = new Player({
				firstName: firstName1v2,
				middleInitial: middleInitial1.trim(),
				lastName: lastName1v2,
			})
		}
	}
	try {
		await createdPlayer1.save()
	} catch (err) {
		// const error = new HttpError('Could not create new Player 1', 500)
		const error = new HttpError(err, 500)
		return next(error)
	}
	//********************************************************************************* *
	//
	//    BRAND NEW PLAYER 2
	//
	//*********************************************************************************/
	//First, let's check to see if the player already exists...
	if (firstName2) {
		const firstName2v2 = firstName2.trim().replace(/\s+/g, '-')
		const lastName2v2 = lastName2.trim().replace(/\s+/g, '-')
		const middleInitial2v2 = middleInitial2 && middleInitial2.trim()

		let player2Exists
		if (middleInitial2v2) {
			player2Exists = await Player.findOne({
				firstName: firstName2v2,
				middleInitial: middleInitial2v2,
				lastName: lastName2v2,
			})
		} else {
			player2Exists = await Player.findOne({
				firstName: firstName2v2,
				lastName: lastName2v2,
			})
		}

		if (player2Exists) {
			createdPlayer1 && createdPlayer1.deleteOne()
			console.log('player 2 already exists')
			const error = new HttpError('Player 2 already exists', 409)
			return next(error)
		} else {
			if (!middleInitial2v2) {
				createdPlayer2 = new Player({
					firstName: firstName2v2,
					middleInitial: '',
					lastName: lastName2v2,
				})
			} else {
				createdPlayer2 = new Player({
					firstName: firstName2v2,
					middleInitial: middleInitial2.trim(),
					lastName: lastName2v2,
				})
			}
		}
		try {
			await createdPlayer2.save()
		} catch (err) {
			createdPlayer1 && createdPlayer1.deleteOne()
			const error = new HttpError('Could not create new Player 2', 500)
			return next(error)
		}
	}
	//********************************************************************************* *
	//
	//    BRAND NEW PLAYER 3
	//
	//*********************************************************************************/
	//First, let's check to see if the player already exists...
	if (firstName3) {
		const firstName3v2 = firstName3.trim().replace(/\s+/g, '-')
		const lastName3v2 = lastName3.trim().replace(/\s+/g, '-')
		const middleInitial3v2 = middleInitial3 && middleInitial3.trim()

		let player3Exists
		if (middleInitial3v2) {
			player3Exists = await Player.findOne({
				firstName: firstName3v2,
				middleInitial: middleInitial3v2,
				lastName: lastName3v2,
			})
		} else {
			player3Exists = await Player.findOne({
				firstName: firstName3v2,
				lastName: lastName3v2,
			})
		}

		if (player3Exists) {
			createdPlayer1 && createdPlayer1.deleteOne()
			createdPlayer2 && createdPlayer2.deleteOne()
			console.log('player 3 already exists')
			const error = new HttpError('Player 3 already exists', 409)
			return next(error)
		} else {
			if (!middleInitial3v2) {
				createdPlayer3 = new Player({
					firstName: firstName3v2,
					middleInitial: '',
					lastName: lastName3v2,
				})
			} else {
				createdPlayer3 = new Player({
					firstName: firstName3v2,
					middleInitial: middleInitial3.trim(),
					lastName: lastName3v2,
				})
			}
		}
		try {
			await createdPlayer3.save()
		} catch (err) {
			createdPlayer1 && createdPlayer1.deleteOne()
			createdPlayer2 && createdPlayer2.deleteOne()
			const error = new HttpError('Could not create new Player 3', 500)
			return next(error)
		}
	}
	//********************************************************************************* *
	//
	//    BRAND NEW PLAYER 4
	//
	//*********************************************************************************/
	//First, let's check to see if the player already exists...
	if (firstName4) {
		const firstName4v2 = firstName4.trim().replace(/\s+/g, '-')
		const lastName4v2 = lastName4.trim().replace(/\s+/g, '-')
		const middleInitial4v2 = middleInitial4 && middleInitial4.trim()

		let player4Exists
		if (middleInitial4v2) {
			player4Exists = await Player.findOne({
				firstName: firstName4v2,
				middleInitial: middleInitial4v2,
				lastName: lastName4v2,
			})
		} else {
			player4Exists = await Player.findOne({
				firstName: firstName4v2,
				lastName: lastName4v2,
			})
		}

		if (player4Exists) {
			createdPlayer1 && createdPlayer1.deleteOne()
			createdPlayer2 && createdPlayer2.deleteOne()
			createdPlayer3 && createdPlayer3.deleteOne()
			console.log('player 4 already exists')
			const error = new HttpError('Player 4 already exists', 409)
			return next(error)
		} else {
			if (!middleInitial4v2) {
				createdPlayer4 = new Player({
					firstName: firstName4v2,
					middleInitial: '',
					lastName: lastName4v2,
				})
			} else {
				createdPlayer4 = new Player({
					firstName: firstName4v2,
					middleInitial: middleInitial4.trim(),
					lastName: lastName4v2,
				})
			}
		}
		try {
			await createdPlayer4.save()
		} catch (err) {
			createdPlayer1 && createdPlayer1.deleteOne()
			createdPlayer2 && createdPlayer2.deleteOne()
			createdPlayer3 && createdPlayer3.deleteOne()
			const error = new HttpError('Could not create new Player 4', 500)
			return next(error)
		}
	}
	//********************************************************************************* *
	//
	//    BRAND NEW PLAYER 5
	//
	//*********************************************************************************/
	//First, let's check to see if the player already exists...
	if (firstName5) {
		const firstName5v2 = firstName5.trim().replace(/\s+/g, '-')
		const lastName5v2 = lastName5.trim().replace(/\s+/g, '-')
		const middleInitial5v2 = middleInitial5 && middleInitial5.trim()

		let player5Exists
		if (middleInitial5v2) {
			player5Exists = await Player.findOne({
				firstName: firstName5v2,
				middleInitial: middleInitial5v2,
				lastName: lastName5v2,
			})
		} else {
			player5Exists = await Player.findOne({
				firstName: firstName5v2,
				lastName: lastName5v2,
			})
		}

		if (player5Exists) {
			createdPlayer1 && createdPlayer1.deleteOne()
			createdPlayer2 && createdPlayer2.deleteOne()
			createdPlayer3 && createdPlayer3.deleteOne()
			createdPlayer4 && createdPlayer4.deleteOne()
			console.log('player 5 already exists')
			const error = new HttpError('Player 5 already exists', 409)
			return next(error)
		} else {
			if (!middleInitial5v2) {
				createdPlayer5 = new Player({
					firstName: firstName5v2,
					middleInitial: '',
					lastName: lastName5v2,
				})
			} else {
				createdPlayer5 = new Player({
					firstName: firstName5v2,
					middleInitial: middleInitial5.trim(),
					lastName: lastName5v2,
				})
			}
		}
		try {
			await createdPlayer5.save()
		} catch (err) {
			createdPlayer1 && createdPlayer1.deleteOne()
			createdPlayer2 && createdPlayer2.deleteOne()
			createdPlayer3 && createdPlayer3.deleteOne()
			createdPlayer4 && createdPlayer4.deleteOne()
			const error = new HttpError('Could not create new Player 5', 500)
			return next(error)
		}
	}
	//********************************************************************************* *
	//
	//    BRAND NEW PLAYER 6
	//
	//*********************************************************************************/
	//First, let's check to see if the player already exists...
	if (firstName6) {
		const firstName6v2 = firstName6.trim().replace(/\s+/g, '-')
		const lastName6v2 = lastName6.trim().replace(/\s+/g, '-')
		const middleInitial6v2 = middleInitial6 && middleInitial6.trim()

		let player6Exists
		if (middleInitial6v2) {
			player6Exists = await Player.findOne({
				firstName: firstName6v2,
				middleInitial: middleInitial6v2,
				lastName: lastName6v2,
			})
		} else {
			player6Exists = await Player.findOne({
				firstName: firstName6.trim(),
				lastName: lastName6.trim(),
			})
		}

		if (player6Exists) {
			createdPlayer1 && createdPlayer1.deleteOne()
			createdPlayer2 && createdPlayer2.deleteOne()
			createdPlayer3 && createdPlayer3.deleteOne()
			createdPlayer4 && createdPlayer4.deleteOne()
			createdPlayer5 && createdPlayer5.deleteOne()
			console.log('player 6 already exists')
			const error = new HttpError('Player 6 already exists', 409)
			return next(error)
		} else {
			if (!middleInitial6v2) {
				createdPlayer6 = new Player({
					firstName: firstName6v2,
					middleInitial: '',
					lastName: lastName6v2,
				})
			} else {
				createdPlayer6 = new Player({
					firstName: firstName6v2,
					middleInitial: middleInitial6.trim(),
					lastName: lastName6v2,
				})
			}
		}
		try {
			await createdPlayer6.save()
		} catch (err) {
			createdPlayer1 && createdPlayer1.deleteOne()
			createdPlayer2 && createdPlayer2.deleteOne()
			createdPlayer3 && createdPlayer3.deleteOne()
			createdPlayer4 && createdPlayer4.deleteOne()
			createdPlayer5 && createdPlayer5.deleteOne()
			const error = new HttpError('Could not create new Player 6', 500)
			return next(error)
		}
	}
	//********************************************************************************* *
	//
	//    BRAND NEW PLAYER 7
	//
	//*********************************************************************************/
	//First, let's check to see if the player already exists...
	if (firstName7) {
		const firstName7v2 = firstName7.trim().replace(/\s+/g, '-')
		const lastName7v2 = lastName7.trim().replace(/\s+/g, '-')
		const middleInitial7v2 = middleInitial7 && middleInitial7.trim()

		let player7Exists
		if (middleInitial7v2) {
			player7Exists = await Player.findOne({
				firstName: firstName7v2,
				middleInitial: middleInitial7v2,
				lastName: lastName7v2,
			})
		} else {
			player7Exists = await Player.findOne({
				firstName: firstName7v2,
				lastName: lastName7v2,
			})
		}

		if (player7Exists) {
			createdPlayer1 && createdPlayer1.deleteOne()
			createdPlayer2 && createdPlayer2.deleteOne()
			createdPlayer3 && createdPlayer3.deleteOne()
			createdPlayer4 && createdPlayer4.deleteOne()
			createdPlayer5 && createdPlayer5.deleteOne()
			createdPlayer6 && createdPlayer6.deleteOne()
			console.log('player 7 already exists')
			const error = new HttpError('Player 7 already exists', 409)
			return next(error)
		} else {
			if (!middleInitial7v2) {
				createdPlayer7 = new Player({
					firstName: firstName7v2,
					middleInitial: '',
					lastName: lastName7v2,
				})
			} else {
				createdPlayer7 = new Player({
					firstName: firstName7v2,
					middleInitial: middleInitial7.trim(),
					lastName: lastName7v2,
				})
			}
		}
		try {
			await createdPlayer7.save()
		} catch (err) {
			createdPlayer1 && createdPlayer1.deleteOne()
			createdPlayer2 && createdPlayer2.deleteOne()
			createdPlayer3 && createdPlayer3.deleteOne()
			createdPlayer4 && createdPlayer4.deleteOne()
			createdPlayer5 && createdPlayer5.deleteOne()
			createdPlayer6 && createdPlayer6.deleteOne()
			const error = new HttpError('Could not create new Player 7', 500)
			return next(error)
		}
	}
	//********************************************************************************* *
	//
	//    BRAND NEW PLAYER 8
	//
	//*********************************************************************************/
	//First, let's check to see if the player already exists...
	if (firstName8) {
		const firstName8v2 = firstName8.trim().replace(/\s+/g, '-')
		const lastName8v2 = lastName8.trim().replace(/\s+/g, '-')
		const middleInitial8v2 = middleInitial8 && middleInitial8.trim()

		let player8Exists
		if (middleInitial8v2) {
			player8Exists = await Player.findOne({
				firstName: firstName8v2,
				middleInitial: middleInitial8v2,
				lastName: lastName8v2,
			})
		} else {
			player8Exists = await Player.findOne({
				firstName: firstName8v2,
				lastName: lastName8v2,
			})
		}

		if (player8Exists) {
			createdPlayer1 && createdPlayer1.deleteOne()
			createdPlayer2 && createdPlayer2.deleteOne()
			createdPlayer3 && createdPlayer3.deleteOne()
			createdPlayer4 && createdPlayer4.deleteOne()
			createdPlayer5 && createdPlayer5.deleteOne()
			createdPlayer6 && createdPlayer6.deleteOne()
			createdPlayer7 && createdPlayer7.deleteOne()
			console.log('player 8 already exists')
			const error = new HttpError('Player 8 already exists', 409)
			return next(error)
		} else {
			if (!middleInitial8v2) {
				createdPlayer8 = new Player({
					firstName: firstName8v2,
					middleInitial: '',
					lastName: lastName8v2,
				})
			} else {
				createdPlayer8 = new Player({
					firstName: firstName8v2,
					middleInitial: middleInitial8.trim(),
					lastName: lastName8v2,
				})
			}
		}
		try {
			await createdPlayer8.save()
		} catch (err) {
			createdPlayer1 && createdPlayer1.deleteOne()
			createdPlayer2 && createdPlayer2.deleteOne()
			createdPlayer3 && createdPlayer3.deleteOne()
			createdPlayer4 && createdPlayer4.deleteOne()
			createdPlayer5 && createdPlayer5.deleteOne()
			createdPlayer6 && createdPlayer6.deleteOne()
			createdPlayer7 && createdPlayer7.deleteOne()
			const error = new HttpError('Could not create new Player 8', 500)
			return next(error)
		}
	}
	//********************************************************************************* *
	//
	//    BRAND NEW PLAYER 9
	//
	//*********************************************************************************/
	//First, let's check to see if the player already exists...
	if (firstName9) {
		const firstName9v2 = firstName9.trim().replace(/\s+/g, '-')
		const lastName9v2 = lastName9.trim().replace(/\s+/g, '-')
		const middleInitial9v2 = middleInitial9 && middleInitial9.trim()

		let player9Exists
		if (middleInitial9v2) {
			player9Exists = await Player.findOne({
				firstName: firstName9v2,
				middleInitial: middleInitial9v2,
				lastName: lastName9v2,
			})
		} else {
			player9Exists = await Player.findOne({
				firstName: firstName9v2,
				lastName: lastName9v2,
			})
		}

		if (player9Exists) {
			createdPlayer1 && createdPlayer1.deleteOne()
			createdPlayer2 && createdPlayer2.deleteOne()
			createdPlayer3 && createdPlayer3.deleteOne()
			createdPlayer4 && createdPlayer4.deleteOne()
			createdPlayer5 && createdPlayer5.deleteOne()
			createdPlayer6 && createdPlayer6.deleteOne()
			createdPlayer7 && createdPlayer7.deleteOne()
			createdPlayer8 && createdPlayer8.deleteOne()
			console.log('player 9 already exists')
			const error = new HttpError('Player 9 already exists', 409)
			return next(error)
		} else {
			if (!middleInitial9v2) {
				createdPlayer9 = new Player({
					firstName: firstName9v2,
					middleInitial: '',
					lastName: lastName9v2,
				})
			} else {
				createdPlayer9 = new Player({
					firstName: firstName9v2,
					middleInitial: middleInitial9.trim(),
					lastName: lastName9v2,
				})
			}
		}
		try {
			await createdPlayer9.save()
		} catch (err) {
			createdPlayer1 && createdPlayer1.deleteOne()
			createdPlayer2 && createdPlayer2.deleteOne()
			createdPlayer3 && createdPlayer3.deleteOne()
			createdPlayer4 && createdPlayer4.deleteOne()
			createdPlayer5 && createdPlayer5.deleteOne()
			createdPlayer6 && createdPlayer6.deleteOne()
			createdPlayer7 && createdPlayer7.deleteOne()
			createdPlayer8 && createdPlayer8.deleteOne()
			const error = new HttpError('Could not create new Player 9', 500)
			return next(error)
		}
	}
	//********************************************************************************* *
	//
	//    BRAND NEW PLAYER 10
	//
	//*********************************************************************************/
	//First, let's check to see if the player already exists...
	if (firstName10) {
		const firstName10v2 = firstName10.trim().replace(/\s+/g, '-')
		const lastName10v2 = lastName10.trim().replace(/\s+/g, '-')
		const middleInitial10v2 = middleInitial10 && middleInitial10.trim()

		let player10Exists
		if (middleInitial10v2) {
			player10Exists = await Player.findOne({
				firstName: firstName10v2,
				middleInitial: middleInitial10v2,
				lastName: lastName10v2,
			})
		} else {
			player10Exists = await Player.findOne({
				firstName: firstName10v2,
				lastName: lastName10v2,
			})
		}

		if (player10Exists) {
			createdPlayer1 && createdPlayer1.deleteOne()
			createdPlayer2 && createdPlayer2.deleteOne()
			createdPlayer3 && createdPlayer3.deleteOne()
			createdPlayer4 && createdPlayer4.deleteOne()
			createdPlayer5 && createdPlayer5.deleteOne()
			createdPlayer6 && createdPlayer6.deleteOne()
			createdPlayer7 && createdPlayer7.deleteOne()
			createdPlayer8 && createdPlayer8.deleteOne()
			createdPlayer9 && createdPlayer9.deleteOne()
			console.log('player 10 already exists')
			const error = new HttpError('Player 10 already exists', 409)
			return next(error)
		} else {
			if (!middleInitial10v2) {
				createdPlayer10 = new Player({
					firstName: firstName10v2,
					middleInitial: '',
					lastName: lastName10v2,
				})
			} else {
				createdPlayer10 = new Player({
					firstName: firstName10v2,
					middleInitial: middleInitial10.trim(),
					lastName: lastName10v2,
				})
			}
		}
		try {
			await createdPlayer10.save()
		} catch (err) {
			createdPlayer1 && createdPlayer1.deleteOne()
			createdPlayer2 && createdPlayer2.deleteOne()
			createdPlayer3 && createdPlayer3.deleteOne()
			createdPlayer4 && createdPlayer4.deleteOne()
			createdPlayer5 && createdPlayer5.deleteOne()
			createdPlayer6 && createdPlayer6.deleteOne()
			createdPlayer7 && createdPlayer7.deleteOne()
			createdPlayer8 && createdPlayer8.deleteOne()
			createdPlayer9 && createdPlayer9.deleteOne()
			const error = new HttpError('Could not create new Player 10', 500)
			return next(error)
		}
	}
	//we created something new so conventionally, that'll be a 201
	res.status(201).json({
		players: createdPlayer1,
		createdPlayer2,
		createdPlayer3,
		createdPlayer4,
		createdPlayer5,
		createdPlayer6,
		createdPlayer7,
		createdPlayer8,
		createdPlayer9,
		createdPlayer10,
	})
}
//
//
//****************************************************************************************** */
//
//Create a new team(s) for a given league.
//We get the leagueName, session, and year in our params, so we need to
//find the leagueId.
//This call will need to be made multiple times possibly, for each new team request.
//
//****************************************************************************************** */
/* const createNewTeam = async (req, res, next) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		throw new HttpError(JSON.stringify(errors), 422)
	}

	const leagueName = req.params.leagueName
	const session = req.params.session
	const year = req.params.year

	//First, let's find the leagueId:
	let leagueId
	let foundLeague
	try {
		foundLeague = await League.findOne({
			leagueName: leagueName,
			session: session,
			year: year,
		}).orFail()
	} catch (err) {
		const error = new HttpError('Finding league failed.  createNewTeam', 500)
		return next(error)
	}
	leagueId = foundLeague.id
	//
	//We get the teamName via the request (from the user input),
	//then create our new team for the league
	//const { teamName1, teamName2, teamName3, teamName4, teamName5 } = req.body
	const { teamName1, teamName2, teamName3, teamName4, teamName5 } = req.body

	//Now, let's find out if this team already exists...
	console.log('you are here 3')
	const teamExists1 = await Team.findOne({
		teamName: teamName1,
		leagueId: leagueId,
		session: session,
		year: year,
	})

	let createdTeam1
	if (teamExists1) {
		const error = new HttpError(
			teamName1 + ' already exists in this league',
			409
		)
		return next(error)
	} else {
		createdTeam1 = new Team({
			teamName: teamName1.trim(),
			leagueId,
			wins: 0,
			losses: 0,
			ties: 0,
			overtimeLosses: 0,
			shootoutLosses: 0,
			goalsFor: 0,
			goalsAgainst: 0,
			points: 0,
			assignedPlayers: 0,
			seed: 0,
		})
	}
	try {
		await createdTeam1.save()
	} catch (err) {
		const error = new HttpError('Could not create new Team1', 500)
		return next(error)
	}
	const createdRoster1 = new Roster({
		id: uuidv4(),
		leagueId,
		teamId: createdTeam1.id,
	})

	try {
		await createdRoster1.save()
	} catch (err) {
		const error = new HttpError(err, 500)
		return next(error)
	}
	//
	//
	//
	//
	//Team 2
	let teamExists2, createdTeam2, createdRoster2
	if (teamName2) {
		teamExists2 = await Team.findOne({
			teamName: teamName2,
			leagueId: leagueId,
			session: session,
			year: year,
		})

		if (teamExists2) {
			createdTeam1.deleteOne()
			createdRoster1.deleteOne()
			const error = new HttpError(
				teamName2 + ' already exists in this league',
				409
			)
			return next(error)
		} else {
			createdTeam2 = new Team({
				teamName: teamName2.trim(),
				leagueId,
				wins: 0,
				losses: 0,
				ties: 0,
				overtimeLosses: 0,
				shootoutLosses: 0,
				goalsFor: 0,
				goalsAgainst: 0,
				points: 0,
				assignedPlayers: 0,
				seed: 0,
			})
		}
		createdRoster2 = new Roster({
			id: uuidv4(),
			leagueId,
			teamId: createdTeam2.id,
		})
		try {
			await createdTeam2.save()
		} catch (err) {
			const error = new HttpError('Could not create new Team2', 500)
			return next(error)
		}
		try {
			await createdRoster2.save()
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
	}
	//
	//
	//
	//
	//Team 3
	let teamExists3, createdTeam3, createdRoster3
	if (teamName3) {
		teamExists3 = await Team.findOne({
			teamName: teamName3,
			leagueId: leagueId,
			session: session,
			year: year,
		})

		if (teamExists3) {
			createdTeam1.deleteOne()
			createdRoster1.deleteOne()
			createdTeam2.deleteOne()
			createdRoster2.deleteOne()
			const error = new HttpError(
				teamName3 + ' already exists in this league',
				409
			)
			return next(error)
		} else {
			createdTeam3 = new Team({
				teamName: teamName3.trim(),
				leagueId,
				wins: 0,
				losses: 0,
				ties: 0,
				overtimeLosses: 0,
				shootoutLosses: 0,
				goalsFor: 0,
				goalsAgainst: 0,
				points: 0,
				assignedPlayers: 0,
				seed: 0,
			})
		}
		createdRoster3 = new Roster({
			id: uuidv4(),
			leagueId,
			teamId: createdTeam3.id,
		})
		try {
			await createdTeam3.save()
		} catch (err) {
			const error = new HttpError('Could not create new Team3', 500)
			return next(error)
		}
		try {
			await createdRoster3.save()
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
	}
	//
	//
	//
	//
	//Team 4
	let teamExists4, createdTeam4, createdRoster4
	if (teamName4) {
		teamExists4 = await Team.findOne({
			teamName: teamName4,
			leagueId: leagueId,
			session: session,
			year: year,
		})

		if (teamExists4) {
			createdTeam1.deleteOne()
			createdRoster1.deleteOne()
			createdTeam2.deleteOne()
			createdRoster2.deleteOne()
			createdTeam3.deleteOne()
			createdRoster3.deleteOne()
			const error = new HttpError(
				teamName4 + ' already exists in this league',
				409
			)
			return next(error)
		} else {
			createdTeam4 = new Team({
				teamName: teamName4,
				leagueId,
				wins: 0,
				losses: 0,
				ties: 0,
				overtimeLosses: 0,
				shootoutLosses: 0,
				goalsFor: 0,
				goalsAgainst: 0,
				points: 0,
				assignedPlayers: 0,
				seed: 0,
			})
		}
		createdRoster4 = new Roster({
			id: uuidv4(),
			leagueId,
			teamId: createdTeam4.id,
		})
		try {
			await createdTeam4.save()
		} catch (err) {
			const error = new HttpError('Could not create new Team4', 500)
			return next(error)
		}
		try {
			await createdRoster4.save()
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
	}
	//
	//
	//
	//
	//Team 5
	let teamExists5, createdTeam5, createdRoster5
	if (teamName5) {
		teamExists5 = await Team.findOne({
			teamName: teamName5,
			leagueId: leagueId,
			session: session,
			year: year,
		})

		//If team 5 already exists, we DONT want to write all the other teams to the database,
		//so we'll remove them (and their rosters)

		if (teamExists5) {
			createdTeam1.deleteOne()
			createdRoster1.deleteOne()
			createdTeam2.deleteOne()
			createdRoster2.deleteOne()
			createdTeam3.deleteOne()
			createdRoster3.deleteOne()
			createdTeam4.deleteOne()
			createdRoster4.deleteOne()
			const error = new HttpError(
				teamName5 + ' already exists in this league',
				409
			)
			return next(error)
		} else {
			createdTeam5 = new Team({
				teamName: teamName5.trim(),
				leagueId,
				wins: 0,
				losses: 0,
				ties: 0,
				overtimeLosses: 0,
				shootoutLosses: 0,
				goalsFor: 0,
				goalsAgainst: 0,
				points: 0,
				assignedPlayers: 0,
				seed: 0,
			})
		}

		//Now that we have a new team, we need a new roster for that team

		createdRoster5 = new Roster({
			id: uuidv4(),
			leagueId,
			teamId: createdTeam5.id,
		})

		try {
			await createdTeam5.save()
		} catch (err) {
			const error = new HttpError('Could not create new Team5', 500)
			return next(error)
		}
		try {
			await createdRoster5.save()
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
	}

	//Now...for each team we made, we want to increment the numberOfTeams field by 1
	if (createdTeam1) {
		foundLeague.numberOfTeams++
		try {
			await foundLeague.save()
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
	}
	if (createdTeam2) {
		foundLeague.numberOfTeams++
		try {
			await foundLeague.save()
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
	}
	if (createdTeam3) {
		foundLeague.numberOfTeams++
		try {
			await foundLeague.save()
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
	}
	if (createdTeam4) {
		foundLeague.numberOfTeams++
		try {
			await foundLeague.save()
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
	}
	if (createdTeam5) {
		foundLeague.numberOfTeams++
		try {
			await foundLeague.save()
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
	}

	res.status(201).json({
		team1: createdTeam1,
		team2: createdTeam2,
		team3: createdTeam3,
		team4: createdTeam4,
		team5: createdTeam5,
	})
} */
//****************************************************************************************** */
//
//Create a new players(s) for a given team.
//
//
//****************************************************************************************** */
const newPlayerOnTeam = async (req, res, next) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		throw new HttpError(JSON.stringify(errors), 422)
	}

	const teamName = req.params.teamName
	//const divisionName = req.params.divisionName
	//const session = req.params.session
	const year = req.params.year

	//First, let's find the teamId:
	let teamId
	let foundTeam
	try {
		foundTeam = await Team.findOne({
			teamName: teamName,
			//divisionName: divisionName,
			//session: session,
			year: year,
		}).orFail()
	} catch (err) {
		const error = new HttpError('Finding team failed.  newPlayerOnTeam', 500)
		return next(error)
	}
	teamId = foundTeam.id
	//
	//
	//Next, lets find the rosterId for this team
	let rosterId
	let foundRoster
	try {
		foundRoster = await Roster.findOne({
			teamId: teamId,
			//divisionName: divisionName,
			//session: session,
			//year: year,
		}).orFail()
	} catch (err) {
		const error = new HttpError('Finding roster failed.  newPlayerOnTeam', 500)
		return next(error)
	}
	rosterId = foundRoster.id
	//
	//We get the teamName via the request (from the user input),
	//then create our new team for the league
	//const { teamName1, teamName2, teamName3, teamName4, teamName5 } = req.body
	const {
		playerFirstName1,
		playerLastName1,
		playerNumber1,
		playerFirstName2,
		playerLastName2,
		playerNumber2,
		playerFirstName3,
		playerLastName3,
		playerNumber3,
		playerFirstName4,
		playerLastName4,
		playerNumber4,
		playerFirstName5,
		playerLastName5,
		playerNumber5,
		playerFirstName6,
		playerLastName6,
		playerNumber6,
		playerFirstName7,
		playerLastName7,
		playerNumber7,
		playerFirstName8,
		playerLastName8,
		playerNumber8,
		playerFirstName9,
		playerLastName9,
		playerNumber9,
		playerFirstName10,
		playerLastName10,
		playerNumber10,
	} = req.body

	//Now, let's find out if this player already exists...
	console.log('you are here 4')
	const playerExists1 = await RosterPlayer.findOne({
		firstName: playerFirstName1,
		lastName: playerLastName1,
		teamId: teamId,
		/* divisionName: divisionName,
		session: session, */
		year: year,
	})

	let createdPlayer1
	if (playerExists1) {
		const error = new HttpError(
			playerFirstName1 + ' ' + playerLastName1 + ' already exists on this team',
			409
		)
		return next(error)
	} else {
		createdPlayer1 = new RosterPlayer({
			//leagueId,
			teamId: teamId,
			playerId: playerId1,
			firstName: playerFirstName1.trim(),
			middleInitial: ' ',
			lastName: playerLastName1.trim(),
			rosterId,
			teamName,
			leagueName,
			session,
			year,
			number: playerNumber1,
			goals: 0,
			assists: 0,
		})
	}
	try {
		await createdPlayer1.save()
	} catch (err) {
		const error = new HttpError('Could not create new Player1', 500)
		return next(error)
	}
	/* const createdRoster1 = new Roster({
		id: uuidv4(),
		leagueId,
		divisionName: divisionName,
		teamId: createdTeam1.id,
	}) */

	/* try {
		await createdRoster1.save()
	} catch (err) {
		const error = new HttpError(err, 500)
		return next(error)
	} */
	//
	//
	//
	//
	//Team 2
	let teamExists2, createdTeam2, createdRoster2
	if (teamName2) {
		teamExists2 = await Team.findOne({
			teamName: teamName2,
			leagueId: leagueId,
			divisionName: divisionName,
			session: session,
			year: year,
		})

		if (teamExists2) {
			createdTeam1.deleteOne()
			createdRoster1.deleteOne()
			const error = new HttpError(
				teamName2 + ' already exists in this league',
				409
			)
			return next(error)
		} else {
			createdTeam2 = new Team({
				teamName: teamName2.trim(),
				leagueId,
				divisionName: divisionName,
				wins: 0,
				losses: 0,
				ties: 0,
				overtimeLosses: 0,
				shootoutLosses: 0,
				goalsFor: 0,
				goalsAgainst: 0,
				points: 0,
				assignedPlayers: 0,
				seed: 0,
			})
		}
		createdRoster2 = new Roster({
			id: uuidv4(),
			leagueId,
			divisionName: divisionName,
			teamId: createdTeam2.id,
		})
		try {
			await createdTeam2.save()
		} catch (err) {
			const error = new HttpError('Could not create new Team2', 500)
			return next(error)
		}
		try {
			await createdRoster2.save()
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
	}
	//
	//
	//
	//
	//Team 3
	let teamExists3, createdTeam3, createdRoster3
	if (teamName3) {
		teamExists3 = await Team.findOne({
			teamName: teamName3,
			divisionName: divisionName,
			leagueId: leagueId,
			session: session,
			year: year,
		})

		if (teamExists3) {
			createdTeam1.deleteOne()
			createdRoster1.deleteOne()
			createdTeam2.deleteOne()
			createdRoster2.deleteOne()
			const error = new HttpError(
				teamName3 + ' already exists in this league',
				409
			)
			return next(error)
		} else {
			createdTeam3 = new Team({
				teamName: teamName3.trim(),
				leagueId,
				divisionName: divisionName,
				wins: 0,
				losses: 0,
				ties: 0,
				overtimeLosses: 0,
				shootoutLosses: 0,
				goalsFor: 0,
				goalsAgainst: 0,
				points: 0,
				assignedPlayers: 0,
				seed: 0,
			})
		}
		createdRoster3 = new Roster({
			id: uuidv4(),
			leagueId,
			divisionName: divisionName,
			teamId: createdTeam3.id,
		})
		try {
			await createdTeam3.save()
		} catch (err) {
			const error = new HttpError('Could not create new Team3', 500)
			return next(error)
		}
		try {
			await createdRoster3.save()
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
	}
	//
	//
	//
	//
	//Team 4
	let teamExists4, createdTeam4, createdRoster4
	if (teamName4) {
		teamExists4 = await Team.findOne({
			teamName: teamName4,
			divisionName: divisionName,
			leagueId: leagueId,
			session: session,
			year: year,
		})

		if (teamExists4) {
			createdTeam1.deleteOne()
			createdRoster1.deleteOne()
			createdTeam2.deleteOne()
			createdRoster2.deleteOne()
			createdTeam3.deleteOne()
			createdRoster3.deleteOne()
			const error = new HttpError(
				teamName4 + ' already exists in this league',
				409
			)
			return next(error)
		} else {
			createdTeam4 = new Team({
				teamName: teamName4.trim(),
				leagueId,
				divisionName: divisionName,
				wins: 0,
				losses: 0,
				ties: 0,
				overtimeLosses: 0,
				shootoutLosses: 0,
				goalsFor: 0,
				goalsAgainst: 0,
				points: 0,
				assignedPlayers: 0,
				seed: 0,
			})
		}
		createdRoster4 = new Roster({
			id: uuidv4(),
			leagueId,
			divisionName: divisionName,
			teamId: createdTeam4.id,
		})
		try {
			await createdTeam4.save()
		} catch (err) {
			const error = new HttpError('Could not create new Team4', 500)
			return next(error)
		}
		try {
			await createdRoster4.save()
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
	}
	//
	//
	//
	//
	//Team 5
	let teamExists5, createdTeam5, createdRoster5
	if (teamName5) {
		teamExists5 = await Team.findOne({
			teamName: teamName5,
			divisionName: divisionName,
			leagueId: leagueId,
			session: session,
			year: year,
		})

		//If team 5 already exists, we DONT want to write all the other teams to the database,
		//so we'll remove them (and their rosters)

		if (teamExists5) {
			createdTeam1.deleteOne()
			createdRoster1.deleteOne()
			createdTeam2.deleteOne()
			createdRoster2.deleteOne()
			createdTeam3.deleteOne()
			createdRoster3.deleteOne()
			createdTeam4.deleteOne()
			createdRoster4.deleteOne()
			const error = new HttpError(
				teamName5 + ' already exists in this league',
				409
			)
			return next(error)
		} else {
			createdTeam5 = new Team({
				teamName: teamName5.trim(),
				leagueId,
				divisionName: divisionName,
				wins: 0,
				losses: 0,
				ties: 0,
				overtimeLosses: 0,
				shootoutLosses: 0,
				goalsFor: 0,
				goalsAgainst: 0,
				points: 0,
				assignedPlayers: 0,
				seed: 0,
			})
		}

		//Now that we have a new team, we need a new roster for that team

		createdRoster5 = new Roster({
			id: uuidv4(),
			leagueId,
			divisionName: divisionName,
			teamId: createdTeam5.id,
		})

		try {
			await createdTeam5.save()
		} catch (err) {
			const error = new HttpError('Could not create new Team5', 500)
			return next(error)
		}
		try {
			await createdRoster5.save()
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
	}

	//Now...for each team we made, we want to increment the numberOfTeams field by 1
	if (createdTeam1) {
		foundLeague.numberOfTeams++
		try {
			await foundLeague.save()
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
	}
	if (createdTeam2) {
		foundLeague.numberOfTeams++
		try {
			await foundLeague.save()
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
	}
	if (createdTeam3) {
		foundLeague.numberOfTeams++
		try {
			await foundLeague.save()
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
	}
	if (createdTeam4) {
		foundLeague.numberOfTeams++
		try {
			await foundLeague.save()
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
	}
	if (createdTeam5) {
		foundLeague.numberOfTeams++
		try {
			await foundLeague.save()
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
	}

	res.status(201).json({
		player1: createdPlayer1,
		player2: createdPlayer2,
		player3: createdPlayer3,
		player4: createdPlayer4,
		player5: createdPlayer5,
	})
}
//
//
//
//****************************************************************************************** */
//
//	      createGames
//
//	Here, we can create up to 10 new games at once, by day.
//
//
//****************************************************************************************** */
const createGames = async (req, res, next) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		const error = new HttpError(
			'Something is missing from Game 1.  Make sure to start at the top',
			422
		)
		return next(error)
	}

	const {
		teamName,
		year,
		date1,
		time1,
		tbd1IsChecked,
		playoff1IsChecked,
		championship1IsChecked,
		venue1,
		date2,
		time2,
		tbd2IsChecked,
		playoff2IsChecked,
		championship2IsChecked,
		venue2,
		date3,
		time3,
		tbd3IsChecked,
		playoff3IsChecked,
		championship3IsChecked,
		venue3,
		date4,
		time4,
		tbd4IsChecked,
		playoff4IsChecked,
		championship4IsChecked,
		venue4,
		date5,
		time5,
		tbd5IsChecked,
		playoff5IsChecked,
		championship5IsChecked,
		venue5,
		date6,
		time6,
		tbd6IsChecked,
		playoff6IsChecked,
		championship6IsChecked,
		venue6,
		date7,
		time7,
		tbd7IsChecked,
		playoff7IsChecked,
		championship7IsChecked,
		venue7,
		date8,
		time8,
		tbd8IsChecked,
		playoff8IsChecked,
		championship8IsChecked,
		venue8,
		date9,
		time9,
		tbd9IsChecked,
		playoff9IsChecked,
		championship9IsChecked,
		venue9,
		date10,
		time10,
		tbd10IsChecked,
		playoff10IsChecked,
		championship10IsChecked,
		venue10,
		opponent1,
		opponent2,
		opponent3,
		opponent4,
		opponent5,
		opponent6,
		opponent7,
		opponent8,
		opponent9,
		opponent10,
	} = req.body

	let createdGame1,
		createdGame2,
		createdGame3,
		createdGame4,
		createdGame5,
		createdGame6,
		createdGame7,
		createdGame8,
		createdGame9,
		createdGame10

	//********************************************************************************* */
	//
	//  Adding game 1
	//  First, we need to obtain:
	//     * leagueId
	//     * homeTeam1 id
	//     * homeRoster id
	//     * visitorTeam1 id
	//     * visitorRoster id
	//
	//********************************************************************************* */
	if (!date1) {
		const error = new HttpError('Please enter a DATE for game 1', 422)
		return next(error)
	}
	if (!time1 && !tbd1IsChecked) {
		const error = new HttpError('Please enter a TIME for game 1', 422)
		return next(error)
	}
	if (!venue1) {
		const error = new HttpError('Please enter a VENUE for game 1', 422)
		return next(error)
	}

	const g1year = date1.substr(0, 4)
	const g1month = date1.substr(5, 2)
	const g1day = date1.substr(8, 2)
	const MDYdate1 = g1month + '-' + g1day + '-' + g1year

	const utcDate1 = new Date(MDYdate1)

	const dateString1 = utcDate1.toString()

	const dayOfWeek1 = dateString1.substr(0, 3)

	//console.log('day of week: ' + dayOfWeek1)

	//Now we should have all the variables we need to create a new game
	//If neither team is TBD:

	console.log('1')
	createdGame1 = new Game({
		teamName: teamName,
		year: year,
		dayOfWeek: dayOfWeek1,
		date: MDYdate1,
		time: time1,
		timeTBD: tbd1IsChecked,
		playoff: playoff1IsChecked,
		championship: championship1IsChecked,
		opponent: opponent1,
		venueName: venue1,
		isCurrent: true,
	})
	try {
		await createdGame1.save()
	} catch (err) {
		const error = new HttpError('error creating game 1: ' + err, 500)
		return next(error)
	}

	//********************************************************************************* */
	//
	//  Adding game 2
	//  First, we need to obtain:
	//     * leagueId
	//     * homeTeam1 id
	//     * homeRoster id
	//     * visitorTeam1 id
	//     * visitorRoster id
	//
	//********************************************************************************* */
	if (date2) {
		if (!date2) {
			createdGame1 && createdGame1.deleteOne()
			const error = new HttpError('Please enter a DATE for game 2', 422)
			return next(error)
		}
		if (!time2 && !tbd2IsChecked) {
			createdGame1 && createdGame1.deleteOne()
			const error = new HttpError('Please enter a TIME for game 2', 422)
			return next(error)
		}
		if (!venue2) {
			createdGame1 && createdGame1.deleteOne()
			const error = new HttpError('Please enter a VENUE for game 2', 422)
			return next(error)
		}
		const g2year = date2.substr(0, 4)
		const g2month = date2.substr(5, 2)
		const g2day = date2.substr(8, 2)
		const MDYdate2 = g2month + '-' + g2day + '-' + g2year

		const utcDate2 = new Date(MDYdate2)

		const dateString2 = utcDate2.toString()

		const dayOfWeek2 = dateString2.substr(0, 3)

		console.log('2')
		createdGame2 = new Game({
			teamName: teamName,
			year: year,
			dayOfWeek: dayOfWeek2,
			date: MDYdate2,
			time: time2,
			timeTBD: tbd2IsChecked,
			playoff: playoff2IsChecked,
			championship: championship2IsChecked,
			opponent: opponent2,
			venueName: venue2,
			isCurrent: true,
		})
		try {
			await createdGame2.save()
		} catch (err) {
			const error = new HttpError('error creating game 2: ' + err, 500)
			createdGame1 && createdGame1.deleteOne()
			return next(error)
		}
	}

	//********************************************************************************* */
	//
	//  Adding game 3
	//  First, we need to obtain:
	//     * leagueId
	//     * homeTeam1 id
	//     * homeRoster id
	//     * visitorTeam1 id
	//     * visitorRoster id
	//
	//********************************************************************************* */
	if (date3) {
		if (!date3) {
			createdGame1 && createdGame1.deleteOne()
			createdGame2 && createdGame2.deleteOne()
			const error = new HttpError('Please enter a DATE for game 3', 422)
			return next(error)
		}
		if (!time3 && !tbd3IsChecked) {
			createdGame1 && createdGame1.deleteOne()
			createdGame2 && createdGame2.deleteOne()
			const error = new HttpError('Please enter a TIME for game 3', 422)
			return next(error)
		}
		if (!venue3) {
			createdGame1 && createdGame1.deleteOne()
			createdGame2 && createdGame2.deleteOne()
			const error = new HttpError('Please enter a VENUE for game 3', 422)
			return next(error)
		}
		const g3year = date3.substr(0, 4)
		const g3month = date3.substr(5, 2)
		const g3day = date3.substr(8, 2)
		const MDYdate3 = g3month + '-' + g3day + '-' + g3year

		const utcDate3 = new Date(MDYdate3)

		const dateString3 = utcDate3.toString()

		const dayOfWeek3 = dateString3.substr(0, 3)

		console.log('3')
		createdGame3 = new Game({
			teamName: teamName,
			year: year,
			dayOfWeek: dayOfWeek3,
			date: MDYdate3,
			time: time3,
			timeTBD: tbd3IsChecked,
			playoff: playoff3IsChecked,
			championship: championship3IsChecked,
			opponent: opponent3,
			venueName: venue3,
			isCurrent: true,
		})
		try {
			await createdGame3.save()
		} catch (err) {
			const error = new HttpError('error creating game 3: ' + err, 500)
			createdGame1 && createdGame1.deleteOne()
			createdGame2 && createdGame2.deleteOne()
			return next(error)
		}
	}
	//END PASTE HERE

	//********************************************************************************* */
	//
	//  Adding game 4
	//  First, we need to obtain:
	//     * leagueId
	//     * homeTeam1 id
	//     * homeRoster id
	//     * visitorTeam1 id
	//     * visitorRoster id
	//
	//********************************************************************************* */
	if (date4) {
		if (!date4) {
			createdGame1 && createdGame1.deleteOne()
			createdGame2 && createdGame2.deleteOne()
			createdGame3 && createdGame3.deleteOne()
			const error = new HttpError('Please enter a DATE for game 4', 422)
			return next(error)
		}
		if (!time4 && !tbd4IsChecked) {
			createdGame1 && createdGame1.deleteOne()
			createdGame2 && createdGame2.deleteOne()
			createdGame3 && createdGame3.deleteOne()
			const error = new HttpError('Please enter a TIME for game 4', 422)
			return next(error)
		}
		if (!venue4) {
			createdGame1 && createdGame1.deleteOne()
			createdGame2 && createdGame2.deleteOne()
			createdGame3 && createdGame3.deleteOne()
			const error = new HttpError('Please enter a VENUE for game 4', 422)
			return next(error)
		}
		const g4year = date4.substr(0, 4)
		const g4month = date4.substr(5, 2)
		const g4day = date4.substr(8, 2)
		const MDYdate4 = g4month + '-' + g4day + '-' + g4year

		const utcDate4 = new Date(MDYdate4)

		const dateString4 = utcDate4.toString()

		const dayOfWeek4 = dateString4.substr(0, 3)

		console.log('4')
		createdGame4 = new Game({
			teamName: teamName,
			year: year,
			dayOfWeek: dayOfWeek4,
			date: MDYdate4,
			time: time4,
			timeTBD: tbd4IsChecked,
			playoff: playoff4IsChecked,
			championship: championship4IsChecked,
			opponent: opponent4,
			venueName: venue4,
			isCurrent: true,
		})
		try {
			await createdGame4.save()
		} catch (err) {
			const error = new HttpError('error creating game 4: ' + err, 500)
			createdGame1 && createdGame1.deleteOne()
			createdGame2 && createdGame2.deleteOne()
			createdGame3 && createdGame3.deleteOne()
			return next(error)
		}
	}
	//END PASTE HERE

	//********************************************************************************* */
	//
	//  Adding game 5
	//  First, we need to obtain:
	//     * leagueId
	//     * homeTeam1 id
	//     * homeRoster id
	//     * visitorTeam1 id
	//     * visitorRoster id
	//
	//********************************************************************************* */
	if (date5) {
		if (!date5) {
			createdGame1 && createdGame1.deleteOne()
			createdGame2 && createdGame2.deleteOne()
			createdGame3 && createdGame3.deleteOne()
			createdGame4 && createdGame4.deleteOne()
			const error = new HttpError('Please enter a DATE for game 5', 422)
			return next(error)
		}
		if (!time5 && !tbd5IsChecked) {
			createdGame1 && createdGame1.deleteOne()
			createdGame2 && createdGame2.deleteOne()
			createdGame3 && createdGame3.deleteOne()
			createdGame4 && createdGame4.deleteOne()
			const error = new HttpError('Please enter a TIME for game 5', 422)
			return next(error)
		}
		if (!venue5) {
			createdGame1 && createdGame1.deleteOne()
			createdGame2 && createdGame2.deleteOne()
			createdGame3 && createdGame3.deleteOne()
			createdGame4 && createdGame4.deleteOne()
			const error = new HttpError('Please enter a VENUE for game 5', 422)
			return next(error)
		}
		const g5year = date5.substr(0, 4)
		const g5month = date5.substr(5, 2)
		const g5day = date5.substr(8, 2)
		const MDYdate5 = g5month + '-' + g5day + '-' + g5year

		const utcDate5 = new Date(MDYdate5)

		const dateString5 = utcDate5.toString()

		const dayOfWeek5 = dateString5.substr(0, 3)

		console.log('5')
		createdGame5 = new Game({
			teamName: teamName,
			year: year,
			dayOfWeek: dayOfWeek5,
			date: MDYdate5,
			time: time5,
			timeTBD: tbd5IsChecked,
			playoff: playoff5IsChecked,
			championship: championship5IsChecked,
			opponent: opponent5,
			venueName: venue5,
			isCurrent: true,
		})
		try {
			await createdGame5.save()
		} catch (err) {
			const error = new HttpError('error creating game 5: ' + err, 500)
			createdGame1 && createdGame1.deleteOne()
			createdGame2 && createdGame2.deleteOne()
			createdGame3 && createdGame3.deleteOne()
			createdGame4 && createdGame4.deleteOne()
			return next(error)
		}
	}
	//END PASTE HERE

	//********************************************************************************* */
	//
	//  Adding game 6
	//  First, we need to obtain:
	//     * leagueId
	//     * homeTeam1 id
	//     * homeRoster id
	//     * visitorTeam1 id
	//     * visitorRoster id
	//
	//********************************************************************************* */
	if (date6) {
		if (!date6) {
			createdGame1 && createdGame1.deleteOne()
			createdGame2 && createdGame2.deleteOne()
			createdGame3 && createdGame3.deleteOne()
			createdGame4 && createdGame4.deleteOne()
			createdGame5 && createdGame5.deleteOne()
			const error = new HttpError('Please enter a DATE for game 6', 422)
			return next(error)
		}
		if (!time6 && !tbd6IsChecked) {
			createdGame1 && createdGame1.deleteOne()
			createdGame2 && createdGame2.deleteOne()
			createdGame3 && createdGame3.deleteOne()
			createdGame4 && createdGame4.deleteOne()
			createdGame5 && createdGame5.deleteOne()
			const error = new HttpError('Please enter a TIME for game 6', 422)
			return next(error)
		}
		if (!venue6) {
			createdGame1 && createdGame1.deleteOne()
			createdGame2 && createdGame2.deleteOne()
			createdGame3 && createdGame3.deleteOne()
			createdGame4 && createdGame4.deleteOne()
			createdGame5 && createdGame5.deleteOne()
			const error = new HttpError('Please enter a VENUE for game 6', 422)
			return next(error)
		}
		const g6year = date6.substr(0, 4)
		const g6month = date6.substr(5, 2)
		const g6day = date6.substr(8, 2)
		const MDYdate6 = g6month + '-' + g6day + '-' + g6year

		const utcDate6 = new Date(MDYdate6)

		const dateString6 = utcDate6.toString()

		const dayOfWeek6 = dateString6.substr(0, 3)

		console.log('6')
		createdGame6 = new Game({
			teamName: teamName,
			year: year,
			dayOfWeek: dayOfWeek6,
			date: MDYdate6,
			time: time6,
			timeTBD: tbd6IsChecked,
			playoff: playoff6IsChecked,
			championship: championship6IsChecked,
			opponent: opponent6,
			venueName: venue6,
			isCurrent: true,
		})
		try {
			await createdGame6.save()
		} catch (err) {
			const error = new HttpError('error creating game 6: ' + err, 500)
			createdGame1 && createdGame1.deleteOne()
			createdGame2 && createdGame2.deleteOne()
			createdGame3 && createdGame3.deleteOne()
			createdGame4 && createdGame4.deleteOne()
			createdGame5 && createdGame5.deleteOne()
			return next(error)
		}
	}
	//END PASTE HERE
	//********************************************************************************* */
	//
	//  Adding game 7
	//  First, we need to obtain:
	//     * leagueId
	//     * homeTeam1 id
	//     * homeRoster id
	//     * visitorTeam1 id
	//     * visitorRoster id
	//
	//********************************************************************************* */
	if (date7) {
		if (!date7) {
			createdGame1 && createdGame1.deleteOne()
			createdGame2 && createdGame2.deleteOne()
			createdGame3 && createdGame3.deleteOne()
			createdGame4 && createdGame4.deleteOne()
			createdGame5 && createdGame5.deleteOne()
			createdGame6 && createdGame6.deleteOne()
			const error = new HttpError('Please enter a DATE for game 7', 422)
			return next(error)
		}
		if (!time7 && !tbd7IsChecked) {
			createdGame1 && createdGame1.deleteOne()
			createdGame2 && createdGame2.deleteOne()
			createdGame3 && createdGame3.deleteOne()
			createdGame4 && createdGame4.deleteOne()
			createdGame5 && createdGame5.deleteOne()
			createdGame6 && createdGame6.deleteOne()
			const error = new HttpError('Please enter a TIME for game 7', 422)
			return next(error)
		}
		if (!venue7) {
			createdGame1 && createdGame1.deleteOne()
			createdGame2 && createdGame2.deleteOne()
			createdGame3 && createdGame3.deleteOne()
			createdGame4 && createdGame4.deleteOne()
			createdGame5 && createdGame5.deleteOne()
			createdGame6 && createdGame6.deleteOne()
			const error = new HttpError('Please enter a VENUE for game 7', 422)
			return next(error)
		}
		const g7year = date7.substr(0, 4)
		const g7month = date7.substr(5, 2)
		const g7day = date7.substr(8, 2)
		const MDYdate7 = g7month + '-' + g7day + '-' + g7year

		const utcDate7 = new Date(MDYdate7)

		const dateString7 = utcDate7.toString()

		const dayOfWeek7 = dateString7.substr(0, 3)

		console.log('7')
		createdGame7 = new Game({
			teamName: teamName,
			year: year,
			dayOfWeek: dayOfWeek7,
			date: MDYdate7,
			time: time7,
			timeTBD: tbd7IsChecked,
			playoff: playoff7IsChecked,
			championship: championship7IsChecked,
			opponent: opponent7,
			venueName: venue7,
			isCurrent: true,
		})
		try {
			await createdGame7.save()
		} catch (err) {
			const error = new HttpError('error creating game 7: ' + err, 500)
			createdGame1 && createdGame1.deleteOne()
			createdGame2 && createdGame2.deleteOne()
			createdGame3 && createdGame3.deleteOne()
			createdGame4 && createdGame4.deleteOne()
			createdGame5 && createdGame5.deleteOne()
			createdGame6 && createdGame6.deleteOne()
			return next(error)
		}
	}
	//END PASTE HERE
	//********************************************************************************* */
	//
	//  Adding game 8
	//  First, we need to obtain:
	//     * leagueId
	//     * homeTeam1 id
	//     * homeRoster id
	//     * visitorTeam1 id
	//     * visitorRoster id
	//
	//********************************************************************************* */
	if (date8) {
		if (!date8) {
			createdGame1 && createdGame1.deleteOne()
			createdGame2 && createdGame2.deleteOne()
			createdGame3 && createdGame3.deleteOne()
			createdGame4 && createdGame4.deleteOne()
			createdGame5 && createdGame5.deleteOne()
			createdGame6 && createdGame6.deleteOne()
			createdGame7 && createdGame7.deleteOne()
			const error = new HttpError('Please enter a DATE for game 8', 422)
			return next(error)
		}
		if (!time8 && !tbd8IsChecked) {
			createdGame1 && createdGame1.deleteOne()
			createdGame2 && createdGame2.deleteOne()
			createdGame3 && createdGame3.deleteOne()
			createdGame4 && createdGame4.deleteOne()
			createdGame5 && createdGame5.deleteOne()
			createdGame6 && createdGame6.deleteOne()
			createdGame7 && createdGame7.deleteOne()
			const error = new HttpError('Please enter a TIME for game 8', 422)
			return next(error)
		}
		if (!venue8) {
			createdGame1 && createdGame1.deleteOne()
			createdGame2 && createdGame2.deleteOne()
			createdGame3 && createdGame3.deleteOne()
			createdGame4 && createdGame4.deleteOne()
			createdGame5 && createdGame5.deleteOne()
			createdGame6 && createdGame6.deleteOne()
			createdGame7 && createdGame7.deleteOne()
			const error = new HttpError('Please enter a VENUE for game 8', 422)
			return next(error)
		}
		const g8year = date8.substr(0, 4)
		const g8month = date8.substr(5, 2)
		const g8day = date8.substr(8, 2)
		const MDYdate8 = g8month + '-' + g8day + '-' + g8year

		const utcDate8 = new Date(MDYdate8)

		const dateString8 = utcDate8.toString()

		const dayOfWeek8 = dateString8.substr(0, 3)

		console.log('8')
		createdGame8 = new Game({
			teamName: teamName,
			year: year,
			dayOfWeek: dayOfWeek8,
			date: MDYdate8,
			time: time8,
			timeTBD: tbd8IsChecked,
			playoff: playoff8IsChecked,
			championship: championship8IsChecked,
			opponent: opponent8,
			venueName: venue8,
			isCurrent: true,
		})
		try {
			await createdGame8.save()
		} catch (err) {
			const error = new HttpError('error creating game 8: ' + err, 500)
			createdGame1 && createdGame1.deleteOne()
			createdGame2 && createdGame2.deleteOne()
			createdGame3 && createdGame3.deleteOne()
			createdGame4 && createdGame4.deleteOne()
			createdGame5 && createdGame5.deleteOne()
			createdGame6 && createdGame6.deleteOne()
			createdGame7 && createdGame7.deleteOne()
			return next(error)
		}
	}
	//END PASTE HERE
	//********************************************************************************* */
	//
	//  Adding game 9
	//  First, we need to obtain:
	//     * leagueId
	//     * homeTeam1 id
	//     * homeRoster id
	//     * visitorTeam1 id
	//     * visitorRoster id
	//
	//********************************************************************************* */
	if (date9) {
		if (!date9) {
			createdGame1 && createdGame1.deleteOne()
			createdGame2 && createdGame2.deleteOne()
			createdGame3 && createdGame3.deleteOne()
			createdGame4 && createdGame4.deleteOne()
			createdGame5 && createdGame5.deleteOne()
			createdGame6 && createdGame6.deleteOne()
			createdGame7 && createdGame7.deleteOne()
			createdGame8 && createdGame8.deleteOne()
			const error = new HttpError('Please enter a DATE for game 9', 422)
			return next(error)
		}
		if (!time9 && !tbd9IsChecked) {
			createdGame1 && createdGame1.deleteOne()
			createdGame2 && createdGame2.deleteOne()
			createdGame3 && createdGame3.deleteOne()
			createdGame4 && createdGame4.deleteOne()
			createdGame5 && createdGame5.deleteOne()
			createdGame6 && createdGame6.deleteOne()
			createdGame7 && createdGame7.deleteOne()
			createdGame8 && createdGame8.deleteOne()
			const error = new HttpError('Please enter a TIME for game 9', 422)
			return next(error)
		}
		if (!venue9) {
			createdGame1 && createdGame1.deleteOne()
			createdGame2 && createdGame2.deleteOne()
			createdGame3 && createdGame3.deleteOne()
			createdGame4 && createdGame4.deleteOne()
			createdGame5 && createdGame5.deleteOne()
			createdGame6 && createdGame6.deleteOne()
			createdGame7 && createdGame7.deleteOne()
			createdGame8 && createdGame8.deleteOne()
			const error = new HttpError('Please enter a VENUE for game 9', 422)
			return next(error)
		}
		const g9year = date9.substr(0, 4)
		const g9month = date9.substr(5, 2)
		const g9day = date9.substr(8, 2)
		const MDYdate9 = g9month + '-' + g9day + '-' + g9year

		const utcDate9 = new Date(MDYdate9)

		const dateString9 = utcDate9.toString()

		const dayOfWeek9 = dateString9.substr(0, 3)

		console.log('9')
		createdGame9 = new Game({
			teamName: teamName,
			year: year,
			dayOfWeek: dayOfWeek9,
			date: MDYdate9,
			time: time9,
			timeTBD: tbd9IsChecked,
			playoff: playoff9IsChecked,
			championship: championship9IsChecked,
			opponent: opponent9,
			venueName: venue9,
			isCurrent: true,
		})
		try {
			await createdGame9.save()
		} catch (err) {
			const error = new HttpError('error creating game 9: ' + err, 500)
			createdGame1 && createdGame1.deleteOne()
			createdGame2 && createdGame2.deleteOne()
			createdGame3 && createdGame3.deleteOne()
			createdGame4 && createdGame4.deleteOne()
			createdGame5 && createdGame5.deleteOne()
			createdGame6 && createdGame6.deleteOne()
			createdGame7 && createdGame7.deleteOne()
			createdGame8 && createdGame8.deleteOne()
			return next(error)
		}
	}
	//END PASTE HERE
	//********************************************************************************* */
	//
	//  Adding game 10
	//  First, we need to obtain:
	//     * leagueId
	//     * homeTeam1 id
	//     * homeRoster id
	//     * visitorTeam1 id
	//     * visitorRoster id
	//
	//********************************************************************************* */
	if (date10) {
		if (!date10) {
			createdGame1 && createdGame1.deleteOne()
			createdGame2 && createdGame2.deleteOne()
			createdGame3 && createdGame3.deleteOne()
			createdGame4 && createdGame4.deleteOne()
			createdGame5 && createdGame5.deleteOne()
			createdGame6 && createdGame6.deleteOne()
			createdGame7 && createdGame7.deleteOne()
			createdGame8 && createdGame8.deleteOne()
			createdGame9 && createdGame9.deleteOne()
			const error = new HttpError('Please enter a DATE for game 10', 422)
			return next(error)
		}
		if (!time10 && !tbd10IsChecked) {
			createdGame1 && createdGame1.deleteOne()
			createdGame2 && createdGame2.deleteOne()
			createdGame3 && createdGame3.deleteOne()
			createdGame4 && createdGame4.deleteOne()
			createdGame5 && createdGame5.deleteOne()
			createdGame6 && createdGame6.deleteOne()
			createdGame7 && createdGame7.deleteOne()
			createdGame8 && createdGame8.deleteOne()
			createdGame9 && createdGame9.deleteOne()
			const error = new HttpError('Please enter a TIME for game 10', 422)
			return next(error)
		}
		if (!venue10) {
			createdGame1 && createdGame1.deleteOne()
			createdGame2 && createdGame2.deleteOne()
			createdGame3 && createdGame3.deleteOne()
			createdGame4 && createdGame4.deleteOne()
			createdGame5 && createdGame5.deleteOne()
			createdGame6 && createdGame6.deleteOne()
			createdGame7 && createdGame7.deleteOne()
			createdGame8 && createdGame8.deleteOne()
			createdGame9 && createdGame9.deleteOne()
			const error = new HttpError('Please enter a VENUE for game 10', 422)
			return next(error)
		}
		const g10year = date10.substr(0, 4)
		const g10month = date10.substr(5, 2)
		const g10day = date10.substr(8, 2)
		const MDYdate10 = g10month + '-' + g10day + '-' + g10year

		const utcDate10 = new Date(MDYdate10)

		const dateString10 = utcDate10.toString()

		const dayOfWeek10 = dateString10.substr(0, 3)

		console.log('10')
		createdGame10 = new Game({
			teamName: teamName,
			year: year,
			dayOfWeek: dayOfWeek10,
			date: MDYdate10,
			time: time10,
			timeTBD: tbd10IsChecked,
			playoff: playoff10IsChecked,
			championship: championship10IsChecked,
			opponent: opponent10,
			venueName: venue10,
			isCurrent: true,
		})
		try {
			await createdGame10.save()
		} catch (err) {
			const error = new HttpError('error creating game 10: ' + err, 500)
			createdGame1 && createdGame1.deleteOne()
			createdGame2 && createdGame2.deleteOne()
			createdGame3 && createdGame3.deleteOne()
			createdGame4 && createdGame4.deleteOne()
			createdGame5 && createdGame5.deleteOne()
			createdGame6 && createdGame6.deleteOne()
			createdGame7 && createdGame7.deleteOne()
			createdGame8 && createdGame8.deleteOne()
			createdGame9 && createdGame9.deleteOne()
			return next(error)
		}
	}
	//END PASTE HERE
	res.status(201).json({
		game1: createdGame1,
		game2: createdGame2,
		game3: createdGame3,
		game4: createdGame4,
		game5: createdGame5,
		game6: createdGame6,
		game7: createdGame7,
		game8: createdGame8,
		game9: createdGame9,
		game10: createdGame10,
	})
}
//
//
//
//
//
//****************************************************************************************** */
//
//	      uploadGames
//
//
//
//****************************************************************************************** */
const uploadGames = async (req, res, next) => {
	const { data, columnArray, values } = req.body
	//console.log('data: ' + data)
	//console.log('columnArray: ' + columnArray)
	//console.log('values: ' + values)
	//console.log('INSIDE uploadGames ' + values)

	const formatted = values.toString().trim().split(',,,,,,,').join('\n')

	//console.log('FORMATTED: ' + formatted)

	let arrayOfGames
	arrayOfGames = []
	const splitByWeek = formatted.split('\n')

	arrayOfWeeks = Array.from(splitByWeek)
	let year, createdGame
	year = new Date().getFullYear()

	//This shifts the array one space, essentially deleting the first element, which is our header.
	//We dont really want the header
	//arrayOfWeeks.shift()
	//formatted.shift()
	//console.log('_________')
	//console.log('_________')
	//console.log('_________')
	//console.log('arrayOfWeeks: ' + arrayOfWeeks)
	//console.log('_________')
	//console.log('_________')
	//console.log('_________')

	let individualGames
	individualGames = []

	/* console.log('arrayOfWeeks week 1: ' + arrayOfWeeks[0])
	console.log('_________')
	console.log('_________')
	console.log('arrayOfWeeks week 2: ' + arrayOfWeeks[1])
	console.log('_________')
	console.log('_________')
	console.log('arrayOfWeeks week 3: ' + arrayOfWeeks[2])
	console.log('_________')
	console.log('_________')
	console.log('arrayOfWeeks week 4: ' + arrayOfWeeks[3])
	console.log('_________')
	console.log('_________')
	console.log('arrayOfWeeks week 5: ' + arrayOfWeeks[4])
	console.log('_________')
	console.log('_________')
	console.log('arrayOfWeeks week 6: ' + arrayOfWeeks[5])
	console.log('_________')
	console.log('_________')
	console.log('arrayOfWeeks week 7: ' + arrayOfWeeks[6])
	console.log('_________')
	console.log('_________')
	console.log('arrayOfWeeks week 8: ' + arrayOfWeeks[7])
	console.log('_________')
	console.log('_________')
	console.log('arrayOfWeeks week 9: ' + arrayOfWeeks[8])
	console.log('_________')
	console.log('_________')
	console.log('arrayOfWeeks week 10: ' + arrayOfWeeks[9])
	console.log('_________')
	console.log('_________')
	console.log('arrayOfWeeks length: ' + arrayOfWeeks.length) */

	let arrayOfIndividualGames
	arrayOfIndividualGames = []

	arrayOfWeeks.forEach((week) => {
		console.log('week: ' + week)
		//lets turn week into an array, then split it on the comma:
		weekArray = Array.from(week)
		const splitWeek = week.split(',')
		console.log('splitWeek[2]: ' + splitWeek[2])
		//now lets split it again into individual games - after the 6th element
		for (let i = 0; i < splitWeek.length; i += 6) {
			const chunk = splitWeek.slice(i, i + 6)
			arrayOfIndividualGames.push(chunk)
		}
	})

	arrayOfIndividualGames.forEach((game) => {
		console.log('GAME: ' + game)
		console.log('____________________________')
	})
	//console.log('arrayOfIndividualGames: ' + arrayOfIndividualGames[0])

	/*   for each week, split into individual games */
	arrayOfIndividualGames.forEach(async (game) => {
		//const split = week.split(',,')
		//const howManyGamesThisWeek = split.length
		// called it possibleLeagueName because it could also be a number:
		let leagueName,
			venue,
			date,
			time,
			homeTeamName,
			visitorTeamName,
			homeTeamId,
			homeRosterId,
			visitorTeamId,
			visitorRosterId
		//
		//console.log('matt youre in the first one ' + gameParameters[2])
		//First, we need to look up the team names and get their teamId's and rosterId's
		//homeTeamId:
		let foundHomeTeam
		try {
			foundHomeTeam = await Team.findOne({
				teamName: game[4].trim(),
			})
		} catch (err) {
			const error = new HttpError(
				'Home Team that was given is not found in the system 1.',
				404
			)
			return next(error)
		}
		homeTeamId = foundHomeTeam._id
		//console.log('whats the fucking home team id: ' + homeTeamId)
		//
		//
		//Now that we have the homeTeamId, we need to grab that teams rosterId
		let foundHomeRoster
		try {
			foundHomeRoster = await Roster.findOne({
				teamId: homeTeamId,
			})
		} catch (err) {
			const error = new HttpError('Cant find rosterId 1.', 404)
			return next(error)
		}
		homeRosterId = foundHomeRoster._id
		//
		//
		//visitorTeamId:
		let foundVisitorTeam
		try {
			foundVisitorTeam = await Team.findOne({
				teamName: game[5].trim(),
			})
		} catch (err) {
			const error = new HttpError(
				'Visitor Team that was given is not found in the system 1.',
				404
			)
			return next(error)
		}
		//console.log('foundVisitorTeam: ' + foundVisitorTeam)
		visitorTeamId = foundVisitorTeam._id
		//Now that we have the visitorTeamId, we need to grab that teams rosterId
		let foundVisitorRoster
		try {
			foundVisitorRoster = await Roster.findOne({
				teamId: visitorTeamId,
			})
		} catch (err) {
			const error = new HttpError('Cant find rosterId 2.', 404)
			return next(error)
		}
		visitorRosterId = foundVisitorRoster._id
		//console.log('visitorTeamId is ' + visitorTeamId)

		leagueName = game[0]
		venue = game[1]
		date = game[2]
		time = game[3]
		homeTeamName = game[4]
		homeTeamId = homeTeamId
		homeRosterId = homeRosterId
		visitorTeamName = game[5]
		visitorTeamId = visitorTeamId
		visitorRosterId = visitorRosterId

		createdGame = new Game({
			leagueName: leagueName,
			year: year,
			session: 'test session',
			venueName: venue,
			date: date,
			time: time,
			homeTeamName: homeTeamName,
			homeTeamId: homeTeamId,
			homeRosterId: homeRosterId,
			visitorTeamName: visitorTeamName,
			visitorTeamId: visitorTeamId,
			visitorRosterId: visitorRosterId,
			isCurrent: true,
		})
		try {
			await createdGame.save()
		} catch (err) {
			const error = new HttpError('uploaded game ERROR: ' + err, 500)
			return next(error)
		}
	})

	res.status(200).json({ message: 'Games have been uploaded' })
}
//****************************************************************************************** */
//
//	      createGameStats
//
//	Here, we log all the stats from a played game.  Both game stats and individual stats
//
//  kralys FINAL -> TBD should go here too
//
//
//****************************************************************************************** */
const createGameStats = async (req, res, next) => {
	const {
		homePointsPerPeriod,
		visitorPointsPerPeriod,
		homeStats,
		//visitorStats,
		gameStatus,
		gameSummary,
	} = req.body
	const gameId = req.params.gameId

	let foundGame,
		newHomeGoals1,
		newHomeGoals2,
		newHomeGoals3,
		newHomeGoals4,
		newHomeGoalsTotal,
		previousStatus
	for (let i = 0; i < homePointsPerPeriod.length; i++) {
		const split = homePointsPerPeriod[i].split('|')
		newHomeGoals1 = split[0]
		newHomeGoals2 = split[1]
		newHomeGoals3 = split[2]
		newHomeGoals4 = split[3]
		newHomeGoalsTotal = split[4]
	}

	console.log('inside createGameStats: ' + gameStatus)

	if (!gameStatus) {
		const error = new HttpError('Please enter a game status')
		return next(error)
	}

	//
	let newVisitorGoals1,
		newVisitorGoals2,
		newVisitorGoals3,
		newVisitorGoals4,
		newVisitorGoalsTotal
	for (let i = 0; i < visitorPointsPerPeriod.length; i++) {
		const split = visitorPointsPerPeriod[i].split('|')
		newVisitorGoals1 = split[0]
		newVisitorGoals2 = split[1]
		newVisitorGoals3 = split[2]
		newVisitorGoals4 = split[3]
		newVisitorGoalsTotal = split[4]
	}

	const gameStatsExist = await GameStats.findOne({
		gameId: gameId,
	})

	//If no game stats exist already, we just create some
	let gameStats
	if (!gameStatsExist) {
		console.log('no game stats yet, lets add some...')
		gameStats = new GameStats({
			gameId: gameId,
			homeGoalsPeriod1: newHomeGoals1,
			homeGoalsPeriod2: newHomeGoals2,
			homeGoalsPeriod3: newHomeGoals3,
			homeGoalsPeriod4: newHomeGoals4,
			homeGoalsTotal: newHomeGoalsTotal,
			visitorGoalsPeriod1: newVisitorGoals1,
			visitorGoalsPeriod2: newVisitorGoals2,
			visitorGoalsPeriod3: newVisitorGoals3,
			visitorGoalsPeriod4: newVisitorGoals4,
			visitorGoalsTotal: newVisitorGoalsTotal,
			status: gameStatus,
			summary: gameSummary,
		})
	}

	//If there are no game stats, we just enter this data.
	if (!gameStatsExist) {
		try {
			await gameStats.save()
		} catch (err) {
			const error = new HttpError(
				'Please enter final goal stats.  "Final" cannot be empty for either team!',
				500
			)
			return next(error)
		}

		//************************************************************* */
		//
		//  TEAM STATS
		//
		//
		//************************************************************** */
		//So, we find a game, so let's get the id's of the home team and the visiting team so
		//that we can add goals for and goals against for those teams
		//NOTE 7/14/2023.  For Sloths, its only one team at a time, so lets find the most
		//current sloth team and grab their teamId
		let foundGame, teamName, opponent
		try {
			foundGame = await Game.findById(gameId)
		} catch (err) {
			const error = new HttpError('Could not find game.  createGameStats', 404)
			return next(error)
		}
		teamName = foundGame.teamName
		opponent = foundGame.opponent
		//
		//
		//Now, using teamName, let's get the current sloths team id
		//
		let foundTeam, teamId
		try {
			foundTeam = await Team.findOne({
				teamName: teamName,
				isCurrent: true,
			})
		} catch (err) {
			const error = new HttpError(
				'could not find teamName.  createGameStats ' + err,
				500
			)
			return next(error)
		}
		teamId = foundTeam.id
		//
		//homeTeamId = foundGame.homeTeamId
		//visitorTeamId = foundGame.visitorTeamId
		//
		//
		/* try {
			foundHomeTeam = await Team.findById(homeTeamId)
		} catch (err) {
			const error = new HttpError(
				'could not find home team.  createGameStats ' + err,
				500
			)
			return next(error)
		} */
		//
		//
		/* try {
			foundVisitorTeam = await Team.findById(visitorTeamId)
		} catch (err) {
			const error = new HttpError(
				'could not find visitor team.  createGameStats ' + err,
				500
			)
			return next(error)
		} */
		//Let's log wins/losses/ties for the home team.
		//
		let homeWins,
			homeLosses,
			homeShootoutLosses,
			homeOvertimeLosses,
			homeTies,
			/* visitorWins,
			visitorLosses,
			visitorShootoutLosses,
			visitorOvertimeLosses,
			visitorTies, */
			winner,
			loser

		//if (!gameStatsExist) {   //If hometeam lost in a shootout
		if (
			Number(newVisitorGoalsTotal) > Number(newHomeGoalsTotal) &&
			gameStatus === 'Shootout'
		) {
			console.log(
				'home team loses in shootout ' +
					newVisitorGoalsTotal +
					'  ' +
					newHomeGoalsTotal
			)
			winner = opponent
			loser = teamName
			homeShootoutLosses = Number(foundTeam.shootoutLosses) + 1
			homeOvertimeLosses = Number(foundTeam.overtimeLosses)
			//visitorShootoutLosses = Number(foundVisitorTeam.shootoutLosses)
			//visitorOvertimeLosses = Number(foundVisitorTeam.overtimeLosses)
			homeWins = Number(foundTeam.wins)
			homeLosses = Number(foundTeam.losses)
			homeTies = Number(foundTeam.ties)
			//visitorWins = Number(foundVisitorTeam.wins) + 1
			//visitorLosses = Number(foundVisitorTeam.losses)
			//visitorTies = Number(foundVisitorTeam.ties)
		} else if (
			Number(newVisitorGoalsTotal) > Number(newHomeGoalsTotal) &&
			gameStatus === 'Overtime'
		) {
			console.log(
				'home team loses in Overtime ' +
					newVisitorGoalsTotal +
					'  ' +
					newHomeGoalsTotal
			)
			winner = opponent
			loser = teamName
			homeOvertimeLosses = Number(foundTeam.overtimeLosses) + 1
			homeShootoutLosses = Number(foundTeam.shootoutLosses)
			//visitorShootoutLosses = Number(foundVisitorTeam.shootoutLosses)
			//visitorOvertimeLosses = Number(foundVisitorTeam.overtimeLosses)
			homeWins = Number(foundTeam.wins)
			homeLosses = Number(foundTeam.losses)
			homeTies = Number(foundTeam.ties)
			//visitorWins = Number(foundVisitorTeam.wins) + 1
			//visitorLosses = Number(foundVisitorTeam.losses)
			//visitorTies = Number(foundVisitorTeam.ties)
		} else if (Number(newVisitorGoalsTotal) > Number(newHomeGoalsTotal)) {
			console.log(
				'home team loses in regulation ' +
					newVisitorGoalsTotal +
					'  ' +
					newHomeGoalsTotal
			)
			winner = opponent
			loser = teamName
			homeLosses = Number(foundTeam.losses) + 1
			homeWins = Number(foundTeam.wins)
			homeTies = Number(foundTeam.ties)
			homeOvertimeLosses = Number(foundTeam.overtimeLosses)
			homeShootoutLosses = Number(foundTeam.shootoutLosses)
			//visitorShootoutLosses = Number(foundVisitorTeam.shootoutLosses)
			//visitorOvertimeLosses = Number(foundVisitorTeam.overtimeLosses)
			//visitorWins = Number(foundVisitorTeam.wins) + 1
			//visitorLosses = Number(foundVisitorTeam.losses)
			//visitorTies = Number(foundVisitorTeam.ties)
		} else if (
			Number(newVisitorGoalsTotal) < Number(newHomeGoalsTotal) &&
			gameStatus === 'Shootout'
		) {
			console.log('visitor team loses in shootout')
			winner = teamName
			loser = opponent
			homeWins = Number(foundTeam.wins) + 1
			homeLosses = Number(foundTeam.losses)
			homeTies = Number(foundTeam.ties)
			//visitorWins = Number(foundVisitorTeam.wins)
			//visitorLosses = Number(foundVisitorTeam.losses)
			//visitorTies = Number(foundVisitorTeam.ties)
			//visitorShootoutLosses = Number(foundVisitorTeam.shootoutLosses) + 1
			//visitorOvertimeLosses = Number(foundVisitorTeam.overtimeLosses)
			homeShootoutLosses = Number(foundTeam.shootoutLosses)
			homeOvertimeLosses = Number(foundTeam.overtimeLosses)
		} else if (
			Number(newVisitorGoalsTotal) < Number(newHomeGoalsTotal) &&
			gameStatus === 'Overtime'
		) {
			console.log('visitor team loses in overtime')
			winner = teamName
			loser = opponent
			homeWins = Number(foundTeam.wins) + 1
			homeLosses = Number(foundTeam.losses)
			homeTies = Number(foundTeam.ties)
			//visitorWins = Number(foundVisitorTeam.wins)
			//visitorLosses = Number(foundVisitorTeam.losses)
			//visitorTies = Number(foundVisitorTeam.ties)
			//visitorOvertimeLosses = Number(foundVisitorTeam.overtimeLosses) + 1
			//visitorShootoutLosses = Number(foundVisitorTeam.shootoutLosses)
			homeShootoutLosses = Number(foundTeam.shootoutLosses)
			homeOvertimeLosses = Number(foundTeam.overtimeLosses)
		} else if (Number(newVisitorGoalsTotal) < Number(newHomeGoalsTotal)) {
			console.log('visitor team loses in regulation')
			winner = teamName
			loser = opponent
			homeWins = Number(foundTeam.wins) + 1
			homeLosses = Number(foundTeam.losses)
			homeTies = Number(foundTeam.ties)
			//visitorWins = Number(foundVisitorTeam.wins)
			//visitorLosses = Number(foundVisitorTeam.losses) + 1
			//visitorTies = Number(foundVisitorTeam.ties)
			//visitorOvertimeLosses = Number(foundVisitorTeam.overtimeLosses)
			//visitorShootoutLosses = Number(foundVisitorTeam.shootoutLosses)
			homeShootoutLosses = Number(foundTeam.shootoutLosses)
			homeOvertimeLosses = Number(foundTeam.overtimeLosses)
		} else if (Number(newVisitorGoalsTotal) === Number(newHomeGoalsTotal)) {
			console.log('we have a TIE')
			homeTies = Number(foundTeam.ties) + 1
			//visitorTies = Number(foundVisitorTeam.ties) + 1
			homeWins = Number(foundTeam.wins)
			homeLosses = Number(foundTeam.losses)
			//visitorWins = Number(foundVisitorTeam.wins)
			//visitorLosses = Number(foundVisitorTeam.losses)
			//visitorOvertimeLosses = Number(foundVisitorTeam.overtimeLosses)
			//visitorShootoutLosses = Number(foundVisitorTeam.shootoutLosses)
			homeOvertimeLosses = Number(foundTeam.overtimeLosses)
			homeShootoutLosses = Number(foundTeam.shootoutLosses)
		}
		//}

		//Let's resave game stats, this time assigning a winner and a loser:
		gameStats.winner = winner
		gameStats.loser = loser
		try {
			await gameStats.save()
		} catch (err) {
			const error = new HttpError('could not save game stats 2 ' + err, 500)
			return next(error)
		}
		//

		foundTeam.goalsFor = Number(foundTeam.goalsFor) + Number(newHomeGoalsTotal)
		foundTeam.goalsAgainst =
			Number(foundTeam.goalsAgainst) + Number(newVisitorGoalsTotal)
		/* foundVisitorTeam.goalsFor =
			Number(foundVisitorTeam.goalsFor) + Number(newVisitorGoalsTotal)
		foundVisitorTeam.goalsAgainst =
			Number(foundVisitorTeam.goalsAgainst) + Number(newHomeGoalsTotal) */

		if (foundTeam) {
			console.log('saving home team: ' + foundTeam.goalsFor)
			foundTeam.wins = homeWins
			foundTeam.losses = homeLosses
			foundTeam.ties = homeTies
			foundTeam.overtimeLosses = homeOvertimeLosses
			foundTeam.shootoutLosses = homeShootoutLosses
			try {
				await foundTeam.save()
			} catch (err) {
				const error = new HttpError(
					'could not save home team stats.  createGameStats ' + err,
					500
				)
				return next(error)
			}
		}

		//Ok so I think the last thing I want to do here is find the game,
		//then set the games status and final score
		foundGame.winner = winner
		foundGame.loser = loser
		foundGame.status = gameStatus
		foundGame.score =
			Number(newVisitorGoalsTotal) + ' - ' + Number(newHomeGoalsTotal)
		console.log('saving game zeroth place')
		try {
			await foundGame.save()
		} catch (err) {
			const error = new HttpError(
				'could not save game for status and final score.  createGameStats ' +
					err,
				500
			)
			return next(error)
		}
		//
		//
		/* if (foundVisitorTeam) {
			console.log('saving visitor team: ' + foundVisitorTeam.goalsFor)
			foundVisitorTeam.wins = visitorWins
			foundVisitorTeam.losses = visitorLosses
			foundVisitorTeam.ties = visitorTies
			foundVisitorTeam.overtimeLosses = visitorOvertimeLosses
			foundVisitorTeam.shootoutLosses = visitorShootoutLosses
			try {
				await foundVisitorTeam.save()
			} catch (err) {
				const error = new HttpError(
					'could not save visitor team stats 1.  createGameStats ' + err,
					500
				)
				return next(error)
			}			
		} */
		//
		//
		//
		//
		//
		//
		//
		//
		//
		//
		//
		//  If gameStats DO exist already for this game,
		//  we need to compare and see what is different, if anything...
	} else {
		console.log('game stats DO exist')
		let previousHomeGoalsPeriod1,
			previousHomeGoalsPeriod2,
			previousHomeGoalsPeriod3,
			previousHomeGoalsPeriod4,
			previousHomeGoalsTotal,
			previousVisitorGoalsPeriod1,
			previousVisitorGoalsPeriod2,
			previousVisitorGoalsPeriod3,
			previousVisitorGoalsPeriod4,
			previousVisitorGoalsTotal,
			previousSummary,
			previousWinner,
			previousLoser

		//let's get the previously recorded goals for each team
		previousHomeGoalsPeriod1 = gameStatsExist.homeGoalsPeriod1
		previousHomeGoalsPeriod2 = gameStatsExist.homeGoalsPeriod2
		previousHomeGoalsPeriod3 = gameStatsExist.homeGoalsPeriod3
		previousHomeGoalsPeriod4 = gameStatsExist.homeGoalsPeriod4
		previousHomeGoalsTotal = gameStatsExist.homeGoalsTotal
		previousVisitorGoalsPeriod1 = gameStatsExist.visitorGoalsPeriod1
		previousVisitorGoalsPeriod2 = gameStatsExist.visitorGoalsPeriod2
		previousVisitorGoalsPeriod3 = gameStatsExist.visitorGoalsPeriod3
		previousVisitorGoalsPeriod4 = gameStatsExist.visitorGoalsPeriod4
		previousVisitorGoalsTotal = gameStatsExist.visitorGoalsTotal
		previousStatus = gameStatsExist.status
		previousSummary = gameStatsExist.summary
		previousWinner = gameStatsExist.winner
		previousLoser = gameStatsExist.loser
		//
		//
		//Let's once again go find the home and visitor teams shirey
		let homeTeamId,
			visitorTeamId,
			foundHomeTeam,
			foundVisitorTeam,
			newWinner,
			newLoser,
			homeWins,
			visitorWins,
			homeLosses,
			visitorLosses,
			homeTies,
			visitorTies
		let foundGame, teamName
		try {
			foundGame = await Game.findById(gameId)
		} catch (err) {
			const error = new HttpError('Could not find game.  createGameStats', 404)
			return next(error)
		}
		teamName = foundGame.teamName
		opponent = foundGame.opponent
		//
		//
		//Now, using teamName, let's get the current sloths team id
		//
		let foundTeam, teamId
		try {
			foundTeam = await Team.findOne({
				teamName: teamName,
				isCurrent: true,
			})
		} catch (err) {
			const error = new HttpError(
				'could not find teamName.  createGameStats ' + err,
				500
			)
			return next(error)
		}
		teamId = foundTeam.id
		/* try {
			foundGame = await Game.findById(gameId)
		} catch (err) {
			const error = new HttpError('Could not find game.  createGameStats', 404)
			return next(error)
		}
		homeTeamId = foundGame.homeTeamId
		visitorTeamId = foundGame.visitorTeamId
		//
		//
		try {
			foundHomeTeam = await Team.findById(homeTeamId)
		} catch (err) {
			const error = new HttpError(
				'could not find home team.  createGameStats ' + err,
				500
			)
			return next(error)
		}
		//
		//
		try {
			foundVisitorTeam = await Team.findById(visitorTeamId)
		} catch (err) {
			const error = new HttpError(
				'could not find visitor team.  createGameStats ' + err,
				500
			)
			return next(error)
		} */

		//
		//  MATT:  get this working first!
		//
		//
		//
		if (previousHomeGoalsTotal != newHomeGoalsTotal) {
			console.log('There is a difference in home goals')
			foundTeam.goalsFor =
				Number(foundTeam.goalsFor) -
				Number(previousHomeGoalsTotal) +
				Number(newHomeGoalsTotal)
			//
			/* foundVisitorTeam.goalsAgainst =
				Number(foundVisitorTeam.goalsAgainst) -
				Number(previousHomeGoalsTotal) +
				Number(newHomeGoalsTotal) */

			try {
				console.log('saving home team')
				await foundTeam.save()
			} catch (err) {
				const error = new HttpError(
					'could not save home team stats.  createGameStats ' + err,
					500
				)
				return next(error)
			}
			//
			//
			/* try {
				console.log('saving visitor team')
				await foundVisitorTeam.save()
			} catch (err) {
				const error = new HttpError(
					'could not save visitor team stats 2.  createGameStats ' + err,
					500
				)
				return next(error)
			} */

			//save game stats
			gameStatsExist.homeGoalsTotal = newHomeGoalsTotal
			try {
				console.log('saving new game stats')
				await gameStatsExist.save()
			} catch (err) {
				const error = new HttpError(
					'PLEASE ENTER FINAL SCORE FOR BOTH TEAMS.  IF NO SCORE YET, ENTER ZEROES',
					500
				)
				return next(error)
			}
		}
		//
		//
		//
		//
		if (
			previousHomeGoalsPeriod1 !== newHomeGoals1 ||
			previousHomeGoalsPeriod2 !== newHomeGoals2 ||
			previousHomeGoalsPeriod3 !== newHomeGoals3 ||
			previousHomeGoalsPeriod4 !== newHomeGoals4
		) {
			gameStatsExist.homeGoalsPeriod1 = newHomeGoals1
			gameStatsExist.homeGoalsPeriod2 = newHomeGoals2
			gameStatsExist.homeGoalsPeriod3 = newHomeGoals3
			gameStatsExist.homeGoalsPeriod4 = newHomeGoals4

			try {
				console.log('saving new game stats')
				await gameStatsExist.save()
			} catch (err) {
				const error = new HttpError(
					'could not save game stats.  createGameStats ' + err,
					500
				)
				return next(error)
			}
		}
		//
		//
		//
		//
		//
		if (previousVisitorGoalsTotal != newVisitorGoalsTotal) {
			console.log('There is a difference in visitor goals')
			/* foundVisitorTeam.goalsFor =
				Number(foundVisitorTeam.goalsFor) -
				Number(previousVisitorGoalsTotal) +
				Number(newVisitorGoalsTotal) */
			//
			foundTeam.goalsAgainst =
				Number(foundTeam.goalsAgainst) -
				Number(previousVisitorGoalsTotal) +
				Number(newVisitorGoalsTotal)

			try {
				await foundTeam.save()
			} catch (err) {
				const error = new HttpError(
					'could not save home team stats 1.  createGameStats ' + err,
					500
				)
				return next(error)
			}
			//
			//
			/* try {
				await foundVisitorTeam.save()
			} catch (err) {
				const error = new HttpError(
					'could not save visitor team stats 3.  createGameStats ' + err,
					500
				)
				return next(error)
			} */

			//save game stats
			gameStatsExist.visitorGoalsTotal = newVisitorGoalsTotal
			try {
				await gameStatsExist.save()
			} catch (err) {
				const error = new HttpError(
					'could not save game stats 3.  createGameStats ' + err,
					500
				)
				return next(error)
			}
		}

		if (
			previousVisitorGoalsPeriod1 !== newVisitorGoals1 ||
			previousVisitorGoalsPeriod2 !== newVisitorGoals2 ||
			previousVisitorGoalsPeriod3 !== newVisitorGoals3 ||
			previousVisitorGoalsPeriod4 !== newVisitorGoals4
		) {
			gameStatsExist.visitorGoalsPeriod1 = newVisitorGoals1
			gameStatsExist.visitorGoalsPeriod2 = newVisitorGoals2
			gameStatsExist.visitorGoalsPeriod3 = newVisitorGoals3
			gameStatsExist.visitorGoalsPeriod4 = newVisitorGoals4

			try {
				console.log('saving new game stats 3')
				await gameStatsExist.save()
			} catch (err) {
				const error = new HttpError(
					'could not save game stats 4.  createGameStats ' + err,
					500
				)
				return next(error)
			}
		}

		//Now we need to determine winner and loser.  Maybe, say, the user got it
		//backwards, and the winning team was actually the losing team.  They'd need
		//to go back in and correct it.
		//
		if (Number(newHomeGoalsTotal) > Number(newVisitorGoalsTotal)) {
			console.log('HOME team wins!')
			newWinner = teamName
			newLoser = opponent
		} else if (Number(newVisitorGoalsTotal) > Number(newHomeGoalsTotal)) {
			console.log('VISITOR team wins')
			newWinner = opponent
			newLoser = teamName
		} else {
			console.log('WE HAVE A TIE')
		}

		//TONS of logic here...be careful
		//
		if (
			gameStatus === 'Overtime' &&
			newHomeGoalsTotal !== newVisitorGoalsTotal
		) {
			if (
				newWinner !== previousWinner &&
				previousHomeGoalsTotal !== previousVisitorGoalsTotal
			) {
				if (newWinner === teamId) {
					console.log(
						'home team is winner this time in Overtime!!  Last game was NOT a tie'
					)
					if (previousStatus === 'Overtime') {
						console.log(
							'home team LOST last game in overtime, and WON this game in overtime'
						)
						console.log(
							'visitor team WON last game in overtime, and LOST this game in overtime'
						)
						foundTeam.wins = Number(foundTeam.wins) + 1
						foundTeam.losses = Number(foundTeam.losses)
						foundTeam.ties = Number(foundTeam.ties)
						foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses) - 1
						foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
						//foundVisitorTeam.wins = Number(foundVisitorTeam.wins) - 1
						//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
						//foundVisitorTeam.ties = Number(foundVisitorTeam.ties)
						//foundVisitorTeam.overtimeLosses =
						//	Number(foundVisitorTeam.overtimeLosses) + 1
						//foundVisitorTeam.shootoutLosses = Number(
						//	foundVisitorTeam.shootoutLosses
						//)
					} else if (previousStatus === 'Shootout') {
						console.log(
							'home team LOST last game in shootout, but WON this time in overtime...'
						)
						console.log(
							'visitor team WON last game in shootout, but LOST this time in overtime...'
						)
						foundTeam.wins = Number(foundTeam.wins) + 1
						foundTeam.losses = Number(foundTeam.losses)
						foundTeam.ties = Number(foundTeam.ties)
						foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
						foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses) - 1
						//foundVisitorTeam.wins = Number(foundVisitorTeam.wins) - 1
						//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
						//foundVisitorTeam.ties = Number(foundVisitorTeam.ties)
						//foundVisitorTeam.overtimeLosses =
						//	Number(foundVisitorTeam.overtimeLosses) + 1
						//foundVisitorTeam.shootoutLosses = Number(
						//	foundVisitorTeam.shootoutLosses
						//)
					} else {
						console.log(
							'home team LOST in regulation last time, but WON this time in overtime'
						)
						console.log(
							'visitor team WON in regulation last time, but LOST this time in overtime'
						)
						foundTeam.wins = Number(foundTeam.wins) + 1
						foundTeam.losses = Number(foundTeam.losses) - 1
						foundTeam.ties = Number(foundTeam.ties)
						foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
						foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
						//foundVisitorTeam.wins = Number(foundVisitorTeam.wins) - 1
						//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
						//foundVisitorTeam.ties = Number(foundVisitorTeam.ties)
						//foundVisitorTeam.overtimeLosses =
						//	Number(foundVisitorTeam.overtimeLosses) + 1
						//foundVisitorTeam.shootoutLosses = Number(
						//	foundVisitorTeam.shootoutLosses
						//)
					}
					//
					//
				} else if (newWinner !== teamId) {
					//do even more shit
					console.log('visitor team is winner this time in Overtime!!  1')
					if (previousStatus === 'Overtime') {
						console.log(
							'visitor team LOST last game in overtime, and WON this game in overtime'
						)
						console.log(
							'home team WON last game in overtime, and LOST this game in overtime'
						)
						foundTeam.wins = Number(foundTeam.wins) - 1
						foundTeam.losses = Number(foundTeam.losses)
						foundTeam.ties = Number(foundTeam.ties)
						foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses) + 1
						foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
						//foundVisitorTeam.wins = Number(foundVisitorTeam.wins) + 1
						//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
						//foundVisitorTeam.ties = Number(foundVisitorTeam.ties)
						//foundVisitorTeam.overtimeLosses =
						//	Number(foundVisitorTeam.overtimeLosses) - 1
						//foundVisitorTeam.shootoutLosses = Number(
						//	foundVisitorTeam.shootoutLosses
						//)
					} else if (previousStatus === 'Shootout') {
						console.log(
							'visitor team LOST last game in shootout, but WON this time in overtime...'
						)
						console.log(
							'home team WON last game in shootout, but LOST this time in overtime...'
						)
						foundTeam.wins = Number(foundTeam.wins) - 1
						foundTeam.losses = Number(foundTeam.losses)
						foundTeam.ties = Number(foundTeam.ties)
						foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses) + 1
						foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
						//foundVisitorTeam.wins = Number(foundVisitorTeam.wins) + 1
						//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
						//foundVisitorTeam.ties = Number(foundVisitorTeam.ties)
						//foundVisitorTeam.overtimeLosses = Number(
						//	foundVisitorTeam.overtimeLosses
						//)
						//foundVisitorTeam.shootoutLosses =
						//	Number(foundVisitorTeam.shootoutLosses) - 1
					} else {
						console.log(
							'visitor team LOST in regulation last time, but WON this time in overtime'
						)
						console.log(
							'home team WON in regulation last time, but LOST this time in overtime'
						)
						foundTeam.wins = Number(foundTeam.wins) - 1
						foundTeam.losses = Number(foundTeam.losses)
						foundTeam.ties = Number(foundTeam.ties)
						foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses) + 1
						foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
						//foundVisitorTeam.wins = Number(foundVisitorTeam.wins) + 1
						//foundVisitorTeam.losses = Number(foundVisitorTeam.losses) - 1
						//foundVisitorTeam.ties = Number(foundVisitorTeam.ties)
						//foundVisitorTeam.overtimeLosses = Number(
						//	foundVisitorTeam.overtimeLosses
						//)
						//foundVisitorTeam.shootoutLosses = Number(
						//	foundVisitorTeam.shootoutLosses
						//)
					}
				}
			} else if (
				newWinner !== previousWinner &&
				previousHomeGoalsTotal === previousVisitorGoalsTotal
			) {
				if (newWinner === teamId) {
					console.log(
						'home team is winner this time in Overtime!!  Last game was a tie in overtime'
					)
					if (previousStatus === 'Overtime') {
						console.log(
							'Previous game was a tie in overtime, but home WON this game in overtime'
						)
						foundTeam.wins = Number(foundTeam.wins) + 1
						foundTeam.losses = Number(foundTeam.losses)
						foundTeam.ties = Number(foundTeam.ties) - 1
						foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
						foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
						//foundVisitorTeam.wins = Number(foundVisitorTeam.wins)
						//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
						//foundVisitorTeam.ties = Number(foundVisitorTeam.ties) - 1
						//foundVisitorTeam.overtimeLosses =
						//	Number(foundVisitorTeam.overtimeLosses) + 1
						//foundVisitorTeam.shootoutLosses = Number(
						//	foundVisitorTeam.shootoutLosses
						//)
					} else if (previousStatus === 'Shootout') {
						console.log(
							'last game was a TIE in a shootout, but home team WON this time in overtime...'
						)
						foundTeam.wins = Number(foundTeam.wins) + 1
						foundTeam.losses = Number(foundTeam.losses)
						foundTeam.ties = Number(foundTeam.ties) - 1
						foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
						foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
						//foundVisitorTeam.wins = Number(foundVisitorTeam.wins)
						//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
						//foundVisitorTeam.ties = Number(foundVisitorTeam.ties) - 1
						//foundVisitorTeam.overtimeLosses =
						//	Number(foundVisitorTeam.overtimeLosses) + 1
						//foundVisitorTeam.shootoutLosses = Number(
						//	foundVisitorTeam.shootoutLosses
						//)
					} else {
						console.log(
							'last game was a TIE in regulation, but home WON this time in overtime'
						)
						foundTeam.wins = Number(foundTeam.wins) + 1
						foundTeam.losses = Number(foundTeam.losses)
						foundTeam.ties = Number(foundTeam.ties) - 1
						foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
						foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
						//foundVisitorTeam.wins = Number(foundVisitorTeam.wins)
						//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
						//foundVisitorTeam.ties = Number(foundVisitorTeam.ties) - 1
						//foundVisitorTeam.overtimeLosses =
						//	Number(foundVisitorTeam.overtimeLosses) + 1
						//foundVisitorTeam.shootoutLosses = Number(
						//	foundVisitorTeam.shootoutLosses
						//)
					}
					//
					//
				} else if (newWinner !== teamId) {
					//do even more shit
					console.log('visitor team is winner this time in Overtime!!  13')
					if (previousStatus === 'Overtime') {
						console.log(
							'last game was a TIE in overtime, but visitor WON this game in overtime'
						)
						foundTeam.wins = Number(foundTeam.wins)
						foundTeam.losses = Number(foundTeam.losses)
						foundTeam.ties = Number(foundTeam.ties) - 1
						foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses) + 1
						foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
						//foundVisitorTeam.wins = Number(foundVisitorTeam.wins) + 1
						//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
						//foundVisitorTeam.ties = Number(foundVisitorTeam.ties) - 1
						//foundVisitorTeam.overtimeLosses = Number(
						//	foundVisitorTeam.overtimeLosses
						//)
						//foundVisitorTeam.shootoutLosses = Number(
						//	foundVisitorTeam.shootoutLosses
						//)
					} else if (previousStatus === 'Shootout') {
						console.log(
							'last game was a TIE in a shootout, but visitor WON this time in overtime...'
						)
						foundTeam.wins = Number(foundTeam.wins)
						foundTeam.losses = Number(foundTeam.losses)
						foundTeam.ties = Number(foundTeam.ties) - 1
						foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses) + 1
						foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
						//foundVisitorTeam.wins = Number(foundVisitorTeam.wins) + 1
						//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
						//foundVisitorTeam.ties = Number(foundVisitorTeam.ties) - 1
						//foundVisitorTeam.overtimeLosses = Number(
						//	foundVisitorTeam.overtimeLosses
						//)
						//foundVisitorTeam.shootoutLosses = Number(
						//	foundVisitorTeam.shootoutLosses
						//)
					} else {
						console.log(
							'last game was a TIE in regulation, visitor but WON this time in overtime'
						)
						foundTeam.wins = Number(foundTeam.wins)
						foundTeam.losses = Number(foundTeam.losses)
						foundTeam.ties = Number(foundTeam.ties) - 1
						foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses) + 1
						foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
						//foundVisitorTeam.wins = Number(foundVisitorTeam.wins) + 1
						//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
						//foundVisitorTeam.ties = Number(foundVisitorTeam.ties) - 1
						//foundVisitorTeam.overtimeLosses = Number(
						//	foundVisitorTeam.overtimeLosses
						//)
						//foundVisitorTeam.shootoutLosses = Number(
						//	foundVisitorTeam.shootoutLosses
						//)
					}
				}
			} else if (newWinner === previousWinner) {
				console.log(
					'new winner is same as previous winner: ' +
						newWinner +
						'  ' +
						previousWinner
				)
				if (newWinner === teamId) {
					console.log('home team is winner this time in Overtime!!')
					if (previousStatus === 'Overtime') {
						console.log(
							'home team WON last game in overtime, and WON this game in overtime'
						)
						console.log(
							'visitor team LOST last game in overtime, and LOST this game in overtime'
						)
						foundTeam.wins = Number(foundTeam.wins)
						foundTeam.losses = Number(foundTeam.losses)
						foundTeam.ties = Number(foundTeam.ties)
						foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
						foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
						//foundVisitorTeam.wins = Number(foundVisitorTeam.wins)
						//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
						//foundVisitorTeam.ties = Number(foundVisitorTeam.ties)
						//foundVisitorTeam.overtimeLosses = Number(
						//	foundVisitorTeam.overtimeLosses
						//)
						//foundVisitorTeam.shootoutLosses = Number(
						//	foundVisitorTeam.shootoutLosses
						//)
					} else if (previousStatus === 'Shootout') {
						console.log(
							'home team WON last game in shootout, but WON this time in overtime'
						)
						console.log(
							'visitor team LOST last game in shootout, but LOST this time in a overtime'
						)
						foundTeam.wins = Number(foundTeam.wins)
						foundTeam.losses = Number(foundTeam.losses)
						foundTeam.ties = Number(foundTeam.ties)
						foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
						foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
						//foundVisitorTeam.wins = Number(foundVisitorTeam.wins)
						//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
						//foundVisitorTeam.ties = Number(foundVisitorTeam.ties)
						//foundVisitorTeam.overtimeLosses =
						//	Number(foundVisitorTeam.overtimeLosses) + 1
						//foundVisitorTeam.shootoutLosses =
						//	Number(foundVisitorTeam.shootoutLosses) - 1
					} else {
						console.log(
							'home team WON in regulation last time, but WON this time in overtime' //done
						)
						console.log(
							'visitor team LOST in regulation last time, but LOST this time in overtime' //done
						)
						foundTeam.wins = Number(foundTeam.wins)
						foundTeam.losses = Number(foundTeam.losses)
						foundTeam.ties = Number(foundTeam.ties)
						foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
						foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
						//foundVisitorTeam.wins = Number(foundVisitorTeam.wins)
						//foundVisitorTeam.losses = Number(foundVisitorTeam.losses) - 1
						//foundVisitorTeam.ties = Number(foundVisitorTeam.ties)
						//foundVisitorTeam.overtimeLosses =
						//	Number(foundVisitorTeam.overtimeLosses) + 1
						//foundVisitorTeam.shootoutLosses = Number(
						//	foundVisitorTeam.shootoutLosses
						//)
					}
					//
					//
				} else if (newWinner !== teamId) {
					console.log('visitor team is winner this time in a Shootout!!  41')
					if (previousStatus === 'Overtime') {
						console.log(
							'visitor team WON last game in overtime, and WON this game in overtime' //done
						)
						console.log(
							'home team LOST last game in overtime, and LOST this game in overtime' //done
						)
						foundTeam.wins = Number(foundTeam.wins)
						foundTeam.losses = Number(foundTeam.losses)
						foundTeam.ties = Number(foundTeam.ties)
						foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
						foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
						//foundVisitorTeam.wins = Number(foundVisitorTeam.wins)
						//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
						//foundVisitorTeam.ties = Number(foundVisitorTeam.ties)
						//foundVisitorTeam.overtimeLosses = Number(
						//	foundVisitorTeam.overtimeLosses
						//)
						//foundVisitorTeam.shootoutLosses = Number(
						//	foundVisitorTeam.shootoutLosses
						//)
					} else if (previousStatus === 'Shootout') {
						console.log(
							'visitor team WON last game in shootout, but WON this time in overtime'
						)
						console.log(
							'home team LOST last game in shootout, but LOST this time in overtime'
						)
						foundTeam.wins = Number(foundTeam.wins)
						foundTeam.losses = Number(foundTeam.losses)
						foundTeam.ties = Number(foundTeam.ties)
						foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses) + 1
						foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses) - 1
						//foundVisitorTeam.wins = Number(foundVisitorTeam.wins)
						//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
						//foundVisitorTeam.ties = Number(foundVisitorTeam.ties)
						//foundVisitorTeam.overtimeLosses = Number(
						//	foundVisitorTeam.overtimeLosses
						//)
						//foundVisitorTeam.shootoutLosses = Number(
						//	foundVisitorTeam.shootoutLosses
						//)
					} else {
						console.log(
							'visitor team WON in regulation last time, but WON this time in overtime'
						)
						console.log(
							'home team LOST in regulation last time, but LOST this time in overtime'
						)
						foundTeam.wins = Number(foundTeam.wins)
						foundTeam.losses = Number(foundTeam.losses) - 1
						foundTeam.ties = Number(foundTeam.ties)
						foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses) + 1
						foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
						//foundVisitorTeam.wins = Number(foundVisitorTeam.wins)
						//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
						//foundVisitorTeam.ties = Number(foundVisitorTeam.ties)
						//foundVisitorTeam.overtimeLosses = Number(
						//	foundVisitorTeam.overtimeLosses
						//)
						//foundVisitorTeam.shootoutLosses = Number(
						//	foundVisitorTeam.shootoutLosses
						//)
					}
				}
			}
		} else if (
			gameStatus === 'Shootout' &&
			newHomeGoalsTotal !== newVisitorGoalsTotal
		) {
			if (
				newWinner !== previousWinner &&
				previousHomeGoalsTotal !== previousVisitorGoalsTotal
			) {
				if (newWinner === teamId) {
					console.log(
						'home team is winner this time in a shootout.  Last game was NOT a tie!!'
					)
					if (previousStatus === 'Overtime') {
						console.log(
							'home team LOST last game in overtime, and WON this game in a shootout' //done
						)
						console.log(
							'visitor team WON last game in overtime, and LOST this game in a shootout' //done
						)
						foundTeam.wins = Number(foundTeam.wins) + 1
						foundTeam.losses = Number(foundTeam.losses)
						foundTeam.ties = Number(foundTeam.ties)
						foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses) - 1
						foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
						//foundVisitorTeam.wins = Number(foundVisitorTeam.wins) - 1
						//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
						//foundVisitorTeam.ties = Number(foundVisitorTeam.ties)
						//foundVisitorTeam.overtimeLosses = Number(
						//	foundVisitorTeam.overtimeLosses
						//)
						//foundVisitorTeam.shootoutLosses =
						//	Number(foundVisitorTeam.shootoutLosses) + 1
					} else if (previousStatus === 'Shootout') {
						console.log(
							'home team LOST last game in shootout, but WON this time in a shootout...'
						)
						console.log(
							'visitor team WON last game in shootout, but LOST this time in a shootout...'
						)
						foundTeam.wins = Number(foundTeam.wins) + 1
						foundTeam.losses = Number(foundTeam.losses)
						foundTeam.ties = Number(foundTeam.ties)
						foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
						foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses) - 1
						//foundVisitorTeam.wins = Number(foundVisitorTeam.wins) - 1
						//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
						//foundVisitorTeam.ties = Number(foundVisitorTeam.ties)
						//foundVisitorTeam.overtimeLosses = Number(
						//	foundVisitorTeam.overtimeLosses
						//)
						//foundVisitorTeam.shootoutLosses =
						//	Number(foundVisitorTeam.shootoutLosses) + 1
					} else {
						console.log(
							'home team LOST in regulation last time, but WON this time in a shootout'
						)
						console.log(
							'visitor team WON in regulation last time, but LOST this time in a shootout'
						)
						foundTeam.wins = Number(foundTeam.wins) + 1
						foundTeam.losses = Number(foundTeam.losses) - 1
						foundTeam.ties = Number(foundTeam.ties)
						foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
						foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
						//foundVisitorTeam.wins = Number(foundVisitorTeam.wins) - 1
						//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
						//foundVisitorTeam.ties = Number(foundVisitorTeam.ties)
						//foundVisitorTeam.overtimeLosses = Number(
						//	foundVisitorTeam.overtimeLosses
						//)
						//foundVisitorTeam.shootoutLosses =
						//	Number(foundVisitorTeam.shootoutLosses) + 1
					}
					//
					//
				} else if (newWinner !== teamId) {
					console.log('visitor team is winner this time in Shootout!!  3')
					if (previousStatus === 'Overtime') {
						console.log(
							'visitor team LOST last game in overtime, and WON this game in a shootout'
						)
						console.log(
							'home team WON last game in overtime, and LOST this game in a shootout'
						)
						foundTeam.wins = Number(foundTeam.wins) - 1
						foundTeam.losses = Number(foundTeam.losses)
						foundTeam.ties = Number(foundTeam.ties)
						foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
						foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses) + 1
						//foundVisitorTeam.wins = Number(foundVisitorTeam.wins) + 1
						//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
						//foundVisitorTeam.ties = Number(foundVisitorTeam.ties)
						//foundVisitorTeam.overtimeLosses =
						//	Number(foundVisitorTeam.overtimeLosses) - 1
						//foundVisitorTeam.shootoutLosses = Number(
						//	foundVisitorTeam.shootoutLosses
						//)
					} else if (previousStatus === 'Shootout') {
						console.log(
							'visitor team LOST last game in shootout, but WON this time in a shootout...'
						)
						console.log(
							'home team WON last game in shootout, but LOST this time in a shootout...'
						)
						foundTeam.wins = Number(foundTeam.wins) - 1
						foundTeam.losses = Number(foundTeam.losses)
						foundTeam.ties = Number(foundTeam.ties)
						foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
						foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses) + 1
						//foundVisitorTeam.wins = Number(foundVisitorTeam.wins) + 1
						//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
						//foundVisitorTeam.ties = Number(foundVisitorTeam.ties)
						//foundVisitorTeam.overtimeLosses = Number(
						//	foundVisitorTeam.overtimeLosses
						//)
						//foundVisitorTeam.shootoutLosses =
						//	Number(foundVisitorTeam.shootoutLosses) - 1
					} else {
						console.log(
							'visitor team LOST in regulation last time, but WON this time in a shootout'
						)
						console.log(
							'home team WON in regulation last time, but LOST this time in a shootout'
						)
						foundTeam.wins = Number(foundTeam.wins) - 1
						foundTeam.losses = Number(foundTeam.losses)
						foundTeam.ties = Number(foundTeam.ties)
						foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
						foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses) + 1
						//foundVisitorTeam.wins = Number(foundVisitorTeam.wins) + 1
						//foundVisitorTeam.losses = Number(foundVisitorTeam.losses) - 1
						//foundVisitorTeam.ties = Number(foundVisitorTeam.ties)
						//foundVisitorTeam.overtimeLosses = Number(
						//	foundVisitorTeam.overtimeLosses
						//)
						//foundVisitorTeam.shootoutLosses = Number(
						//	foundVisitorTeam.shootoutLosses
						//)
					}
				}
			} else if (
				newWinner !== previousWinner &&
				previousHomeGoalsTotal === previousVisitorGoalsTotal
			) {
				if (newWinner === teamId) {
					console.log(
						'home team is winner this time in a shootout!!  Last game was a tie in overtime'
					)
					if (previousStatus === 'Overtime') {
						console.log(
							'Last game was a tie in overtime, but home WON this game in a shootout'
						)
						foundTeam.wins = Number(foundTeam.wins) + 1
						foundTeam.losses = Number(foundTeam.losses)
						foundTeam.ties = Number(foundTeam.ties) - 1
						foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
						foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
						//foundVisitorTeam.wins = Number(foundVisitorTeam.wins)
						//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
						//foundVisitorTeam.ties = Number(foundVisitorTeam.ties) - 1
						//foundVisitorTeam.overtimeLosses = Number(
						//	foundVisitorTeam.overtimeLosses
						//)
						//foundVisitorTeam.shootoutLosses =
						//	Number(foundVisitorTeam.shootoutLosses) + 1
					} else if (previousStatus === 'Shootout') {
						console.log(
							'last game was a TIE in a shootout, but home team WON this time in a shootout...'
						)
						foundTeam.wins = Number(foundTeam.wins) + 1
						foundTeam.losses = Number(foundTeam.losses)
						foundTeam.ties = Number(foundTeam.ties) - 1
						foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
						foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
						//foundVisitorTeam.wins = Number(foundVisitorTeam.wins)
						//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
						//foundVisitorTeam.ties = Number(foundVisitorTeam.ties) - 1
						//foundVisitorTeam.overtimeLosses = Number(
						//	foundVisitorTeam.overtimeLosses
						//)
						//foundVisitorTeam.shootoutLosses =
						//	Number(foundVisitorTeam.shootoutLosses) + 1
					} else {
						console.log(
							'last game was a TIE in regulation, but home WON this time in shootout'
						)
						foundTeam.wins = Number(foundTeam.wins) + 1
						foundTeam.losses = Number(foundTeam.losses)
						foundTeam.ties = Number(foundTeam.ties) - 1
						foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
						foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
						//foundVisitorTeam.wins = Number(foundVisitorTeam.wins)
						//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
						//foundVisitorTeam.ties = Number(foundVisitorTeam.ties) - 1
						//foundVisitorTeam.overtimeLosses = Number(
						//	foundVisitorTeam.overtimeLosses
						//)
						//foundVisitorTeam.shootoutLosses =
						//	Number(foundVisitorTeam.shootoutLosses) + 1
					}
					//
					//
				} else if (newWinner !== teamId) {
					console.log('visitor team is winner this time in Overtime!!  13')
					if (previousStatus === 'Overtime') {
						console.log(
							'last game was a TIE in overtime, but visitor WON this game in shootout'
						)
						foundTeam.wins = Number(foundTeam.wins)
						foundTeam.losses = Number(foundTeam.losses)
						foundTeam.ties = Number(foundTeam.ties) - 1
						foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
						foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses) + 1
						//foundVisitorTeam.wins = Number(foundVisitorTeam.wins) + 1
						//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
						//foundVisitorTeam.ties = Number(foundVisitorTeam.ties) - 1
						//foundVisitorTeam.overtimeLosses = Number(
						//	foundVisitorTeam.overtimeLosses
						//)
						//foundVisitorTeam.shootoutLosses = Number(
						//	foundVisitorTeam.shootoutLosses
						//)
					} else if (previousStatus === 'Shootout') {
						console.log(
							'last game was a TIE in a shootout, but visitor WON this time in shootout...'
						)
						foundTeam.wins = Number(foundTeam.wins)
						foundTeam.losses = Number(foundTeam.losses)
						foundTeam.ties = Number(foundTeam.ties) - 1
						foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
						foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses) + 1
						//foundVisitorTeam.wins = Number(foundVisitorTeam.wins) + 1
						//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
						//foundVisitorTeam.ties = Number(foundVisitorTeam.ties) - 1
						//foundVisitorTeam.overtimeLosses = Number(
						//	foundVisitorTeam.overtimeLosses
						//)
						//foundVisitorTeam.shootoutLosses = Number(
						//	foundVisitorTeam.shootoutLosses
						//)
					} else {
						console.log(
							'last game was a TIE in regulation, visitor but WON this time in shootout'
						)
						foundTeam.wins = Number(foundTeam.wins)
						foundTeam.losses = Number(foundTeam.losses)
						foundTeam.ties = Number(foundTeam.ties) - 1
						foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
						foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses) + 1
						//foundVisitorTeam.wins = Number(foundVisitorTeam.wins) + 1
						//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
						//foundVisitorTeam.ties = Number(foundVisitorTeam.ties) - 1
						//foundVisitorTeam.overtimeLosses = Number(
						//	foundVisitorTeam.overtimeLosses
						//)
						//foundVisitorTeam.shootoutLosses = Number(
						//	foundVisitorTeam.shootoutLosses
						//)
					}
				}
			} else if (newWinner === previousWinner) {
				console.log(
					'new winner is same as previous winner: ' +
						newWinner +
						'  ' +
						previousWinner
				)
				if (newWinner === teamId) {
					console.log('home team is winner this time in a Shootout!!')
					if (previousStatus === 'Overtime') {
						console.log(
							'home team WON last game in overtime, and WON this game in a shootout'
						)
						console.log(
							'visitor team LOST last game in overtime, and LOST this game in a shootout'
						)
						foundTeam.wins = Number(foundTeam.wins)
						foundTeam.losses = Number(foundTeam.losses)
						foundTeam.ties = Number(foundTeam.ties)
						foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
						foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
						//foundVisitorTeam.wins = Number(foundVisitorTeam.wins)
						//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
						//foundVisitorTeam.ties = Number(foundVisitorTeam.ties)
						//foundVisitorTeam.overtimeLosses =
						//	Number(foundVisitorTeam.overtimeLosses) - 1
						//foundVisitorTeam.shootoutLosses =
						//	Number(foundVisitorTeam.shootoutLosses) + 1
					} else if (previousStatus === 'Shootout') {
						console.log(
							'home team WON last game in shootout, but WON this time in a shootout...'
						)
						console.log(
							'visitor team LOST last game in shootout, but LOST this time in a shootout...'
						)
						foundTeam.wins = Number(foundTeam.wins)
						foundTeam.losses = Number(foundTeam.losses)
						foundTeam.ties = Number(foundTeam.ties)
						foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
						foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
						//foundVisitorTeam.wins = Number(foundVisitorTeam.wins)
						//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
						//foundVisitorTeam.ties = Number(foundVisitorTeam.ties)
						//foundVisitorTeam.overtimeLosses = Number(
						//	foundVisitorTeam.overtimeLosses
						//)
						//foundVisitorTeam.shootoutLosses = Number(
						//	foundVisitorTeam.shootoutLosses
						//)
					} else {
						console.log(
							'home team WON in regulation last time, but WON this time in a shootout' //done
						)
						console.log(
							'visitor team LOST in regulation last time, but LOST this time in a shootout' //done
						)
						foundTeam.wins = Number(foundTeam.wins)
						foundTeam.losses = Number(foundTeam.losses)
						foundTeam.ties = Number(foundTeam.ties)
						foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
						foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
						//foundVisitorTeam.wins = Number(foundVisitorTeam.wins)
						//foundVisitorTeam.losses = Number(foundVisitorTeam.losses) - 1
						//foundVisitorTeam.ties = Number(foundVisitorTeam.ties)
						//foundVisitorTeam.overtimeLosses = Number(
						//	foundVisitorTeam.overtimeLosses
						//)
						//foundVisitorTeam.shootoutLosses =
						//	Number(foundVisitorTeam.shootoutLosses) + 1
					}
					//
					//
				} else if (newWinner !== teamId) {
					console.log('visitor team is winner this time in a Shootout!!  4')
					if (previousStatus === 'Overtime') {
						console.log(
							'visitor team WON last game in overtime, and WON this game in a shootout' //done
						)
						console.log(
							'home team LOST last game in overtime, and LOST this game in a shootout' //done
						)
						foundTeam.wins = Number(foundTeam.wins)
						foundTeam.losses = Number(foundTeam.losses)
						foundTeam.ties = Number(foundTeam.ties)
						foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses) - 1
						foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses) + 1
						//foundVisitorTeam.wins = Number(foundVisitorTeam.wins)
						//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
						//foundVisitorTeam.ties = Number(foundVisitorTeam.ties)
						//foundVisitorTeam.overtimeLosses = Number(
						//	foundVisitorTeam.overtimeLosses
						//)
						//foundVisitorTeam.shootoutLosses = Number(
						//	foundVisitorTeam.shootoutLosses
						//)
					} else if (previousStatus === 'Shootout') {
						console.log(
							'visitor team WON last game in shootout, but WON this time in a shootout...'
						)
						console.log(
							'home team LOST last game in shootout, but LOST this time in a shootout...'
						)
						foundTeam.wins = Number(foundTeam.wins)
						foundTeam.losses = Number(foundTeam.losses)
						foundTeam.ties = Number(foundTeam.ties)
						foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
						foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
						//foundVisitorTeam.wins = Number(foundVisitorTeam.wins)
						//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
						//foundVisitorTeam.ties = Number(foundVisitorTeam.ties)
						//foundVisitorTeam.overtimeLosses = Number(
						//	foundVisitorTeam.overtimeLosses
						//)
						//foundVisitorTeam.shootoutLosses = Number(
						//	foundVisitorTeam.shootoutLosses
						//)
					} else {
						console.log(
							'visitor team WON in regulation last time, but WON this time in a shootout'
						)
						console.log(
							'home team LOST in regulation last time, but LOST this time in a shootout'
						)
						foundTeam.wins = Number(foundTeam.wins)
						foundTeam.losses = Number(foundTeam.losses) - 1
						foundTeam.ties = Number(foundTeam.ties)
						foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
						foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses) + 1
						//foundVisitorTeam.wins = Number(foundVisitorTeam.wins)
						//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
						//foundVisitorTeam.ties = Number(foundVisitorTeam.ties)
						//foundVisitorTeam.overtimeLosses = Number(
						//	foundVisitorTeam.overtimeLosses
						//)
						//foundVisitorTeam.shootoutLosses = Number(
						//	foundVisitorTeam.shootoutLosses
						//)
					}
				}
			}
		} else if (
			gameStatus === 'FINAL' &&
			newHomeGoalsTotal !== newVisitorGoalsTotal
		) {
			if (
				newWinner !== previousWinner &&
				previousHomeGoalsTotal !== previousVisitorGoalsTotal
			) {
				if (newWinner === teamId) {
					console.log(
						'home team is winner this time in a regulation.  Last game was NOT a tie!!'
					)
					if (previousStatus === 'Overtime') {
						console.log(
							'home team LOST last game in overtime, and WON this game in regulation'
						)
						console.log(
							'visitor team WON last game in overtime, and LOST this game in regulation'
						)
						foundTeam.wins = Number(foundTeam.wins) + 1
						foundTeam.losses = Number(foundTeam.losses)
						foundTeam.ties = Number(foundTeam.ties)
						foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses) - 1
						foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
						//foundVisitorTeam.wins = Number(foundVisitorTeam.wins) - 1
						//foundVisitorTeam.losses = Number(foundVisitorTeam.losses) + 1
						//foundVisitorTeam.ties = Number(foundVisitorTeam.ties)
						//foundVisitorTeam.overtimeLosses = Number(
						//	foundVisitorTeam.overtimeLosses
						//)
						//foundVisitorTeam.shootoutLosses = Number(
						//	foundVisitorTeam.shootoutLosses
						//)
					} else if (previousStatus === 'Shootout') {
						console.log(
							'home team LOST last game in shootout, but WON this time in regulation'
						)
						console.log(
							'visitor team WON last game in shootout, but LOST this time in regulation'
						)
						foundTeam.wins = Number(foundTeam.wins) + 1
						foundTeam.losses = Number(foundTeam.losses)
						foundTeam.ties = Number(foundTeam.ties)
						foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
						foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses) - 1
						//foundVisitorTeam.wins = Number(foundVisitorTeam.wins) - 1
						//foundVisitorTeam.losses = Number(foundVisitorTeam.losses) + 1
						//foundVisitorTeam.ties = Number(foundVisitorTeam.ties)
						//foundVisitorTeam.overtimeLosses = Number(
						//	foundVisitorTeam.overtimeLosses
						//)
						//foundVisitorTeam.shootoutLosses = Number(
						//	foundVisitorTeam.shootoutLosses
						//)
					} else {
						console.log(
							'home team LOST in regulation last time, but WON this time in regulation'
						)
						console.log(
							'visitor team WON in regulation last time, but LOST this time in regulation'
						)
						foundTeam.wins = Number(foundTeam.wins) + 1
						foundTeam.losses = Number(foundTeam.losses) - 1
						foundTeam.ties = Number(foundTeam.ties)
						foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
						foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
						//foundVisitorTeam.wins = Number(foundVisitorTeam.wins) - 1
						//foundVisitorTeam.losses = Number(foundVisitorTeam.losses) + 1
						//foundVisitorTeam.ties = Number(foundVisitorTeam.ties)
						//foundVisitorTeam.overtimeLosses = Number(
						//	foundVisitorTeam.overtimeLosses
						//)
						//foundVisitorTeam.shootoutLosses = Number(
						//	foundVisitorTeam.shootoutLosses
						//)
					}
					//
					//
				} else if (newWinner !== teamId) {
					console.log('visitor team is winner this time in Shootout!!  33')
					if (previousStatus === 'Overtime') {
						console.log(
							'visitor team LOST last game in overtime, and WON this game in regulation'
						)
						console.log(
							'home team WON last game in overtime, and LOST this game in regulation'
						)
						foundTeam.wins = Number(foundTeam.wins) - 1
						foundTeam.losses = Number(foundTeam.losses) + 1
						foundTeam.ties = Number(foundTeam.ties)
						foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
						foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
						//foundVisitorTeam.wins = Number(foundVisitorTeam.wins) + 1
						//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
						//foundVisitorTeam.ties = Number(foundVisitorTeam.ties)
						//foundVisitorTeam.overtimeLosses =
						//	Number(foundVisitorTeam.overtimeLosses) - 1
						//foundVisitorTeam.shootoutLosses = Number(
						//	foundVisitorTeam.shootoutLosses
						//)
					} else if (previousStatus === 'Shootout') {
						console.log(
							'visitor team LOST last game in shootout, but WON this time in regulation'
						)
						console.log(
							'home team WON last game in shootout, but LOST this time in regulation'
						)
						foundTeam.wins = Number(foundTeam.wins) - 1
						foundTeam.losses = Number(foundTeam.losses) + 1
						foundTeam.ties = Number(foundTeam.ties)
						foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
						foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
						//foundVisitorTeam.wins = Number(foundVisitorTeam.wins) + 1
						//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
						//foundVisitorTeam.ties = Number(foundVisitorTeam.ties)
						//foundVisitorTeam.overtimeLosses = Number(
						//	foundVisitorTeam.overtimeLosses
						//)
						//foundVisitorTeam.shootoutLosses =
						//	Number(foundVisitorTeam.shootoutLosses) - 1
					} else {
						console.log(
							'visitor team LOST in regulation last time, but WON this time in regulation'
						)
						console.log(
							'home team WON in regulation last time, but LOST this time in regulation'
						)
						foundTeam.wins = Number(foundTeam.wins) - 1
						foundTeam.losses = Number(foundTeam.losses) + 1
						foundTeam.ties = Number(foundTeam.ties)
						foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
						foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
						//foundVisitorTeam.wins = Number(foundVisitorTeam.wins) + 1
						//foundVisitorTeam.losses = Number(foundVisitorTeam.losses) - 1
						//foundVisitorTeam.ties = Number(foundVisitorTeam.ties)
						//foundVisitorTeam.overtimeLosses = Number(
						//	foundVisitorTeam.overtimeLosses
						//)
						//foundVisitorTeam.shootoutLosses = Number(
						//	foundVisitorTeam.shootoutLosses
						//)
					}
				}
			} else if (
				newWinner !== previousWinner &&
				previousHomeGoalsTotal === previousVisitorGoalsTotal
			) {
				if (newWinner === teamId) {
					console.log(
						'home team is winner this time in regulation!  Last game was a tie in overtime'
					)
					if (previousStatus === 'Overtime') {
						console.log(
							'Last game was a tie in overtime, but home WON this game in regulation'
						)
						foundTeam.wins = Number(foundTeam.wins) + 1
						foundTeam.losses = Number(foundTeam.losses)
						foundTeam.ties = Number(foundTeam.ties) - 1
						foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
						foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
						//foundVisitorTeam.wins = Number(foundVisitorTeam.wins)
						//foundVisitorTeam.losses = Number(foundVisitorTeam.losses) + 1
						//foundVisitorTeam.ties = Number(foundVisitorTeam.ties) - 1
						//foundVisitorTeam.overtimeLosses = Number(
						//	foundVisitorTeam.overtimeLosses
						//)
						//foundVisitorTeam.shootoutLosses = Number(
						//	foundVisitorTeam.shootoutLosses
						//)
					} else if (previousStatus === 'Shootout') {
						console.log(
							'last game was a TIE in a shootout, but home team WON this time in regulation'
						)
						foundTeam.wins = Number(foundTeam.wins) + 1
						foundTeam.losses = Number(foundTeam.losses)
						foundTeam.ties = Number(foundTeam.ties) - 1
						foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
						foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
						//foundVisitorTeam.wins = Number(foundVisitorTeam.wins)
						//foundVisitorTeam.losses = Number(foundVisitorTeam.losses) + 1
						//foundVisitorTeam.ties = Number(foundVisitorTeam.ties) - 1
						//foundVisitorTeam.overtimeLosses = Number(
						//	foundVisitorTeam.overtimeLosses
						//)
						//foundVisitorTeam.shootoutLosses = Number(
						//	foundVisitorTeam.shootoutLosses
						//)
					} else {
						console.log(
							'last game was a TIE in regulation, but home WON this time in regulation'
						)
						foundTeam.wins = Number(foundTeam.wins) + 1
						foundTeam.losses = Number(foundTeam.losses)
						foundTeam.ties = Number(foundTeam.ties) - 1
						foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
						foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
						//foundVisitorTeam.wins = Number(foundVisitorTeam.wins)
						//foundVisitorTeam.losses = Number(foundVisitorTeam.losses) + 1
						//foundVisitorTeam.ties = Number(foundVisitorTeam.ties) - 1
						//foundVisitorTeam.overtimeLosses = Number(
						//	foundVisitorTeam.overtimeLosses
						//)
						//foundVisitorTeam.shootoutLosses = Number(
						//	foundVisitorTeam.shootoutLosses
						//)
					}
					//
					//
				} else if (newWinner !== teamId) {
					console.log('visitor team is winner this time in Overtime!!  13')
					if (previousStatus === 'Overtime') {
						console.log(
							'last game was a TIE in overtime, but visitor WON this game in regulation'
						)
						foundTeam.wins = Number(foundTeam.wins)
						foundTeam.losses = Number(foundTeam.losses) + 1
						foundTeam.ties = Number(foundTeam.ties) - 1
						foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
						foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
						//foundVisitorTeam.wins = Number(foundVisitorTeam.wins) + 1
						//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
						//foundVisitorTeam.ties = Number(foundVisitorTeam.ties) - 1
						//foundVisitorTeam.overtimeLosses = Number(
						//	foundVisitorTeam.overtimeLosses
						//)
						//foundVisitorTeam.shootoutLosses = Number(
						//	foundVisitorTeam.shootoutLosses
						//)
					} else if (previousStatus === 'Shootout') {
						console.log(
							'last game was a TIE in a shootout, but visitor WON this time in regulation'
						)
						foundTeam.wins = Number(foundTeam.wins)
						foundTeam.losses = Number(foundTeam.losses) + 1
						foundTeam.ties = Number(foundTeam.ties) - 1
						foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
						foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
						//foundVisitorTeam.wins = Number(foundVisitorTeam.wins) + 1
						//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
						//foundVisitorTeam.ties = Number(foundVisitorTeam.ties) - 1
						//foundVisitorTeam.overtimeLosses = Number(
						//	foundVisitorTeam.overtimeLosses
						//)
						//foundVisitorTeam.shootoutLosses = Number(
						//	foundVisitorTeam.shootoutLosses
						//)
					} else {
						console.log(
							'last game was a TIE in regulation,  but visitor WON this time in regulation'
						)
						foundTeam.wins = Number(foundTeam.wins)
						foundTeam.losses = Number(foundTeam.losses) + 1
						foundTeam.ties = Number(foundTeam.ties) - 1
						foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
						foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
						//foundVisitorTeam.wins = Number(foundVisitorTeam.wins) + 1
						//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
						//foundVisitorTeam.ties = Number(foundVisitorTeam.ties) - 1
						//foundVisitorTeam.overtimeLosses = Number(
						//	foundVisitorTeam.overtimeLosses
						//)
						//foundVisitorTeam.shootoutLosses = Number(
						//	foundVisitorTeam.shootoutLosses
						//)
					}
				}
			} else if (newWinner === previousWinner) {
				console.log(
					'new winner is same as previous winner: ' +
						newWinner +
						'  ' +
						previousWinner
				)
				if (newWinner === teamId) {
					console.log('home team is winner this time in regulation')
					if (previousStatus === 'Overtime') {
						console.log(
							'home team WON last game in overtime, and WON this game in regulation'
						)
						console.log(
							'visitor team LOST last game in overtime, and LOST this game in regulation'
						)
						foundTeam.wins = Number(foundTeam.wins)
						foundTeam.losses = Number(foundTeam.losses)
						foundTeam.ties = Number(foundTeam.ties)
						foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
						foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
						//foundVisitorTeam.wins = Number(foundVisitorTeam.wins)
						//foundVisitorTeam.losses = Number(foundVisitorTeam.losses) + 1
						//foundVisitorTeam.ties = Number(foundVisitorTeam.ties)
						//foundVisitorTeam.overtimeLosses =
						//	Number(foundVisitorTeam.overtimeLosses) - 1
						//foundVisitorTeam.shootoutLosses = Number(
						//	foundVisitorTeam.shootoutLosses
						//)
					} else if (previousStatus === 'Shootout') {
						console.log(
							'home team WON last game in shootout, but WON this time in regulation'
						)
						console.log(
							'visitor team LOST last game in shootout, but LOST this time in regulation'
						)
						foundTeam.wins = Number(foundTeam.wins)
						foundTeam.losses = Number(foundTeam.losses)
						foundTeam.ties = Number(foundTeam.ties)
						foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
						foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
						//foundVisitorTeam.wins = Number(foundVisitorTeam.wins)
						//foundVisitorTeam.losses = Number(foundVisitorTeam.losses) + 1
						//foundVisitorTeam.ties = Number(foundVisitorTeam.ties)
						//foundVisitorTeam.overtimeLosses = Number(
						//	foundVisitorTeam.overtimeLosses
						//)
						//foundVisitorTeam.shootoutLosses =
						//	Number(foundVisitorTeam.shootoutLosses) - 1
					} else {
						console.log(
							'home team WON in regulation last time, but WON this time in regulation'
						)
						console.log(
							'visitor team LOST in regulation last time, but LOST this time in regulation'
						)
						foundTeam.wins = Number(foundTeam.wins)
						foundTeam.losses = Number(foundTeam.losses)
						foundTeam.ties = Number(foundTeam.ties)
						foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
						foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
						//foundVisitorTeam.wins = Number(foundVisitorTeam.wins)
						//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
						//foundVisitorTeam.ties = Number(foundVisitorTeam.ties)
						//foundVisitorTeam.overtimeLosses = Number(
						//	foundVisitorTeam.overtimeLosses
						//)
						//foundVisitorTeam.shootoutLosses = Number(
						//	foundVisitorTeam.shootoutLosses
						//)
					}
					//
					//
				} else if (newWinner !== teamId) {
					console.log('visitor team is winner this time in regulation  42')
					if (previousStatus === 'Overtime') {
						console.log(
							'visitor team WON last game in overtime, and WON this game in regulation'
						)
						console.log(
							'home team LOST last game in overtime, and LOST this game in regulation'
						)
						foundTeam.wins = Number(foundTeam.wins)
						foundTeam.losses = Number(foundTeam.losses) + 1
						foundTeam.ties = Number(foundTeam.ties)
						foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses) - 1
						foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
						//foundVisitorTeam.wins = Number(foundVisitorTeam.wins)
						//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
						//foundVisitorTeam.ties = Number(foundVisitorTeam.ties)
						//foundVisitorTeam.overtimeLosses = Number(
						//	foundVisitorTeam.overtimeLosses
						//)
						//foundVisitorTeam.shootoutLosses = Number(
						//	foundVisitorTeam.shootoutLosses
						//)
					} else if (previousStatus === 'Shootout') {
						console.log(
							'visitor team WON last game in shootout, but WON this time in regulation'
						)
						console.log(
							'home team LOST last game in shootout, but LOST this time in regulation'
						)
						foundTeam.wins = Number(foundTeam.wins)
						foundTeam.losses = Number(foundTeam.losses) + 1
						foundTeam.ties = Number(foundTeam.ties)
						foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
						foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses) - 1
						//foundVisitorTeam.wins = Number(foundVisitorTeam.wins)
						//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
						//foundVisitorTeam.ties = Number(foundVisitorTeam.ties)
						//foundVisitorTeam.overtimeLosses = Number(
						//	foundVisitorTeam.overtimeLosses
						//)
						//foundVisitorTeam.shootoutLosses = Number(
						//	foundVisitorTeam.shootoutLosses
						//)
					} else {
						console.log(
							'visitor team WON in regulation last time, but WON this time in regulation'
						)
						console.log(
							'home team LOST in regulation last time, but LOST this time in regulation'
						)
						foundTeam.wins = Number(foundTeam.wins)
						foundTeam.losses = Number(foundTeam.losses)
						foundTeam.ties = Number(foundTeam.ties)
						foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
						foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
						//foundVisitorTeam.wins = Number(foundVisitorTeam.wins)
						//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
						//foundVisitorTeam.ties = Number(foundVisitorTeam.ties)
						//foundVisitorTeam.overtimeLosses = Number(
						//	foundVisitorTeam.overtimeLosses
						//)
						//foundVisitorTeam.shootoutLosses = Number(
						//	foundVisitorTeam.shootoutLosses
						//)
					}
				}
			}
			//TIE STUFF.  THERE IS NO NEW WINNER
			//
			//
			//
		} else if (
			gameStatus === 'Overtime' &&
			newHomeGoalsTotal === newVisitorGoalsTotal
		) {
			//console.log('you are here matthew')
			if (
				previousWinner === teamId &&
				previousHomeGoalsTotal !== previousVisitorGoalsTotal
			) {
				//home team won last game, NOT in a tie.  This game is a TIE marked as Overtime
				//
				if (previousStatus === 'Overtime') {
					//
					console.log(
						'home team won last game, NOT in a tie but in Overtime.  This game is a TIE marked as Overtime'
					)
					foundTeam.wins = Number(foundTeam.wins) - 1
					foundTeam.losses = Number(foundTeam.losses)
					foundTeam.ties = Number(foundTeam.ties) + 1
					foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
					foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
					//foundVisitorTeam.wins = Number(foundVisitorTeam.wins)
					//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
					//foundVisitorTeam.ties = Number(foundVisitorTeam.ties) + 1
					//foundVisitorTeam.overtimeLosses =
					//	Number(foundVisitorTeam.overtimeLosses) - 1
					//foundVisitorTeam.shootoutLosses = Number(
					//	foundVisitorTeam.shootoutLosses
					//)
				} else if (previousStatus === 'Shootout') {
					//
					console.log(
						'home team won last game, NOT in a tie but in a Shootout.  This game is a TIE marked as Overtime'
					)
					foundTeam.wins = Number(foundTeam.wins) - 1
					foundTeam.losses = Number(foundTeam.losses)
					foundTeam.ties = Number(foundTeam.ties) + 1
					foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
					foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
					//foundVisitorTeam.wins = Number(foundVisitorTeam.wins)
					//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
					//foundVisitorTeam.ties = Number(foundVisitorTeam.ties) + 1
					//foundVisitorTeam.overtimeLosses = Number(
					//	foundVisitorTeam.overtimeLosses
					//)
					//foundVisitorTeam.shootoutLosses =
					//	Number(foundVisitorTeam.shootoutLosses) - 1
				} else if (previousStatus === 'FINAL') {
					//
					console.log(
						'home team won last game, NOT in a tie but in Regulation.  This game is a TIE marked as Overtime'
					)
					foundTeam.wins = Number(foundTeam.wins) - 1
					foundTeam.losses = Number(foundTeam.losses)
					foundTeam.ties = Number(foundTeam.ties) + 1
					foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
					foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
					//foundVisitorTeam.wins = Number(foundVisitorTeam.wins)
					//foundVisitorTeam.losses = Number(foundVisitorTeam.losses) - 1
					//foundVisitorTeam.ties = Number(foundVisitorTeam.ties) + 1
					//foundVisitorTeam.overtimeLosses = Number(
					//	foundVisitorTeam.overtimeLosses
					//)
					//foundVisitorTeam.shootoutLosses = Number(
					//	foundVisitorTeam.shootoutLosses
					//)
				}
			} else if (
				previousWinner !== teamId &&
				previousHomeGoalsTotal !== previousVisitorGoalsTotal
			) {
				//visitor team won last game, NOT in a tie.  This game is a TIE, marked as Overtime
				//
				if (previousStatus === 'Overtime') {
					//
					console.log(
						'visitor team won last game, NOT in a tie but in Overtime.  This game is a TIE marked as Overtime'
					)
					foundTeam.wins = Number(foundTeam.wins)
					foundTeam.losses = Number(foundTeam.losses)
					foundTeam.ties = Number(foundTeam.ties) + 1
					foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses) - 1
					foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
					//foundVisitorTeam.wins = Number(foundVisitorTeam.wins) - 1
					//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
					//foundVisitorTeam.ties = Number(foundVisitorTeam.ties) + 1
					//foundVisitorTeam.overtimeLosses = Number(
					//	foundVisitorTeam.overtimeLosses
					//)
					//foundVisitorTeam.shootoutLosses = Number(
					//	foundVisitorTeam.shootoutLosses
					//)
				} else if (previousStatus === 'Shootout') {
					//
					console.log(
						'visitor team won last game, NOT in a tie but in a Shootout.  This game is a TIE marked as Overtime'
					)
					foundTeam.wins = Number(foundTeam.wins)
					foundTeam.losses = Number(foundTeam.losses)
					foundTeam.ties = Number(foundTeam.ties) + 1
					foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
					foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses) - 1
					//foundVisitorTeam.wins = Number(foundVisitorTeam.wins) - 1
					//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
					//foundVisitorTeam.ties = Number(foundVisitorTeam.ties) + 1
					//foundVisitorTeam.overtimeLosses = Number(
					//	foundVisitorTeam.overtimeLosses
					//)
					//foundVisitorTeam.shootoutLosses = Number(
					//	foundVisitorTeam.shootoutLosses
					//)
				} else if (previousStatus === 'FINAL') {
					//
					console.log(
						'visitor team won last game, NOT in a tie but in Regulation.  This game is a TIE marked as Overtime'
					)
					foundTeam.wins = Number(foundTeam.wins)
					foundTeam.losses = Number(foundTeam.losses) - 1
					foundTeam.ties = Number(foundTeam.ties) + 1
					foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
					foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
					//foundVisitorTeam.wins = Number(foundVisitorTeam.wins) - 1
					//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
					//foundVisitorTeam.ties = Number(foundVisitorTeam.ties) + 1
					//foundVisitorTeam.overtimeLosses = Number(
					//	foundVisitorTeam.overtimeLosses
					//)
					//foundVisitorTeam.shootoutLosses = Number(
					//	foundVisitorTeam.shootoutLosses
					//)
				}
			} else if (
				!previousWinner &&
				previousHomeGoalsTotal === previousVisitorGoalsTotal
			) {
				//last game was a TIE.  This game is a TIE, marked as Overtime
				if (previousStatus === 'Overtime') {
					console.log('TIE last time in Overtime, TIE this time in Overtime')
					foundTeam.wins = Number(foundTeam.wins)
					foundTeam.losses = Number(foundTeam.losses)
					foundTeam.ties = Number(foundTeam.ties)
					foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
					foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
					//foundVisitorTeam.wins = Number(foundVisitorTeam.wins)
					//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
					//foundVisitorTeam.ties = Number(foundVisitorTeam.ties)
					//foundVisitorTeam.overtimeLosses = Number(
					//	foundVisitorTeam.overtimeLosses
					//)
					//foundVisitorTeam.shootoutLosses = Number(
					//	foundVisitorTeam.shootoutLosses
					//)
				} else if (previousStatus === 'Shootout') {
					console.log('TIE last time in Shootout, TIE this time in Overtime')
					foundTeam.wins = Number(foundTeam.wins)
					foundTeam.losses = Number(foundTeam.losses)
					foundTeam.ties = Number(foundTeam.ties)
					foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
					foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
					//foundVisitorTeam.wins = Number(foundVisitorTeam.wins)
					//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
					//foundVisitorTeam.ties = Number(foundVisitorTeam.ties)
					//foundVisitorTeam.overtimeLosses = Number(
					//	foundVisitorTeam.overtimeLosses
					//)
					//foundVisitorTeam.shootoutLosses = Number(
					//	foundVisitorTeam.shootoutLosses
					//)
				} else if (previousStatus === 'FINAL') {
					console.log('TIE last time in Regulation, TIE this time in Overtime')
					foundTeam.wins = Number(foundTeam.wins)
					foundTeam.losses = Number(foundTeam.losses)
					foundTeam.ties = Number(foundTeam.ties)
					foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
					foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
					//foundVisitorTeam.wins = Number(foundVisitorTeam.wins)
					//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
					//foundVisitorTeam.ties = Number(foundVisitorTeam.ties)
					//foundVisitorTeam.overtimeLosses = Number(
					//	foundVisitorTeam.overtimeLosses
					//)
					//foundVisitorTeam.shootoutLosses = Number(
					//	foundVisitorTeam.shootoutLosses
					//)
				}
			}
			//
			//MORE TIE STUFF
		} else if (
			gameStatus === 'Shootout' &&
			newHomeGoalsTotal === newVisitorGoalsTotal
		) {
			if (
				previousWinner === teamId &&
				previousHomeGoalsTotal !== previousVisitorGoalsTotal
			) {
				//home team won last game, NOT in a tie.  This game is a TIE marked as Overtime
				//
				if (previousStatus === 'Overtime') {
					//
					console.log(
						'home team won last game, NOT in a tie but in Overtime.  This game is a TIE marked as a Shootout'
					)
					foundTeam.wins = Number(foundTeam.wins) - 1
					foundTeam.losses = Number(foundTeam.losses)
					foundTeam.ties = Number(foundTeam.ties) + 1
					foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
					foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
					//oundVisitorTeam.wins = Number(foundVisitorTeam.wins)
					//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
					//foundVisitorTeam.ties = Number(foundVisitorTeam.ties) + 1
					//foundVisitorTeam.overtimeLosses =
					//	Number(foundVisitorTeam.overtimeLosses) - 1
					//foundVisitorTeam.shootoutLosses = Number(
					//	foundVisitorTeam.shootoutLosses
					//)
				} else if (previousStatus === 'Shootout') {
					//
					console.log(
						'home team won last game, NOT in a tie but in a Shootout.  This game is a TIE marked as a Shootout'
					)
					foundTeam.wins = Number(foundTeam.wins) - 1
					foundTeam.losses = Number(foundTeam.losses)
					foundTeam.ties = Number(foundTeam.ties) + 1
					foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
					foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
					//foundVisitorTeam.wins = Number(foundVisitorTeam.wins)
					//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
					//foundVisitorTeam.ties = Number(foundVisitorTeam.ties) + 1
					//foundVisitorTeam.overtimeLosses = Number(
					//	foundVisitorTeam.overtimeLosses
					//)
					//foundVisitorTeam.shootoutLosses =
					//	Number(foundVisitorTeam.shootoutLosses) - 1
				} else if (previousStatus === 'FINAL') {
					//
					console.log(
						'home team won last game, NOT in a tie but in Regulation.  This game is a TIE marked as a Shootout'
					)
					foundTeam.wins = Number(foundTeam.wins) - 1
					foundTeam.losses = Number(foundTeam.losses)
					foundTeam.ties = Number(foundTeam.ties) + 1
					foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
					foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
					//foundVisitorTeam.wins = Number(foundVisitorTeam.wins)
					//foundVisitorTeam.losses = Number(foundVisitorTeam.losses) - 1
					//foundVisitorTeam.ties = Number(foundVisitorTeam.ties) + 1
					//foundVisitorTeam.overtimeLosses = Number(
					//	foundVisitorTeam.overtimeLosses
					//)
					//foundVisitorTeam.shootoutLosses = Number(
					//	foundVisitorTeam.shootoutLosses
					//)
				}
			} else if (
				previousWinner !== teamId &&
				previousHomeGoalsTotal !== previousVisitorGoalsTotal
			) {
				//visitor team won last game, NOT in a tie.  This game is a TIE, marked as Overtime
				//
				if (previousStatus === 'Overtime') {
					//
					console.log(
						'visitor team won last game, NOT in a tie but in Overtime.  This game is a TIE marked as a Shootout'
					)
					foundTeam.wins = Number(foundTeam.wins)
					foundTeam.losses = Number(foundTeam.losses)
					foundTeam.ties = Number(foundTeam.ties) + 1
					foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses) - 1
					foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
					//foundVisitorTeam.wins = Number(foundVisitorTeam.wins) - 1
					//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
					//foundVisitorTeam.ties = Number(foundVisitorTeam.ties) + 1
					//foundVisitorTeam.overtimeLosses = Number(
					//	foundVisitorTeam.overtimeLosses
					//)
					//foundVisitorTeam.shootoutLosses = Number(
					//	foundVisitorTeam.shootoutLosses
					//)
				} else if (previousStatus === 'Shootout') {
					//
					console.log(
						'visitor team won last game, NOT in a tie but in a Shootout.  This game is a TIE marked as a Shootout'
					)
					foundTeam.wins = Number(foundTeam.wins)
					foundTeam.losses = Number(foundTeam.losses)
					foundTeam.ties = Number(foundTeam.ties) + 1
					foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
					foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses) - 1
					//foundVisitorTeam.wins = Number(foundVisitorTeam.wins) - 1
					//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
					//foundVisitorTeam.ties = Number(foundVisitorTeam.ties) + 1
					//foundVisitorTeam.overtimeLosses = Number(
					//	foundVisitorTeam.overtimeLosses
					//)
					//foundVisitorTeam.shootoutLosses = Number(
					//	foundVisitorTeam.shootoutLosses
					//)
				} else if (previousStatus === 'FINAL') {
					//
					console.log(
						'visitor team won last game, NOT in a tie but in Regulation.  This game is a TIE marked as a Shootout'
					)
					foundTeam.wins = Number(foundTeam.wins)
					foundTeam.losses = Number(foundTeam.losses) - 1
					foundTeam.ties = Number(foundTeam.ties) + 1
					foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
					foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
					//foundVisitorTeam.wins = Number(foundVisitorTeam.wins) - 1
					//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
					//foundVisitorTeam.ties = Number(foundVisitorTeam.ties) + 1
					//foundVisitorTeam.overtimeLosses = Number(
					//	foundVisitorTeam.overtimeLosses
					//)
					//foundVisitorTeam.shootoutLosses = Number(
					//	foundVisitorTeam.shootoutLosses
					//)
				}
			} else if (
				!previousWinner &&
				previousHomeGoalsTotal === previousVisitorGoalsTotal
			) {
				//last game was a TIE.  This game is a TIE, marked as Overtime
				if (previousStatus === 'Overtime') {
					console.log('TIE last time in Overtime, TIE this time in a Shootout')
					foundTeam.wins = Number(foundTeam.wins)
					foundTeam.losses = Number(foundTeam.losses)
					foundTeam.ties = Number(foundTeam.ties)
					foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
					foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
					//foundVisitorTeam.wins = Number(foundVisitorTeam.wins)
					//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
					//foundVisitorTeam.ties = Number(foundVisitorTeam.ties)
					//foundVisitorTeam.overtimeLosses = Number(
					//	foundVisitorTeam.overtimeLosses
					//)
					//foundVisitorTeam.shootoutLosses = Number(
					//	foundVisitorTeam.shootoutLosses
					//)
				} else if (previousStatus === 'Shootout') {
					console.log('TIE last time in Shootout, TIE this time in a Shootout')
					foundTeam.wins = Number(foundTeam.wins)
					foundTeam.losses = Number(foundTeam.losses)
					foundTeam.ties = Number(foundTeam.ties)
					foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
					foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
					//foundVisitorTeam.wins = Number(foundVisitorTeam.wins)
					//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
					//foundVisitorTeam.ties = Number(foundVisitorTeam.ties)
					//foundVisitorTeam.overtimeLosses = Number(
					//	foundVisitorTeam.overtimeLosses
					//)
					//foundVisitorTeam.shootoutLosses = Number(
					//	foundVisitorTeam.shootoutLosses
					//)
				} else if (previousStatus === 'FINAL') {
					console.log(
						'TIE last time in Regulation, TIE this time in a Shootout'
					)
					foundTeam.wins = Number(foundTeam.wins)
					foundTeam.losses = Number(foundTeam.losses)
					foundTeam.ties = Number(foundTeam.ties)
					foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
					foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
					//foundVisitorTeam.wins = Number(foundVisitorTeam.wins)
					//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
					//foundVisitorTeam.ties = Number(foundVisitorTeam.ties)
					//foundVisitorTeam.overtimeLosses = Number(
					//	foundVisitorTeam.overtimeLosses
					//)
					//foundVisitorTeam.shootoutLosses = Number(
					//	foundVisitorTeam.shootoutLosses
					//)
				}
			}
			//MORE TIE STUFF
		} else if (
			gameStatus === 'FINAL' &&
			newHomeGoalsTotal === newVisitorGoalsTotal
		) {
			if (
				previousWinner === teamId &&
				previousHomeGoalsTotal !== previousVisitorGoalsTotal
			) {
				//home team won last game, NOT in a tie.  This game is a TIE marked as Overtime
				//
				if (previousStatus === 'Overtime') {
					//
					console.log(
						'home team won last game, NOT in a tie but in Overtime.  This game is a TIE marked as Regulation'
					)
					foundTeam.wins = Number(foundTeam.wins) - 1
					foundTeam.losses = Number(foundTeam.losses)
					foundTeam.ties = Number(foundTeam.ties) + 1
					foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
					foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
					//foundVisitorTeam.wins = Number(foundVisitorTeam.wins)
					//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
					//foundVisitorTeam.ties = Number(foundVisitorTeam.ties) + 1
					//foundVisitorTeam.overtimeLosses =
					//	Number(foundVisitorTeam.overtimeLosses) - 1
					//foundVisitorTeam.shootoutLosses = Number(
					//	foundVisitorTeam.shootoutLosses
					//)
				} else if (previousStatus === 'Shootout') {
					//
					console.log(
						'home team won last game, NOT in a tie but in a Shootout.  This game is a TIE marked as Regulation'
					)
					foundTeam.wins = Number(foundTeam.wins) - 1
					foundTeam.losses = Number(foundTeam.losses)
					foundTeam.ties = Number(foundTeam.ties) + 1
					foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
					foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
					//foundVisitorTeam.wins = Number(foundVisitorTeam.wins)
					//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
					//foundVisitorTeam.ties = Number(foundVisitorTeam.ties) + 1
					//foundVisitorTeam.overtimeLosses = Number(
					//	foundVisitorTeam.overtimeLosses
					//)
					//foundVisitorTeam.shootoutLosses =
					//	Number(foundVisitorTeam.shootoutLosses) - 1
				} else if (previousStatus === 'FINAL') {
					//
					console.log(
						'home team won last game, NOT in a tie but in Regulation.  This game is a TIE marked as Regulation'
					)
					foundTeam.wins = Number(foundTeam.wins) - 1
					foundTeam.losses = Number(foundTeam.losses)
					foundTeam.ties = Number(foundTeam.ties) + 1
					foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
					foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
					//foundVisitorTeam.wins = Number(foundVisitorTeam.wins)
					//foundVisitorTeam.losses = Number(foundVisitorTeam.losses) - 1
					//foundVisitorTeam.ties = Number(foundVisitorTeam.ties) + 1
					//foundVisitorTeam.overtimeLosses = Number(
					//	foundVisitorTeam.overtimeLosses
					//)
					//foundVisitorTeam.shootoutLosses = Number(
					//	foundVisitorTeam.shootoutLosses
					//)
				}
			} else if (
				previousWinner !== teamId &&
				previousHomeGoalsTotal !== previousVisitorGoalsTotal
			) {
				//visitor team won last game, NOT in a tie.  This game is a TIE, marked as Overtime
				//
				if (previousStatus === 'Overtime') {
					//
					console.log(
						'visitor team won last game, NOT in a tie but in Overtime.  This game is a TIE marked as Regulation'
					)
					foundTeam.wins = Number(foundTeam.wins)
					foundTeam.losses = Number(foundTeam.losses)
					foundTeam.ties = Number(foundTeam.ties) + 1
					foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses) - 1
					foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
					//foundVisitorTeam.wins = Number(foundVisitorTeam.wins) - 1
					//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
					//foundVisitorTeam.ties = Number(foundVisitorTeam.ties) + 1
					//foundVisitorTeam.overtimeLosses = Number(
					//	foundVisitorTeam.overtimeLosses
					//)
					//foundVisitorTeam.shootoutLosses = Number(
					//	foundVisitorTeam.shootoutLosses
					//)
				} else if (previousStatus === 'Shootout') {
					//
					console.log(
						'visitor team won last game, NOT in a tie but in a Shootout.  This game is a TIE marked as Regulation'
					)
					foundTeam.wins = Number(foundTeam.wins)
					foundTeam.losses = Number(foundTeam.losses)
					foundTeam.ties = Number(foundTeam.ties) + 1
					foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
					foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses) - 1
					//foundVisitorTeam.wins = Number(foundVisitorTeam.wins) - 1
					//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
					//foundVisitorTeam.ties = Number(foundVisitorTeam.ties) + 1
					//foundVisitorTeam.overtimeLosses = Number(
					//	foundVisitorTeam.overtimeLosses
					//)
					//foundVisitorTeam.shootoutLosses = Number(
					//	foundVisitorTeam.shootoutLosses
					//)
				} else if (previousStatus === 'FINAL') {
					//
					console.log(
						'visitor team won last game, NOT in a tie but in Regulation.  This game is a TIE marked as Regulation'
					)
					foundTeam.wins = Number(foundTeam.wins)
					foundTeam.losses = Number(foundTeam.losses) - 1
					foundTeam.ties = Number(foundTeam.ties) + 1
					foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
					foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
					//foundVisitorTeam.wins = Number(foundVisitorTeam.wins) - 1
					//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
					//foundVisitorTeam.ties = Number(foundVisitorTeam.ties) + 1
					//foundVisitorTeam.overtimeLosses = Number(
					//	foundVisitorTeam.overtimeLosses
					//)
					//foundVisitorTeam.shootoutLosses = Number(
					//	foundVisitorTeam.shootoutLosses
					//)
				}
			} else if (
				!previousWinner &&
				previousHomeGoalsTotal === previousVisitorGoalsTotal
			) {
				//last game was a TIE.  This game is a TIE, marked as Overtime
				if (previousStatus === 'Overtime') {
					console.log('TIE last time in Overtime, TIE this time in Regulation')
					foundTeam.wins = Number(foundTeam.wins)
					foundTeam.losses = Number(foundTeam.losses)
					foundTeam.ties = Number(foundTeam.ties)
					foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
					foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
					//foundVisitorTeam.wins = Number(foundVisitorTeam.wins)
					//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
					//foundVisitorTeam.ties = Number(foundVisitorTeam.ties)
					//foundVisitorTeam.overtimeLosses = Number(
					//	foundVisitorTeam.overtimeLosses
					//)
					//foundVisitorTeam.shootoutLosses = Number(
					//	foundVisitorTeam.shootoutLosses
					//)
				} else if (previousStatus === 'Shootout') {
					console.log('TIE last time in Shootout, TIE this time in Regulation')
					foundTeam.wins = Number(foundTeam.wins)
					foundTeam.losses = Number(foundTeam.losses)
					foundTeam.ties = Number(foundTeam.ties)
					foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
					foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
					//foundVisitorTeam.wins = Number(foundVisitorTeam.wins)
					//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
					//foundVisitorTeam.ties = Number(foundVisitorTeam.ties)
					//foundVisitorTeam.overtimeLosses = Number(
					//	foundVisitorTeam.overtimeLosses
					//)
					//foundVisitorTeam.shootoutLosses = Number(
					//	foundVisitorTeam.shootoutLosses
					//)
				} else if (previousStatus === 'FINAL') {
					console.log(
						'TIE last time in Regulation, TIE this time in Regulation'
					)
					foundTeam.wins = Number(foundTeam.wins)
					foundTeam.losses = Number(foundTeam.losses)
					foundTeam.ties = Number(foundTeam.ties)
					foundTeam.overtimeLosses = Number(foundTeam.overtimeLosses)
					foundTeam.shootoutLosses = Number(foundTeam.shootoutLosses)
					//foundVisitorTeam.wins = Number(foundVisitorTeam.wins)
					//foundVisitorTeam.losses = Number(foundVisitorTeam.losses)
					//foundVisitorTeam.ties = Number(foundVisitorTeam.ties)
					//foundVisitorTeam.overtimeLosses = Number(
					//	foundVisitorTeam.overtimeLosses
					//)
					//foundVisitorTeam.shootoutLosses = Number(
					//	foundVisitorTeam.shootoutLosses
					//)
				}
			}
		} else if (gameStatus === 'TBP') {
			//begin kraly
			//kraly told me that sometimes he accidentally will enter stats for a game, then
			//realize that it was the wrong game, so he goes back in and clears it all out
			//and sets the status from FINAL to TBP.  But it's counted as a TIE.  We don't want that.
			//If that ever happens, we want to go a wipe out everything from that previous mistaken entry.
			let gameStats
			if (previousStatus === 'FINAL' || 'OVERTIME' || 'SHOOTOUT') {
				console.log('GAME STATUS = TBP!!!!!!!!!!!!!!!!!!!!!!!!!')

				try {
					gameStats = await GameStats.findOne({
						gameId: gameId,
					})
				} catch (err) {
					const error = new HttpError(
						'Could not find game stats for this itemId ' + error,
						404
					)
				}
				console.log('gameStats: ' + gameStats)
			}

			//Most of this logic was taken from removeEvent: shirey2
			let homePoints,
				visitorPoints,
				minusWinForHomeTeam,
				minusWinForVisitorTeam,
				minusLossForHomeTeam,
				minusOvertimeLossForHomeTeam,
				minusShootoutLossForHomeTeam,
				minusLossForVisitorTeam,
				minusOvertimeLossForVisitorTeam,
				minusShootoutLossForVisitorTeam,
				minusTieForHomeTeam,
				minusTieForVisitorTeam,
				//winner,
				//loser,
				tie

			if (gameStats) {
				homePoints = gameStats.homeGoalsTotal
				visitorPoints = gameStats.visitorGoalsTotal
				//If the home team was the winner, we need to tap into the team and remove a win from them
				//as well as tap into the visiting team and remove a loss from them
				//
				//
				//    if home team won
				//
				//
				if (homePoints > visitorPoints) {
					console.log('home team won teamId: ' + teamId)
					try {
						minusWinForHomeTeam = await Team.findById(teamId)
					} catch (err) {
						const error = new HttpError(
							'Could not find homeTeam to delete their win.',
							404
						)
						return next(error)
					}

					console.log('minusWinForHomeTeam: ' + minusWinForHomeTeam)

					/* try {
						minusLossForVisitorTeam = await Team.findById(visitorTeamId)
					} catch (err) {
						const error = new HttpError(
							'Could not find visitorTeam to delete their loss.',
							404
						)
						return next(error)
					} */

					/* try {
						minusOvertimeLossForVisitorTeam = await Team.findById(visitorTeamId)
					} catch (err) {
						const error = new HttpError(
							'Could not find visitorTeam to delete their Overtime loss.',
							404
						)
						return next(error)
					} */

					/* try {
						minusShootoutLossForVisitorTeam = await Team.findById(visitorTeamId)
					} catch (err) {
						const error = new HttpError(
							'Could not find visitorTeam to delete their shootout loss.',
							404
						)
						return next(error)
					} */
					//
					//
					minusWinForHomeTeam.wins = Number(minusWinForHomeTeam.wins) - 1
					//
					minusWinForHomeTeam.goalsFor =
						Number(minusWinForHomeTeam.goalsFor) - homePoints
					//
					minusWinForHomeTeam.goalsAgainst =
						Number(minusWinForHomeTeam.goalsAgainst) - visitorPoints
					//
					//
					//minusLossForVisitorTeam.goalsFor =
					//	Number(minusLossForVisitorTeam.goalsFor) - visitorPoints
					//
					//minusLossForVisitorTeam.goalsAgainst =
					//	Number(minusLossForVisitorTeam.goalsAgainst) - homePoints

					if (previousStatus === 'Overtime') {
						console.log('visitor lost in overtime')
						//minusOvertimeLossForVisitorTeam.overtimeLosses =
						//	Number(minusOvertimeLossForVisitorTeam.overtimeLosses) - 1
						//minusShootoutLossForVisitorTeam.shootoutLosses = Number(
						//	minusShootoutLossForVisitorTeam.shootoutLosses
						//)
						//minusOvertimeLossForVisitorTeam.goalsFor =
						//	Number(minusOvertimeLossForVisitorTeam.goalsFor) - visitorPoints
						//minusOvertimeLossForVisitorTeam.goalsAgainst =
						//	Number(minusOvertimeLossForVisitorTeam.goalsAgainst) - homePoints
					} else if (previousStatus === 'Shootout') {
						console.log('visitor lost in shootout') /
							//minusShootoutLossForVisitorTeam.shootoutLosses =
							Number(minusShootoutLossForVisitorTeam.shootoutLosses) -
							1
						//minusOvertimeLossForVisitorTeam.overtimeLosses = Number(
						//	minusOvertimeLossForVisitorTeam.overtimeLosses
						//)
						//minusShootoutLossForVisitorTeam.goalsFor =
						//	Number(minusShootoutLossForVisitorTeam.goalsFor) - visitorPoints
						//minusShootoutLossForVisitorTeam.goalsAgainst =
						//	Number(minusShootoutLossForVisitorTeam.goalsAgainst) - homePoints
					} else {
						console.log('visitor lost in regulation')
						//minusLossForVisitorTeam.losses =
						//	Number(minusLossForVisitorTeam.losses) - 1
						//minusOvertimeLossForVisitorTeam.overtimeLosses = Number(
						//	minusOvertimeLossForVisitorTeam.overtimeLosses
						//)
						//minusShootoutLossForVisitorTeam.shootoutLosses = Number(
						//	minusShootoutLossForVisitorTeam.shootoutLosses
						//)
					}

					try {
						console.log('saving home team after removing their win...')
						await minusWinForHomeTeam.save()
					} catch (err) {
						const error = new HttpError(
							'could not edit home team to take away a win',
							500
						)
						return next(error)
					}
					//
					//
					/* if (previousStatus === 'Overtime') {
						try {
							console.log(
								'saving visitor team after deleting their overtime loss...'
							)
							await minusOvertimeLossForVisitorTeam.save()
						} catch (err) {
							const error = new HttpError(
								'could not edit visitor team to take away a loss 1',
								500
							)
							return next(error)
						}
					} else if (previousStatus === 'Shootout') {
						try {
							console.log(
								'saving visitor team after deleting their shootout loss...'
							)
							await minusShootoutLossForVisitorTeam.save()
						} catch (err) {
							const error = new HttpError(
								'could not edit visitor team to take away a loss 2',
								500
							)
							return next(error)
						}
					} else if (previousStatus !== 'Shootout' || 'Overtime') {
						console.log('what was the previous status?? ' + previousStatus)
						try {
							console.log(
								'saving visitor team after deleting their regulation loss...'
							)
							await minusLossForVisitorTeam.save()
						} catch (err) {
							const error = new HttpError(
								'could not edit visitor team to take away a loss 3 ' + err,
								500
							)
							return next(error)
						}
					} */
					//
					//
					//
					try {
						console.log('deleting game stats 100...')
						await gameStats.deleteOne()
					} catch (err) {
						const error = new HttpError(
							'Could not delete game stats: ' + err,
							404
						)
						return next(error)
					}
					//Finally, we need to find the game, set it's status to TBP, clear out the score,
					//and re-save it
					let gameToAlter
					try {
						gameToAlter = await Game.findById(gameId)
					} catch (err) {
						const error = new HttpError(
							'Could not find game stats for this gameId',
							404
						)
					}

					console.log('gameToAlter: ' + gameToAlter)

					try {
						gameToAlter.status = 'TBP'
						gameToAlter.score = ''
						gameToAlter.winner = ''
						gameToAlter.loser = ''
						console.log('saving gameToAlter ' + gameId)
						await gameToAlter.save()
					} catch (err) {
						const error = new HttpError(
							'could not alter game to take away score and set status to TBP ' +
								err,
							500
						)
						return next(error)
					}
					//
					console.log('you are here 6')
					//
					//
					//
					//
					//
					//
					// IF VISITING TEAM WINS
					//
					//
					//
					//
				} else if (visitorPoints > homePoints) {
					console.log('visitor team won previously')
					/* try {
						minusWinForVisitorTeam = await Team.findById(visitorTeamId)
					} catch (err) {
						const error = new HttpError(
							'Could not find visitorTeam to delete their win.',
							404
						)
						return next(error)
					} */

					try {
						minusOvertimeLossForHomeTeam = await Team.findById(teamId)
					} catch (err) {
						const error = new HttpError(
							'Could not find homeTeam to delete their Overtime loss.',
							404
						)
						return next(error)
					}

					try {
						minusShootoutLossForHomeTeam = await Team.findById(teamId)
					} catch (err) {
						const error = new HttpError(
							'Could not find homeTeam to delete their shootout loss.',
							404
						)
						return next(error)
					}

					try {
						minusLossForHomeTeam = await Team.findById(teamId)
					} catch (err) {
						const error = new HttpError(
							'Could not find homeTeam to delete their loss.',
							404
						)
						return next(error)
					}
					//
					//minusWinForVisitorTeam.wins = Number(minusWinForVisitorTeam.wins) - 1
					//
					//console.log(minusWinForVisitorTeam.goalsFor + ' ' + visitorPoints)
					//minusWinForVisitorTeam.goalsFor =
					//	Number(minusWinForVisitorTeam.goalsFor) - visitorPoints
					//
					//console.log(minusWinForVisitorTeam.goalsAgainst + ' ' + homePoints)
					//minusWinForVisitorTeam.goalsAgainst =
					//	Number(minusWinForVisitorTeam.goalsAgainst) - homePoints
					//
					minusLossForHomeTeam.losses = Number(minusLossForHomeTeam.losses) - 1
					//
					minusLossForHomeTeam.goalsFor =
						Number(minusLossForHomeTeam.goalsFor) - homePoints
					//
					minusLossForHomeTeam.goalsAgainst =
						Number(minusLossForHomeTeam.goalsAgainst) - visitorPoints

					if (previousStatus === 'Overtime') {
						console.log('home team lost in overtime')
						minusOvertimeLossForHomeTeam.overtimeLosses =
							Number(minusOvertimeLossForHomeTeam.overtimeLosses) - 1
						minusShootoutLossForHomeTeam.shootoutLosses = Number(
							minusShootoutLossForHomeTeam.shootoutLosses
						)
						//MATT TEST 2
						minusOvertimeLossForHomeTeam.goalsFor =
							Number(minusOvertimeLossForHomeTeam.goalsFor) - homePoints
						minusOvertimeLossForHomeTeam.goalsAgainst =
							Number(minusOvertimeLossForHomeTeam.goalsAgainst) - visitorPoints
					} else if (previousStatus === 'Shootout') {
						minusShootoutLossForHomeTeam.shootoutLosses =
							Number(minusShootoutLossForHomeTeam.shootoutLosses) - 1
						minusOvertimeLossForHomeTeam.overtimeLosses = Number(
							minusOvertimeLossForHomeTeam.overtimeLosses
						)
						minusShootoutLossForHomeTeam.goalsFor =
							Number(minusShootoutLossForHomeTeam.goalsFor) - homePoints
						minusShootoutLossForHomeTeam.goalsAgainst =
							Number(minusShootoutLossForHomeTeam.goalsAgainst) - visitorPoints
					} else {
						console.log('home team lost in regulation')
						//minusLossForHomeTeam.losses = Number(minusLossForHomeTeam.losses) - 1
						minusOvertimeLossForHomeTeam.overtimeLosses = Number(
							minusOvertimeLossForHomeTeam.overtimeLosses
						)
						minusShootoutLossForHomeTeam.shootoutLosses = Number(
							minusShootoutLossForHomeTeam.shootoutLosses
						)
					}

					/* try {
						console.log('saving visitor team after removing their win...')
						await minusWinForVisitorTeam.save()
					} catch (err) {
						const error = new HttpError(
							'could not edit visitor team to take away a win',
							500
						)
						return next(error)
					} */
					//
					//
					if (previousStatus === 'Overtime') {
						try {
							console.log('saving home team after deleting their overtime loss')
							await minusOvertimeLossForHomeTeam.save()
						} catch (err) {
							const error = new HttpError(
								'could not edit home team to take away overtime loss',
								500
							)
							return next(error)
						}
					} else if (previousStatus === 'Shootout') {
						try {
							console.log('saving home team after deleting their shootout loss')
							await minusShootoutLossForHomeTeam.save()
						} catch (err) {
							const error = new HttpError(
								'could not edit home team to take away a loss',
								500
							)
							return next(error)
						}
					} else if (previousStatus !== 'Shootout' || 'Overtime') {
						//console.log('whats the status?? ' + status)
						try {
							console.log(
								'saving home team after deleting their regulation loss...'
							)
							await minusLossForHomeTeam.save()
						} catch (err) {
							const error = new HttpError(
								'could not edit home team to take away a loss',
								500
							)
							return next(error)
						}
					}
					//
					//
					try {
						console.log('deleting game stats 101...')
						await gameStats.deleteOne()
					} catch (err) {
						const error = new HttpError(
							'Could not delete game stats: ' + err,
							404
						)
						return next(error)
					}
					//
					//
					//
					//Finally, we need to find the game, set it's status to TBP, clear out the score,
					//and re-save it
					let gameToAlter
					try {
						gameToAlter = await Game.findById(gameId)
					} catch (err) {
						const error = new HttpError(
							'Could not find game stats for this gameId',
							404
						)
					}

					console.log('gameToAlter: ' + gameToAlter)

					try {
						gameToAlter.status = '' //was TBP
						gameToAlter.score = ''
						gameToAlter.winner = ''
						gameToAlter.loser = ''
						console.log('saving gameToAlter ' + gameId)
						await gameToAlter.save()
					} catch (err) {
						const error = new HttpError(
							'could not alter game to take away score and set status to TBP ' +
								err,
							500
						)
						return next(error)
					}
					//
					//
					//
					//
					//
					//
					//If it's a TIE
					//
					//
					//
				} else if (homePoints === visitorPoints) {
					console.log(
						'This game was a tie.  Score was ' +
							homePoints +
							' ' +
							visitorPoints
					)
					/* try {
						minusTieForVisitorTeam = await Team.findById(visitorTeamId)
					} catch (err) {
						const error = new HttpError(
							'Could not find visitorTeam to delete their tie.',
							404
						)
						return next(error)
					} */

					try {
						minusTieForHomeTeam = await Team.findById(teamId)
					} catch (err) {
						const error = new HttpError(
							'Could not find homeTeam to delete their tie.',
							404
						)
						return next(error)
					}
					//
					//
					//
					console.log(
						'Matt - might want to fix something here.  Check team ties.'
					)
					//
					//minusTieForVisitorTeam.ties = Number(minusTieForVisitorTeam.ties) - 1
					//
					//minusTieForVisitorTeam.goalsFor =
					//	Number(minusTieForVisitorTeam.goalsFor) - visitorPoints
					//
					//minusTieForVisitorTeam.goalsAgainst =
					//	Number(minusTieForVisitorTeam.goalsAgainst) - homePoints
					//
					minusTieForHomeTeam.ties = Number(minusTieForHomeTeam.ties) - 1
					//
					minusTieForHomeTeam.goalsFor =
						Number(minusTieForHomeTeam.goalsFor) - homePoints
					//
					minusTieForHomeTeam.goalsAgainst =
						Number(minusTieForHomeTeam.goalsAgainst) - visitorPoints

					/* try {
						console.log('saving visitor team...')
						await minusTieForVisitorTeam.save()
					} catch (err) {
						const error = new HttpError(
							'could not edit visitor team to take away a tie',
							500
						)
						return next(error)
					} */
					//
					//
					try {
						console.log('saving home team...')
						await minusTieForHomeTeam.save()
					} catch (err) {
						const error = new HttpError(
							'could not edit home team to take away a tie',
							500
						)
						return next(error)
					}
					//
					//
					try {
						console.log('deleting game stats 102...')
						await gameStats.deleteOne()
					} catch (err) {
						const error = new HttpError(
							'Could not delete game stats: ' + err,
							404
						)
						return next(error)
					}
					//
					//
					//
					//Finally, we need to find the game, set it's status to TBP, clear out the score,
					//and re-save it
					let gameToAlter
					try {
						gameToAlter = await Game.findById(gameId)
					} catch (err) {
						const error = new HttpError(
							'Could not find game stats for this gameId',
							404
						)
					}

					console.log('gameToAlter: ' + gameToAlter)

					try {
						gameToAlter.status = 'TBP'
						gameToAlter.score = ''
						gameToAlter.winner = ''
						gameToAlter.loser = ''
						console.log('saving gameToAlter ' + gameId)
						await gameToAlter.save()
					} catch (err) {
						const error = new HttpError(
							'could not alter game to take away score and set status to TBP ' +
								err,
							500
						)
						return next(error)
					}
				}
			} //end of if gameStats
		} //end of kraly
		//
		//
		//
		//
		//
		//
		//
		if (gameStatus !== 'TBP') {
			console.log('game status is NOT TBP, dont want to go any further...')

			gameStatsExist.status = gameStatus
			gameStatsExist.summary = gameSummary
			gameStatsExist.winner = newWinner
			gameStatsExist.loser = newLoser
			try {
				console.log('saving new game stats after determining winner/loser')
				await gameStatsExist.save()
			} catch (err) {
				const error = new HttpError(
					'could not save game stats 5.  createGameStats ' + err,
					500
				)
				return next(error)
			}

			try {
				await foundTeam.save()
			} catch (err) {
				const error = new HttpError(
					'saving home team to determine win or loss.  createGameStats ' + err,
					500
				)
				return next(error)
			}
			//
			//
			/* try {
				await foundVisitorTeam.save()
			} catch (err) {
				const error = new HttpError(
					'saving visitor team to determine win or loss.  createGameStats ' +
						err,
					500
				)
				return next(error)
			} */

			//Finally, lets save the foundGame with status and score
			foundGame.status = gameStatus
			foundGame.score =
				Number(newVisitorGoalsTotal) + ' - ' + Number(newHomeGoalsTotal)
			foundGame.winner = newWinner
			foundGame.loser = newLoser
			console.log('saving game - first')
			try {
				await foundGame.save()
			} catch (err) {
				const error = new HttpError(
					'could not save game for status and final score.  createGameStats ' +
						err,
					500
				)
				return next(error)
			}
		}
	}
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//************************************************** */
	//
	//  Individual stats
	//
	//************************************************** */
	let foundHomeRosterPlayer,
		rosterHomePlayerId,
		rosterHomePlayerNewGoals,
		rosterHomePlayerNewAssists,
		rosterHomePlayerGameStats
	for (let i = 0; i < homeStats.length; i++) {
		const split = homeStats[i].split('|')
		rosterHomePlayerId = split[0]
		rosterHomePlayerNewGoals = split[1]
		rosterHomePlayerNewAssists = split[2]

		if (rosterHomePlayerNewGoals || rosterHomePlayerNewAssists) {
			try {
				foundHomeRosterPlayer = await RosterPlayer.findById(rosterHomePlayerId)
			} catch (err) {
				const error = new HttpError(
					'Could not find rosterPlayer.  addPlayerStats ' + rosterHomePlayerId,
					404
				)
				return next(error)
			}
			console.log(rosterHomePlayerId)
			//
			//
			//So, we also want to write this players stats, but before we do that, we want to
			//see if they already exist.  If they do, we want to delete them and create anew
			const rosterPlayerStatsPerGameExists =
				await RosterPlayerStatsPerGame.findOne({
					gameId: gameId,
					rosterPlayerId: foundHomeRosterPlayer._id,
				})
			//
			//
			//
			//So...right here, if we find that stats already exist for this player,
			//if their number of goals or assists is the same as above, we don't want
			//to write them.  If the are DIFFERENT, then we write the ABOVE value.
			let previousGoals, previousAssists
			if (rosterPlayerStatsPerGameExists) {
				previousGoals = rosterPlayerStatsPerGameExists.goals
				previousAssists = rosterPlayerStatsPerGameExists.assists
				rosterPlayerStatsPerGameExists.deleteOne()
			}
			//
			//
			//
			if (previousGoals) {
				if (previousGoals === rosterHomePlayerNewGoals) {
					foundHomeRosterPlayer.goals = Number(foundHomeRosterPlayer.goals)
				} else {
					foundHomeRosterPlayer.goals =
						Number(foundHomeRosterPlayer.goals) -
						Number(previousGoals) +
						Number(rosterHomePlayerNewGoals)
				}
			} else {
				foundHomeRosterPlayer.goals =
					Number(foundHomeRosterPlayer.goals) + Number(rosterHomePlayerNewGoals)
			}

			if (previousAssists) {
				if (previousAssists === rosterHomePlayerNewAssists) {
					foundHomeRosterPlayer.assists = Number(foundHomeRosterPlayer.assists)
				} else {
					foundHomeRosterPlayer.assists =
						Number(foundHomeRosterPlayer.assists) -
						Number(previousAssists) +
						Number(rosterHomePlayerNewAssists)
				}
			} else {
				foundHomeRosterPlayer.assists =
					Number(foundHomeRosterPlayer.assists) +
					Number(rosterHomePlayerNewAssists)
			}
			//
			//more kraly code here.  When changing game results back to TBP, we also want
			//to wipe out any individual player stats as well
			//
			if (gameStatus === 'TBP' && previousStatus !== 'TBP') {
				console.log('hello matthew, you are here now')
				if (previousGoals) {
					foundHomeRosterPlayer.goals =
						Number(foundHomeRosterPlayer.goals) - Number(previousGoals)
				}
				if (previousAssists) {
					foundHomeRosterPlayer.assists =
						Number(foundHomeRosterPlayer.assists) - Number(previousAssists)
				}
			}

			//writing changes to RosterPlayer
			try {
				await foundHomeRosterPlayer.save()
			} catch (err) {
				const error = new HttpError(
					'Something went wrong with saving the roster players goals.  addPlayerStats ' +
						rosterHomePlayerId +
						' ' +
						foundHomeRosterPlayer.goals,
					500
				)
				return next(error)
			}

			//If the game HASNT been switched back to TBP, lets record the new stats in
			//this players statsPerGame.  If gameStatus is TBP, we want to wipe out
			//anything previous.
			//creating new RosterPlayerStatsPerGame
			if (gameStatus !== 'TBP') {
				rosterHomePlayerGameStats = new RosterPlayerStatsPerGame({
					gameId: gameId,
					rosterPlayerId: foundHomeRosterPlayer._id,
					goals: rosterHomePlayerNewGoals,
					assists: rosterHomePlayerNewAssists,
				})
				//Writing to GAME tally.  This is what will appear when we reload the form
				try {
					await rosterHomePlayerGameStats.save()
				} catch (err) {
					const error = new HttpError(
						'could not create new instance of home RosterPlayerStatsPerGame',
						500
					)
					return next(error)
				}
				//
				//
				//
				//if game status = TBP
			} else {
				let rosterPlayerGameStatsToDelete
				console.log(
					'need to find then delete this home players rosterStatsPerGame from last time'
				)
				console.log('gameId: ' + gameId)
				console.log('rosterPlayerId: ' + foundHomeRosterPlayer._id)
				try {
					rosterPlayerGameStatsToDelete =
						await RosterPlayerStatsPerGame.findOne({
							gameId: gameId,
							rosterPlayerId: foundHomeRosterPlayer._id,
						})
				} catch (err) {
					const error = new HttpError(
						'Trouble finding player stats for this game 001.',
						404
					)
					return next(error)
				}
				console.log(
					'rosterPlayerGameStatsToDelete: ' + rosterPlayerGameStatsToDelete
				)
				//Writing to GAME tally.  This is what will appear when we reload the form
				if (rosterPlayerGameStatsToDelete) {
					rosterPlayerGameStatsToDelete.deleteOne()
				}
			}
		}
	}
	//
	//
	//  Now lets do the same for the visitor players...
	//
	//

	/* let foundVisitorRosterPlayer,
		rosterVisitorPlayerId,
		rosterVisitorPlayerNewGoals,
		rosterVisitorPlayerNewAssists,
		rosterVisitorPlayerGameStats 
	for (let i = 0; i < visitorStats.length; i++) {
		const split = visitorStats[i].split('|')
		rosterVisitorPlayerId = split[0]
		rosterVisitorPlayerNewGoals = split[1]
		rosterVisitorPlayerNewAssists = split[2]

		if (rosterVisitorPlayerNewGoals || rosterVisitorPlayerNewAssists) {
			try {
				foundVisitorRosterPlayer = await RosterPlayer.findById(
					rosterVisitorPlayerId
				)
			} catch (err) {
				const error = new HttpError(
					'Could not find rosterPlayer.  addPlayerStats ' +
						rosterVisitorPlayerId,
					404
				)
				return next(error)
			}
			//
			//
			//So, we also want to write this players stats, but before we do that, we want to
			//see if they already exist.  If they do, we want to delete them and create anew
			const rosterPlayerStatsPerGameExists =
				await RosterPlayerStatsPerGame.findOne({
					gameId: gameId,
					rosterPlayerId: foundVisitorRosterPlayer._id,
				})
			//
			//
			//
			//So...right here, if we find that stats already exist for this player,
			//if their number of goals or assists is the same as above, we don't want
			//to write them.  If the are DIFFERENT, then we write the ABOVE value.
			let previousGoals, previousAssists
			if (rosterPlayerStatsPerGameExists) {
				previousGoals = rosterPlayerStatsPerGameExists.goals
				previousAssists = rosterPlayerStatsPerGameExists.assists
				rosterPlayerStatsPerGameExists.deleteOne()
			}
			//
			//
			//
			if (previousGoals) {
				//If there ARE goals, but they're the same, don't write them
				if (previousGoals === rosterVisitorPlayerNewGoals) {
					foundVisitorRosterPlayer.goals = Number(
						foundVisitorRosterPlayer.goals
					)
				} else {
					//If there ARE goals, but they're DIFFERENT, calculate and update
					foundVisitorRosterPlayer.goals =
						Number(foundVisitorRosterPlayer.goals) -
						Number(previousGoals) +
						Number(rosterVisitorPlayerNewGoals)
				}
			} else {
				//else, if there AREN'T previous goals, then just add to the season tally the new goals
				foundVisitorRosterPlayer.goals =
					Number(foundVisitorRosterPlayer.goals) +
					Number(rosterVisitorPlayerNewGoals)
			}
			if (previousAssists) {
				if (previousAssists === rosterVisitorPlayerNewAssists) {
					foundVisitorRosterPlayer.assists = Number(
						foundVisitorRosterPlayer.assists
					)
				} else {
					foundVisitorRosterPlayer.assists =
						Number(foundVisitorRosterPlayer.assists) -
						Number(previousAssists) +
						Number(rosterVisitorPlayerNewAssists)
				}
			} else {
				foundVisitorRosterPlayer.assists =
					Number(foundVisitorRosterPlayer.assists) +
					Number(rosterVisitorPlayerNewAssists)
			}

			if (gameStatus === 'TBP' && previousStatus !== 'TBP') {
				console.log('hello matthew, you are here now')
				if (previousGoals) {
					foundVisitorRosterPlayer.goals =
						Number(foundVisitorRosterPlayer.goals) - Number(previousGoals)
				}
				if (previousAssists) {
					foundVisitorRosterPlayer.assists =
						Number(foundVisitorRosterPlayer.assists) - Number(previousAssists)
				}
			}

			try {
				console.log('writing to database............')
				await foundVisitorRosterPlayer.save()
			} catch (err) {
				const error = new HttpError(
					'Something went wrong with saving the roster players goals.  addPlayerStats ' +
						rosterVisitorPlayerId +
						' ' +
						foundVisitorRosterPlayer.goals,
					500
				)
				return next(error)
			}

			//
			//
			//If the game HASNT been switch back to TBP, lets record the new stats in
			//this players statsPerGame.  If gameStatus is TBP, we want to wipe out
			//anything previous.
			//kraly check at the beginning
			if (gameStatus !== 'TBP') {
				rosterVisitorPlayerGameStats = new RosterPlayerStatsPerGame({
					gameId: gameId,
					rosterPlayerId: foundVisitorRosterPlayer._id,
					goals: rosterVisitorPlayerNewGoals,
					assists: rosterVisitorPlayerNewAssists,
				})
				//Writing to GAME tally.  This is what will appear when we reload the form
				try {
					await rosterVisitorPlayerGameStats.save()
				} catch (err) {
					const error = new HttpError(
						'could not create new instance of home RosterPlayerStatsPerGame',
						500
					)
					return next(error)
				}
				//
				//
				//
				//
			} else {
				let rosterPlayerGameStatsToDelete
				console.log(
					'need to find then delete this visiting players rosterStatsPerGame from last time'
				)
				try {
					rosterPlayerGameStatsToDelete =
						await RosterPlayerStatsPerGame.findOne({
							gameId: gameId,
							rosterPlayerId: foundVisitorRosterPlayer._id,
						})
				} catch (err) {
					const error = new HttpError(
						'Trouble finding player stats for this game 002.',
						404
					)
					return next(error)
				}
				//Writing to GAME tally.  This is what will appear when we reload the form
				if (rosterPlayerGameStatsToDelete) {
					rosterPlayerGameStatsToDelete.deleteOne()
				}
			}
		}
	} */

	res.status(200).json({ message: 'Game stats have been added' })
}
//
//
//
//
//****************************************************************************************** */
//
//	      createPlayoffGameStats
//
//	Here, we log all the stats from a playoff game.
//  This is different for the Sloths, because we DO want to record player stats and I think
//  we DO want to record a win or a loss...
//
//
//****************************************************************************************** */
const createPlayoffGameStats = async (req, res, next) => {
	console.log('welp, time to create playoff stats...')

	//These are coming to us from AdminGameResultsPlayoff.js
	const {
		homeStats,
		gameId,
		homePointsTotal,
		visitorPointsTotal,
		gameSummary,
	} = req.body

	//Use the gameId to get the homeTeamName and the visitorTeamName
	let homeTeamName, visitorTeamName, playoffGame, year, foundGame
	try {
		foundGame = await Game.findById(gameId)
	} catch (err) {
		const error = new HttpError('Could not find game.  createPlayoffStats', 404)
		return next(error)
	}
	homeTeamName = foundGame.teamName
	visitorTeamName = foundGame.opponent
	year = foundGame.year

	console.log('home: ' + homeTeamName + ' ' + homePointsTotal)
	console.log('visitor: ' + visitorTeamName + ' ' + visitorPointsTotal)
	console.log('game summary: ' + gameSummary)

	let winner, loser

	if (homePointsTotal > visitorPointsTotal) {
		winner = homeTeamName
		loser = visitorTeamName
	} else {
		winner = visitorTeamName
		loser = homeTeamName
	}

	console.log('And the winner is: ' + winner + '!!!')

	//Let's check to see if PlayoffGameStats already exist for this:
	//If so, we want to delete them.  Only need one set of stats per game
	try {
		foundStats = await PlayoffGameStats.find({ gameId: gameId })
	} catch {}

	let previousHomeGoalsTotal,
		previousVisitorGoalsTotal,
		previousPlayoffWinner,
		previousPlayoffLoser

	//Lets look for previous playoff stats.  If they exist, let's log them so we can
	//refer to them later, then let's delete whats out there...
	if (foundStats.length > 0) {
		console.log('stats already exist for this game: ' + foundStats)
		previousHomeGoalsTotal = foundStats[0].homeGoalsTotal
		previousVisitorGoalsTotal = foundStats[0].visitorGoalsTotal
		previousPlayoffWinner = foundStats[0].winner
		previousPlayoffLoser = foundStats[0].loser
		foundStats.forEach((stat) => {
			stat.deleteOne()
		})
	}

	console.log('previousHomeGoalsTotal: ' + previousHomeGoalsTotal)
	console.log('previousVisitorGoalsTotal: ' + previousVisitorGoalsTotal)
	console.log('previousPlayoffWinner: ' + previousPlayoffWinner)
	console.log('previousPlayoffLoser: ' + previousPlayoffLoser)
	console.log('NEW homeGoalsTotal: ' + homePointsTotal)
	console.log('NEW visitorGoalsTotal: ' + visitorPointsTotal)
	console.log('NEW winner: ' + winner)
	console.log('NEW loser: ' + loser)

	playoffGame = new PlayoffGameStats({
		gameId: gameId,
		homeGoalsTotal: homePointsTotal,
		visitorGoalsTotal: visitorPointsTotal,
		winner: winner,
		loser: loser,
		summary: gameSummary.trim(),
	})
	try {
		await playoffGame.save()
	} catch (err) {
		const error = new HttpError(err, 500)
		return next(error)
	}

	//So, we created playoff game stats, but I also want to go back and alter the game
	//so that info shows up on the schedule screen
	foundGame.status = 'FINAL'
	foundGame.winner = winner
	foundGame.loser = loser
	foundGame.score = Number(homePointsTotal) + ' - ' + Number(visitorPointsTotal)
	console.log('saving game - second')
	try {
		await foundGame.save()
	} catch (err) {
		const error = new HttpError(err, 500)
		return next(error)
	}
	//
	//
	//
	//************************************************** */
	//
	//  Individual stats
	//
	//************************************************** */
	let foundHomeRosterPlayer,
		rosterHomePlayerId,
		rosterHomePlayerNewGoals,
		rosterHomePlayerNewAssists,
		rosterHomePlayerGameStats
	for (let i = 0; i < homeStats.length; i++) {
		const split = homeStats[i].split('|')
		rosterHomePlayerId = split[0]
		rosterHomePlayerNewGoals = split[1]
		rosterHomePlayerNewAssists = split[2]

		if (rosterHomePlayerNewGoals || rosterHomePlayerNewAssists) {
			try {
				foundHomeRosterPlayer = await RosterPlayer.findById(rosterHomePlayerId)
			} catch (err) {
				const error = new HttpError(
					'Could not find rosterPlayer.  addPlayerStats ' + rosterHomePlayerId,
					404
				)
				return next(error)
			}
			console.log(rosterHomePlayerId)
			//
			//
			//So, we also want to write this players stats, but before we do that, we want to
			//see if they already exist.  If they do, we want to delete them and create anew
			const rosterPlayerStatsPerGameExists =
				await RosterPlayerStatsPerGame.findOne({
					gameId: gameId,
					rosterPlayerId: foundHomeRosterPlayer._id,
				})
			//
			//
			//
			//So...right here, if we find that stats already exist for this player,
			//if their number of goals or assists is the same as above, we don't want
			//to write them.  If the are DIFFERENT, then we write the ABOVE value.
			let previousGoals, previousAssists
			if (rosterPlayerStatsPerGameExists) {
				previousGoals = rosterPlayerStatsPerGameExists.goals
				previousAssists = rosterPlayerStatsPerGameExists.assists
				rosterPlayerStatsPerGameExists.deleteOne()
			}
			//
			//
			//
			if (previousGoals) {
				if (previousGoals === rosterHomePlayerNewGoals) {
					foundHomeRosterPlayer.goals = Number(foundHomeRosterPlayer.goals)
				} else {
					foundHomeRosterPlayer.goals =
						Number(foundHomeRosterPlayer.goals) -
						Number(previousGoals) +
						Number(rosterHomePlayerNewGoals)
				}
			} else {
				foundHomeRosterPlayer.goals =
					Number(foundHomeRosterPlayer.goals) + Number(rosterHomePlayerNewGoals)
			}

			if (previousAssists) {
				if (previousAssists === rosterHomePlayerNewAssists) {
					foundHomeRosterPlayer.assists = Number(foundHomeRosterPlayer.assists)
				} else {
					foundHomeRosterPlayer.assists =
						Number(foundHomeRosterPlayer.assists) -
						Number(previousAssists) +
						Number(rosterHomePlayerNewAssists)
				}
			} else {
				foundHomeRosterPlayer.assists =
					Number(foundHomeRosterPlayer.assists) +
					Number(rosterHomePlayerNewAssists)
			}

			//writing changes to RosterPlayer
			try {
				await foundHomeRosterPlayer.save()
			} catch (err) {
				const error = new HttpError(
					'Something went wrong with saving the roster players goals.  addPlayerStats ' +
						rosterHomePlayerId +
						' ' +
						foundHomeRosterPlayer.goals,
					500
				)
				return next(error)
			}

			//If the game HASNT been switched back to TBP, lets record the new stats in
			//this players statsPerGame.  If gameStatus is TBP, we want to wipe out
			//anything previous.
			//creating new RosterPlayerStatsPerGame
			//if (gameStatus !== 'TBP') {
			rosterHomePlayerGameStats = new RosterPlayerStatsPerGame({
				gameId: gameId,
				rosterPlayerId: foundHomeRosterPlayer._id,
				goals: rosterHomePlayerNewGoals,
				assists: rosterHomePlayerNewAssists,
			})
			//Writing to GAME tally.  This is what will appear when we reload the form
			try {
				await rosterHomePlayerGameStats.save()
			} catch (err) {
				const error = new HttpError(
					'could not create new instance of home RosterPlayerStatsPerGame',
					500
				)
				return next(error)
			}
		}
	}
	//******************************************************************* */
	//
	//  team stats (team wins, losses, goalsFor, goalsAgainst)
	//
	//******************************************************************* */
	//
	//Last thing we want to do here is find the sloths team and assign them either
	//a win or a loss, and also goals for and against
	//
	let foundHomeTeam
	try {
		foundHomeTeam = await Team.findOne({
			teamName: homeTeamName,
			year: year,
		})
	} catch (err) {
		const error = new HttpError(
			'could not find home team.  createPlayoffStats',
			500
		)
		return next(error)
	}

	if (previousPlayoffWinner && previousPlayoffWinner === homeTeamName) {
		console.log('looks like the sloths won last time.  did they win again?')
		if (winner === homeTeamName) {
			console.log('yes.  do nothing')
		} else {
			console.log('no.  so lets take away the previous win and add a loss')
			foundHomeTeam.wins = Number(foundHomeTeam.wins) - 1
			foundHomeTeam.losses = Number(foundHomeTeam.losses) + 1
		}
	}
	if (previousPlayoffLoser && previousPlayoffLoser === homeTeamName) {
		console.log('looks like the sloths lost last time.  did they lose again?')
		if (loser === homeTeamName) {
			console.log('yes.  do nothing')
		} else {
			console.log('no.  so lets take away the previous loss and add a win')
			foundHomeTeam.wins = Number(foundHomeTeam.wins) + 1
			foundHomeTeam.losses = Number(foundHomeTeam.losses) - 1
		}
	}
	if (!previousPlayoffLoser && !previousPlayoffWinner) {
		console.log('no previous winner or loser.  lets do that now')
		if (winner === homeTeamName) {
			foundHomeTeam.wins = Number(foundHomeTeam.wins) + 1
		} else {
			foundHomeTeam.losses = Number(foundHomeTeam.losses) + 1
		}
	}

	if (previousHomeGoalsTotal) {
		foundHomeTeam.goalsFor =
			Number(foundHomeTeam.goalsFor) - Number(previousHomeGoalsTotal)
	}
	if (previousVisitorGoalsTotal) {
		foundHomeTeam.goalsAgainst =
			Number(foundHomeTeam.goalsAgainst) - Number(previousVisitorGoalsTotal)
	}
	if (homePointsTotal) {
		foundHomeTeam.goalsFor =
			Number(foundHomeTeam.goalsFor) + Number(homePointsTotal)
	}

	if (visitorPointsTotal) {
		foundHomeTeam.goalsAgainst =
			Number(foundHomeTeam.goalsAgainst) + Number(visitorPointsTotal)
	}

	try {
		await foundHomeTeam.save()
	} catch (err) {
		const error = new HttpError(
			'could not save a win or loss for the home team.  createPlayoffStats',
			500
		)
		return next(error)
	}

	console.log('foundHomeTeam: ' + foundHomeTeam)

	res.status(200).json({ message: 'Playoff stats have been added' })
}
//
//
//
//
//****************************************************************************************** */
//
//	      createChampionshipGameStats
//
//	Here, we log all the stats from a championship game.  Basically, all we need is
//  a winner, a loser, and the score
//
//
//****************************************************************************************** */
const createChampionshipGameStats = async (req, res, next) => {
	console.log('welp, time to create Championship stats...')

	//These are coming to us from AdminGameResultsPlayoff.js
	const {
		homeStats,
		gameId,
		homePointsTotal,
		visitorPointsTotal,
		gameSummary,
	} = req.body

	//Use the gameId to get the homeTeamName and the visitorTeamName
	let homeTeamName, visitorTeamName, championshipGame, year, foundGame
	try {
		foundGame = await Game.findById(gameId)
	} catch (err) {
		const error = new HttpError(
			'Could not find game.  createChampionshipStats',
			404
		)
		return next(error)
	}
	homeTeamName = foundGame.teamName
	visitorTeamName = foundGame.opponent
	year = foundGame.year

	console.log('home: ' + homeTeamName + ' ' + homePointsTotal)
	console.log('visitor: ' + visitorTeamName + ' ' + visitorPointsTotal)
	console.log('game summary: ' + gameSummary)

	let winner, loser

	if (homePointsTotal > visitorPointsTotal) {
		winner = homeTeamName
		loser = visitorTeamName
	} else {
		winner = visitorTeamName
		loser = homeTeamName
	}

	console.log('And the championship winner is: ' + winner + '!!!')

	//Let's check to see if PlayoffGameStats already exist for this:
	//If so, we want to delete them.  Only need one set of stats per game
	try {
		foundStats = await ChampionshipGameStats.find({ gameId: gameId })
	} catch {}

	let previousHomeGoalsTotal,
		previousVisitorGoalsTotal,
		previousChampionshipWinner,
		previousChampionshipLoser

	//Lets look for previous playoff stats.  If they exist, let's log them so we can
	//refer to them later, then let's delete whats out there...
	if (foundStats.length > 0) {
		console.log('stats already exist for this Championship game: ' + foundStats)
		previousHomeGoalsTotal = foundStats[0].homeGoalsTotal
		previousVisitorGoalsTotal = foundStats[0].visitorGoalsTotal
		previousChampionshipWinner = foundStats[0].winner
		previousChampionshipLoser = foundStats[0].loser
		foundStats.forEach((stat) => {
			stat.deleteOne()
		})
	}

	console.log('previousHomeGoalsTotal: ' + previousHomeGoalsTotal)
	console.log('previousVisitorGoalsTotal: ' + previousVisitorGoalsTotal)
	console.log('previousChampionshipWinner: ' + previousChampionshipWinner)
	console.log('previousChampionshipLoser: ' + previousChampionshipLoser)
	console.log('NEW homeGoalsTotal: ' + homePointsTotal)
	console.log('NEW visitorGoalsTotal: ' + visitorPointsTotal)
	console.log('NEW winner: ' + winner)
	console.log('NEW loser: ' + loser)

	championshipGame = new ChampionshipGameStats({
		gameId: gameId,
		homeGoalsTotal: homePointsTotal,
		visitorGoalsTotal: visitorPointsTotal,
		winner: winner,
		loser: loser,
		summary: gameSummary.trim(),
	})
	try {
		await championshipGame.save()
	} catch (err) {
		const error = new HttpError(err, 500)
		return next(error)
	}

	//So, we created playoff game stats, but I also want to go back and alter the game
	//so that info shows up on the schedule screen
	foundGame.status = 'FINAL'
	foundGame.winner = winner
	foundGame.loser = loser
	foundGame.score = Number(homePointsTotal) + ' - ' + Number(visitorPointsTotal)
	console.log('saving game - second')
	try {
		await foundGame.save()
	} catch (err) {
		const error = new HttpError(err, 500)
		return next(error)
	}
	//
	//
	//
	//************************************************** */
	//
	//  Individual stats
	//
	//************************************************** */
	let foundHomeRosterPlayer,
		rosterHomePlayerId,
		rosterHomePlayerNewGoals,
		rosterHomePlayerNewAssists,
		rosterHomePlayerGameStats
	for (let i = 0; i < homeStats.length; i++) {
		const split = homeStats[i].split('|')
		rosterHomePlayerId = split[0]
		rosterHomePlayerNewGoals = split[1]
		rosterHomePlayerNewAssists = split[2]

		if (rosterHomePlayerNewGoals || rosterHomePlayerNewAssists) {
			try {
				foundHomeRosterPlayer = await RosterPlayer.findById(rosterHomePlayerId)
			} catch (err) {
				const error = new HttpError(
					'Could not find rosterPlayer.  createChampionshipGame ' +
						rosterHomePlayerId,
					404
				)
				return next(error)
			}
			console.log(rosterHomePlayerId)
			//
			//
			//So, we also want to write this players stats, but before we do that, we want to
			//see if they already exist.  If they do, we want to delete them and create anew
			const rosterPlayerStatsPerGameExists =
				await RosterPlayerStatsPerGame.findOne({
					gameId: gameId,
					rosterPlayerId: foundHomeRosterPlayer._id,
				})
			//
			//
			//
			//So...right here, if we find that stats already exist for this player,
			//if their number of goals or assists is the same as above, we don't want
			//to write them.  If the are DIFFERENT, then we write the ABOVE value.
			let previousGoals, previousAssists
			if (rosterPlayerStatsPerGameExists) {
				previousGoals = rosterPlayerStatsPerGameExists.goals
				previousAssists = rosterPlayerStatsPerGameExists.assists
				rosterPlayerStatsPerGameExists.deleteOne()
			}
			//
			//
			//
			if (previousGoals) {
				if (previousGoals === rosterHomePlayerNewGoals) {
					foundHomeRosterPlayer.goals = Number(foundHomeRosterPlayer.goals)
				} else {
					foundHomeRosterPlayer.goals =
						Number(foundHomeRosterPlayer.goals) -
						Number(previousGoals) +
						Number(rosterHomePlayerNewGoals)
				}
			} else {
				foundHomeRosterPlayer.goals =
					Number(foundHomeRosterPlayer.goals) + Number(rosterHomePlayerNewGoals)
			}

			if (previousAssists) {
				if (previousAssists === rosterHomePlayerNewAssists) {
					foundHomeRosterPlayer.assists = Number(foundHomeRosterPlayer.assists)
				} else {
					foundHomeRosterPlayer.assists =
						Number(foundHomeRosterPlayer.assists) -
						Number(previousAssists) +
						Number(rosterHomePlayerNewAssists)
				}
			} else {
				foundHomeRosterPlayer.assists =
					Number(foundHomeRosterPlayer.assists) +
					Number(rosterHomePlayerNewAssists)
			}

			//writing changes to RosterPlayer
			try {
				await foundHomeRosterPlayer.save()
			} catch (err) {
				const error = new HttpError(
					'Something went wrong with saving the roster players goals.  addPlayerStats ' +
						rosterHomePlayerId +
						' ' +
						foundHomeRosterPlayer.goals,
					500
				)
				return next(error)
			}

			//If the game HASNT been switched back to TBP, lets record the new stats in
			//this players statsPerGame.  If gameStatus is TBP, we want to wipe out
			//anything previous.
			//creating new RosterPlayerStatsPerGame
			//if (gameStatus !== 'TBP') {
			rosterHomePlayerGameStats = new RosterPlayerStatsPerGame({
				gameId: gameId,
				rosterPlayerId: foundHomeRosterPlayer._id,
				goals: rosterHomePlayerNewGoals,
				assists: rosterHomePlayerNewAssists,
			})
			//Writing to GAME tally.  This is what will appear when we reload the form
			try {
				await rosterHomePlayerGameStats.save()
			} catch (err) {
				const error = new HttpError(
					'could not create new instance of home RosterPlayerStatsPerGame',
					500
				)
				return next(error)
			}
		}
	}
	//******************************************************************* */
	//
	//  team stats (team wins, losses, goalsFor, goalsAgainst)
	//
	//******************************************************************* */
	//
	//Last thing we want to do here is find the sloths team and assign them either
	//a win or a loss, and also goals for and against
	//
	let foundHomeTeam
	try {
		foundHomeTeam = await Team.findOne({
			teamName: homeTeamName,
			year: year,
		})
	} catch (err) {
		const error = new HttpError(
			'could not find home team.  createPlayoffStats',
			500
		)
		return next(error)
	}

	if (
		previousChampionshipWinner &&
		previousChampionshipWinner === homeTeamName
	) {
		console.log('looks like the sloths won last time.  did they win again?')
		if (winner === homeTeamName) {
			console.log('yes.  do nothing')
		} else {
			console.log('no.  so lets take away the previous win and add a loss')
			foundHomeTeam.wins = Number(foundHomeTeam.wins) - 1
			foundHomeTeam.losses = Number(foundHomeTeam.losses) + 1
		}
	}
	if (previousChampionshipLoser && previousChampionshipLoser === homeTeamName) {
		console.log('looks like the sloths lost last time.  did they lose again?')
		if (loser === homeTeamName) {
			console.log('yes.  do nothing')
		} else {
			console.log('no.  so lets take away the previous loss and add a win')
			foundHomeTeam.wins = Number(foundHomeTeam.wins) + 1
			foundHomeTeam.losses = Number(foundHomeTeam.losses) - 1
		}
	}
	if (!previousChampionshipLoser && !previousChampionshipWinner) {
		console.log('no previous winner or loser.  lets do that now')
		if (winner === homeTeamName) {
			foundHomeTeam.wins = Number(foundHomeTeam.wins) + 1
		} else {
			foundHomeTeam.losses = Number(foundHomeTeam.losses) + 1
		}
	}

	if (previousHomeGoalsTotal) {
		foundHomeTeam.goalsFor =
			Number(foundHomeTeam.goalsFor) - Number(previousHomeGoalsTotal)
	}
	if (previousVisitorGoalsTotal) {
		foundHomeTeam.goalsAgainst =
			Number(foundHomeTeam.goalsAgainst) - Number(previousVisitorGoalsTotal)
	}
	if (homePointsTotal) {
		foundHomeTeam.goalsFor =
			Number(foundHomeTeam.goalsFor) + Number(homePointsTotal)
	}

	if (visitorPointsTotal) {
		foundHomeTeam.goalsAgainst =
			Number(foundHomeTeam.goalsAgainst) + Number(visitorPointsTotal)
	}

	try {
		await foundHomeTeam.save()
	} catch (err) {
		const error = new HttpError(
			'could not save a win or loss for the home team.  createPlayoffStats',
			500
		)
		return next(error)
	}

	console.log('foundHomeTeam: ' + foundHomeTeam)

	res.status(200).json({ message: 'Championship stats have been added' })
}
//
//
//
//
//****************************************************************************************** */
//
//	      createEvents
//
//	Here, we can create up to 10 new non-game events.
//
//
//****************************************************************************************** */
const createEvents = async (req, res, next) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		const error = new HttpError(
			'Something is missing from Event 1.  Make sure to start at the top',
			422
		)
		return next(error)
	}

	const {
		date1,
		time1,
		endTime1,
		recurring1,
		eventName1,
		venue1,
		tbd1IsChecked,
		date2,
		time2,
		endTime2,
		recurring2,
		eventName2,
		venue2,
		tbd2IsChecked,
		date3,
		time3,
		endTime3,
		recurring3,
		eventName3,
		venue3,
		tbd3IsChecked,
		date4,
		time4,
		endTime4,
		recurring4,
		eventName4,
		venue4,
		tbd4IsChecked,
		date5,
		time5,
		endTime5,
		recurring5,
		eventName5,
		venue5,
		tbd5IsChecked,
	} = req.body

	let createdEvent1,
		recurringEvent1,
		createdEvent2,
		recurringEvent2,
		createdEvent3,
		recurringEvent3,
		createdEvent4,
		recurringEvent4,
		createdEvent5,
		recurringEvent5
	//**************************************************************************************** */
	//
	//    event 1
	//
	//**************************************************************************************** */
	if (!date1) {
		const error = new HttpError('Please enter a DATE for event 1', 422)
		return next(error)
	}
	if (!time1 && !tbd1IsChecked) {
		const error = new HttpError('Please enter a TIME for event 1', 422)
		return next(error)
	}
	if (!venue1) {
		const error = new HttpError('Please enter a VENUE for event 1', 422)
		return next(error)
	}

	console.log('date1: ' + date1)

	const e1year = date1.substr(0, 4)
	const e1month = date1.substr(5, 2)
	const e1day = date1.substr(8, 2)
	const MDYEventDate1 = e1month + '-' + e1day + '-' + e1year

	const utcEventDate1 = new Date(MDYEventDate1)

	const eventDateString1 = utcEventDate1.toString()

	const eventDayOfWeek1 = eventDateString1.substr(0, 3)
	//
	//
	//
	let numberOfWeeks1
	if (recurring1 === '3month') {
		numberOfWeeks1 = '12'
	} else if (recurring1 === '6month') {
		numberOfWeeks1 = '26'
	} else if (recurring1 === '9month') {
		numberOfWeeks1 === '39'
	} else if (recurring1 === '1year') {
		numberOfWeeks1 === '52'
	}

	let recurringEvent1Collection
	recurringEvent1Collection = []
	if (recurring1) {
		let startYear, startMonth, startDay
		startYear = e1year
		startMonth = e1month
		startDay = e1day
		for (let i = 0; i < numberOfWeeks1; i++) {
			const stringDate =
				'"' + startYear + '-' + startMonth + '-' + startDay + '"'
			const convertedDate = new Date(stringDate)
			console.log('convertedDate: ' + convertedDate)

			//next, I think we need to convert one week later to MM-DD-YYYY
			//so first, we convert the oneWeekLater into a string, so we can split it
			const dateString = convertedDate.toString()
			let dateArray
			dateArray = []
			dateArray = dateString.split(' ')
			const dayOfWeek = dateArray[0]
			const month = dateArray[1]
			const day = dateArray[2]
			const year = dateArray[3]
			let monthNumber
			switch (month) {
				case 'Jan':
					monthNumber = '01'
					break
				case 'Feb':
					monthNumber = '02'
					break
				case 'Mar':
					monthNumber = '03'
					break
				case 'Apr':
					monthNumber = '04'
					break
				case 'May':
					monthNumber = '05'
					break
				case 'Jun':
					monthNumber = '06'
					break
				case 'Jul':
					monthNumber = '07'
					break
				case 'Aug':
					monthNumber = '08'
					break
				case 'Sep':
					monthNumber = '09'
					break
				case 'Oct':
					monthNumber = '10'
					break
				case 'Nov':
					monthNumber = '11'
					break
				case 'Dec':
					monthNumber = '12'
					break
			}

			const newDate = monthNumber + '-' + day + '-' + year

			console.log('newDate: ' + newDate)

			recurringEvent1 = new Event({
				eventName: eventName1.trim(),
				dayOfWeek: dayOfWeek,
				date: newDate,
				time: time1,
				endTime: endTime1,
				timeTBD: tbd1IsChecked,
				venueName: venue1,
			})
			try {
				await recurringEvent1.save()
			} catch (err) {
				const error = new HttpError(err, 500)
				return next(error)
			}
			recurringEvent1Collection.push(recurringEvent1)

			convertedDate.setDate(convertedDate.getDate() + 7)

			console.log('convertedDate HERE: ' + convertedDate)

			const oneWeekLaterString = convertedDate.toString()
			let dateArray2
			dateArray2 = []
			dateArray2 = oneWeekLaterString.split(' ')
			const dayOfWeek2 = dateArray2[0]
			const month2 = dateArray2[1]
			const day2 = dateArray2[2]
			const year2 = dateArray2[3]

			let monthNumber2
			switch (month2) {
				case 'Jan':
					monthNumber2 = '01'
					break
				case 'Feb':
					monthNumber2 = '02'
					break
				case 'Mar':
					monthNumber2 = '03'
					break
				case 'Apr':
					monthNumber2 = '04'
					break
				case 'May':
					monthNumber2 = '05'
					break
				case 'Jun':
					monthNumber2 = '06'
					break
				case 'Jul':
					monthNumber2 = '07'
					break
				case 'Aug':
					monthNumber2 = '08'
					break
				case 'Sep':
					monthNumber2 = '09'
					break
				case 'Oct':
					monthNumber2 = '10'
					break
				case 'Nov':
					monthNumber2 = '11'
					break
				case 'Dec':
					monthNumber2 = '12'
					break
			}

			startYear = year2
			startMonth = monthNumber2
			startDay = day2
		}
	} else {
		console.log('MDYEventDate1: ' + MDYEventDate1)
		createdEvent1 = new Event({
			eventName: eventName1.trim(),
			dayOfWeek: eventDayOfWeek1,
			date: MDYEventDate1,
			time: time1,
			endTime: endTime1,
			timeTBD: tbd1IsChecked,
			venueName: venue1,
		})
		try {
			await createdEvent1.save()
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
	}
	console.log('Event 1 has been added')

	//**************************************************************************************** */
	//
	//    event 2
	//
	//**************************************************************************************** */
	if (eventName2) {
		if (!date2) {
			createdEvent1 && createdEvent1.deleteOne()
			if (recurring1) {
				console.log('NO DATE GIVEN: we need to delete recurring events')
				recurringEvent1Collection.forEach((event) => {
					event.deleteOne()
				})
			}
			const error = new HttpError('Please enter a DATE for event 2', 422)
			return next(error)
		}
		if (!time2 && !tbd2IsChecked) {
			createdEvent1 && createdEvent1.deleteOne()
			if (recurring1) {
				console.log('NO TIME GIVEN: we need to delete recurring events')
				recurringEvent1Collection.forEach((event) => {
					event.deleteOne()
				})
			}
			const error = new HttpError('Please enter a TIME for event 2', 422)
			return next(error)
		}
		if (!venue2) {
			createdEvent1 && createdEvent1.deleteOne()
			if (recurring1) {
				console.log('NO TIME GIVEN: we need to delete recurring events')
				recurringEvent1Collection.forEach((event) => {
					event.deleteOne()
				})
			}
			const error = new HttpError('Please enter a VENUE for event 2', 422)
			return next(error)
		}

		const e2year = date2.substr(0, 4)
		const e2month = date2.substr(5, 2)
		const e2day = date2.substr(8, 2)
		const MDYEventDate2 = e2month + '-' + e2day + '-' + e2year

		const utcEventDate2 = new Date(MDYEventDate2)

		const eventDateString2 = utcEventDate2.toString()

		const eventDayOfWeek2 = eventDateString2.substr(0, 3)

		let numberOfWeeks2

		if (recurring2 === '3month') {
			numberOfWeeks2 = '12'
		} else if (recurring2 === '6month') {
			numberOfWeeks2 = '26'
		} else if (recurring2 === '9month') {
			numberOfWeeks2 === '39'
		} else if (recurring2 === '1year') {
			numberOfWeeks2 === '52'
		}
		let recurringEvent2Collection
		recurringEvent2Collection = []

		if (recurring2) {
			let startYear, startMonth, startDay
			startYear = e2year
			startMonth = e2month
			startDay = e2day
			for (let i = 0; i < numberOfWeeks2; i++) {
				const stringDate =
					'"' + startYear + '-' + startMonth + '-' + startDay + '"'
				const convertedDate = new Date(stringDate)
				console.log('convertedDate: ' + convertedDate)

				//next, I think we need to convert one week later to MM-DD-YYYY
				//so first, we convert the oneWeekLater into a string, so we can split it
				const dateString = convertedDate.toString()
				let dateArray
				dateArray = []
				dateArray = dateString.split(' ')
				const dayOfWeek = dateArray[0]
				const month = dateArray[1]
				const day = dateArray[2]
				const year = dateArray[3]
				let monthNumber
				switch (month) {
					case 'Jan':
						monthNumber = '01'
						break
					case 'Feb':
						monthNumber = '02'
						break
					case 'Mar':
						monthNumber = '03'
						break
					case 'Apr':
						monthNumber = '04'
						break
					case 'May':
						monthNumber = '05'
						break
					case 'Jun':
						monthNumber = '06'
						break
					case 'Jul':
						monthNumber = '07'
						break
					case 'Aug':
						monthNumber = '08'
						break
					case 'Sep':
						monthNumber = '09'
						break
					case 'Oct':
						monthNumber = '10'
						break
					case 'Nov':
						monthNumber = '11'
						break
					case 'Dec':
						monthNumber = '12'
						break
				}

				const newDate = monthNumber + '-' + day + '-' + year

				console.log('newDate: ' + newDate)

				recurringEvent2 = new Event({
					eventName: eventName2.trim(),
					dayOfWeek: dayOfWeek,
					date: newDate,
					time: time2,
					endTime: endTime2,
					timeTBD: tbd2IsChecked,
					venueName: venue2,
				})
				try {
					await recurringEvent2.save()
				} catch (err) {
					const error = new HttpError(err, 500)
					return next(error)
				}
				recurringEvent2Collection.push(recurringEvent2)

				convertedDate.setDate(convertedDate.getDate() + 7)

				console.log('convertedDate HERE: ' + convertedDate)

				const oneWeekLaterString = convertedDate.toString()
				let dateArray2
				dateArray2 = []
				dateArray2 = oneWeekLaterString.split(' ')
				const dayOfWeek2 = dateArray2[0]
				const month2 = dateArray2[1]
				const day2 = dateArray2[2]
				const year2 = dateArray2[3]

				let monthNumber2
				switch (month2) {
					case 'Jan':
						monthNumber2 = '01'
						break
					case 'Feb':
						monthNumber2 = '02'
						break
					case 'Mar':
						monthNumber2 = '03'
						break
					case 'Apr':
						monthNumber2 = '04'
						break
					case 'May':
						monthNumber2 = '05'
						break
					case 'Jun':
						monthNumber2 = '06'
						break
					case 'Jul':
						monthNumber2 = '07'
						break
					case 'Aug':
						monthNumber2 = '08'
						break
					case 'Sep':
						monthNumber2 = '09'
						break
					case 'Oct':
						monthNumber2 = '10'
						break
					case 'Nov':
						monthNumber2 = '11'
						break
					case 'Dec':
						monthNumber2 = '12'
						break
				}

				startYear = year2
				startMonth = monthNumber2
				startDay = day2
			}
		} else {
			createdEvent2 = new Event({
				eventName: eventName2.trim(),
				dayOfWeek: eventDayOfWeek2,
				date: MDYEventDate2,
				time: time2,
				endTime: endTime2,
				timeTBD: tbd2IsChecked,
				venueName: venue2,
			})
			try {
				await createdEvent2.save()
			} catch (err) {
				createdEvent1 && createdEvent1.deleteOne()
				if (recurring1) {
					console.log('NO TIME GIVEN: we need to delete recurring events')
					recurringEvent1Collection.forEach((event) => {
						event.deleteOne()
					})
				}
				const error = new HttpError(err, 500)
				return next(error)
			}
			console.log('Event 2 has been added')
		}
	}

	//**************************************************************************************** */
	//
	//    event 3
	//
	//**************************************************************************************** */
	if (eventName3) {
		if (!date3) {
			createdEvent1 && createdEvent1.deleteOne()
			if (recurring1) {
				recurringEvent1Collection.forEach((event) => {
					event.deleteOne()
				})
			}
			createdEvent2 && createdEvent2.deleteOne()
			if (recurring2) {
				console.log('NO DATE GIVEN: we need to delete recurring events')
				recurringEvent2Collection.forEach((event) => {
					event.deleteOne()
				})
			}
			const error = new HttpError('Please enter a DATE for event 3', 422)
			return next(error)
		}
		if (!time3 && !tbd3IsChecked) {
			createdEvent1 && createdEvent1.deleteOne()
			if (recurring1) {
				recurringEvent1Collection.forEach((event) => {
					event.deleteOne()
				})
			}
			createdEvent2 && createdEvent2.deleteOne()
			if (recurring2) {
				console.log('NO DATE GIVEN: we need to delete recurring events')
				recurringEvent2Collection.forEach((event) => {
					event.deleteOne()
				})
			}
			const error = new HttpError('Please enter a TIME for event 3', 422)
			return next(error)
		}
		if (!venue3) {
			createdEvent1 && createdEvent1.deleteOne()
			if (recurring1) {
				recurringEvent1Collection.forEach((event) => {
					event.deleteOne()
				})
			}
			createdEvent2 && createdEvent2.deleteOne()
			if (recurring2) {
				console.log('NO DATE GIVEN: we need to delete recurring events')
				recurringEvent2Collection.forEach((event) => {
					event.deleteOne()
				})
			}
			const error = new HttpError('Please enter a VENUE for event 3', 422)
			return next(error)
		}

		const e3year = date3.substr(0, 4)
		const e3month = date3.substr(5, 2)
		const e3day = date3.substr(8, 2)
		const MDYEventDate3 = e3month + '-' + e3day + '-' + e3year

		const utcEventDate3 = new Date(MDYEventDate3)

		const eventDateString3 = utcEventDate3.toString()

		const eventDayOfWeek3 = eventDateString3.substr(0, 3)

		let numberOfWeeks3

		if (recurring3 === '3month') {
			numberOfWeeks3 = '12'
		} else if (recurring3 === '6month') {
			numberOfWeeks3 = '26'
		} else if (recurring3 === '9month') {
			numberOfWeeks3 === '39'
		} else if (recurring3 === '1year') {
			numberOfWeeks3 === '52'
		}

		let recurringEvent3Collection
		recurringEvent3Collection = []

		if (recurring3) {
			let startYear, startMonth, startDay
			startYear = e3year
			startMonth = e3month
			startDay = e3day
			for (let i = 0; i < numberOfWeeks3; i++) {
				const stringDate =
					'"' + startYear + '-' + startMonth + '-' + startDay + '"'
				const convertedDate = new Date(stringDate)
				console.log('convertedDate: ' + convertedDate)

				//next, I think we need to convert one week later to MM-DD-YYYY
				//so first, we convert the oneWeekLater into a string, so we can split it
				const dateString = convertedDate.toString()
				let dateArray
				dateArray = []
				dateArray = dateString.split(' ')
				const dayOfWeek = dateArray[0]
				const month = dateArray[1]
				const day = dateArray[2]
				const year = dateArray[3]
				let monthNumber
				switch (month) {
					case 'Jan':
						monthNumber = '01'
						break
					case 'Feb':
						monthNumber = '02'
						break
					case 'Mar':
						monthNumber = '03'
						break
					case 'Apr':
						monthNumber = '04'
						break
					case 'May':
						monthNumber = '05'
						break
					case 'Jun':
						monthNumber = '06'
						break
					case 'Jul':
						monthNumber = '07'
						break
					case 'Aug':
						monthNumber = '08'
						break
					case 'Sep':
						monthNumber = '09'
						break
					case 'Oct':
						monthNumber = '10'
						break
					case 'Nov':
						monthNumber = '11'
						break
					case 'Dec':
						monthNumber = '12'
						break
				}

				const newDate = monthNumber + '-' + day + '-' + year

				console.log('newDate: ' + newDate)

				recurringEvent3 = new Event({
					eventName: eventName3.trim(),
					dayOfWeek: dayOfWeek,
					date: newDate,
					time: time3,
					endTime: endTime3,
					timeTBD: tbd3IsChecked,
					venueName: venue3,
				})
				try {
					await recurringEvent3.save()
				} catch (err) {
					const error = new HttpError(err, 500)
					return next(error)
				}

				recurringEvent3Collection.push(recurringEvent3)

				convertedDate.setDate(convertedDate.getDate() + 7)

				console.log('convertedDate HERE: ' + convertedDate)

				const oneWeekLaterString = convertedDate.toString()
				let dateArray2
				dateArray2 = []
				dateArray2 = oneWeekLaterString.split(' ')
				const dayOfWeek2 = dateArray2[0]
				const month2 = dateArray2[1]
				const day2 = dateArray2[2]
				const year2 = dateArray2[3]

				let monthNumber2
				switch (month2) {
					case 'Jan':
						monthNumber2 = '01'
						break
					case 'Feb':
						monthNumber2 = '02'
						break
					case 'Mar':
						monthNumber2 = '03'
						break
					case 'Apr':
						monthNumber2 = '04'
						break
					case 'May':
						monthNumber2 = '05'
						break
					case 'Jun':
						monthNumber2 = '06'
						break
					case 'Jul':
						monthNumber2 = '07'
						break
					case 'Aug':
						monthNumber2 = '08'
						break
					case 'Sep':
						monthNumber2 = '09'
						break
					case 'Oct':
						monthNumber2 = '10'
						break
					case 'Nov':
						monthNumber2 = '11'
						break
					case 'Dec':
						monthNumber2 = '12'
						break
				}

				startYear = year2
				startMonth = monthNumber2
				startDay = day2
			}
		} else {
			createdEvent3 = new Event({
				eventName: eventName3.trim(),
				dayOfWeek: eventDayOfWeek3,
				date: MDYEventDate3,
				time: time3,
				endTime: endTime3,
				timeTBD: tbd3IsChecked,
				venueName: venue3,
			})
			try {
				await createdEvent3.save()
			} catch (err) {
				createdEvent1 && createdEvent1.deleteOne()
				if (recurring1) {
					recurringEvent1Collection.forEach((event) => {
						event.deleteOne()
					})
				}
				createdEvent2 && createdEvent2.deleteOne()
				if (recurring2) {
					console.log('NO DATE GIVEN: we need to delete recurring events')
					recurringEvent1Collection.forEach((event) => {
						event.deleteOne()
					})
				}
				const error = new HttpError(err, 500)
				return next(error)
			}
			console.log('Event 3 has been added')
		}
	}

	//**************************************************************************************** */
	//
	//    event 4
	//
	//**************************************************************************************** */
	if (eventName4) {
		if (!date4) {
			createdEvent1 && createdEvent1.deleteOne()
			if (recurring1) {
				recurringEvent1Collection.forEach((event) => {
					event.deleteOne()
				})
			}

			createdEvent3 && createdEvent3.deleteOne()
			const error = new HttpError('Please enter a DATE for event 4', 422)
			return next(error)
		}
		if (!time4 && !tbd4IsChecked) {
			createdEvent1 && createdEvent1.deleteOne()
			if (recurring1) {
				recurringEvent1Collection.forEach((event) => {
					event.deleteOne()
				})
			}
			createdEvent2 && createdEvent2.deleteOne()
			if (recurring2) {
				console.log('NO DATE GIVEN: we need to delete recurring events')
				recurringEvent1Collection.forEach((event) => {
					event.deleteOne()
				})
			}
			createdEvent3 && createdEvent3.deleteOne()
			const error = new HttpError('Please enter a TIME for event 4', 422)
			return next(error)
		}
		if (!venue4) {
			createdEvent1 && createdEvent1.deleteOne()
			if (recurring1) {
				recurringEvent1Collection.forEach((event) => {
					event.deleteOne()
				})
			}
			createdEvent2 && createdEvent2.deleteOne()
			if (recurring2) {
				console.log('NO DATE GIVEN: we need to delete recurring events')
				recurringEvent1Collection.forEach((event) => {
					event.deleteOne()
				})
			}
			createdEvent3 && createdEvent3.deleteOne()
			const error = new HttpError('Please enter a VENUE for event 4', 422)
			return next(error)
		}

		const e4year = date4.substr(0, 4)
		const e4month = date4.substr(5, 2)
		const e4day = date4.substr(8, 2)
		const MDYEventDate4 = e4month + '-' + e4day + '-' + e4year

		const utcEventDate4 = new Date(MDYEventDate4)

		const eventDateString4 = utcEventDate4.toString()

		const eventDayOfWeek4 = eventDateString4.substr(0, 3)

		let numberOfWeeks4

		if (recurring4 === '3month') {
			numberOfWeeks4 = '12'
		} else if (recurring4 === '6month') {
			numberOfWeeks4 = '26'
		} else if (recurring4 === '9month') {
			numberOfWeeks4 === '39'
		} else if (recurring4 === '1year') {
			numberOfWeeks4 === '52'
		}

		let recurringEvent4Collection
		recurringEvent4Collection = []

		if (recurring4) {
			let startYear, startMonth, startDay
			startYear = e4year
			startMonth = e4month
			startDay = e4day
			for (let i = 0; i < numberOfWeeks4; i++) {
				const stringDate =
					'"' + startYear + '-' + startMonth + '-' + startDay + '"'
				const convertedDate = new Date(stringDate)
				console.log('convertedDate: ' + convertedDate)

				//next, I think we need to convert one week later to MM-DD-YYYY
				//so first, we convert the oneWeekLater into a string, so we can split it
				const dateString = convertedDate.toString()
				let dateArray
				dateArray = []
				dateArray = dateString.split(' ')
				const dayOfWeek = dateArray[0]
				const month = dateArray[1]
				const day = dateArray[2]
				const year = dateArray[3]
				let monthNumber
				switch (month) {
					case 'Jan':
						monthNumber = '01'
						break
					case 'Feb':
						monthNumber = '02'
						break
					case 'Mar':
						monthNumber = '03'
						break
					case 'Apr':
						monthNumber = '04'
						break
					case 'May':
						monthNumber = '05'
						break
					case 'Jun':
						monthNumber = '06'
						break
					case 'Jul':
						monthNumber = '07'
						break
					case 'Aug':
						monthNumber = '08'
						break
					case 'Sep':
						monthNumber = '09'
						break
					case 'Oct':
						monthNumber = '10'
						break
					case 'Nov':
						monthNumber = '11'
						break
					case 'Dec':
						monthNumber = '12'
						break
				}

				const newDate = monthNumber + '-' + day + '-' + year

				console.log('newDate: ' + newDate)

				recurringEvent4 = new Event({
					eventName: eventName4.trim(),
					dayOfWeek: dayOfWeek,
					date: newDate,
					time: time4,
					endTime: endTime4,
					timeTBD: tbd4IsChecked,
					venueName: venue4,
				})
				try {
					await recurringEvent4.save()
				} catch (err) {
					const error = new HttpError(err, 500)
					return next(error)
				}

				recurringEvent4Collection.push(recurringEvent4)

				convertedDate.setDate(convertedDate.getDate() + 7)

				console.log('convertedDate HERE: ' + convertedDate)

				const oneWeekLaterString = convertedDate.toString()
				let dateArray2
				dateArray2 = []
				dateArray2 = oneWeekLaterString.split(' ')
				const dayOfWeek2 = dateArray2[0]
				const month2 = dateArray2[1]
				const day2 = dateArray2[2]
				const year2 = dateArray2[3]

				let monthNumber2
				switch (month2) {
					case 'Jan':
						monthNumber2 = '01'
						break
					case 'Feb':
						monthNumber2 = '02'
						break
					case 'Mar':
						monthNumber2 = '03'
						break
					case 'Apr':
						monthNumber2 = '04'
						break
					case 'May':
						monthNumber2 = '05'
						break
					case 'Jun':
						monthNumber2 = '06'
						break
					case 'Jul':
						monthNumber2 = '07'
						break
					case 'Aug':
						monthNumber2 = '08'
						break
					case 'Sep':
						monthNumber2 = '09'
						break
					case 'Oct':
						monthNumber2 = '10'
						break
					case 'Nov':
						monthNumber2 = '11'
						break
					case 'Dec':
						monthNumber2 = '12'
						break
				}

				startYear = year2
				startMonth = monthNumber2
				startDay = day2
			}
		} else {
			createdEvent4 = new Event({
				eventName: eventName4.trim(),
				dayOfWeek: eventDayOfWeek4,
				date: MDYEventDate4,
				time: time4,
				endTime: endTime4,
				timeTBD: tbd4IsChecked,
				venueName: venue4,
			})
			try {
				await createdEvent4.save()
			} catch (err) {
				createdEvent1 && createdEvent1.deleteOne()
				if (recurring1) {
					recurringEvent1Collection.forEach((event) => {
						event.deleteOne()
					})
				}
				createdEvent2 && createdEvent2.deleteOne()
				if (recurring2) {
					console.log('NO DATE GIVEN: we need to delete recurring events')
					recurringEvent1Collection.forEach((event) => {
						event.deleteOne()
					})
				}
				createdEvent3 && createdEvent3.deleteOne()
				const error = new HttpError(err, 500)
				return next(error)
			}
			console.log('Event 4 has been added')
		}
	}
	//**************************************************************************************** */
	//
	//    event 5
	//
	//**************************************************************************************** */
	if (eventName5) {
		if (!date5) {
			createdEvent1 && createdEvent1.deleteOne()
			if (recurring1) {
				recurringEvent1Collection.forEach((event) => {
					event.deleteOne()
				})
			}
			createdEvent2 && createdEvent2.deleteOne()
			if (recurring2) {
				console.log('NO DATE GIVEN: we need to delete recurring events')
				recurringEvent1Collection.forEach((event) => {
					event.deleteOne()
				})
			}
			createdEvent3 && createdEvent3.deleteOne()
			createdEvent4 && createdEvent4.deleteOne()
			const error = new HttpError('Please enter a DATE for event 5', 422)
			return next(error)
		}
		if (!time5 && !tbd5IsChecked) {
			createdEvent1 && createdEvent1.deleteOne()
			if (recurring1) {
				recurringEvent1Collection.forEach((event) => {
					event.deleteOne()
				})
			}
			createdEvent2 && createdEvent2.deleteOne()
			if (recurring2) {
				console.log('NO DATE GIVEN: we need to delete recurring events')
				recurringEvent1Collection.forEach((event) => {
					event.deleteOne()
				})
			}
			createdEvent3 && createdEvent3.deleteOne()
			createdEvent4 && createdEvent4.deleteOne()
			const error = new HttpError('Please enter a TIME for event 5', 422)
			return next(error)
		}
		if (!venue5) {
			createdEvent1 && createdEvent1.deleteOne()
			if (recurring1) {
				recurringEvent1Collection.forEach((event) => {
					event.deleteOne()
				})
			}
			createdEvent2 && createdEvent2.deleteOne()
			if (recurring2) {
				console.log('NO DATE GIVEN: we need to delete recurring events')
				recurringEvent1Collection.forEach((event) => {
					event.deleteOne()
				})
			}
			createdEvent3 && createdEvent3.deleteOne()
			createdEvent4 && createdEvent4.deleteOne()
			const error = new HttpError('Please enter a VENUE for event 5', 422)
			return next(error)
		}

		const e5year = date5.substr(0, 4)
		const e5month = date5.substr(5, 2)
		const e5day = date5.substr(8, 2)
		const MDYEventDate5 = e5month + '-' + e5day + '-' + e5year

		const utcEventDate5 = new Date(MDYEventDate5)

		const eventDateString5 = utcEventDate5.toString()

		const eventDayOfWeek5 = eventDateString5.substr(0, 3)

		let numberOfWeeks5

		if (recurring5 === '3month') {
			numberOfWeeks5 = '12'
		} else if (recurring5 === '6month') {
			numberOfWeeks5 = '26'
		} else if (recurring5 === '9month') {
			numberOfWeeks5 === '39'
		} else if (recurring5 === '1year') {
			numberOfWeeks5 === '52'
		}

		let recurringEvent5Collection
		recurringEvent5Collection = []

		if (recurring5) {
			let startYear, startMonth, startDay
			startYear = e4year
			startMonth = e4month
			startDay = e4day
			for (let i = 0; i < numberOfWeeks5; i++) {
				const stringDate =
					'"' + startYear + '-' + startMonth + '-' + startDay + '"'
				const convertedDate = new Date(stringDate)
				console.log('convertedDate: ' + convertedDate)

				//next, I think we need to convert one week later to MM-DD-YYYY
				//so first, we convert the oneWeekLater into a string, so we can split it
				const dateString = convertedDate.toString()
				let dateArray
				dateArray = []
				dateArray = dateString.split(' ')
				const dayOfWeek = dateArray[0]
				const month = dateArray[1]
				const day = dateArray[2]
				const year = dateArray[3]
				let monthNumber
				switch (month) {
					case 'Jan':
						monthNumber = '01'
						break
					case 'Feb':
						monthNumber = '02'
						break
					case 'Mar':
						monthNumber = '03'
						break
					case 'Apr':
						monthNumber = '04'
						break
					case 'May':
						monthNumber = '05'
						break
					case 'Jun':
						monthNumber = '06'
						break
					case 'Jul':
						monthNumber = '07'
						break
					case 'Aug':
						monthNumber = '08'
						break
					case 'Sep':
						monthNumber = '09'
						break
					case 'Oct':
						monthNumber = '10'
						break
					case 'Nov':
						monthNumber = '11'
						break
					case 'Dec':
						monthNumber = '12'
						break
				}

				const newDate = monthNumber + '-' + day + '-' + year

				console.log('newDate: ' + newDate)

				recurringEvent5 = new Event({
					eventName: eventName5.trim(),
					dayOfWeek: dayOfWeek,
					date: newDate,
					time: time5,
					endTime: endTime5,
					timeTBD: tbd5IsChecked,
					venueName: venue5,
				})
				try {
					await recurringEvent5.save()
				} catch (err) {
					const error = new HttpError(err, 500)
					return next(error)
				}

				recurringEvent5Collection.push(recurringEvent5)

				convertedDate.setDate(convertedDate.getDate() + 7)

				console.log('convertedDate HERE: ' + convertedDate)

				const oneWeekLaterString = convertedDate.toString()
				let dateArray2
				dateArray2 = []
				dateArray2 = oneWeekLaterString.split(' ')
				const dayOfWeek2 = dateArray2[0]
				const month2 = dateArray2[1]
				const day2 = dateArray2[2]
				const year2 = dateArray2[3]

				let monthNumber2
				switch (month2) {
					case 'Jan':
						monthNumber2 = '01'
						break
					case 'Feb':
						monthNumber2 = '02'
						break
					case 'Mar':
						monthNumber2 = '03'
						break
					case 'Apr':
						monthNumber2 = '04'
						break
					case 'May':
						monthNumber2 = '05'
						break
					case 'Jun':
						monthNumber2 = '06'
						break
					case 'Jul':
						monthNumber2 = '07'
						break
					case 'Aug':
						monthNumber2 = '08'
						break
					case 'Sep':
						monthNumber2 = '09'
						break
					case 'Oct':
						monthNumber2 = '10'
						break
					case 'Nov':
						monthNumber2 = '11'
						break
					case 'Dec':
						monthNumber2 = '12'
						break
				}

				startYear = year2
				startMonth = monthNumber2
				startDay = day2
			}
		} else {
			createdEvent5 = new Event({
				eventName: eventName5.trim(),
				dayOfWeek: eventDayOfWeek5,
				date: MDYEventDate5,
				time: time5,
				endTime: endTime5,
				timeTBD: tbd5IsChecked,
				venueName: venue5,
			})
			try {
				await createdEvent5.save()
			} catch (err) {
				createdEvent1 && createdEvent1.deleteOne()
				if (recurring1) {
					recurringEvent1Collection.forEach((event) => {
						event.deleteOne()
					})
				}
				createdEvent2 && createdEvent2.deleteOne()
				if (recurring2) {
					console.log('NO DATE GIVEN: we need to delete recurring events')
					recurringEvent1Collection.forEach((event) => {
						event.deleteOne()
					})
				}
				createdEvent3 && createdEvent3.deleteOne()
				createdEvent4 && createdEvent4.deleteOne()
				const error = new HttpError(err, 500)
				return next(error)
			}
			console.log('Event 5 has been added')
		}
	}
	//**************************************************************************************** */
	//
	//    event 6
	//
	//**************************************************************************************** */
	/* if (eventName6) {
		if (!date6) {
			createdEvent1.deleteOne()
			createdEvent2 && createdEvent2.deleteOne()
			createdEvent3 && createdEvent3.deleteOne()
			createdEvent4 && createdEvent4.deleteOne()
			createdEvent5 && createdEvent5.deleteOne()
			const error = new HttpError('Please enter a DATE for event 6', 422)
			return next(error)
		}
		if (!time6 && !tbd6IsChecked) {
			createdEvent1.deleteOne()
			createdEvent2 && createdEvent2.deleteOne()
			createdEvent3 && createdEvent3.deleteOne()
			createdEvent4 && createdEvent4.deleteOne()
			createdEvent5 && createdEvent5.deleteOne()
			const error = new HttpError('Please enter a TIME for event 6', 422)
			return next(error)
		}
		if (!venue6) {
			createdEvent1.deleteOne()
			createdEvent2 && createdEvent2.deleteOne()
			createdEvent3 && createdEvent3.deleteOne()
			createdEvent4 && createdEvent4.deleteOne()
			createdEvent5 && createdEvent5.deleteOne()
			const error = new HttpError('Please enter a VENUE for event 6', 422)
			return next(error)
		}

		const e6year = date6.substr(0, 4)
		const e6month = date6.substr(5, 2)
		const e6day = date6.substr(8, 2)
		const MDYEventDate6 = e6month + '-' + e6day + '-' + e6year

		const utcEventDate6 = new Date(MDYEventDate6)

		const eventDateString6 = utcEventDate6.toString()

		const eventDayOfWeek6 = eventDateString6.substr(0, 3)

		createdEvent6 = new Event({
			eventName: eventName6,
			dayOfWeek: eventDayOfWeek6,
			date: MDYEventDate6,
			time: time6,
			endTime: endTime6,
			timeTBD: tbd6IsChecked,
			venueName: venue6,
		})
		try {
			await createdEvent6.save()
		} catch (err) {
			createdEvent1.deleteOne()
			createdEvent2 && createdEvent2.deleteOne()
			createdEvent3 && createdEvent3.deleteOne()
			createdEvent4 && createdEvent4.deleteOne()
			createdEvent5 && createdEvent5.deleteOne()
			const error = new HttpError(err, 500)
			return next(error)
		}
		console.log('Event 6 has been added')
	} */
	//**************************************************************************************** */
	//
	//    event 7
	//
	//**************************************************************************************** */
	/* if (eventName7) {
		if (!date7) {
			createdEvent1.deleteOne()
			createdEvent2 && createdEvent2.deleteOne()
			createdEvent3 && createdEvent3.deleteOne()
			createdEvent4 && createdEvent4.deleteOne()
			createdEvent5 && createdEvent5.deleteOne()
			createdEvent6 && createdEvent6.deleteOne()
			const error = new HttpError('Please enter a DATE for event 7', 422)
			return next(error)
		}
		if (!time7 && !tbd7IsChecked) {
			createdEvent1.deleteOne()
			createdEvent2 && createdEvent2.deleteOne()
			createdEvent3 && createdEvent3.deleteOne()
			createdEvent4 && createdEvent4.deleteOne()
			createdEvent5 && createdEvent5.deleteOne()
			createdEvent6 && createdEvent6.deleteOne()
			const error = new HttpError('Please enter a TIME for event 7', 422)
			return next(error)
		}
		if (!venue7) {
			createdEvent1.deleteOne()
			createdEvent2 && createdEvent2.deleteOne()
			createdEvent3 && createdEvent3.deleteOne()
			createdEvent4 && createdEvent4.deleteOne()
			createdEvent5 && createdEvent5.deleteOne()
			createdEvent6 && createdEvent6.deleteOne()
			const error = new HttpError('Please enter a VENUE for event 7', 422)
			return next(error)
		}

		const e7year = date7.substr(0, 4)
		const e7month = date7.substr(5, 2)
		const e7day = date7.substr(8, 2)
		const MDYEventDate7 = e7month + '-' + e7day + '-' + e7year

		const utcEventDate7 = new Date(MDYEventDate7)

		const eventDateString7 = utcEventDate7.toString()

		const eventDayOfWeek7 = eventDateString7.substr(0, 3)

		createdEvent7 = new Event({
			eventName: eventName7,
			dayOfWeek: eventDayOfWeek7,
			date: MDYEventDate7,
			time: time7,
			endTime: endTime7,
			timeTBD: tbd7IsChecked,
			venueName: venue7,
		})
		try {
			await createdEvent7.save()
		} catch (err) {
			createdEvent1.deleteOne()
			createdEvent2 && createdEvent2.deleteOne()
			createdEvent3 && createdEvent3.deleteOne()
			createdEvent4 && createdEvent4.deleteOne()
			createdEvent5 && createdEvent5.deleteOne()
			createdEvent6 && createdEvent6.deleteOne()
			const error = new HttpError(err, 500)
			return next(error)
		}
		console.log('Event 7 has been added')
	} */
	//**************************************************************************************** */
	//
	//    event 8
	//
	//**************************************************************************************** */
	/* if (eventName8) {
		if (!date8) {
			createdEvent1.deleteOne()
			createdEvent2 && createdEvent2.deleteOne()
			createdEvent3 && createdEvent3.deleteOne()
			createdEvent4 && createdEvent4.deleteOne()
			createdEvent5 && createdEvent5.deleteOne()
			createdEvent6 && createdEvent6.deleteOne()
			createdEvent7 && createdEvent7.deleteOne()
			const error = new HttpError('Please enter a DATE for event 8', 422)
			return next(error)
		}
		if (!time8 && !tbd8IsChecked) {
			createdEvent1.deleteOne()
			createdEvent2 && createdEvent2.deleteOne()
			createdEvent3 && createdEvent3.deleteOne()
			createdEvent4 && createdEvent4.deleteOne()
			createdEvent5 && createdEvent5.deleteOne()
			createdEvent6 && createdEvent6.deleteOne()
			createdEvent7 && createdEvent7.deleteOne()
			const error = new HttpError('Please enter a TIME for event 8', 422)
			return next(error)
		}
		if (!venue8) {
			createdEvent1.deleteOne()
			createdEvent2 && createdEvent2.deleteOne()
			createdEvent3 && createdEvent3.deleteOne()
			createdEvent4 && createdEvent4.deleteOne()
			createdEvent5 && createdEvent5.deleteOne()
			createdEvent6 && createdEvent6.deleteOne()
			createdEvent7 && createdEvent7.deleteOne()
			const error = new HttpError('Please enter a VENUE for event 8', 422)
			return next(error)
		}

		const e8year = date8.substr(0, 4)
		const e8month = date8.substr(5, 2)
		const e8day = date8.substr(8, 2)
		const MDYEventDate8 = e8month + '-' + e8day + '-' + e8year

		const utcEventDate8 = new Date(MDYEventDate8)

		const eventDateString8 = utcEventDate8.toString()

		const eventDayOfWeek8 = eventDateString8.substr(0, 3)

		createdEvent8 = new Event({
			eventName: eventName8,
			dayOfWeek: eventDayOfWeek8,
			date: MDYEventDate8,
			time: time8,
			endTime: endTime8,
			timeTBD: tbd8IsChecked,
			venueName: venue8,
		})
		try {
			await createdEvent8.save()
		} catch (err) {
			createdEvent1.deleteOne()
			createdEvent2 && createdEvent2.deleteOne()
			createdEvent3 && createdEvent3.deleteOne()
			createdEvent4 && createdEvent4.deleteOne()
			createdEvent5 && createdEvent5.deleteOne()
			createdEvent6 && createdEvent6.deleteOne()
			createdEvent7 && createdEvent7.deleteOne()
			const error = new HttpError(err, 500)
			return next(error)
		}
		console.log('Event 8 has been added')
	} */
	//**************************************************************************************** */
	//
	//    event 9
	//
	//**************************************************************************************** */
	/* if (eventName9) {
		if (!date9) {
			createdEvent1.deleteOne()
			createdEvent2 && createdEvent2.deleteOne()
			createdEvent3 && createdEvent3.deleteOne()
			createdEvent4 && createdEvent4.deleteOne()
			createdEvent5 && createdEvent5.deleteOne()
			createdEvent6 && createdEvent6.deleteOne()
			createdEvent7 && createdEvent7.deleteOne()
			createdEvent8 && createdEvent8.deleteOne()
			const error = new HttpError('Please enter a DATE for event 9', 422)
			return next(error)
		}
		if (!time9 && !tbd9IsChecked) {
			createdEvent1.deleteOne()
			createdEvent2 && createdEvent2.deleteOne()
			createdEvent3 && createdEvent3.deleteOne()
			createdEvent4 && createdEvent4.deleteOne()
			createdEvent5 && createdEvent5.deleteOne()
			createdEvent6 && createdEvent6.deleteOne()
			createdEvent7 && createdEvent7.deleteOne()
			createdEvent8 && createdEvent8.deleteOne()
			const error = new HttpError('Please enter a TIME for event 9', 422)
			return next(error)
		}
		if (!venue9) {
			createdEvent1.deleteOne()
			createdEvent2 && createdEvent2.deleteOne()
			createdEvent3 && createdEvent3.deleteOne()
			createdEvent4 && createdEvent4.deleteOne()
			createdEvent5 && createdEvent5.deleteOne()
			createdEvent6 && createdEvent6.deleteOne()
			createdEvent7 && createdEvent7.deleteOne()
			createdEvent8 && createdEvent8.deleteOne()
			const error = new HttpError('Please enter a VENUE for event 9', 422)
			return next(error)
		}

		const e9year = date9.substr(0, 4)
		const e9month = date9.substr(5, 2)
		const e9day = date9.substr(8, 2)
		const MDYEventDate9 = e9month + '-' + e9day + '-' + e9year

		const utcEventDate9 = new Date(MDYEventDate9)

		const eventDateString9 = utcEventDate9.toString()

		const eventDayOfWeek9 = eventDateString9.substr(0, 3)

		createdEvent9 = new Event({
			eventName: eventName9,
			dayOfWeek: eventDayOfWeek9,
			date: MDYEventDate9,
			time: time9,
			endTime: endTime9,
			timeTBD: tbd9IsChecked,
			venueName: venue9,
		})
		try {
			await createdEvent9.save()
		} catch (err) {
			createdEvent1.deleteOne()
			createdEvent2 && createdEvent2.deleteOne()
			createdEvent3 && createdEvent3.deleteOne()
			createdEvent4 && createdEvent4.deleteOne()
			createdEvent5 && createdEvent5.deleteOne()
			createdEvent6 && createdEvent6.deleteOne()
			createdEvent7 && createdEvent7.deleteOne()
			createdEvent8 && createdEvent8.deleteOne()
			const error = new HttpError(err, 500)
			return next(error)
		}
		console.log('Event 9 has been added')
	} */
	//**************************************************************************************** */
	//
	//    event 10
	//
	//**************************************************************************************** */
	/* if (eventName10) {
		if (!date10) {
			createdEvent1.deleteOne()
			createdEvent2 && createdEvent2.deleteOne()
			createdEvent3 && createdEvent3.deleteOne()
			createdEvent4 && createdEvent4.deleteOne()
			createdEvent5 && createdEvent5.deleteOne()
			createdEvent6 && createdEvent6.deleteOne()
			createdEvent7 && createdEvent7.deleteOne()
			createdEvent8 && createdEvent8.deleteOne()
			createdEvent9 && createdEvent9.deleteOne()
			const error = new HttpError('Please enter a DATE for event 10', 422)
			return next(error)
		}
		if (!time10 && !tbd10IsChecked) {
			createdEvent1.deleteOne()
			createdEvent2 && createdEvent2.deleteOne()
			createdEvent3 && createdEvent3.deleteOne()
			createdEvent4 && createdEvent4.deleteOne()
			createdEvent5 && createdEvent5.deleteOne()
			createdEvent6 && createdEvent6.deleteOne()
			createdEvent7 && createdEvent7.deleteOne()
			createdEvent8 && createdEvent8.deleteOne()
			createdEvent9 && createdEvent9.deleteOne()
			const error = new HttpError('Please enter a TIME for event 10', 422)
			return next(error)
		}
		if (!venue10) {
			createdEvent1.deleteOne()
			createdEvent2 && createdEvent2.deleteOne()
			createdEvent3 && createdEvent3.deleteOne()
			createdEvent4 && createdEvent4.deleteOne()
			createdEvent5 && createdEvent5.deleteOne()
			createdEvent6 && createdEvent6.deleteOne()
			createdEvent7 && createdEvent7.deleteOne()
			createdEvent8 && createdEvent8.deleteOne()
			createdEvent9 && createdEvent9.deleteOne()
			const error = new HttpError('Please enter a VENUE for event 10', 422)
			return next(error)
		}

		const e10year = date10.substr(0, 4)
		const e10month = date10.substr(5, 2)
		const e10day = date10.substr(8, 2)
		const MDYEventDate10 = e10month + '-' + e10day + '-' + e10year

		const utcEventDate10 = new Date(MDYEventDate10)

		const eventDateString10 = utcEventDate10.toString()

		const eventDayOfWeek10 = eventDateString10.substr(0, 3)

		createdEvent10 = new Event({
			eventName: eventName10,
			dayOfWeek: eventDayOfWeek10,
			date: MDYEventDate10,
			time: time10,
			endTime: endTime10,
			timeTBD: tbd10IsChecked,
			venueName: venue10,
		})
		try {
			await createdEvent10.save()
		} catch (err) {
			createdEvent1.deleteOne()
			createdEvent2 && createdEvent2.deleteOne()
			createdEvent3 && createdEvent3.deleteOne()
			createdEvent4 && createdEvent4.deleteOne()
			createdEvent5 && createdEvent5.deleteOne()
			createdEvent6 && createdEvent6.deleteOne()
			createdEvent7 && createdEvent7.deleteOne()
			createdEvent8 && createdEvent8.deleteOne()
			createdEvent9 && createdEvent9.deleteOne()
			const error = new HttpError(err, 500)
			return next(error)
		}
		console.log('Event 10 has been added')
	} */
	//
	//
	res.status(201).json({
		event1: createdEvent1,
		event2: createdEvent2,
		event3: createdEvent3,
		event4: createdEvent4,
		event5: createdEvent5,
		/* event6: createdEvent6,
		event7: createdEvent7,
		event8: createdEvent8,
		event9: createdEvent9,
		event10: createdEvent10, */
	})
}
//****************************************************************************************** */
//
//	addPlayerToTeam
//
//We're not creating a new player here, we're creating a new
//rostered player for a specific team.  This player already exists
//in the system somewhere. We need to find the roster for the team
//in question, and we need to find the player's playerId.  Then,
//we can create a new RosterPlayer item.
//
//****************************************************************************************** */
const addPlayerToTeam = async (req, res, next) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		console.log(errors)
		const error = new HttpError(
			errors || 'Invalid inputs.  Something is empty in addPlayerToTeam',
			422
		)
	}
	const year = req.params.year
	const teamName = req.params.teamName
	console.log('adding player(s) to team ' + teamName + ' - ' + year)
	//
	//
	//First, let's find the teamId:
	let teamId
	let foundTeam
	try {
		foundTeam = await Team.findOne({
			teamName: teamName,
			year: year,
		}).orFail()
	} catch (err) {
		const error = new HttpError(
			'Could not find team to obtain teamId 3.  addPlayerToTeam',
			500
		)
		return next(error)
	}
	console.log('foundTeam: ' + foundTeam)
	teamId = foundTeam.id
	//
	//
	//Now that we have our leagueId and teamId, let's find the rosterId
	let rosterId
	let foundRoster
	try {
		foundRoster = await Roster.findOne({
			teamId: teamId,
		}).orFail()
	} catch (err) {
		const error = new HttpError(
			'Could not find roster to obtain rosterId.  addPlayerToTeam'
		)
		return next(error)
	}
	console.log('foundRoster: ' + foundRoster)
	rosterId = foundRoster.id
	//
	//
	//Now we have the rosterId, but we still need the playerId.
	//So let's rip the following out of the request body:
	const {
		lastName1,
		lastName2,
		lastName3,
		lastName4,
		lastName5,
		lastName6,
		lastName7,
		lastName8,
		lastName9,
		lastName10,
		lastName11,
		lastName12,
		lastName13,
		firstName1,
		firstName2,
		firstName3,
		firstName4,
		firstName5,
		firstName6,
		firstName7,
		firstName8,
		firstName9,
		firstName10,
		firstName11,
		firstName12,
		firstName13,
		middleInitial1,
		middleInitial2,
		middleInitial3,
		middleInitial4,
		middleInitial5,
		middleInitial6,
		middleInitial7,
		middleInitial8,
		middleInitial9,
		middleInitial10,
		middleInitial11,
		middleInitial12,
		middleInitial13,
		playerNumber1,
		playerNumber2,
		playerNumber3,
		playerNumber4,
		playerNumber5,
		playerNumber6,
		playerNumber7,
		playerNumber8,
		playerNumber9,
		playerNumber10,
		playerNumber11,
		playerNumber12,
		playerNumber13,
	} = req.body

	//********************************************************************************* */
	//
	//   Adding Roster Player 1
	//   Need to get the playerId first
	//   Then we need to check to see if the player already exists.  If so, throw alert
	//   If not, then we create a new roster player, either
	//      WITH or WITHOUT middleInitial
	//
	//********************************************************************************* */
	console.log('adding player 1')
	let playerId1
	let foundPlayer1
	if (!middleInitial1) {
		try {
			foundPlayer1 = await Player.findOne({
				firstName: firstName1,
				lastName: lastName1,
			})
		} catch (err) {
			const error = new HttpError(
				'Could not find player1 to obtain playerId1',
				500
			)
			return next(error)
		}
		playerId1 = foundPlayer1.id
	}

	if (middleInitial1) {
		try {
			foundPlayer1 = await Player.findOne({
				firstName: firstName1,
				lastName: lastName1,
				middleInitial: middleInitial1,
			})
		} catch (err) {
			const error = new HttpError(
				'Could not find player1 to obtain playerId1',
				500
			)
			return next(error)
		}
		playerId1 = foundPlayer1.id
	}
	//
	//
	//Before we add this player, let's make sure he doesnt already exist on the team
	const playerExists1 = await RosterPlayer.findOne({
		playerId: playerId1,
		rosterId: rosterId,
		//number: number,
	})
	//If the player exists, we want to display an error saying such, and include the player name
	let existingPlayerName1
	if (playerExists1) {
		existingPlayerName1 = firstName1 + ' ' + middleInitial1 + ' ' + lastName1
		console.log('Player1 Exists: ' + existingPlayerName1)
	}
	//
	//Should have everything we need now to create a new RosterPlayer item.
	let createdRosterPlayer1,
		createdRosterPlayer2,
		createdRosterPlayer3,
		createdRosterPlayer4,
		createdRosterPlayer5,
		createdRosterPlayer6,
		createdRosterPlayer7,
		createdRosterPlayer8,
		createdRosterPlayer9,
		createdRosterPlayer10,
		createdRosterPlayer11,
		createdRosterPlayer12,
		createdRosterPlayer13
	if (!middleInitial1) {
		if (playerExists1) {
			console.log('Player1 already exists!')
			const error = new HttpError(
				existingPlayerName1 +
					' already exists on this team. Start the form over, but do not include ' +
					existingPlayerName1,
				409
			)
			return next(error)
		} else {
			createdRosterPlayer1 = new RosterPlayer({
				teamId,
				playerId: playerId1,
				firstName: firstName1,
				middleInitial: ' ',
				lastName: lastName1,
				rosterId,
				teamName,
				year,
				number: playerNumber1,
				goals: 0,
				assists: 0,
			})
		}

		try {
			await createdRosterPlayer1.save()
		} catch (err) {
			//const error = new HttpError('Could not add player1 to team (1)', 500)
			const error = new HttpError(err, 500)
			return next(error)
		}
	}

	if (middleInitial1) {
		if (playerExists1) {
			console.log('Player already exists!')
			const error = new HttpError(
				existingPlayerName1 +
					' already exists on this team. Start the form over, but do not include ' +
					existingPlayerName1,
				409
			)
			return next(error)
		} else {
			createdRosterPlayer1 = new RosterPlayer({
				teamId,
				playerId: playerId1,
				firstName: firstName1,
				middleInitial: ' ',
				lastName: lastName1,
				rosterId,
				teamName,
				year,
				number: playerNumber1,
				goals: 0,
				assists: 0,
			})
		}
		try {
			await createdRosterPlayer1.save()
		} catch (err) {
			//const error = new HttpError('Could not add player1 to team (2)', 500)
			const error = new HttpError(err, 500)
			return next(error)
		}
	}

	//**************************************************************************** */
	//
	//   Adding Roster Player 2
	//
	//**************************************************************************** */
	let playerId2
	let foundPlayer2
	if (firstName2) {
		console.log('adding player 2')
		if (!middleInitial2) {
			try {
				foundPlayer2 = await Player.findOne({
					firstName: firstName2,
					lastName: lastName2,
				})
			} catch (err) {
				const error = new HttpError(
					'Could not find player to obtain playerId2',
					500
				)
				return next(error)
			}
			playerId2 = foundPlayer2.id
		}

		if (middleInitial2) {
			try {
				foundPlayer2 = await Player.findOne({
					firstName: firstName2,
					lastName: lastName2,
					middleInitial: middleInitial2,
				})
			} catch (err) {
				const error = new HttpError(
					'Could not find player to obtain playerId2',
					500
				)
				return next(error)
			}
			playerId2 = foundPlayer2.id
		}
		//
		//
		//Before we add this player, let's make sure he doesnt already exist on the team
		const playerExists2 = await RosterPlayer.findOne({
			playerId: playerId2,
			rosterId: rosterId,
			//number: number,
		})
		//If the player exists, we want to display an error saying such, and include the player name
		let existingPlayerName2
		if (playerExists2) {
			existingPlayerName2 = firstName2 + ' ' + middleInitial2 + ' ' + lastName2
			console.log('Player Exists: ' + existingPlayerName2)
		}
		//
		//Should have everything we need now to create a new RosterPlayer item.
		//let createdRosterPlayer2
		if (!middleInitial2) {
			if (playerExists2) {
				console.log('Player already exists!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				const error = new HttpError(
					existingPlayerName2 +
						' already exists on this team. Start the form over, but do not include ' +
						existingPlayerName2,
					409
				)
				return next(error)
			} else if (firstName2 && !playerNumber2) {
				console.log('Player 2 is missing a number!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				const error = new HttpError(
					'Please enter a jersey number for player 2',
					409
				)
				return next(error)
			} else {
				createdRosterPlayer2 = new RosterPlayer({
					teamId,
					playerId: playerId2,
					firstName: firstName2,
					middleInitial: ' ',
					lastName: lastName2,
					rosterId,
					teamName,
					//leagueName,
					//session,
					year,
					number: playerNumber2,
					goals: 0,
					assists: 0,
				})
			}
			try {
				await createdRosterPlayer2.save()
			} catch (err) {
				const error = new HttpError('Could not add player2 to team.', 500)
				//const error = new HttpError(err, 500)
				return next(error)
			}
		}

		if (middleInitial2) {
			if (playerExists2) {
				console.log('Player already exists!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				const error = new HttpError(
					existingPlayerName2 +
						' already exists on this team. Start the form over, but do not include ' +
						existingPlayerName2,
					409
				)
				return next(error)
			} else if (firstName2 && !playerNumber2) {
				console.log('Player 2 is missing a number!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				const error = new HttpError(
					'Please enter a jersey number for player 2',
					409
				)
				return next(error)
			} else {
				createdRosterPlayer2 = new RosterPlayer({
					teamId,
					playerId: playerId2,
					firstName: firstName2,
					middleInitial: ' ',
					lastName: lastName2,
					rosterId,
					teamName,
					//leagueName,
					//session,
					year,
					number: playerNumber2,
					goals: 0,
					assists: 0,
				})
			}
			try {
				await createdRosterPlayer2.save()
			} catch (err) {
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				const error = new HttpError('Could not add player2 to team.', 500)
				//const error = new HttpError(err, 500)
				return next(error)
			}
		}
	}

	//**************************************************************************** */
	//
	//   Adding Roster Player 3
	//
	//**************************************************************************** */
	let playerId3
	let foundPlayer3
	if (firstName3) {
		console.log('adding player 3')
		if (!middleInitial3) {
			try {
				foundPlayer3 = await Player.findOne({
					firstName: firstName3,
					lastName: lastName3,
				})
			} catch (err) {
				const error = new HttpError(
					'Could not find player to obtain playerId3',
					500
				)
				return next(error)
			}
			playerId3 = foundPlayer3.id
		}

		if (middleInitial3) {
			try {
				foundPlayer3 = await Player.findOne({
					firstName: firstName3,
					lastName: lastName3,
					middleInitial: middleInitial3,
				})
			} catch (err) {
				const error = new HttpError(
					'Could not find player to obtain playerId3',
					500
				)
				return next(error)
			}
			playerId3 = foundPlayer3.id
		}
		//
		//
		//Before we add this player, let's make sure he doesnt already exist on the team
		const playerExists3 = await RosterPlayer.findOne({
			playerId: playerId3,
			rosterId: rosterId,
			//number: number,
		})
		//If the player exists, we want to display an error saying such, and include the player name
		let existingPlayerName3
		if (playerExists3) {
			existingPlayerName3 = firstName3 + ' ' + middleInitial3 + ' ' + lastName3
			console.log('Player Exists: ' + existingPlayerName3)
		}
		//
		//Should have everything we need now to create a new RosterPlayer item.
		//let createdRosterPlayer3
		if (!middleInitial3) {
			if (playerExists3) {
				console.log('Player 3 already exists!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				const error = new HttpError(
					existingPlayerName3 +
						' already exists on this team. Start the form over, but do not include ' +
						existingPlayerName3,
					409
				)
				return next(error)
			} else if (firstName3 && !playerNumber3) {
				console.log('Player 3 is missing a number!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				const error = new HttpError(
					'Please enter a jersey number for player 3',
					409
				)
				return next(error)
			} else {
				createdRosterPlayer3 = new RosterPlayer({
					teamId,
					playerId: playerId3,
					firstName: firstName3,
					middleInitial: ' ',
					lastName: lastName3,
					rosterId,
					teamName,
					year,
					number: playerNumber3,
					goals: 0,
					assists: 0,
				})
			}
			try {
				await createdRosterPlayer3.save()
			} catch (err) {
				const error = new HttpError('Could not add player3 to team.', 500)
				//const error = new HttpError(err, 500)
				return next(error)
			}
		}

		if (middleInitial3) {
			if (playerExists3) {
				console.log('Player3 already exists!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				const error = new HttpError(
					existingPlayerName3 +
						' already exists on this team. Start the form over, but do not include ' +
						existingPlayerName3,
					409
				)
				return next(error)
			} else if (firstName3 && !playerNumber3) {
				console.log('Player 3 is missing a number!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				const error = new HttpError(
					'Please enter a jersey number for player 3',
					409
				)
				return next(error)
			} else {
				createdRosterPlayer3 = new RosterPlayer({
					teamId,
					playerId: playerId3,
					firstName: firstName3,
					middleInitial: ' ',
					lastName: lastName3,
					rosterId,
					teamName,
					year,
					number: playerNumber3,
					goals: 0,
					assists: 0,
				})
			}
			try {
				await createdRosterPlayer3.save()
			} catch (err) {
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				const error = new HttpError('Could not add player3 to team.', 500)
				//const error = new HttpError(err, 500)
				return next(error)
			}
		}
	}
	//**************************************************************************** */
	//
	//   Adding Roster Player 4
	//
	//**************************************************************************** */
	let playerId4
	let foundPlayer4
	if (firstName4) {
		console.log('adding player 4')
		if (!middleInitial4) {
			try {
				foundPlayer4 = await Player.findOne({
					firstName: firstName4,
					lastName: lastName4,
				})
			} catch (err) {
				const error = new HttpError(
					'Could not find player to obtain playerId4',
					500
				)
				return next(error)
			}
			playerId4 = foundPlayer4.id
		}

		if (middleInitial4) {
			try {
				foundPlayer4 = await Player.findOne({
					firstName: firstName4,
					lastName: lastName4,
					middleInitial: middleInitial4,
				})
			} catch (err) {
				const error = new HttpError(
					'Could not find player to obtain playerId4',
					500
				)
				return next(error)
			}
			playerId4 = foundPlayer4.id
		}
		//
		//
		//Before we add this player, let's make sure he doesnt already exist on the team
		const playerExists4 = await RosterPlayer.findOne({
			playerId: playerId4,
			rosterId: rosterId,
			//number: number,
		})
		//If the player exists, we want to display an error saying such, and include the player name
		let existingPlayerName4
		if (playerExists4) {
			existingPlayerName4 = firstName4 + ' ' + middleInitial4 + ' ' + lastName4
			console.log('Player Exists: ' + existingPlayerName4)
		}
		//
		//Should have everything we need now to create a new RosterPlayer item.
		//let createdRosterPlayer3
		if (!middleInitial4) {
			if (playerExists4) {
				console.log('Player 4 already exists!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				const error = new HttpError(
					existingPlayerName4 +
						' already exists on this team. Start the form over, but do not include ' +
						existingPlayerName4,
					409
				)
				return next(error)
			} else if (firstName4 && !playerNumber4) {
				console.log('Player 4 is missing a number!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				const error = new HttpError(
					'Please enter a jersey number for player 4',
					409
				)
				return next(error)
			} else {
				createdRosterPlayer4 = new RosterPlayer({
					teamId,
					playerId: playerId4,
					firstName: firstName4,
					middleInitial: ' ',
					lastName: lastName4,
					rosterId,
					teamName,
					year,
					number: playerNumber4,
					goals: 0,
					assists: 0,
				})
			}
			try {
				await createdRosterPlayer4.save()
			} catch (err) {
				const error = new HttpError('Could not add player4 to team.', 500)
				//const error = new HttpError(err, 500)
				return next(error)
			}
		}

		if (middleInitial4) {
			if (playerExists4) {
				console.log('Player4 already exists!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				const error = new HttpError(
					existingPlayerName4 +
						' already exists on this team. Start the form over, but do not include ' +
						existingPlayerName4,
					409
				)
				return next(error)
			} else if (firstName4 && !playerNumber4) {
				console.log('Player 4 is missing a number!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				const error = new HttpError(
					'Please enter a jersey number for player 4',
					409
				)
				return next(error)
			} else {
				createdRosterPlayer4 = new RosterPlayer({
					teamId,
					playerId: playerId4,
					firstName: firstName4,
					middleInitial: ' ',
					lastName: lastName4,
					rosterId,
					teamName,
					year,
					number: playerNumber4,
					goals: 0,
					assists: 0,
				})
			}
			try {
				await createdRosterPlayer4.save()
			} catch (err) {
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				const error = new HttpError('Could not add player4 to team.', 500)
				//const error = new HttpError(err, 500)
				return next(error)
			}
		}
	}
	//**************************************************************************** */
	//
	//   Adding Roster Player 5
	//
	//**************************************************************************** */
	let playerId5
	let foundPlayer5
	if (firstName5) {
		if (!middleInitial5) {
			try {
				foundPlayer5 = await Player.findOne({
					firstName: firstName5,
					lastName: lastName5,
				})
			} catch (err) {
				const error = new HttpError(
					'Could not find player to obtain playerId5',
					500
				)
				return next(error)
			}
			playerId5 = foundPlayer5.id
		}

		if (middleInitial5) {
			try {
				foundPlayer5 = await Player.findOne({
					firstName: firstName5,
					lastName: lastName5,
					middleInitial: middleInitial5,
				})
			} catch (err) {
				const error = new HttpError(
					'Could not find player to obtain playerId5',
					500
				)
				return next(error)
			}
			playerId5 = foundPlayer5.id
		}
		//
		//
		//Before we add this player, let's make sure he doesnt already exist on the team
		const playerExists5 = await RosterPlayer.findOne({
			playerId: playerId5,
			rosterId: rosterId,
			//number: number,
		})
		//If the player exists, we want to display an error saying such, and include the player name
		let existingPlayerName5
		if (playerExists5) {
			existingPlayerName5 = firstName5 + ' ' + middleInitial5 + ' ' + lastName5
			console.log('Player5 Exists: ' + existingPlayerName5)
		}
		//
		//Should have everything we need now to create a new RosterPlayer item.
		//let createdRosterPlayer5
		if (!middleInitial5) {
			if (playerExists5) {
				console.log('Player 5 already exists!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				const error = new HttpError(
					existingPlayerName5 +
						' already exists on this team. Start the form over, but do not include ' +
						existingPlayerName5,
					409
				)
				return next(error)
			} else if (firstName5 && !playerNumber5) {
				console.log('Player 5 is missing a number!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				const error = new HttpError(
					'Please enter a jersey number for player 5',
					409
				)
				return next(error)
			} else {
				createdRosterPlayer5 = new RosterPlayer({
					leagueId,
					playerId: playerId5,
					firstName: firstName5,
					middleInitial: ' ',
					lastName: lastName5,
					rosterId,
					teamName,
					leagueName,
					session,
					year,
					number: playerNumber5,
					goals: 0,
					assists: 0,
				})
			}
			try {
				await createdRosterPlayer5.save()
			} catch (err) {
				const error = new HttpError(
					'Could not add player5 to team.  Maybe a missing Number?',
					500
				)
				//const error = new HttpError(err, 500)
				return next(error)
			}
		}

		if (middleInitial5) {
			if (playerExists5) {
				console.log('Player5 already exists!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				const error = new HttpError(
					existingPlayerName5 +
						' already exists on this team. Start the form over, but do not include ' +
						existingPlayerName5,
					409
				)
				return next(error)
			} else if (firstName5 && !playerNumber5) {
				console.log('Player 5 is missing a number!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				const error = new HttpError(
					'Please enter a jersey number for player 5',
					409
				)
				return next(error)
			} else {
				createdRosterPlayer5 = new RosterPlayer({
					leagueId,
					playerId: playerId5,
					firstName: firstName5,
					middleInitial: middleInitial5,
					lastName: lastName5,
					rosterId,
					teamName,
					leagueName,
					session,
					year,
					number: playerNumber5,
					goals: 0,
					assists: 0,
				})
			}
			try {
				await createdRosterPlayer5.save()
			} catch (err) {
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				const error = new HttpError(
					'Could not add player5 to team.  Maybe a missing Number?',
					500
				)
				//const error = new HttpError(err, 500)
				return next(error)
			}
		}
	}
	//**************************************************************************** */
	//
	//   Adding Roster Player 6
	//
	//**************************************************************************** */
	let playerId6
	let foundPlayer6
	if (firstName6) {
		if (!middleInitial6) {
			try {
				foundPlayer6 = await Player.findOne({
					firstName: firstName6,
					lastName: lastName6,
				})
			} catch (err) {
				const error = new HttpError(
					'Could not find player to obtain playerId6',
					500
				)
				return next(error)
			}
			playerId6 = foundPlayer6.id
		}

		if (middleInitial6) {
			try {
				foundPlayer6 = await Player.findOne({
					firstName: firstName6,
					lastName: lastName6,
					middleInitial: middleInitial6,
				})
			} catch (err) {
				const error = new HttpError(
					'Could not find player to obtain playerId6',
					500
				)
				return next(error)
			}
			playerId6 = foundPlayer6.id
		}
		//
		//
		//Before we add this player, let's make sure he doesnt already exist on the team
		const playerExists6 = await RosterPlayer.findOne({
			playerId: playerId6,
			rosterId: rosterId,
			//number: number,
		})
		//If the player exists, we want to display an error saying such, and include the player name
		let existingPlayerName6
		if (playerExists6) {
			existingPlayerName6 = firstName6 + ' ' + middleInitial6 + ' ' + lastName6
			console.log('Player6 Exists: ' + existingPlayerName6)
		}
		//
		//Should have everything we need now to create a new RosterPlayer item.
		//let createdRosterPlayer6
		if (!middleInitial6) {
			if (playerExists6) {
				console.log('Player 6 already exists!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				const error = new HttpError(
					existingPlayerName6 +
						' already exists on this team. Start the form over, but do not include ' +
						existingPlayerName6,
					409
				)
				return next(error)
			} else if (firstName6 && !playerNumber6) {
				console.log('Player 6 is missing a number!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				const error = new HttpError(
					'Please enter a jersey number for player 6',
					409
				)
				return next(error)
			} else {
				createdRosterPlayer6 = new RosterPlayer({
					leagueId,
					playerId: playerId6,
					firstName: firstName6,
					middleInitial: ' ',
					lastName: lastName6,
					rosterId,
					teamName,
					leagueName,
					session,
					year,
					number: playerNumber6,
					goals: 0,
					assists: 0,
				})
			}
			try {
				await createdRosterPlayer6.save()
			} catch (err) {
				const error = new HttpError(
					'Could not add player6 to team.  Maybe a missing Number?',
					500
				)
				//const error = new HttpError(err, 500)
				return next(error)
			}
		}

		if (middleInitial6) {
			if (playerExists6) {
				console.log('Player6 already exists!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				const error = new HttpError(
					existingPlayerName6 +
						' already exists on this team. Start the form over, but do not include ' +
						existingPlayerName6,
					409
				)
				return next(error)
			} else if (firstName6 && !playerNumber6) {
				console.log('Player 6 is missing a number!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				const error = new HttpError(
					'Please enter a jersey number for player 6',
					409
				)
				return next(error)
			} else {
				createdRosterPlayer6 = new RosterPlayer({
					leagueId,
					playerId: playerId6,
					firstName: firstName6,
					middleInitial: middleInitial6,
					lastName: lastName6,
					rosterId,
					teamName,
					leagueName,
					session,
					year,
					number: playerNumber6,
					goals: 0,
					assists: 0,
				})
			}
			try {
				await createdRosterPlayer6.save()
			} catch (err) {
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				const error = new HttpError(
					'Could not add player6 to team.  Maybe a missing Number?',
					500
				)
				return next(error)
			}
		}
	}
	//**************************************************************************** */
	//
	//   Adding Roster Player 7
	//
	//**************************************************************************** */
	let playerId7
	let foundPlayer7
	if (firstName7) {
		if (!middleInitial7) {
			try {
				foundPlayer7 = await Player.findOne({
					firstName: firstName7,
					lastName: lastName7,
				})
			} catch (err) {
				const error = new HttpError(
					'Could not find player to obtain playerId7',
					500
				)
				return next(error)
			}
			playerId7 = foundPlayer7.id
		}

		if (middleInitial7) {
			try {
				foundPlayer7 = await Player.findOne({
					firstName: firstName7,
					lastName: lastName7,
					middleInitial: middleInitial7,
				})
			} catch (err) {
				const error = new HttpError(
					'Could not find player to obtain playerId7',
					500
				)
				return next(error)
			}
			playerId7 = foundPlayer7.id
		}
		//
		//
		//Before we add this player, let's make sure he doesnt already exist on the team
		const playerExists7 = await RosterPlayer.findOne({
			playerId: playerId7,
			rosterId: rosterId,
			//number: number,
		})
		//If the player exists, we want to display an error saying such, and include the player name
		let existingPlayerName7
		if (playerExists7) {
			existingPlayerName7 = firstName7 + ' ' + middleInitial7 + ' ' + lastName7
			console.log('Player7 Exists: ' + existingPlayerName7)
		}
		//
		//Should have everything we need now to create a new RosterPlayer item.
		//let createdRosterPlayer7
		if (!middleInitial7) {
			if (playerExists7) {
				console.log('Player 7 already exists!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				const error = new HttpError(
					existingPlayerName7 +
						' already exists on this team. Start the form over, but do not include ' +
						existingPlayerName7,
					409
				)
				return next(error)
			} else if (firstName7 && !playerNumber7) {
				console.log('Player 7 is missing a number!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				const error = new HttpError(
					'Please enter a jersey number for player 7',
					409
				)
				return next(error)
			} else {
				createdRosterPlayer7 = new RosterPlayer({
					leagueId,
					playerId: playerId7,
					firstName: firstName7,
					middleInitial: ' ',
					lastName: lastName7,
					rosterId,
					teamName,
					leagueName,
					session,
					year,
					number: playerNumber7,
					goals: 0,
					assists: 0,
				})
			}
			try {
				await createdRosterPlayer7.save()
			} catch (err) {
				const error = new HttpError(
					'Could not add player7 to team.  Maybe a missing Number?',
					500
				)
				//const error = new HttpError(err, 500)
				return next(error)
			}
		}

		if (middleInitial7) {
			if (playerExists7) {
				console.log('Player7 already exists!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				const error = new HttpError(
					existingPlayerName7 +
						' already exists on this team. Start the form over, but do not include ' +
						existingPlayerName7,
					409
				)
				return next(error)
			} else if (firstName7 && !playerNumber7) {
				console.log('Player 7 is missing a number!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				const error = new HttpError(
					'Please enter a jersey number for player 7',
					409
				)
				return next(error)
			} else {
				createdRosterPlayer7 = new RosterPlayer({
					leagueId,
					playerId: playerId7,
					firstName: firstName7,
					middleInitial: middleInitial7,
					lastName: lastName7,
					rosterId,
					teamName,
					leagueName,
					session,
					year,
					number: playerNumber7,
					goals: 0,
					assists: 0,
				})
			}
			try {
				await createdRosterPlayer7.save()
			} catch (err) {
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				const error = new HttpError(
					'Could not add player7 to team.  Maybe a missing Number?',
					500
				)
				//const error = new HttpError(err, 500)
				return next(error)
			}
		}
	}
	//**************************************************************************** */
	//
	//   Adding Roster Player 8
	//
	//**************************************************************************** */
	let playerId8
	let foundPlayer8
	if (firstName8) {
		if (!middleInitial8) {
			try {
				foundPlayer8 = await Player.findOne({
					firstName: firstName8,
					lastName: lastName8,
				})
			} catch (err) {
				const error = new HttpError(
					'Could not find player to obtain playerId8',
					500
				)
				return next(error)
			}
			playerId8 = foundPlayer8.id
		}

		if (middleInitial8) {
			try {
				foundPlayer8 = await Player.findOne({
					firstName: firstName8,
					lastName: lastName8,
					middleInitial: middleInitial8,
				})
			} catch (err) {
				const error = new HttpError(
					'Could not find player to obtain playerId8',
					500
				)
				return next(error)
			}
			playerId8 = foundPlayer8.id
		}
		//
		//
		//Before we add this player, let's make sure he doesnt already exist on the team
		const playerExists8 = await RosterPlayer.findOne({
			playerId: playerId8,
			rosterId: rosterId,
			//number: number,
		})
		//If the player exists, we want to display an error saying such, and include the player name
		let existingPlayerName8
		if (playerExists8) {
			existingPlayerName8 = firstName8 + ' ' + middleInitial8 + ' ' + lastName8
			console.log('Player8 Exists: ' + existingPlayerName8)
		}
		//
		//Should have everything we need now to create a new RosterPlayer item.
		//let createdRosterPlayer8
		if (!middleInitial8) {
			if (playerExists8) {
				console.log('Player 8 already exists!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				const error = new HttpError(
					existingPlayerName8 +
						' already exists on this team. Start the form over, but do not include ' +
						existingPlayerName8,
					409
				)
				return next(error)
			} else if (firstName8 && !playerNumber8) {
				console.log('Player 8 is missing a number!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				const error = new HttpError(
					'Please enter a jersey number for player 8',
					409
				)
				return next(error)
			} else {
				createdRosterPlayer8 = new RosterPlayer({
					leagueId,
					playerId: playerId8,
					firstName: firstName8,
					middleInitial: ' ',
					lastName: lastName8,
					rosterId,
					teamName,
					leagueName,
					session,
					year,
					number: playerNumber8,
					goals: 0,
					assists: 0,
				})
			}
			try {
				await createdRosterPlayer8.save()
			} catch (err) {
				const error = new HttpError(
					'Could not add player8 to team.  Maybe a missing Number?',
					500
				)
				//const error = new HttpError(err, 500)
				return next(error)
			}
		}

		if (middleInitial8) {
			if (playerExists8) {
				console.log('Player8 already exists!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				const error = new HttpError(
					existingPlayerName8 +
						' already exists on this team. Start the form over, but do not include ' +
						existingPlayerName8,
					409
				)
				return next(error)
			} else if (firstName8 && !playerNumber8) {
				console.log('Player 8 is missing a number!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				const error = new HttpError(
					'Please enter a jersey number for player 8',
					409
				)
				return next(error)
			} else {
				createdRosterPlayer8 = new RosterPlayer({
					leagueId,
					playerId: playerId8,
					firstName: firstName8,
					middleInitial: middleInitial8,
					lastName: lastName8,
					rosterId,
					teamName,
					leagueName,
					session,
					year,
					number: playerNumber8,
					goals: 0,
					assists: 0,
				})
			}
			try {
				await createdRosterPlayer8.save()
			} catch (err) {
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				const error = new HttpError(
					'Could not add player8 to team.  Maybe a missing Number?',
					500
				)
				//const error = new HttpError(err, 500)
				return next(error)
			}
		}
	}
	//**************************************************************************** */
	//
	//   Adding Roster Player 9
	//
	//**************************************************************************** */
	let playerId9
	let foundPlayer9
	if (firstName9) {
		if (!middleInitial9) {
			try {
				foundPlayer9 = await Player.findOne({
					firstName: firstName9,
					lastName: lastName9,
				})
			} catch (err) {
				const error = new HttpError(
					'Could not find player to obtain playerId9',
					500
				)
				return next(error)
			}
			playerId9 = foundPlayer9.id
		}

		if (middleInitial9) {
			try {
				foundPlayer9 = await Player.findOne({
					firstName: firstName9,
					lastName: lastName9,
					middleInitial: middleInitial9,
				})
			} catch (err) {
				const error = new HttpError(
					'Could not find player to obtain playerId9',
					500
				)
				return next(error)
			}
			playerId9 = foundPlayer9.id
		}
		//
		//
		//Before we add this player, let's make sure he doesnt already exist on the team
		const playerExists9 = await RosterPlayer.findOne({
			playerId: playerId9,
			rosterId: rosterId,
			//number: number,
		})
		//If the player exists, we want to display an error saying such, and include the player name
		let existingPlayerName9
		if (playerExists9) {
			existingPlayerName9 = firstName9 + ' ' + middleInitial9 + ' ' + lastName9
			console.log('Player9 Exists: ' + existingPlayerName9)
		}
		//
		//Should have everything we need now to create a new RosterPlayer item.
		//let createdRosterPlayer9
		if (!middleInitial9) {
			if (playerExists9) {
				console.log('Player 9 already exists!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				createdRosterPlayer8 && createdRosterPlayer8.deleteOne()
				const error = new HttpError(
					existingPlayerName9 +
						' already exists on this team. Start the form over, but do not include ' +
						existingPlayerName9,
					409
				)
				return next(error)
			} else if (firstName9 && !playerNumber9) {
				console.log('Player 9 is missing a number!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				createdRosterPlayer8 && createdRosterPlayer8.deleteOne()
				const error = new HttpError(
					'Please enter a jersey number for player 9',
					409
				)
				return next(error)
			} else {
				createdRosterPlayer9 = new RosterPlayer({
					leagueId,
					playerId: playerId9,
					firstName: firstName9,
					middleInitial: ' ',
					lastName: lastName9,
					rosterId,
					teamName,
					leagueName,
					session,
					year,
					number: playerNumber9,
					goals: 0,
					assists: 0,
				})
			}
			try {
				await createdRosterPlayer9.save()
			} catch (err) {
				const error = new HttpError(
					'Could not add player9 to team.  Maybe a missing Number?',
					500
				)
				//const error = new HttpError(err, 500)
				return next(error)
			}
		}

		if (middleInitial9) {
			if (playerExists9) {
				console.log('Player9 already exists!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				createdRosterPlayer8 && createdRosterPlayer8.deleteOne()
				const error = new HttpError(
					existingPlayerName9 +
						' already exists on this team. Start the form over, but do not include ' +
						existingPlayerName9,
					409
				)
				return next(error)
			} else if (firstName9 && !playerNumber9) {
				console.log('Player 9 is missing a number!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				createdRosterPlayer8 && createdRosterPlayer8.deleteOne()
				const error = new HttpError(
					'Please enter a jersey number for player 9',
					409
				)
				return next(error)
			} else {
				createdRosterPlayer9 = new RosterPlayer({
					leagueId,
					playerId: playerId9,
					firstName: firstName9,
					middleInitial: middleInitial9,
					lastName: lastName9,
					rosterId,
					teamName,
					leagueName,
					session,
					year,
					number: playerNumber9,
					goals: 0,
					assists: 0,
				})
			}
			try {
				await createdRosterPlayer9.save()
			} catch (err) {
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				createdRosterPlayer8 && createdRosterPlayer8.deleteOne()
				const error = new HttpError(
					'Could not add player9 to team.  Maybe a missing Number?',
					500
				)
				//const error = new HttpError(err, 500)
				return next(error)
			}
		}
	}
	//**************************************************************************** */
	//
	//   Adding Roster Player 10
	//
	//**************************************************************************** */
	let playerId10
	let foundPlayer10
	if (firstName10) {
		if (!middleInitial10) {
			try {
				foundPlayer10 = await Player.findOne({
					firstName: firstName10,
					lastName: lastName10,
				})
			} catch (err) {
				const error = new HttpError(
					'Could not find player to obtain playerId10',
					500
				)
				return next(error)
			}
			playerId10 = foundPlayer10.id
		}

		if (middleInitial10) {
			try {
				foundPlayer10 = await Player.findOne({
					firstName: firstName10,
					lastName: lastName10,
					middleInitial: middleInitial10,
				})
			} catch (err) {
				const error = new HttpError(
					'Could not find player to obtain playerId10',
					500
				)
				return next(error)
			}
			playerId10 = foundPlayer10.id
		}
		//
		//
		//Before we add this player, let's make sure he doesnt already exist on the team
		const playerExists10 = await RosterPlayer.findOne({
			playerId: playerId10,
			rosterId: rosterId,
			//number: number,
		})
		//If the player exists, we want to display an error saying such, and include the player name
		let existingPlayerName10
		if (playerExists10) {
			existingPlayerName10 =
				firstName10 + ' ' + middleInitial10 + ' ' + lastName10
			console.log('Player10 Exists: ' + existingPlayerName10)
		}
		//
		//Should have everything we need now to create a new RosterPlayer item.
		//let createdRosterPlayer10
		if (!middleInitial10) {
			if (playerExists10) {
				console.log('Player 10 already exists!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				createdRosterPlayer8 && createdRosterPlayer8.deleteOne()
				createdRosterPlayer9 && createdRosterPlayer9.deleteOne()
				const error = new HttpError(
					existingPlayerName10 +
						' already exists on this team. Start the form over, but do not include ' +
						existingPlayerName10,
					409
				)
				return next(error)
			} else if (firstName10 && !playerNumber10) {
				console.log('Player 10 is missing a number!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				createdRosterPlayer8 && createdRosterPlayer8.deleteOne()
				createdRosterPlayer9 && createdRosterPlayer9.deleteOne()
				const error = new HttpError(
					'Please enter a jersey number for player 10',
					409
				)
				return next(error)
			} else {
				createdRosterPlayer10 = new RosterPlayer({
					leagueId,
					playerId: playerId10,
					firstName: firstName10,
					middleInitial: ' ',
					lastName: lastName10,
					rosterId,
					teamName,
					leagueName,
					session,
					year,
					number: playerNumber10,
					goals: 0,
					assists: 0,
				})
			}
			try {
				await createdRosterPlayer10.save()
			} catch (err) {
				const error = new HttpError(
					'Could not add player10 to team.  Maybe a missing Number?',
					500
				)
				//const error = new HttpError(err, 500)
				return next(error)
			}
		}

		if (middleInitial10) {
			if (playerExists10) {
				console.log('Player10 already exists!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				createdRosterPlayer8 && createdRosterPlayer8.deleteOne()
				createdRosterPlayer9 && createdRosterPlayer9.deleteOne()
				const error = new HttpError(
					existingPlayerName10 +
						' already exists on this team. Start the form over, but do not include ' +
						existingPlayerName10,
					409
				)
				return next(error)
			} else if (firstName10 && !playerNumber10) {
				console.log('Player 10 is missing a number!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				createdRosterPlayer8 && createdRosterPlayer8.deleteOne()
				createdRosterPlayer9 && createdRosterPlayer9.deleteOne()
				const error = new HttpError(
					'Please enter a jersey number for player 10',
					409
				)
				return next(error)
			} else {
				createdRosterPlayer10 = new RosterPlayer({
					leagueId,
					playerId: playerId10,
					firstName: firstName10,
					middleInitial: middleInitial10,
					lastName: lastName10,
					rosterId,
					teamName,
					leagueName,
					session,
					year,
					number: playerNumber10,
					goals: 0,
					assists: 0,
				})
			}
			try {
				await createdRosterPlayer10.save()
			} catch (err) {
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				createdRosterPlayer8 && createdRosterPlayer8.deleteOne()
				createdRosterPlayer9 && createdRosterPlayer9.deleteOne()
				const error = new HttpError(
					'Could not add player10 to team.  Maybe a missing Number?',
					500
				)
				//const error = new HttpError(err, 500)
				return next(error)
			}
		}
	}
	//**************************************************************************** */
	//
	//   Adding Roster Player 11
	//
	//**************************************************************************** */
	let playerId11
	let foundPlayer11
	if (firstName11) {
		if (!middleInitial11) {
			try {
				foundPlayer11 = await Player.findOne({
					firstName: firstName11,
					lastName: lastName11,
				})
			} catch (err) {
				const error = new HttpError(
					'Could not find player to obtain playerId11',
					500
				)
				return next(error)
			}
			playerId11 = foundPlayer11.id
		}

		if (middleInitial11) {
			try {
				foundPlayer11 = await Player.findOne({
					firstName: firstName11,
					lastName: lastName11,
					middleInitial: middleInitial11,
				})
			} catch (err) {
				const error = new HttpError(
					'Could not find player to obtain playerId11',
					500
				)
				return next(error)
			}
			playerId11 = foundPlayer11.id
		}
		//
		//
		//Before we add this player, let's make sure he doesnt already exist on the team
		const playerExists11 = await RosterPlayer.findOne({
			playerId: playerId11,
			rosterId: rosterId,
			//number: number,
		})
		//If the player exists, we want to display an error saying such, and include the player name
		let existingPlayerName11
		if (playerExists11) {
			existingPlayerName11 =
				firstName11 + ' ' + middleInitial11 + ' ' + lastName11
			console.log('Player11 Exists: ' + existingPlayerName11)
		}
		//
		//Should have everything we need now to create a new RosterPlayer item.
		//let createdRosterPlayer10
		if (!middleInitial11) {
			if (playerExists11) {
				console.log('Player 11 already exists!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				createdRosterPlayer8 && createdRosterPlayer8.deleteOne()
				createdRosterPlayer9 && createdRosterPlayer9.deleteOne()
				createdRosterPlayer10 && createdRosterPlayer10.deleteOne()
				const error = new HttpError(
					existingPlayerName11 +
						' already exists on this team. Start the form over, but do not include ' +
						existingPlayerName11,
					409
				)
				return next(error)
			} else if (firstName11 && !playerNumber11) {
				console.log('Player 11 is missing a number!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				createdRosterPlayer8 && createdRosterPlayer8.deleteOne()
				createdRosterPlayer9 && createdRosterPlayer9.deleteOne()
				createdRosterPlayer10 && createdRosterPlayer10.deleteOne()
				const error = new HttpError(
					'Please enter a jersey number for player 11',
					409
				)
				return next(error)
			} else {
				createdRosterPlayer11 = new RosterPlayer({
					leagueId,
					playerId: playerId11,
					firstName: firstName11,
					middleInitial: ' ',
					lastName: lastName11,
					rosterId,
					teamName,
					leagueName,
					session,
					year,
					number: playerNumber11,
					goals: 0,
					assists: 0,
				})
			}
			try {
				await createdRosterPlayer11.save()
			} catch (err) {
				const error = new HttpError(
					'Could not add player11 to team.  Maybe a missing Number?',
					500
				)
				//const error = new HttpError(err, 500)
				return next(error)
			}
		}

		if (middleInitial11) {
			if (playerExists11) {
				console.log('Player11 already exists!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				createdRosterPlayer8 && createdRosterPlayer8.deleteOne()
				createdRosterPlayer9 && createdRosterPlayer9.deleteOne()
				createdRosterPlayer10 && createdRosterPlayer10.deleteOne()
				const error = new HttpError(
					existingPlayerName11 +
						' already exists on this team. Start the form over, but do not include ' +
						existingPlayerName11,
					409
				)
				return next(error)
			} else if (firstName11 && !playerNumber11) {
				console.log('Player 11 is missing a number!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				createdRosterPlayer8 && createdRosterPlayer8.deleteOne()
				createdRosterPlayer9 && createdRosterPlayer9.deleteOne()
				createdRosterPlayer10 && createdRosterPlayer10.deleteOne()
				const error = new HttpError(
					'Please enter a jersey number for player 11',
					409
				)
				return next(error)
			} else {
				createdRosterPlayer11 = new RosterPlayer({
					leagueId,
					playerId: playerId11,
					firstName: firstName11,
					middleInitial: middleInitial11,
					lastName: lastName11,
					rosterId,
					teamName,
					leagueName,
					session,
					year,
					number: playerNumber11,
					goals: 0,
					assists: 0,
				})
			}
			try {
				await createdRosterPlayer11.save()
			} catch (err) {
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				createdRosterPlayer8 && createdRosterPlayer8.deleteOne()
				createdRosterPlayer9 && createdRosterPlayer9.deleteOne()
				createdRosterPlayer10 && createdRosterPlayer10.deleteOne()
				const error = new HttpError(
					'Could not add player11 to team.  Maybe a missing Number?',
					500
				)
				//const error = new HttpError(err, 500)
				return next(error)
			}
		}
	}
	//**************************************************************************** */
	//
	//   Adding Roster Player 12
	//
	//**************************************************************************** */
	let playerId12
	let foundPlayer12
	if (firstName12) {
		if (!middleInitial12) {
			try {
				foundPlayer12 = await Player.findOne({
					firstName: firstName12,
					lastName: lastName12,
				})
			} catch (err) {
				const error = new HttpError(
					'Could not find player to obtain playerId12',
					500
				)
				return next(error)
			}
			playerId12 = foundPlayer12.id
		}

		if (middleInitial12) {
			try {
				foundPlayer12 = await Player.findOne({
					firstName: firstName12,
					lastName: lastName12,
					middleInitial: middleInitial12,
				})
			} catch (err) {
				const error = new HttpError(
					'Could not find player to obtain playerId12',
					500
				)
				return next(error)
			}
			playerId12 = foundPlayer12.id
		}
		//
		//
		//Before we add this player, let's make sure he doesnt already exist on the team
		const playerExists12 = await RosterPlayer.findOne({
			playerId: playerId12,
			rosterId: rosterId,
			//number: number,
		})
		//If the player exists, we want to display an error saying such, and include the player name
		let existingPlayerName12
		if (playerExists12) {
			existingPlayerName12 =
				firstName12 + ' ' + middleInitial12 + ' ' + lastName12
			console.log('Player12 Exists: ' + existingPlayerName12)
		}
		//
		//Should have everything we need now to create a new RosterPlayer item.
		//let createdRosterPlayer10
		if (!middleInitial12) {
			if (playerExists12) {
				console.log('Player 12 already exists!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				createdRosterPlayer8 && createdRosterPlayer8.deleteOne()
				createdRosterPlayer9 && createdRosterPlayer9.deleteOne()
				createdRosterPlayer10 && createdRosterPlayer10.deleteOne()
				createdRosterPlayer11 && createdRosterPlayer11.deleteOne()
				const error = new HttpError(
					existingPlayerName12 +
						' already exists on this team. Start the form over, but do not include ' +
						existingPlayerName12,
					409
				)
				return next(error)
			} else if (firstName12 && !playerNumber12) {
				console.log('Player 12 is missing a number!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				createdRosterPlayer8 && createdRosterPlayer8.deleteOne()
				createdRosterPlayer9 && createdRosterPlayer9.deleteOne()
				createdRosterPlayer10 && createdRosterPlayer10.deleteOne()
				createdRosterPlayer11 && createdRosterPlayer11.deleteOne()
				const error = new HttpError(
					'Please enter a jersey number for player 12',
					409
				)
				return next(error)
			} else {
				createdRosterPlayer12 = new RosterPlayer({
					leagueId,
					playerId: playerId12,
					firstName: firstName12,
					middleInitial: ' ',
					lastName: lastName12,
					rosterId,
					teamName,
					leagueName,
					session,
					year,
					number: playerNumber12,
					goals: 0,
					assists: 0,
				})
			}
			try {
				await createdRosterPlayer12.save()
			} catch (err) {
				const error = new HttpError(
					'Could not add player12 to team.  Maybe a missing Number?',
					500
				)
				//const error = new HttpError(err, 500)
				return next(error)
			}
		}

		if (middleInitial12) {
			if (playerExists12) {
				console.log('Player12 already exists!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				createdRosterPlayer8 && createdRosterPlayer8.deleteOne()
				createdRosterPlayer9 && createdRosterPlayer9.deleteOne()
				createdRosterPlayer10 && createdRosterPlayer10.deleteOne()
				createdRosterPlayer11 && createdRosterPlayer11.deleteOne()
				const error = new HttpError(
					existingPlayerName12 +
						' already exists on this team. Start the form over, but do not include ' +
						existingPlayerName12,
					409
				)
				return next(error)
			} else if (firstName12 && !playerNumber12) {
				console.log('Player 12 is missing a number!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				createdRosterPlayer8 && createdRosterPlayer8.deleteOne()
				createdRosterPlayer9 && createdRosterPlayer9.deleteOne()
				createdRosterPlayer10 && createdRosterPlayer10.deleteOne()
				createdRosterPlayer11 && createdRosterPlayer11.deleteOne()
				const error = new HttpError(
					'Please enter a jersey number for player 12',
					409
				)
				return next(error)
			} else {
				createdRosterPlayer12 = new RosterPlayer({
					leagueId,
					playerId: playerId12,
					firstName: firstName12,
					middleInitial: middleInitial12,
					lastName: lastName12,
					rosterId,
					teamName,
					leagueName,
					session,
					year,
					number: playerNumber12,
					goals: 0,
					assists: 0,
				})
			}
			try {
				await createdRosterPlayer12.save()
			} catch (err) {
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				createdRosterPlayer8 && createdRosterPlayer8.deleteOne()
				createdRosterPlayer9 && createdRosterPlayer9.deleteOne()
				createdRosterPlayer10 && createdRosterPlayer10.deleteOne()
				createdRosterPlayer11 && createdRosterPlayer11.deleteOne()
				const error = new HttpError(
					'Could not add player12 to team.  Maybe a missing Number?',
					500
				)
				//const error = new HttpError(err, 500)
				return next(error)
			}
		}
	}
	//**************************************************************************** */
	//
	//   Adding Roster Player 13
	//
	//**************************************************************************** */
	let playerId13
	let foundPlayer13
	if (firstName13) {
		if (!middleInitial13) {
			try {
				foundPlayer13 = await Player.findOne({
					firstName: firstName13,
					lastName: lastName13,
				})
			} catch (err) {
				const error = new HttpError(
					'Could not find player to obtain playerId13',
					500
				)
				return next(error)
			}
			playerId13 = foundPlayer13.id
		}

		if (middleInitial13) {
			try {
				foundPlayer13 = await Player.findOne({
					firstName: firstName13,
					lastName: lastName13,
					middleInitial: middleInitial13,
				})
			} catch (err) {
				const error = new HttpError(
					'Could not find player to obtain playerId13',
					500
				)
				return next(error)
			}
			playerId13 = foundPlayer13.id
		}
		//
		//
		//Before we add this player, let's make sure he doesnt already exist on the team
		const playerExists13 = await RosterPlayer.findOne({
			playerId: playerId13,
			rosterId: rosterId,
			//number: number,
		})
		//If the player exists, we want to display an error saying such, and include the player name
		let existingPlayerName13
		if (playerExists13) {
			existingPlayerName13 =
				firstName13 + ' ' + middleInitial13 + ' ' + lastName13
			console.log('Player13 Exists: ' + existingPlayerName13)
		}
		//
		//Should have everything we need now to create a new RosterPlayer item.
		//let createdRosterPlayer10
		if (!middleInitial13) {
			if (playerExists13) {
				console.log('Player 13 already exists!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				createdRosterPlayer8 && createdRosterPlayer8.deleteOne()
				createdRosterPlayer9 && createdRosterPlayer9.deleteOne()
				createdRosterPlayer10 && createdRosterPlayer10.deleteOne()
				createdRosterPlayer11 && createdRosterPlayer11.deleteOne()
				createdRosterPlayer12 && createdRosterPlayer12.deleteOne()
				const error = new HttpError(
					existingPlayerName13 +
						' already exists on this team. Start the form over, but do not include ' +
						existingPlayerName13,
					409
				)
				return next(error)
			} else if (firstName13 && !playerNumber13) {
				console.log('Player 13 is missing a number!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				createdRosterPlayer8 && createdRosterPlayer8.deleteOne()
				createdRosterPlayer9 && createdRosterPlayer9.deleteOne()
				createdRosterPlayer10 && createdRosterPlayer10.deleteOne()
				createdRosterPlayer11 && createdRosterPlayer11.deleteOne()
				createdRosterPlayer12 && createdRosterPlayer12.deleteOne()
				const error = new HttpError(
					'Please enter a jersey number for player 13',
					409
				)
				return next(error)
			} else {
				createdRosterPlayer13 = new RosterPlayer({
					leagueId,
					playerId: playerId13,
					firstName: firstName13,
					middleInitial: ' ',
					lastName: lastName13,
					rosterId,
					teamName,
					leagueName,
					session,
					year,
					number: playerNumber13,
					goals: 0,
					assists: 0,
				})
			}
			try {
				await createdRosterPlayer13.save()
			} catch (err) {
				const error = new HttpError(
					'Could not add player13 to team.  Maybe a missing Number?',
					500
				)
				//const error = new HttpError(err, 500)
				return next(error)
			}
		}

		if (middleInitial13) {
			if (playerExists13) {
				console.log('Player13 already exists!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				createdRosterPlayer8 && createdRosterPlayer8.deleteOne()
				createdRosterPlayer9 && createdRosterPlayer9.deleteOne()
				createdRosterPlayer10 && createdRosterPlayer10.deleteOne()
				createdRosterPlayer11 && createdRosterPlayer11.deleteOne()
				createdRosterPlayer12 && createdRosterPlayer12.deleteOne()
				const error = new HttpError(
					existingPlayerName13 +
						' already exists on this team. Start the form over, but do not include ' +
						existingPlayerName13,
					409
				)
				return next(error)
			} else if (firstName13 && !playerNumber13) {
				console.log('Player 13 is missing a number!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				createdRosterPlayer8 && createdRosterPlayer8.deleteOne()
				createdRosterPlayer9 && createdRosterPlayer9.deleteOne()
				createdRosterPlayer10 && createdRosterPlayer10.deleteOne()
				createdRosterPlayer11 && createdRosterPlayer11.deleteOne()
				createdRosterPlayer12 && createdRosterPlayer12.deleteOne()
				const error = new HttpError(
					'Please enter a jersey number for player 13',
					409
				)
				return next(error)
			} else {
				createdRosterPlayer13 = new RosterPlayer({
					leagueId,
					playerId: playerId13,
					firstName: firstName13,
					middleInitial: middleInitial13,
					lastName: lastName13,
					rosterId,
					teamName,
					leagueName,
					session,
					year,
					number: playerNumber13,
					goals: 0,
					assists: 0,
				})
			}
			try {
				await createdRosterPlayer13.save()
			} catch (err) {
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				createdRosterPlayer8 && createdRosterPlayer8.deleteOne()
				createdRosterPlayer9 && createdRosterPlayer9.deleteOne()
				createdRosterPlayer10 && createdRosterPlayer10.deleteOne()
				createdRosterPlayer11 && createdRosterPlayer11.deleteOne()
				createdRosterPlayer12 && createdRosterPlayer12.deleteOne()
				const error = new HttpError(
					'Could not add player13 to team.  Maybe a missing Number?',
					500
				)
				//const error = new HttpError(err, 500)
				return next(error)
			}
		}
	}
	//Now, if we make it this far, let's increment assignedPlayers. One by one
	if (createdRosterPlayer1) {
		foundTeam.assignedPlayers++
		try {
			await foundTeam.save()
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
	}
	if (createdRosterPlayer2) {
		foundTeam.assignedPlayers++
		try {
			await foundTeam.save()
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
	}
	if (createdRosterPlayer3) {
		foundTeam.assignedPlayers++
		try {
			await foundTeam.save()
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
	}
	if (createdRosterPlayer4) {
		foundTeam.assignedPlayers++
		try {
			await foundTeam.save()
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
	}
	if (createdRosterPlayer5) {
		foundTeam.assignedPlayers++
		try {
			await foundTeam.save()
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
	}
	if (createdRosterPlayer6) {
		foundTeam.assignedPlayers++
		try {
			await foundTeam.save()
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
	}
	if (createdRosterPlayer7) {
		foundTeam.assignedPlayers++
		try {
			await foundTeam.save()
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
	}
	if (createdRosterPlayer8) {
		foundTeam.assignedPlayers++
		try {
			await foundTeam.save()
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
	}
	if (createdRosterPlayer9) {
		foundTeam.assignedPlayers++
		try {
			await foundTeam.save()
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
	}
	if (createdRosterPlayer10) {
		foundTeam.assignedPlayers++
		try {
			await foundTeam.save()
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
	}
	if (createdRosterPlayer11) {
		foundTeam.assignedPlayers++
		try {
			await foundTeam.save()
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
	}
	if (createdRosterPlayer12) {
		foundTeam.assignedPlayers++
		try {
			await foundTeam.save()
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
	}
	if (createdRosterPlayer13) {
		foundTeam.assignedPlayers++
		try {
			await foundTeam.save()
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
	}

	//Now - we need to incremement that teams assignedPlayers value

	res.status(201).json({
		player1: createdRosterPlayer1,
		player2: createdRosterPlayer2,
		player3: createdRosterPlayer3,
		player4: createdRosterPlayer4,
		player5: createdRosterPlayer5,
		player6: createdRosterPlayer6,
		player7: createdRosterPlayer7,
		player8: createdRosterPlayer8,
		player9: createdRosterPlayer9,
		player10: createdRosterPlayer10,
		player11: createdRosterPlayer11,
		player12: createdRosterPlayer12,
		player13: createdRosterPlayer13,
	})
}
//
//
//
//
//
//
//
//
//****************************************************************************************** */
//
//	addPlayerToTeamWithDivision
//
//We're not creating a new player here, we're creating a new
//rostered player for a specific team.  This player already exists
//in the system somewhere. We need to find the roster for the team
//in question, and we need to find the player's playerId.  Then,
//we can create a new RosterPlayer item.
//
//****************************************************************************************** */
const addPlayerToTeamWithDivision = async (req, res, next) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		console.log(errors)
		const error = new HttpError(
			errors ||
				'Invalid inputs.  Something is empty in addPlayerToTeamWithDivision',
			422
		)
	}

	const leagueName = req.params.leagueName
	const divisionName = req.params.divisionName
	const session = req.params.session
	const year = req.params.year
	const teamName = req.params.teamName

	//First, let's find the leagueId:
	let leagueId
	let foundLeague
	try {
		foundLeague = await League.findOne({
			leagueName: leagueName,
			divisionName: divisionName,
			session: session,
			year: year,
		}).orFail()
	} catch (err) {
		const error = new HttpError(
			'Could not find league to obtain leagueId. addPlayerToTeamWithDivision',
			500
		)
		return next(error)
	}
	leagueId = foundLeague.id
	//
	//
	//Next, let's find the teamId:
	let teamId
	let foundTeam
	try {
		foundTeam = await Team.findOne({
			leagueId: leagueId,
			teamName: teamName,
			divisionName: divisionName,
		}).orFail()
	} catch (err) {
		const error = new HttpError(
			'Could not find team to obtain teamId 3.  addPlayerToTeamWithDivision',
			500
		)
		return next(error)
	}
	teamId = foundTeam.id
	//
	//
	//Now that we have our leagueId and teamId, let's find the rosterId
	let rosterId
	let foundRoster
	try {
		foundRoster = await Roster.findOne({
			leagueId: leagueId,
			teamId: teamId,
			divisionName: divisionName,
		}).orFail()
	} catch (err) {
		const error = new HttpError(
			'Could not find roster to obtain rosterId.  addPlayerToTeamWithDivision'
		)
		return next(error)
	}
	rosterId = foundRoster.id
	//
	//
	//Now we have the rosterId, but we still need the playerId.
	//So let's rip the following out of the request body:
	const {
		lastName1,
		lastName2,
		lastName3,
		lastName4,
		lastName5,
		lastName6,
		lastName7,
		lastName8,
		lastName9,
		lastName10,
		lastName11,
		lastName12,
		lastName13,
		firstName1,
		firstName2,
		firstName3,
		firstName4,
		firstName5,
		firstName6,
		firstName7,
		firstName8,
		firstName9,
		firstName10,
		firstName11,
		firstName12,
		firstName13,
		middleInitial1,
		middleInitial2,
		middleInitial3,
		middleInitial4,
		middleInitial5,
		middleInitial6,
		middleInitial7,
		middleInitial8,
		middleInitial9,
		middleInitial10,
		middleInitial11,
		middleInitial12,
		middleInitial13,
		playerNumber1,
		playerNumber2,
		playerNumber3,
		playerNumber4,
		playerNumber5,
		playerNumber6,
		playerNumber7,
		playerNumber8,
		playerNumber9,
		playerNumber10,
		playerNumber11,
		playerNumber12,
		playerNumber13,
	} = req.body

	//********************************************************************************* */
	//
	//   Adding Roster Player 1
	//   Need to get the playerId first
	//   Then we need to check to see if the player already exists.  If so, throw alert
	//   If not, then we create a new roster player, either
	//      WITH or WITHOUT middleInitial
	//
	//********************************************************************************* */
	let playerId1
	let foundPlayer1
	if (!middleInitial1) {
		try {
			foundPlayer1 = await Player.findOne({
				firstName: firstName1,
				lastName: lastName1,
			})
		} catch (err) {
			const error = new HttpError(
				'Could not find player1 to obtain playerId1',
				500
			)
			return next(error)
		}
		playerId1 = foundPlayer1.id
	}

	if (middleInitial1) {
		try {
			foundPlayer1 = await Player.findOne({
				firstName: firstName1,
				lastName: lastName1,
				middleInitial: middleInitial1,
			})
		} catch (err) {
			const error = new HttpError(
				'Could not find player1 to obtain playerId1',
				500
			)
			return next(error)
		}
		playerId1 = foundPlayer1.id
	}
	//
	//
	//Before we add this player, let's make sure he doesnt already exist on the team
	const playerExists1 = await RosterPlayer.findOne({
		playerId: playerId1,
		rosterId: rosterId,
		//number: number,
	})
	//If the player exists, we want to display an error saying such, and include the player name
	let existingPlayerName1
	if (playerExists1) {
		existingPlayerName1 = firstName1 + ' ' + middleInitial1 + ' ' + lastName1
		console.log('Player1 Exists: ' + existingPlayerName1)
	}
	//
	//Should have everything we need now to create a new RosterPlayer item.
	let createdRosterPlayer1,
		createdRosterPlayer2,
		createdRosterPlayer3,
		createdRosterPlayer4,
		createdRosterPlayer5,
		createdRosterPlayer6,
		createdRosterPlayer7,
		createdRosterPlayer8,
		createdRosterPlayer9,
		createdRosterPlayer10,
		createdRosterPlayer11,
		createdRosterPlayer12,
		createdRosterPlayer13
	if (!middleInitial1) {
		if (playerExists1) {
			console.log('Player1 already exists!')
			const error = new HttpError(
				existingPlayerName1 +
					' already exists on this team. Start the form over, but do not include ' +
					existingPlayerName1,
				409
			)
			return next(error)
		} else {
			createdRosterPlayer1 = new RosterPlayer({
				leagueId,
				playerId: playerId1,
				firstName: firstName1,
				middleInitial: ' ',
				lastName: lastName1,
				rosterId,
				teamName,
				leagueName,
				divisionName,
				session,
				year,
				number: playerNumber1,
				goals: 0,
				assists: 0,
			})
		}

		try {
			await createdRosterPlayer1.save()
		} catch (err) {
			//const error = new HttpError('Could not add player1 to team (1)', 500)
			const error = new HttpError(err, 500)
			return next(error)
		}
	}

	if (middleInitial1) {
		if (playerExists1) {
			console.log('Player already exists!')
			const error = new HttpError(
				existingPlayerName1 +
					' already exists on this team. Start the form over, but do not include ' +
					existingPlayerName1,
				409
			)
			return next(error)
		} else {
			createdRosterPlayer1 = new RosterPlayer({
				leagueId,
				playerId: playerId1,
				firstName: firstName1,
				middleInitial: middleInitial1,
				lastName: lastName1,
				rosterId,
				teamName,
				leagueName,
				divisionName,
				session,
				year,
				number: playerNumber1,
				goals: 0,
				assists: 0,
			})
		}
		try {
			await createdRosterPlayer1.save()
		} catch (err) {
			//const error = new HttpError('Could not add player1 to team (2)', 500)
			const error = new HttpError(err, 500)
			return next(error)
		}
	}

	//**************************************************************************** */
	//
	//   Adding Roster Player 2
	//
	//**************************************************************************** */
	let playerId2
	let foundPlayer2
	if (firstName2) {
		if (!middleInitial2) {
			try {
				foundPlayer2 = await Player.findOne({
					firstName: firstName2,
					lastName: lastName2,
				})
			} catch (err) {
				const error = new HttpError(
					'Could not find player to obtain playerId2',
					500
				)
				return next(error)
			}
			playerId2 = foundPlayer2.id
		}

		if (middleInitial2) {
			try {
				foundPlayer2 = await Player.findOne({
					firstName: firstName2,
					lastName: lastName2,
					middleInitial: middleInitial2,
				})
			} catch (err) {
				const error = new HttpError(
					'Could not find player to obtain playerId2',
					500
				)
				return next(error)
			}
			playerId2 = foundPlayer2.id
		}
		//
		//
		//Before we add this player, let's make sure he doesnt already exist on the team
		const playerExists2 = await RosterPlayer.findOne({
			playerId: playerId2,
			rosterId: rosterId,
			//number: number,
		})
		//If the player exists, we want to display an error saying such, and include the player name
		let existingPlayerName2
		if (playerExists2) {
			existingPlayerName2 = firstName2 + ' ' + middleInitial2 + ' ' + lastName2
			console.log('Player Exists: ' + existingPlayerName2)
		}
		//
		//Should have everything we need now to create a new RosterPlayer item.
		//let createdRosterPlayer2
		if (!middleInitial2) {
			if (playerExists2) {
				console.log('Player already exists!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				const error = new HttpError(
					existingPlayerName2 +
						' already exists on this team. Start the form over, but do not include ' +
						existingPlayerName2,
					409
				)
				return next(error)
			} else if (firstName2 && !playerNumber2) {
				console.log('Player 2 is missing a number!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				const error = new HttpError(
					'Please enter a jersey number for player 2',
					409
				)
				return next(error)
			} else {
				createdRosterPlayer2 = new RosterPlayer({
					leagueId,
					playerId: playerId2,
					firstName: firstName2,
					middleInitial: ' ',
					lastName: lastName2,
					rosterId,
					teamName,
					leagueName,
					divisionName,
					session,
					year,
					number: playerNumber2,
					goals: 0,
					assists: 0,
				})
			}
			try {
				await createdRosterPlayer2.save()
			} catch (err) {
				const error = new HttpError('Could not add player2 to team.', 500)
				//const error = new HttpError(err, 500)
				return next(error)
			}
		}

		if (middleInitial2) {
			if (playerExists2) {
				console.log('Player already exists!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				const error = new HttpError(
					existingPlayerName2 +
						' already exists on this team. Start the form over, but do not include ' +
						existingPlayerName2,
					409
				)
				return next(error)
			} else if (firstName2 && !playerNumber2) {
				console.log('Player 2 is missing a number!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				const error = new HttpError(
					'Please enter a jersey number for player 2',
					409
				)
				return next(error)
			} else {
				createdRosterPlayer2 = new RosterPlayer({
					leagueId,
					playerId: playerId2,
					firstName: firstName2,
					middleInitial: middleInitial2,
					lastName: lastName2,
					rosterId,
					teamName,
					leagueName,
					divisionName,
					session,
					year,
					number: playerNumber2,
					goals: 0,
					assists: 0,
				})
			}
			try {
				await createdRosterPlayer2.save()
			} catch (err) {
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				const error = new HttpError('Could not add player2 to team.', 500)
				//const error = new HttpError(err, 500)
				return next(error)
			}
		}
	}

	//**************************************************************************** */
	//
	//   Adding Roster Player 3
	//
	//**************************************************************************** */
	let playerId3
	let foundPlayer3
	if (firstName3) {
		if (!middleInitial3) {
			try {
				foundPlayer3 = await Player.findOne({
					firstName: firstName3,
					lastName: lastName3,
				})
			} catch (err) {
				const error = new HttpError(
					'Could not find player to obtain playerId3',
					500
				)
				return next(error)
			}
			playerId3 = foundPlayer3.id
		}

		if (middleInitial3) {
			try {
				foundPlayer3 = await Player.findOne({
					firstName: firstName3,
					lastName: lastName3,
					middleInitial: middleInitial3,
				})
			} catch (err) {
				const error = new HttpError(
					'Could not find player to obtain playerId3',
					500
				)
				return next(error)
			}
			playerId3 = foundPlayer3.id
		}
		//
		//
		//Before we add this player, let's make sure he doesnt already exist on the team
		const playerExists3 = await RosterPlayer.findOne({
			playerId: playerId3,
			rosterId: rosterId,
			//number: number,
		})
		//If the player exists, we want to display an error saying such, and include the player name
		let existingPlayerName3
		if (playerExists3) {
			existingPlayerName3 = firstName3 + ' ' + middleInitial3 + ' ' + lastName3
			console.log('Player Exists: ' + existingPlayerName3)
		}
		//
		//Should have everything we need now to create a new RosterPlayer item.
		//let createdRosterPlayer3
		if (!middleInitial3) {
			if (playerExists3) {
				console.log('Player 3 already exists!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				const error = new HttpError(
					existingPlayerName3 +
						' already exists on this team. Start the form over, but do not include ' +
						existingPlayerName3,
					409
				)
				return next(error)
			} else if (firstName3 && !playerNumber3) {
				console.log('Player 3 is missing a number!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				const error = new HttpError(
					'Please enter a jersey number for player 3',
					409
				)
				return next(error)
			} else {
				createdRosterPlayer3 = new RosterPlayer({
					leagueId,
					playerId: playerId3,
					firstName: firstName3,
					middleInitial: ' ',
					lastName: lastName3,
					rosterId,
					teamName,
					leagueName,
					divisionName,
					session,
					year,
					number: playerNumber3,
					goals: 0,
					assists: 0,
				})
			}
			try {
				await createdRosterPlayer3.save()
			} catch (err) {
				const error = new HttpError('Could not add player3 to team.', 500)
				//const error = new HttpError(err, 500)
				return next(error)
			}
		}

		if (middleInitial3) {
			if (playerExists3) {
				console.log('Player3 already exists!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				const error = new HttpError(
					existingPlayerName3 +
						' already exists on this team. Start the form over, but do not include ' +
						existingPlayerName3,
					409
				)
				return next(error)
			} else if (firstName3 && !playerNumber3) {
				console.log('Player 3 is missing a number!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				const error = new HttpError(
					'Please enter a jersey number for player 3',
					409
				)
				return next(error)
			} else {
				createdRosterPlayer3 = new RosterPlayer({
					leagueId,
					playerId: playerId3,
					firstName: firstName3,
					middleInitial: middleInitial3,
					lastName: lastName3,
					rosterId,
					teamName,
					leagueName,
					divisionName,
					session,
					year,
					number: playerNumber3,
					goals: 0,
					assists: 0,
				})
			}
			try {
				await createdRosterPlayer3.save()
			} catch (err) {
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				const error = new HttpError('Could not add player3 to team.', 500)
				//const error = new HttpError(err, 500)
				return next(error)
			}
		}
	}
	//**************************************************************************** */
	//
	//   Adding Roster Player 4
	//
	//**************************************************************************** */
	let playerId4
	let foundPlayer4
	if (firstName4) {
		if (!middleInitial4) {
			try {
				foundPlayer4 = await Player.findOne({
					firstName: firstName4,
					lastName: lastName4,
				})
			} catch (err) {
				const error = new HttpError(
					'Could not find player to obtain playerId4',
					500
				)
				return next(error)
			}
			playerId4 = foundPlayer4.id
		}

		if (middleInitial4) {
			try {
				foundPlayer4 = await Player.findOne({
					firstName: firstName4,
					lastName: lastName4,
					middleInitial: middleInitial4,
				})
			} catch (err) {
				const error = new HttpError(
					'Could not find player to obtain playerId4',
					500
				)
				return next(error)
			}
			playerId4 = foundPlayer4.id
		}
		//
		//
		//Before we add this player, let's make sure he doesnt already exist on the team
		const playerExists4 = await RosterPlayer.findOne({
			playerId: playerId4,
			rosterId: rosterId,
			//number: number,
		})
		//If the player exists, we want to display an error saying such, and include the player name
		let existingPlayerName4
		if (playerExists4) {
			existingPlayerName4 = firstName4 + ' ' + middleInitial4 + ' ' + lastName4
			console.log('Player4 Exists: ' + existingPlayerName4)
		}
		//
		//Should have everything we need now to create a new RosterPlayer item.
		//let createdRosterPlayer4
		if (!middleInitial4) {
			if (playerExists4) {
				console.log('Player 4 already exists!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				const error = new HttpError(
					existingPlayerName4 +
						' already exists on this team. Start the form over, but do not include ' +
						existingPlayerName4,
					409
				)
				return next(error)
			} else if (firstName4 && !playerNumber4) {
				console.log('Player 4 is missing a number!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				const error = new HttpError(
					'Please enter a jersey number for player 4',
					409
				)
				return next(error)
			} else {
				createdRosterPlayer4 = new RosterPlayer({
					leagueId,
					playerId: playerId4,
					firstName: firstName4,
					middleInitial: ' ',
					lastName: lastName4,
					rosterId,
					teamName,
					leagueName,
					divisionName,
					session,
					year,
					number: playerNumber4,
					goals: 0,
					assists: 0,
				})
			}
			try {
				await createdRosterPlayer4.save()
			} catch (err) {
				const error = new HttpError(
					'Could not add player4 to team.  Maybe a missing Number?',
					500
				)
				//const error = new HttpError(err, 500)
				return next(error)
			}
		}

		if (middleInitial4) {
			if (playerExists4) {
				console.log('Player4 already exists!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				const error = new HttpError(
					existingPlayerName4 +
						' already exists on this team. Start the form over, but do not include ' +
						existingPlayerName4,
					409
				)
				return next(error)
			} else if (firstName4 && !playerNumber4) {
				console.log('Player 4 is missing a number!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				const error = new HttpError(
					'Please enter a jersey number for player 4',
					409
				)
				return next(error)
			} else {
				createdRosterPlayer4 = new RosterPlayer({
					leagueId,
					playerId: playerId4,
					firstName: firstName4,
					middleInitial: middleInitial4,
					lastName: lastName4,
					rosterId,
					teamName,
					leagueName,
					divisionName,
					session,
					year,
					number: playerNumber4,
					goals: 0,
					assists: 0,
				})
			}
			try {
				await createdRosterPlayer4.save()
			} catch (err) {
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				const error = new HttpError(
					'Could not add player4 to team.  Maybe a missing Number?',
					500
				)
				//const error = new HttpError(err, 500)
				return next(error)
			}
		}
	}
	//**************************************************************************** */
	//
	//   Adding Roster Player 5
	//
	//**************************************************************************** */
	let playerId5
	let foundPlayer5
	if (firstName5) {
		if (!middleInitial5) {
			try {
				foundPlayer5 = await Player.findOne({
					firstName: firstName5,
					lastName: lastName5,
				})
			} catch (err) {
				const error = new HttpError(
					'Could not find player to obtain playerId5',
					500
				)
				return next(error)
			}
			playerId5 = foundPlayer5.id
		}

		if (middleInitial5) {
			try {
				foundPlayer5 = await Player.findOne({
					firstName: firstName5,
					lastName: lastName5,
					middleInitial: middleInitial5,
				})
			} catch (err) {
				const error = new HttpError(
					'Could not find player to obtain playerId5',
					500
				)
				return next(error)
			}
			playerId5 = foundPlayer5.id
		}
		//
		//
		//Before we add this player, let's make sure he doesnt already exist on the team
		const playerExists5 = await RosterPlayer.findOne({
			playerId: playerId5,
			rosterId: rosterId,
			//number: number,
		})
		//If the player exists, we want to display an error saying such, and include the player name
		let existingPlayerName5
		if (playerExists5) {
			existingPlayerName5 = firstName5 + ' ' + middleInitial5 + ' ' + lastName5
			console.log('Player5 Exists: ' + existingPlayerName5)
		}
		//
		//Should have everything we need now to create a new RosterPlayer item.
		//let createdRosterPlayer5
		if (!middleInitial5) {
			if (playerExists5) {
				console.log('Player 5 already exists!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				const error = new HttpError(
					existingPlayerName5 +
						' already exists on this team. Start the form over, but do not include ' +
						existingPlayerName5,
					409
				)
				return next(error)
			} else if (firstName5 && !playerNumber5) {
				console.log('Player 5 is missing a number!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				const error = new HttpError(
					'Please enter a jersey number for player 5',
					409
				)
				return next(error)
			} else {
				createdRosterPlayer5 = new RosterPlayer({
					leagueId,
					playerId: playerId5,
					firstName: firstName5,
					middleInitial: ' ',
					lastName: lastName5,
					rosterId,
					teamName,
					leagueName,
					divisionName,
					session,
					year,
					number: playerNumber5,
					goals: 0,
					assists: 0,
				})
			}
			try {
				await createdRosterPlayer5.save()
			} catch (err) {
				const error = new HttpError(
					'Could not add player5 to team.  Maybe a missing Number?',
					500
				)
				//const error = new HttpError(err, 500)
				return next(error)
			}
		}

		if (middleInitial5) {
			if (playerExists5) {
				console.log('Player5 already exists!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				const error = new HttpError(
					existingPlayerName5 +
						' already exists on this team. Start the form over, but do not include ' +
						existingPlayerName5,
					409
				)
				return next(error)
			} else if (firstName5 && !playerNumber5) {
				console.log('Player 5 is missing a number!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				const error = new HttpError(
					'Please enter a jersey number for player 5',
					409
				)
				return next(error)
			} else {
				createdRosterPlayer5 = new RosterPlayer({
					leagueId,
					playerId: playerId5,
					firstName: firstName5,
					middleInitial: middleInitial5,
					lastName: lastName5,
					rosterId,
					teamName,
					leagueName,
					divisionName,
					session,
					year,
					number: playerNumber5,
					goals: 0,
					assists: 0,
				})
			}
			try {
				await createdRosterPlayer5.save()
			} catch (err) {
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				const error = new HttpError(
					'Could not add player5 to team.  Maybe a missing Number?',
					500
				)
				//const error = new HttpError(err, 500)
				return next(error)
			}
		}
	}
	//**************************************************************************** */
	//
	//   Adding Roster Player 6
	//
	//**************************************************************************** */
	let playerId6
	let foundPlayer6
	if (firstName6) {
		if (!middleInitial6) {
			try {
				foundPlayer6 = await Player.findOne({
					firstName: firstName6,
					lastName: lastName6,
				})
			} catch (err) {
				const error = new HttpError(
					'Could not find player to obtain playerId6',
					500
				)
				return next(error)
			}
			playerId6 = foundPlayer6.id
		}

		if (middleInitial6) {
			try {
				foundPlayer6 = await Player.findOne({
					firstName: firstName6,
					lastName: lastName6,
					middleInitial: middleInitial6,
				})
			} catch (err) {
				const error = new HttpError(
					'Could not find player to obtain playerId6',
					500
				)
				return next(error)
			}
			playerId6 = foundPlayer6.id
		}
		//
		//
		//Before we add this player, let's make sure he doesnt already exist on the team
		const playerExists6 = await RosterPlayer.findOne({
			playerId: playerId6,
			rosterId: rosterId,
			//number: number,
		})
		//If the player exists, we want to display an error saying such, and include the player name
		let existingPlayerName6
		if (playerExists6) {
			existingPlayerName6 = firstName6 + ' ' + middleInitial6 + ' ' + lastName6
			console.log('Player6 Exists: ' + existingPlayerName6)
		}
		//
		//Should have everything we need now to create a new RosterPlayer item.
		//let createdRosterPlayer6
		if (!middleInitial6) {
			if (playerExists6) {
				console.log('Player 6 already exists!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				const error = new HttpError(
					existingPlayerName6 +
						' already exists on this team. Start the form over, but do not include ' +
						existingPlayerName6,
					409
				)
				return next(error)
			} else if (firstName6 && !playerNumber6) {
				console.log('Player 6 is missing a number!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				const error = new HttpError(
					'Please enter a jersey number for player 6',
					409
				)
				return next(error)
			} else {
				createdRosterPlayer6 = new RosterPlayer({
					leagueId,
					playerId: playerId6,
					firstName: firstName6,
					middleInitial: ' ',
					lastName: lastName6,
					rosterId,
					teamName,
					leagueName,
					divisionName,
					session,
					year,
					number: playerNumber6,
					goals: 0,
					assists: 0,
				})
			}
			try {
				await createdRosterPlayer6.save()
			} catch (err) {
				const error = new HttpError(
					'Could not add player6 to team.  Maybe a missing Number?',
					500
				)
				//const error = new HttpError(err, 500)
				return next(error)
			}
		}

		if (middleInitial6) {
			if (playerExists6) {
				console.log('Player6 already exists!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				const error = new HttpError(
					existingPlayerName6 +
						' already exists on this team. Start the form over, but do not include ' +
						existingPlayerName6,
					409
				)
				return next(error)
			} else if (firstName6 && !playerNumber6) {
				console.log('Player 6 is missing a number!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				const error = new HttpError(
					'Please enter a jersey number for player 6',
					409
				)
				return next(error)
			} else {
				createdRosterPlayer6 = new RosterPlayer({
					leagueId,
					playerId: playerId6,
					firstName: firstName6,
					middleInitial: middleInitial6,
					lastName: lastName6,
					rosterId,
					teamName,
					leagueName,
					divisionName,
					session,
					year,
					number: playerNumber6,
					goals: 0,
					assists: 0,
				})
			}
			try {
				await createdRosterPlayer6.save()
			} catch (err) {
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				const error = new HttpError(
					'Could not add player6 to team.  Maybe a missing Number?',
					500
				)
				return next(error)
			}
		}
	}
	//**************************************************************************** */
	//
	//   Adding Roster Player 7
	//
	//**************************************************************************** */
	let playerId7
	let foundPlayer7
	if (firstName7) {
		if (!middleInitial7) {
			try {
				foundPlayer7 = await Player.findOne({
					firstName: firstName7,
					lastName: lastName7,
				})
			} catch (err) {
				const error = new HttpError(
					'Could not find player to obtain playerId7',
					500
				)
				return next(error)
			}
			playerId7 = foundPlayer7.id
		}

		if (middleInitial7) {
			try {
				foundPlayer7 = await Player.findOne({
					firstName: firstName7,
					lastName: lastName7,
					middleInitial: middleInitial7,
				})
			} catch (err) {
				const error = new HttpError(
					'Could not find player to obtain playerId7',
					500
				)
				return next(error)
			}
			playerId7 = foundPlayer7.id
		}
		//
		//
		//Before we add this player, let's make sure he doesnt already exist on the team
		const playerExists7 = await RosterPlayer.findOne({
			playerId: playerId7,
			rosterId: rosterId,
			//number: number,
		})
		//If the player exists, we want to display an error saying such, and include the player name
		let existingPlayerName7
		if (playerExists7) {
			existingPlayerName7 = firstName7 + ' ' + middleInitial7 + ' ' + lastName7
			console.log('Player7 Exists: ' + existingPlayerName7)
		}
		//
		//Should have everything we need now to create a new RosterPlayer item.
		//let createdRosterPlayer7
		if (!middleInitial7) {
			if (playerExists7) {
				console.log('Player 7 already exists!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				const error = new HttpError(
					existingPlayerName7 +
						' already exists on this team. Start the form over, but do not include ' +
						existingPlayerName7,
					409
				)
				return next(error)
			} else if (firstName7 && !playerNumber7) {
				console.log('Player 7 is missing a number!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				const error = new HttpError(
					'Please enter a jersey number for player 7',
					409
				)
				return next(error)
			} else {
				createdRosterPlayer7 = new RosterPlayer({
					leagueId,
					playerId: playerId7,
					firstName: firstName7,
					middleInitial: ' ',
					lastName: lastName7,
					rosterId,
					teamName,
					leagueName,
					divisionName,
					session,
					year,
					number: playerNumber7,
					goals: 0,
					assists: 0,
				})
			}
			try {
				await createdRosterPlayer7.save()
			} catch (err) {
				const error = new HttpError(
					'Could not add player7 to team.  Maybe a missing Number?',
					500
				)
				//const error = new HttpError(err, 500)
				return next(error)
			}
		}

		if (middleInitial7) {
			if (playerExists7) {
				console.log('Player7 already exists!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				const error = new HttpError(
					existingPlayerName7 +
						' already exists on this team. Start the form over, but do not include ' +
						existingPlayerName7,
					409
				)
				return next(error)
			} else if (firstName7 && !playerNumber7) {
				console.log('Player 7 is missing a number!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				const error = new HttpError(
					'Please enter a jersey number for player 7',
					409
				)
				return next(error)
			} else {
				createdRosterPlayer7 = new RosterPlayer({
					leagueId,
					playerId: playerId7,
					firstName: firstName7,
					middleInitial: middleInitial7,
					lastName: lastName7,
					rosterId,
					teamName,
					leagueName,
					divisionName,
					session,
					year,
					number: playerNumber7,
					goals: 0,
					assists: 0,
				})
			}
			try {
				await createdRosterPlayer7.save()
			} catch (err) {
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				const error = new HttpError(
					'Could not add player7 to team.  Maybe a missing Number?',
					500
				)
				//const error = new HttpError(err, 500)
				return next(error)
			}
		}
	}
	//**************************************************************************** */
	//
	//   Adding Roster Player 8
	//
	//**************************************************************************** */
	let playerId8
	let foundPlayer8
	if (firstName8) {
		if (!middleInitial8) {
			try {
				foundPlayer8 = await Player.findOne({
					firstName: firstName8,
					lastName: lastName8,
				})
			} catch (err) {
				const error = new HttpError(
					'Could not find player to obtain playerId8',
					500
				)
				return next(error)
			}
			playerId8 = foundPlayer8.id
		}

		if (middleInitial8) {
			try {
				foundPlayer8 = await Player.findOne({
					firstName: firstName8,
					lastName: lastName8,
					middleInitial: middleInitial8,
				})
			} catch (err) {
				const error = new HttpError(
					'Could not find player to obtain playerId8',
					500
				)
				return next(error)
			}
			playerId8 = foundPlayer8.id
		}
		//
		//
		//Before we add this player, let's make sure he doesnt already exist on the team
		const playerExists8 = await RosterPlayer.findOne({
			playerId: playerId8,
			rosterId: rosterId,
			//number: number,
		})
		//If the player exists, we want to display an error saying such, and include the player name
		let existingPlayerName8
		if (playerExists8) {
			existingPlayerName8 = firstName8 + ' ' + middleInitial8 + ' ' + lastName8
			console.log('Player8 Exists: ' + existingPlayerName8)
		}
		//
		//Should have everything we need now to create a new RosterPlayer item.
		//let createdRosterPlayer8
		if (!middleInitial8) {
			if (playerExists8) {
				console.log('Player 8 already exists!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				const error = new HttpError(
					existingPlayerName8 +
						' already exists on this team. Start the form over, but do not include ' +
						existingPlayerName8,
					409
				)
				return next(error)
			} else if (firstName8 && !playerNumber8) {
				console.log('Player 8 is missing a number!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				const error = new HttpError(
					'Please enter a jersey number for player 8',
					409
				)
				return next(error)
			} else {
				createdRosterPlayer8 = new RosterPlayer({
					leagueId,
					playerId: playerId8,
					firstName: firstName8,
					middleInitial: ' ',
					lastName: lastName8,
					rosterId,
					teamName,
					leagueName,
					divisionName,
					session,
					year,
					number: playerNumber8,
					goals: 0,
					assists: 0,
				})
			}
			try {
				await createdRosterPlayer8.save()
			} catch (err) {
				const error = new HttpError(
					'Could not add player8 to team.  Maybe a missing Number?',
					500
				)
				//const error = new HttpError(err, 500)
				return next(error)
			}
		}

		if (middleInitial8) {
			if (playerExists8) {
				console.log('Player8 already exists!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				const error = new HttpError(
					existingPlayerName8 +
						' already exists on this team. Start the form over, but do not include ' +
						existingPlayerName8,
					409
				)
				return next(error)
			} else if (firstName8 && !playerNumber8) {
				console.log('Player 8 is missing a number!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				const error = new HttpError(
					'Please enter a jersey number for player 8',
					409
				)
				return next(error)
			} else {
				createdRosterPlayer8 = new RosterPlayer({
					leagueId,
					playerId: playerId8,
					firstName: firstName8,
					middleInitial: middleInitial8,
					lastName: lastName8,
					rosterId,
					teamName,
					leagueName,
					divisionName,
					session,
					year,
					number: playerNumber8,
					goals: 0,
					assists: 0,
				})
			}
			try {
				await createdRosterPlayer8.save()
			} catch (err) {
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				const error = new HttpError(
					'Could not add player8 to team.  Maybe a missing Number?',
					500
				)
				//const error = new HttpError(err, 500)
				return next(error)
			}
		}
	}
	//**************************************************************************** */
	//
	//   Adding Roster Player 9
	//
	//**************************************************************************** */
	let playerId9
	let foundPlayer9
	if (firstName9) {
		if (!middleInitial9) {
			try {
				foundPlayer9 = await Player.findOne({
					firstName: firstName9,
					lastName: lastName9,
				})
			} catch (err) {
				const error = new HttpError(
					'Could not find player to obtain playerId9',
					500
				)
				return next(error)
			}
			playerId9 = foundPlayer9.id
		}

		if (middleInitial9) {
			try {
				foundPlayer9 = await Player.findOne({
					firstName: firstName9,
					lastName: lastName9,
					middleInitial: middleInitial9,
				})
			} catch (err) {
				const error = new HttpError(
					'Could not find player to obtain playerId9',
					500
				)
				return next(error)
			}
			playerId9 = foundPlayer9.id
		}
		//
		//
		//Before we add this player, let's make sure he doesnt already exist on the team
		const playerExists9 = await RosterPlayer.findOne({
			playerId: playerId9,
			rosterId: rosterId,
			//number: number,
		})
		//If the player exists, we want to display an error saying such, and include the player name
		let existingPlayerName9
		if (playerExists9) {
			existingPlayerName9 = firstName9 + ' ' + middleInitial9 + ' ' + lastName9
			console.log('Player9 Exists: ' + existingPlayerName9)
		}
		//
		//Should have everything we need now to create a new RosterPlayer item.
		//let createdRosterPlayer9
		if (!middleInitial9) {
			if (playerExists9) {
				console.log('Player 9 already exists!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				createdRosterPlayer8 && createdRosterPlayer8.deleteOne()
				const error = new HttpError(
					existingPlayerName9 +
						' already exists on this team. Start the form over, but do not include ' +
						existingPlayerName9,
					409
				)
				return next(error)
			} else if (firstName9 && !playerNumber9) {
				console.log('Player 9 is missing a number!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				createdRosterPlayer8 && createdRosterPlayer8.deleteOne()
				const error = new HttpError(
					'Please enter a jersey number for player 9',
					409
				)
				return next(error)
			} else {
				createdRosterPlayer9 = new RosterPlayer({
					leagueId,
					playerId: playerId9,
					firstName: firstName9,
					middleInitial: ' ',
					lastName: lastName9,
					rosterId,
					teamName,
					leagueName,
					divisionName,
					session,
					year,
					number: playerNumber9,
					goals: 0,
					assists: 0,
				})
			}
			try {
				await createdRosterPlayer9.save()
			} catch (err) {
				const error = new HttpError(
					'Could not add player9 to team.  Maybe a missing Number?',
					500
				)
				//const error = new HttpError(err, 500)
				return next(error)
			}
		}

		if (middleInitial9) {
			if (playerExists9) {
				console.log('Player9 already exists!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				createdRosterPlayer8 && createdRosterPlayer8.deleteOne()
				const error = new HttpError(
					existingPlayerName9 +
						' already exists on this team. Start the form over, but do not include ' +
						existingPlayerName9,
					409
				)
				return next(error)
			} else if (firstName9 && !playerNumber9) {
				console.log('Player 9 is missing a number!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				createdRosterPlayer8 && createdRosterPlayer8.deleteOne()
				const error = new HttpError(
					'Please enter a jersey number for player 9',
					409
				)
				return next(error)
			} else {
				createdRosterPlayer9 = new RosterPlayer({
					leagueId,
					playerId: playerId9,
					firstName: firstName9,
					middleInitial: middleInitial9,
					lastName: lastName9,
					rosterId,
					teamName,
					leagueName,
					divisionName,
					session,
					year,
					number: playerNumber9,
					goals: 0,
					assists: 0,
				})
			}
			try {
				await createdRosterPlayer9.save()
			} catch (err) {
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				createdRosterPlayer8 && createdRosterPlayer8.deleteOne()
				const error = new HttpError(
					'Could not add player9 to team.  Maybe a missing Number?',
					500
				)
				//const error = new HttpError(err, 500)
				return next(error)
			}
		}
	}
	//**************************************************************************** */
	//
	//   Adding Roster Player 10
	//
	//**************************************************************************** */
	let playerId10
	let foundPlayer10
	if (firstName10) {
		if (!middleInitial10) {
			try {
				foundPlayer10 = await Player.findOne({
					firstName: firstName10,
					lastName: lastName10,
				})
			} catch (err) {
				const error = new HttpError(
					'Could not find player to obtain playerId10',
					500
				)
				return next(error)
			}
			playerId10 = foundPlayer10.id
		}

		if (middleInitial10) {
			try {
				foundPlayer10 = await Player.findOne({
					firstName: firstName10,
					lastName: lastName10,
					middleInitial: middleInitial10,
				})
			} catch (err) {
				const error = new HttpError(
					'Could not find player to obtain playerId10',
					500
				)
				return next(error)
			}
			playerId10 = foundPlayer10.id
		}
		//
		//
		//Before we add this player, let's make sure he doesnt already exist on the team
		const playerExists10 = await RosterPlayer.findOne({
			playerId: playerId10,
			rosterId: rosterId,
			//number: number,
		})
		//If the player exists, we want to display an error saying such, and include the player name
		let existingPlayerName10
		if (playerExists10) {
			existingPlayerName10 =
				firstName10 + ' ' + middleInitial10 + ' ' + lastName10
			console.log('Player10 Exists: ' + existingPlayerName10)
		}
		//
		//Should have everything we need now to create a new RosterPlayer item.
		//let createdRosterPlayer10
		if (!middleInitial10) {
			if (playerExists10) {
				console.log('Player 10 already exists!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				createdRosterPlayer8 && createdRosterPlayer8.deleteOne()
				createdRosterPlayer9 && createdRosterPlayer9.deleteOne()
				const error = new HttpError(
					existingPlayerName10 +
						' already exists on this team. Start the form over, but do not include ' +
						existingPlayerName10,
					409
				)
				return next(error)
			} else if (firstName10 && !playerNumber10) {
				console.log('Player 10 is missing a number!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				createdRosterPlayer8 && createdRosterPlayer8.deleteOne()
				createdRosterPlayer9 && createdRosterPlayer9.deleteOne()
				const error = new HttpError(
					'Please enter a jersey number for player 10',
					409
				)
				return next(error)
			} else {
				createdRosterPlayer10 = new RosterPlayer({
					leagueId,
					playerId: playerId10,
					firstName: firstName10,
					middleInitial: ' ',
					lastName: lastName10,
					rosterId,
					teamName,
					leagueName,
					divisionName,
					session,
					year,
					number: playerNumber10,
					goals: 0,
					assists: 0,
				})
			}
			try {
				await createdRosterPlayer10.save()
			} catch (err) {
				const error = new HttpError(
					'Could not add player10 to team.  Maybe a missing Number?',
					500
				)
				//const error = new HttpError(err, 500)
				return next(error)
			}
		}

		if (middleInitial10) {
			if (playerExists10) {
				console.log('Player10 already exists!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				createdRosterPlayer8 && createdRosterPlayer8.deleteOne()
				createdRosterPlayer9 && createdRosterPlayer9.deleteOne()
				const error = new HttpError(
					existingPlayerName10 +
						' already exists on this team. Start the form over, but do not include ' +
						existingPlayerName10,
					409
				)
				return next(error)
			} else if (firstName10 && !playerNumber10) {
				console.log('Player 10 is missing a number!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				createdRosterPlayer8 && createdRosterPlayer8.deleteOne()
				createdRosterPlayer9 && createdRosterPlayer9.deleteOne()
				const error = new HttpError(
					'Please enter a jersey number for player 10',
					409
				)
				return next(error)
			} else {
				createdRosterPlayer10 = new RosterPlayer({
					leagueId,
					playerId: playerId10,
					firstName: firstName10,
					middleInitial: middleInitial10,
					lastName: lastName10,
					rosterId,
					teamName,
					leagueName,
					divisionName,
					session,
					year,
					number: playerNumber10,
					goals: 0,
					assists: 0,
				})
			}
			try {
				await createdRosterPlayer10.save()
			} catch (err) {
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				createdRosterPlayer8 && createdRosterPlayer8.deleteOne()
				createdRosterPlayer9 && createdRosterPlayer9.deleteOne()
				const error = new HttpError(
					'Could not add player10 to team.  Maybe a missing Number?',
					500
				)
				//const error = new HttpError(err, 500)
				return next(error)
			}
		}
	}
	//**************************************************************************** */
	//
	//   Adding Roster Player 11
	//
	//**************************************************************************** */
	let playerId11
	let foundPlayer11
	if (firstName11) {
		if (!middleInitial11) {
			try {
				foundPlayer11 = await Player.findOne({
					firstName: firstName11,
					lastName: lastName11,
				})
			} catch (err) {
				const error = new HttpError(
					'Could not find player to obtain playerId11',
					500
				)
				return next(error)
			}
			playerId11 = foundPlayer11.id
		}

		if (middleInitial11) {
			try {
				foundPlayer11 = await Player.findOne({
					firstName: firstName11,
					lastName: lastName11,
					middleInitial: middleInitial11,
				})
			} catch (err) {
				const error = new HttpError(
					'Could not find player to obtain playerId11',
					500
				)
				return next(error)
			}
			playerId11 = foundPlayer11.id
		}
		//
		//
		//Before we add this player, let's make sure he doesnt already exist on the team
		const playerExists11 = await RosterPlayer.findOne({
			playerId: playerId11,
			rosterId: rosterId,
			//number: number,
		})
		//If the player exists, we want to display an error saying such, and include the player name
		let existingPlayerName11
		if (playerExists11) {
			existingPlayerName11 =
				firstName11 + ' ' + middleInitial11 + ' ' + lastName11
			console.log('Player11 Exists: ' + existingPlayerName11)
		}
		//
		//Should have everything we need now to create a new RosterPlayer item.
		//let createdRosterPlayer10
		if (!middleInitial11) {
			if (playerExists11) {
				console.log('Player 11 already exists!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				createdRosterPlayer8 && createdRosterPlayer8.deleteOne()
				createdRosterPlayer9 && createdRosterPlayer9.deleteOne()
				createdRosterPlayer10 && createdRosterPlayer10.deleteOne()
				const error = new HttpError(
					existingPlayerName11 +
						' already exists on this team. Start the form over, but do not include ' +
						existingPlayerName11,
					409
				)
				return next(error)
			} else if (firstName11 && !playerNumber11) {
				console.log('Player 11 is missing a number!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				createdRosterPlayer8 && createdRosterPlayer8.deleteOne()
				createdRosterPlayer9 && createdRosterPlayer9.deleteOne()
				createdRosterPlayer10 && createdRosterPlayer10.deleteOne()
				const error = new HttpError(
					'Please enter a jersey number for player 11',
					409
				)
				return next(error)
			} else {
				createdRosterPlayer11 = new RosterPlayer({
					leagueId,
					playerId: playerId11,
					firstName: firstName11,
					middleInitial: ' ',
					lastName: lastName11,
					rosterId,
					teamName,
					leagueName,
					divisionName,
					session,
					year,
					number: playerNumber11,
					goals: 0,
					assists: 0,
				})
			}
			try {
				await createdRosterPlayer11.save()
			} catch (err) {
				const error = new HttpError(
					'Could not add player11 to team.  Maybe a missing Number?',
					500
				)
				//const error = new HttpError(err, 500)
				return next(error)
			}
		}

		if (middleInitial11) {
			if (playerExists11) {
				console.log('Player11 already exists!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				createdRosterPlayer8 && createdRosterPlayer8.deleteOne()
				createdRosterPlayer9 && createdRosterPlayer9.deleteOne()
				createdRosterPlayer10 && createdRosterPlayer10.deleteOne()
				const error = new HttpError(
					existingPlayerName11 +
						' already exists on this team. Start the form over, but do not include ' +
						existingPlayerName11,
					409
				)
				return next(error)
			} else if (firstName11 && !playerNumber11) {
				console.log('Player 11 is missing a number!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				createdRosterPlayer8 && createdRosterPlayer8.deleteOne()
				createdRosterPlayer9 && createdRosterPlayer9.deleteOne()
				createdRosterPlayer10 && createdRosterPlayer10.deleteOne()
				const error = new HttpError(
					'Please enter a jersey number for player 11',
					409
				)
				return next(error)
			} else {
				createdRosterPlayer11 = new RosterPlayer({
					leagueId,
					playerId: playerId11,
					firstName: firstName11,
					middleInitial: middleInitial11,
					lastName: lastName11,
					rosterId,
					teamName,
					leagueName,
					divisionName,
					session,
					year,
					number: playerNumber11,
					goals: 0,
					assists: 0,
				})
			}
			try {
				await createdRosterPlayer11.save()
			} catch (err) {
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				createdRosterPlayer8 && createdRosterPlayer8.deleteOne()
				createdRosterPlayer9 && createdRosterPlayer9.deleteOne()
				createdRosterPlayer10 && createdRosterPlayer10.deleteOne()
				const error = new HttpError(
					'Could not add player11 to team.  Maybe a missing Number?',
					500
				)
				//const error = new HttpError(err, 500)
				return next(error)
			}
		}
	}
	//**************************************************************************** */
	//
	//   Adding Roster Player 12
	//
	//**************************************************************************** */
	let playerId12
	let foundPlayer12
	if (firstName12) {
		if (!middleInitial12) {
			try {
				foundPlayer12 = await Player.findOne({
					firstName: firstName12,
					lastName: lastName12,
				})
			} catch (err) {
				const error = new HttpError(
					'Could not find player to obtain playerId12',
					500
				)
				return next(error)
			}
			playerId12 = foundPlayer12.id
		}

		if (middleInitial12) {
			try {
				foundPlayer12 = await Player.findOne({
					firstName: firstName12,
					lastName: lastName12,
					middleInitial: middleInitial12,
				})
			} catch (err) {
				const error = new HttpError(
					'Could not find player to obtain playerId12',
					500
				)
				return next(error)
			}
			playerId12 = foundPlayer12.id
		}
		//
		//
		//Before we add this player, let's make sure he doesnt already exist on the team
		const playerExists12 = await RosterPlayer.findOne({
			playerId: playerId12,
			rosterId: rosterId,
			//number: number,
		})
		//If the player exists, we want to display an error saying such, and include the player name
		let existingPlayerName12
		if (playerExists12) {
			existingPlayerName12 =
				firstName12 + ' ' + middleInitial12 + ' ' + lastName12
			console.log('Player12 Exists: ' + existingPlayerName12)
		}
		//
		//Should have everything we need now to create a new RosterPlayer item.
		//let createdRosterPlayer10
		if (!middleInitial12) {
			if (playerExists12) {
				console.log('Player 12 already exists!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				createdRosterPlayer8 && createdRosterPlayer8.deleteOne()
				createdRosterPlayer9 && createdRosterPlayer9.deleteOne()
				createdRosterPlayer10 && createdRosterPlayer10.deleteOne()
				createdRosterPlayer11 && createdRosterPlayer11.deleteOne()
				const error = new HttpError(
					existingPlayerName12 +
						' already exists on this team. Start the form over, but do not include ' +
						existingPlayerName12,
					409
				)
				return next(error)
			} else if (firstName12 && !playerNumber12) {
				console.log('Player 12 is missing a number!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				createdRosterPlayer8 && createdRosterPlayer8.deleteOne()
				createdRosterPlayer9 && createdRosterPlayer9.deleteOne()
				createdRosterPlayer10 && createdRosterPlayer10.deleteOne()
				createdRosterPlayer11 && createdRosterPlayer11.deleteOne()
				const error = new HttpError(
					'Please enter a jersey number for player 12',
					409
				)
				return next(error)
			} else {
				createdRosterPlayer12 = new RosterPlayer({
					leagueId,
					playerId: playerId12,
					firstName: firstName12,
					middleInitial: ' ',
					lastName: lastName12,
					rosterId,
					teamName,
					leagueName,
					divisionName,
					session,
					year,
					number: playerNumber12,
					goals: 0,
					assists: 0,
				})
			}
			try {
				await createdRosterPlayer12.save()
			} catch (err) {
				const error = new HttpError(
					'Could not add player12 to team.  Maybe a missing Number?',
					500
				)
				//const error = new HttpError(err, 500)
				return next(error)
			}
		}

		if (middleInitial12) {
			if (playerExists12) {
				console.log('Player12 already exists!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				createdRosterPlayer8 && createdRosterPlayer8.deleteOne()
				createdRosterPlayer9 && createdRosterPlayer9.deleteOne()
				createdRosterPlayer10 && createdRosterPlayer10.deleteOne()
				createdRosterPlayer11 && createdRosterPlayer11.deleteOne()
				const error = new HttpError(
					existingPlayerName12 +
						' already exists on this team. Start the form over, but do not include ' +
						existingPlayerName12,
					409
				)
				return next(error)
			} else if (firstName12 && !playerNumber12) {
				console.log('Player 12 is missing a number!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				createdRosterPlayer8 && createdRosterPlayer8.deleteOne()
				createdRosterPlayer9 && createdRosterPlayer9.deleteOne()
				createdRosterPlayer10 && createdRosterPlayer10.deleteOne()
				createdRosterPlayer11 && createdRosterPlayer11.deleteOne()
				const error = new HttpError(
					'Please enter a jersey number for player 12',
					409
				)
				return next(error)
			} else {
				createdRosterPlayer12 = new RosterPlayer({
					leagueId,
					playerId: playerId12,
					firstName: firstName12,
					middleInitial: middleInitial12,
					lastName: lastName12,
					rosterId,
					teamName,
					leagueName,
					divisionName,
					session,
					year,
					number: playerNumber12,
					goals: 0,
					assists: 0,
				})
			}
			try {
				await createdRosterPlayer12.save()
			} catch (err) {
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				createdRosterPlayer8 && createdRosterPlayer8.deleteOne()
				createdRosterPlayer9 && createdRosterPlayer9.deleteOne()
				createdRosterPlayer10 && createdRosterPlayer10.deleteOne()
				createdRosterPlayer11 && createdRosterPlayer11.deleteOne()
				const error = new HttpError(
					'Could not add player12 to team.  Maybe a missing Number?',
					500
				)
				//const error = new HttpError(err, 500)
				return next(error)
			}
		}
	}
	//**************************************************************************** */
	//
	//   Adding Roster Player 13
	//
	//**************************************************************************** */
	let playerId13
	let foundPlayer13
	if (firstName13) {
		if (!middleInitial13) {
			try {
				foundPlayer13 = await Player.findOne({
					firstName: firstName13,
					lastName: lastName13,
				})
			} catch (err) {
				const error = new HttpError(
					'Could not find player to obtain playerId13',
					500
				)
				return next(error)
			}
			playerId13 = foundPlayer13.id
		}

		if (middleInitial13) {
			try {
				foundPlayer13 = await Player.findOne({
					firstName: firstName13,
					lastName: lastName13,
					middleInitial: middleInitial13,
				})
			} catch (err) {
				const error = new HttpError(
					'Could not find player to obtain playerId13',
					500
				)
				return next(error)
			}
			playerId13 = foundPlayer13.id
		}
		//
		//
		//Before we add this player, let's make sure he doesnt already exist on the team
		const playerExists13 = await RosterPlayer.findOne({
			playerId: playerId13,
			rosterId: rosterId,
			//number: number,
		})
		//If the player exists, we want to display an error saying such, and include the player name
		let existingPlayerName13
		if (playerExists13) {
			existingPlayerName13 =
				firstName13 + ' ' + middleInitial13 + ' ' + lastName13
			console.log('Player13 Exists: ' + existingPlayerName13)
		}
		//
		//Should have everything we need now to create a new RosterPlayer item.
		//let createdRosterPlayer10
		if (!middleInitial13) {
			if (playerExists13) {
				console.log('Player 13 already exists!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				createdRosterPlayer8 && createdRosterPlayer8.deleteOne()
				createdRosterPlayer9 && createdRosterPlayer9.deleteOne()
				createdRosterPlayer10 && createdRosterPlayer10.deleteOne()
				createdRosterPlayer11 && createdRosterPlayer11.deleteOne()
				createdRosterPlayer12 && createdRosterPlayer12.deleteOne()
				const error = new HttpError(
					existingPlayerName13 +
						' already exists on this team. Start the form over, but do not include ' +
						existingPlayerName13,
					409
				)
				return next(error)
			} else if (firstName13 && !playerNumber13) {
				console.log('Player 13 is missing a number!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				createdRosterPlayer8 && createdRosterPlayer8.deleteOne()
				createdRosterPlayer9 && createdRosterPlayer9.deleteOne()
				createdRosterPlayer10 && createdRosterPlayer10.deleteOne()
				createdRosterPlayer11 && createdRosterPlayer11.deleteOne()
				createdRosterPlayer12 && createdRosterPlayer12.deleteOne()
				const error = new HttpError(
					'Please enter a jersey number for player 13',
					409
				)
				return next(error)
			} else {
				createdRosterPlayer13 = new RosterPlayer({
					leagueId,
					playerId: playerId13,
					firstName: firstName13,
					middleInitial: ' ',
					lastName: lastName13,
					rosterId,
					teamName,
					leagueName,
					divisionName,
					session,
					year,
					number: playerNumber13,
					goals: 0,
					assists: 0,
				})
			}
			try {
				await createdRosterPlayer13.save()
			} catch (err) {
				const error = new HttpError(
					'Could not add player13 to team.  Maybe a missing Number?',
					500
				)
				//const error = new HttpError(err, 500)
				return next(error)
			}
		}

		if (middleInitial13) {
			if (playerExists13) {
				console.log('Player13 already exists!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				createdRosterPlayer8 && createdRosterPlayer8.deleteOne()
				createdRosterPlayer9 && createdRosterPlayer9.deleteOne()
				createdRosterPlayer10 && createdRosterPlayer10.deleteOne()
				createdRosterPlayer11 && createdRosterPlayer11.deleteOne()
				createdRosterPlayer12 && createdRosterPlayer12.deleteOne()
				const error = new HttpError(
					existingPlayerName13 +
						' already exists on this team. Start the form over, but do not include ' +
						existingPlayerName13,
					409
				)
				return next(error)
			} else if (firstName13 && !playerNumber13) {
				console.log('Player 13 is missing a number!')
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				createdRosterPlayer8 && createdRosterPlayer8.deleteOne()
				createdRosterPlayer9 && createdRosterPlayer9.deleteOne()
				createdRosterPlayer10 && createdRosterPlayer10.deleteOne()
				createdRosterPlayer11 && createdRosterPlayer11.deleteOne()
				createdRosterPlayer12 && createdRosterPlayer12.deleteOne()
				const error = new HttpError(
					'Please enter a jersey number for player 13',
					409
				)
				return next(error)
			} else {
				createdRosterPlayer13 = new RosterPlayer({
					leagueId,
					playerId: playerId13,
					firstName: firstName13,
					middleInitial: middleInitial13,
					lastName: lastName13,
					rosterId,
					teamName,
					leagueName,
					divisionName,
					session,
					year,
					number: playerNumber13,
					goals: 0,
					assists: 0,
				})
			}
			try {
				await createdRosterPlayer13.save()
			} catch (err) {
				createdRosterPlayer1 && createdRosterPlayer1.deleteOne()
				createdRosterPlayer2 && createdRosterPlayer2.deleteOne()
				createdRosterPlayer3 && createdRosterPlayer3.deleteOne()
				createdRosterPlayer4 && createdRosterPlayer4.deleteOne()
				createdRosterPlayer5 && createdRosterPlayer5.deleteOne()
				createdRosterPlayer6 && createdRosterPlayer6.deleteOne()
				createdRosterPlayer7 && createdRosterPlayer7.deleteOne()
				createdRosterPlayer8 && createdRosterPlayer8.deleteOne()
				createdRosterPlayer9 && createdRosterPlayer9.deleteOne()
				createdRosterPlayer10 && createdRosterPlayer10.deleteOne()
				createdRosterPlayer11 && createdRosterPlayer11.deleteOne()
				createdRosterPlayer12 && createdRosterPlayer12.deleteOne()
				const error = new HttpError(
					'Could not add player13 to team.  Maybe a missing Number?',
					500
				)
				//const error = new HttpError(err, 500)
				return next(error)
			}
		}
	}
	//Now, if we make it this far, let's increment assignedPlayers. One by one
	if (createdRosterPlayer1) {
		foundTeam.assignedPlayers++
		try {
			await foundTeam.save()
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
	}
	if (createdRosterPlayer2) {
		foundTeam.assignedPlayers++
		try {
			await foundTeam.save()
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
	}
	if (createdRosterPlayer3) {
		foundTeam.assignedPlayers++
		try {
			await foundTeam.save()
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
	}
	if (createdRosterPlayer4) {
		foundTeam.assignedPlayers++
		try {
			await foundTeam.save()
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
	}
	if (createdRosterPlayer5) {
		foundTeam.assignedPlayers++
		try {
			await foundTeam.save()
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
	}
	if (createdRosterPlayer6) {
		foundTeam.assignedPlayers++
		try {
			await foundTeam.save()
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
	}
	if (createdRosterPlayer7) {
		foundTeam.assignedPlayers++
		try {
			await foundTeam.save()
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
	}
	if (createdRosterPlayer8) {
		foundTeam.assignedPlayers++
		try {
			await foundTeam.save()
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
	}
	if (createdRosterPlayer9) {
		foundTeam.assignedPlayers++
		try {
			await foundTeam.save()
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
	}
	if (createdRosterPlayer10) {
		foundTeam.assignedPlayers++
		try {
			await foundTeam.save()
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
	}
	if (createdRosterPlayer11) {
		foundTeam.assignedPlayers++
		try {
			await foundTeam.save()
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
	}
	if (createdRosterPlayer12) {
		foundTeam.assignedPlayers++
		try {
			await foundTeam.save()
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
	}
	if (createdRosterPlayer13) {
		foundTeam.assignedPlayers++
		try {
			await foundTeam.save()
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
	}

	//Now - we need to incremement that teams assignedPlayers value

	res.status(201).json({
		player1: createdRosterPlayer1,
		player2: createdRosterPlayer2,
		player3: createdRosterPlayer3,
		player4: createdRosterPlayer4,
		player5: createdRosterPlayer5,
		player6: createdRosterPlayer6,
		player7: createdRosterPlayer7,
		player8: createdRosterPlayer8,
		player9: createdRosterPlayer9,
		player10: createdRosterPlayer10,
		player11: createdRosterPlayer11,
		player12: createdRosterPlayer12,
		player13: createdRosterPlayer13,
	})
}
//
//
//
//
//
//
//
//
//**************************************************************************************** */
//
//This is a PATCH route to change the name of a team
//
//**************************************************************************************** */
const editTeamName = async (req, res, next) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		throw new HttpError(
			'Invalid inputs - something is empty in editTeamName',
			422
		)
	}

	const { teamName, seed } = req.body
	const teamId = req.params.teamId
	const leagueName = req.params.leagueName
	const session = req.params.session
	const year = req.params.year

	//Maybe we just need the teamId for this.......
	let team, leagueId
	try {
		team = await Team.findById(teamId)
	} catch (err) {
		const error = new HttpError('could not find team by team id', 500)
		return next(error)
	}
	leagueId = team.leagueId
	team.teamName = teamName.trim()
	team.seed = seed

	try {
		await team.save()
	} catch (err) {
		const error = new HttpError(
			err,
			//'Something went wrong with updating the team name',
			500
		)
		return next(error)
	}

	//Next, we need to find all the rostered players for this team, and change their teamName
	//To do that, we first need to get the rosterId
	let roster, rosterId
	try {
		roster = await Roster.findOne({
			leagueId: leagueId,
			teamId: teamId,
		})
	} catch (err) {
		const error = new HttpError('could not find roster.  editTeamName', 500)
		return next(error)
	}
	rosterId = roster._id

	//Now that we have the rosterId, let's get all the rosterPlayers
	let rosterPlayers
	try {
		rosterPlayers = await RosterPlayer.find({
			rosterId: rosterId,
		})
	} catch (err) {
		const error = new HttpError(
			'could not find roster players.  editTeamName',
			500
		)
		return next(error)
	}

	console.log('rosterPlayers here: ' + rosterPlayers)

	//Now that we have all the roster players, we can change their team name to the new team name
	rosterPlayers.forEach(async (player) => {
		player.teamName = teamName.trim()
		try {
			await player.save()
		} catch (err) {
			const error = new HttpError(
				err,
				//'Something went wrong with updating the team name',
				500
			)
			return next(error)
		}
	})

	//Next, we need to find all the games that this teamId is involved in and change the
	//team name there as well!  Start with looking at all games where the homeTeamId = teamId
	//We do this so that when we look at the schedule, all their previous games that are listed
	//will show their new name
	let gamesWhereHomeTeam
	try {
		gamesWhereHomeTeam = await Game.find({
			homeTeamId: teamId,
		})
	} catch (err) {
		const error = new HttpError(
			'could not find games where this team is the home team.  editTeamName',
			500
		)
		return next(error)
	}

	if (gamesWhereHomeTeam) {
		console.log(
			'how many games where theyre the home team: ' + gamesWhereHomeTeam.length
		)
	}

	gamesWhereHomeTeam.forEach(async (game) => {
		game.homeTeamName = teamName.trim()
		try {
			await game.save()
		} catch (err) {
			const error = new HttpError(
				err,
				//'Something went wrong with updating the team name',
				500
			)
			return next(error)
		}
	})
	//
	//
	//
	let gamesWhereVisitorTeam
	try {
		gamesWhereVisitorTeam = await Game.find({
			visitorTeamId: teamId,
		})
	} catch (err) {
		const error = new HttpError(
			'could not find games where this team is the visitor team.  editTeamName',
			500
		)
		return next(error)
	}

	if (gamesWhereVisitorTeam) {
		console.log(
			'how many games where theyre the visitor team: ' +
				gamesWhereVisitorTeam.length
		)
	}

	gamesWhereVisitorTeam.forEach(async (game) => {
		game.visitorTeamName = teamName.trim()
		try {
			await game.save()
		} catch (err) {
			const error = new HttpError(
				err,
				//'Something went wrong with updating the team name',
				500
			)
			return next(error)
		}
	})

	res.status(200).json({ team: team.toObject({ getters: true }) })
}
//
//
//
//**************************************************************************************** */
//
//  editTeamNameWithDivision
//
//
//**************************************************************************************** */
const editTeamNameWithDivision = async (req, res, next) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		throw new HttpError(
			'Invalid inputs - something is empty in editTeamNameWithDivision',
			422
		)
	}
	console.log('you are in editTeamNameWithDivision')

	const { teamName, seed } = req.body
	const { divisionName } = req.body
	const { oldDivisionName } = req.body
	const teamId = req.params.teamId
	const leagueName = req.params.leagueName
	const session = req.params.session
	const year = req.params.year

	console.log('oldDivisionName: ' + oldDivisionName)
	console.log('newDivisionName: ' + divisionName)

	//Maybe we just need the teamId for this.......
	let team, oldLeagueId, newLeagueId
	try {
		team = await Team.findById(teamId)
	} catch (err) {
		const error = new HttpError('could not find team by team id', 500)
		return next(error)
	}
	oldLeagueId = team.leagueId
	const oldTeamName = team.teamName
	const newTeamName = teamName.trim()

	//Since we have a team, let's get the seed outta the way first, cause it's easiest to do:
	if (team.seed !== seed) {
		team.seed = seed
		try {
			await team.save()
		} catch (err) {
			const error = new HttpError(
				err,
				'Something went wrong with updating the team seed ' + err,
				500
			)
			return next(error)
		}
	}

	console.log('oldLeagueId: ' + oldLeagueId)

	let leagueIdForNewDivision
	//
	//
	//
	//First scenario:  a team is changing name AND division
	//
	//
	if (
		divisionName &&
		oldDivisionName !== divisionName &&
		oldTeamName !== newTeamName
	) {
		console.log('this team is changing both team name AND division')
		team.divisionName = divisionName
		//Next, we need to find the NEW leagueId and change the teams leagueId to that
		try {
			leagueIdForNewDivision = await League.findOne({
				leagueName: leagueName,
				session: session,
				year: year,
				divisionName: divisionName,
			})
		} catch (err) {
			const error = new HttpError('what the heck?' + err, 500)
			return next(error)
		}
		if (leagueIdForNewDivision) {
			console.log('newLeague: ' + leagueIdForNewDivision)
			newLeagueId = leagueIdForNewDivision._id
			console.log('newLeagueId: ' + newLeagueId)
		}

		team.divisionName = divisionName
		team.leagueId = newLeagueId
		team.teamName = newTeamName.trim()
		team.seed = seed

		//Save the team into the new division
		try {
			await team.save()
		} catch (err) {
			const error = new HttpError(
				err,
				'Something went wrong with updating the team division, name, or leagueId ' +
					err,
				500
			)
			return next(error)
		}

		//Here, we incremement the new leagues number of teams by 1
		leagueIdForNewDivision.numberOfTeams =
			leagueIdForNewDivision.numberOfTeams + 1
		try {
			await leagueIdForNewDivision.save()
		} catch (err) {
			const error = new HttpError(
				err,
				'Something went wrong with updating the number of teams in league ' +
					err,
				500
			)
			return next(error)
		}

		//Next, we need to find the OLD league and decremement their number of teams by 1
		let oldLeague
		try {
			oldLeague = await League.findById(oldLeagueId)
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
		//
		oldLeague.numberOfTeams = oldLeague.numberOfTeams - 1
		//
		try {
			await oldLeague.save()
		} catch (err) {
			const error = new HttpError(
				err,
				'Something went wrong with decrementing the number of teams in old league ' +
					err,
				500
			)
			return next(error)
		}
		//Next, let's find the teams roster via teamId, then change the rosters leagueId and divisionName
		//
		//
		let foundRoster
		try {
			foundRoster = await Roster.findOne({
				teamId: teamId,
			})
		} catch (err) {
			const error = new HttpError(
				'could not find rosterId for team.  editTeamNameWithDivision ' + err,
				500
			)
			return next(error)
		}
		foundRoster.divisionName = divisionName
		foundRoster.leagueId = newLeagueId
		//
		try {
			await foundRoster.save()
		} catch (err) {
			const error = new HttpError(
				err,
				'Something went wrong with saving team roster ' + err,
				500
			)
			return next(error)
		}
		//
		//
		//
		//
		//Next, we need to find all the rosterPlayers from the old team, and change
		//their leagueId's to the new league
		let rosterPlayersToChange
		console.log('oldLeagueId: ' + oldLeagueId)
		console.log('oldDivisionName: ' + oldDivisionName)
		console.log('teamName: ' + teamName)
		try {
			rosterPlayersToChange = await RosterPlayer.find({
				leagueId: oldLeagueId,
				divisionName: oldDivisionName,
				teamName: oldTeamName,
			})
		} catch (err) {
			const error = new HttpError(
				'could not find roster players for previous league ' + err,
				500
			)
			return next(error)
		}

		if (rosterPlayersToChange) {
			rosterPlayersToChange.forEach((player) => {
				console.log(player.firstName + ' ' + player.lastName)
			})
			console.log('changing to division: ' + divisionName)
			console.log(
				'rosterPlayersToChange length: ' + rosterPlayersToChange.length
			)
			rosterPlayersToChange.forEach(async (player) => {
				player.leagueId = newLeagueId
				player.divisionName = divisionName
				player.teamName = newTeamName.trim()

				//console.log('you are here: ' + player.leagueId)
				console.log(player.divisionName)
				try {
					await player.save()
				} catch (err) {
					const error = new HttpError(
						err,
						'Something went wrong with saving rosterPlayer to new leagueId ' +
							err,
						500
					)
					return next(error)
				}
			})
		}

		//Next, we need to find all the games that this teamId is involved in and change the
		//team name there as well!  Start with looking at all games where the homeTeamId = teamId
		//We do this so that when we look at the schedule, all their previous games that are listed
		//will show their new name
		let gamesWhereHomeTeam
		try {
			gamesWhereHomeTeam = await Game.find({
				homeTeamId: teamId,
			})
		} catch (err) {
			const error = new HttpError(
				'could not find games where this team is the home team.  editTeamName',
				500
			)
			return next(error)
		}

		gamesWhereHomeTeam.forEach(async (game) => {
			game.homeTeamName = newTeamName.trim()
			try {
				await game.save()
			} catch (err) {
				const error = new HttpError(
					err,
					//'Something went wrong with updating the team name',
					500
				)
				return next(error)
			}
		})
		//
		//
		//
		let gamesWhereVisitorTeam
		try {
			gamesWhereVisitorTeam = await Game.find({
				visitorTeamId: teamId,
			})
		} catch (err) {
			const error = new HttpError(
				'could not find games where this team is the visitor team.  editTeamName',
				500
			)
			return next(error)
		}

		gamesWhereVisitorTeam.forEach(async (game) => {
			game.visitorTeamName = newTeamName.trim()
			try {
				await game.save()
			} catch (err) {
				const error = new HttpError(
					err,
					//'Something went wrong with updating the team name',
					500
				)
				return next(error)
			}
		})
	} else if (divisionName && oldDivisionName !== divisionName) {
		//
		//
		//Second scenario:  team is only changing their division
		//
		//
		console.log('team is only changing their division.  Name stays the same')
		team.divisionName = divisionName
		//Next, we need to find the NEW leagueId and change the teams leagueId to that
		try {
			leagueIdForNewDivision = await League.findOne({
				leagueName: leagueName,
				session: session,
				year: year,
				divisionName: divisionName,
			})
		} catch (err) {
			const error = new HttpError('what the heck?' + err, 500)
			return next(error)
		}
		if (leagueIdForNewDivision) {
			console.log('newLeague: ' + leagueIdForNewDivision)
			newLeagueId = leagueIdForNewDivision._id
			console.log('newLeagueId: ' + newLeagueId)
		}

		team.divisionName = divisionName
		team.leagueId = newLeagueId
		team.seed = seed
		//team.teamName = newTeamName

		//Save the team into the new division
		try {
			await team.save()
		} catch (err) {
			const error = new HttpError(
				err,
				'Something went wrong with updating the team division, name, or leagueId ' +
					err,
				500
			)
			return next(error)
		}

		//Here, we incremement the new leagues number of teams by 1
		leagueIdForNewDivision.numberOfTeams =
			leagueIdForNewDivision.numberOfTeams + 1
		try {
			await leagueIdForNewDivision.save()
		} catch (err) {
			const error = new HttpError(
				err,
				'Something went wrong with updating the number of teams in league ' +
					err,
				500
			)
			return next(error)
		}

		//Next, we need to find the OLD league and decremement their number of teams by 1
		let oldLeague
		try {
			oldLeague = await League.findById(oldLeagueId)
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
		//
		oldLeague.numberOfTeams = oldLeague.numberOfTeams - 1
		//
		try {
			await oldLeague.save()
		} catch (err) {
			const error = new HttpError(
				err,
				'Something went wrong with decrementing the number of teams in old league ' +
					err,
				500
			)
			return next(error)
		}
		//Next, let's find the teams roster via teamId, then change the rosters leagueId and divisionName
		//
		//
		let foundRoster
		try {
			foundRoster = await Roster.findOne({
				teamId: teamId,
			})
		} catch (err) {
			const error = new HttpError(
				'could not find rosterId for team.  editTeamNameWithDivision ' + err,
				500
			)
			return next(error)
		}
		foundRoster.divisionName = divisionName
		foundRoster.leagueId = newLeagueId
		//
		try {
			await foundRoster.save()
		} catch (err) {
			const error = new HttpError(
				err,
				'Something went wrong with saving team roster ' + err,
				500
			)
			return next(error)
		}
		//
		//
		//Next, we need to find all the rosterPlayers from the old team, and change
		//their leagueId's to the new league
		let rosterPlayersToChange
		console.log('oldLeagueId: ' + oldLeagueId)
		console.log('oldDivisionName: ' + oldDivisionName)
		//console.log('teamName: ' + teamName)
		try {
			rosterPlayersToChange = await RosterPlayer.find({
				leagueId: oldLeagueId,
				divisionName: oldDivisionName,
				teamName: oldTeamName,
			})
		} catch (err) {
			const error = new HttpError(
				'could not find roster players for previous league ' + err,
				500
			)
			return next(error)
		}

		if (rosterPlayersToChange) {
			rosterPlayersToChange.forEach((player) => {
				console.log(player.firstName + ' ' + player.lastName)
			})
			console.log('changing to division: ' + divisionName)
			console.log(
				'rosterPlayersToChange length: ' + rosterPlayersToChange.length
			)
			rosterPlayersToChange.forEach(async (player) => {
				player.leagueId = newLeagueId
				player.divisionName = divisionName
				//player.teamName = newTeamName

				//console.log('you are here: ' + player.leagueId)
				console.log(player.divisionName)
				try {
					await player.save()
				} catch (err) {
					const error = new HttpError(
						err,
						'Something went wrong with saving rosterPlayer to new leagueId ' +
							err,
						500
					)
					return next(error)
				}
			})
		}
	} else if (oldTeamName !== newTeamName) {
		//
		//
		//
		//Third scenario:  team is only changing their name
		//
		//
		//
		team.seed = seed
		team.teamName = newTeamName.trim()
		console.log('only changing team name.  Division stays the same')
		try {
			await team.save()
		} catch (err) {
			const error = new HttpError(
				err,
				'Something went wrong with updating the team name (in a team with a division) ' +
					err,
				500
			)
			return next(error)
		}

		//Next, we need to find all the rostered players for this team, and change their teamName
		//To do that, we first need to get the rosterId
		let roster, rosterId
		try {
			roster = await Roster.findOne({
				leagueId: oldLeagueId,
				teamId: teamId,
			})
		} catch (err) {
			const error = new HttpError(
				'could not find roster.  editTeamNameWithDivisions',
				500
			)
			return next(error)
		}
		rosterId = roster._id

		//Now that we have the rosterId, let's get all the rosterPlayers
		let rosterPlayers
		try {
			rosterPlayers = await RosterPlayer.find({
				rosterId: rosterId,
			})
		} catch (err) {
			const error = new HttpError(
				'could not find roster players.  editTeamNameWithDivisions',
				500
			)
			return next(error)
		}

		console.log('rosterPlayers here: ' + rosterPlayers)

		//Now that we have all the roster players, we can change their team name to the new team name
		rosterPlayers.forEach(async (player) => {
			player.teamName = newTeamName.trim()
			try {
				await player.save()
			} catch (err) {
				const error = new HttpError(
					err,
					//'Something went wrong with updating the team name',
					500
				)
				return next(error)
			}
		})

		//Next, we need to find all the games that this teamId is involved in and change the
		//team name there as well!  Start with looking at all games where the homeTeamId = teamId
		//We do this so that when we look at the schedule, all their previous games that are listed
		//will show their new name
		let gamesWhereHomeTeam
		try {
			gamesWhereHomeTeam = await Game.find({
				homeTeamId: teamId,
			})
		} catch (err) {
			const error = new HttpError(
				'could not find games where this team is the home team.  editTeamName',
				500
			)
			return next(error)
		}

		gamesWhereHomeTeam.forEach(async (game) => {
			game.homeTeamName = newTeamName.trim()
			try {
				await game.save()
			} catch (err) {
				const error = new HttpError(
					err,
					//'Something went wrong with updating the team name',
					500
				)
				return next(error)
			}
		})
		//
		//
		//
		let gamesWhereVisitorTeam
		try {
			gamesWhereVisitorTeam = await Game.find({
				visitorTeamId: teamId,
			})
		} catch (err) {
			const error = new HttpError(
				'could not find games where this team is the visitor team.  editTeamName',
				500
			)
			return next(error)
		}

		gamesWhereVisitorTeam.forEach(async (game) => {
			game.visitorTeamName = newTeamName.trim()
			try {
				await game.save()
			} catch (err) {
				const error = new HttpError(
					err,
					//'Something went wrong with updating the team name',
					500
				)
				return next(error)
			}
		})
	}

	res.status(200).json({ team: team.toObject({ getters: true }) })
}
//
//
//
//
//**************************************************************************************** */
//
//This is a PATCH route to change the jersey number for a rostered player
//
//**************************************************************************************** */
const editPlayerNumber = async (req, res, next) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		throw new HttpError('Invalid inputs - something is empty', 422)
	}
	const { number } = req.body
	//const session = req.params.session
	const year = req.params.year
	const teamName = req.params.teamName
	const playerId = req.params.playerId
	//const leagueName = req.params.leagueName

	//Need to find the correct RosterPlayer
	let rosterPlayer
	try {
		rosterPlayer = await RosterPlayer.findOne({
			//leagueName: leagueName,
			//session: session,
			year: year,
			teamName: teamName,
			playerId: playerId,
		})
	} catch (err) {
		const error = new HttpError('could not find player by playerId', 500)
		return next(error)
	}

	if (number >= 0 && number < 100) {
		rosterPlayer.number = number
	} else {
		const error = new HttpError('Number must be AT LEAST 0, and LESS THAN 100')
		return next(error)
	}

	try {
		await rosterPlayer.save()
	} catch (err) {
		const error = new HttpError(
			err,
			//'Something went wrong with updating the team name',
			500
		)
		return next(error)
	}

	res
		.status(200)
		.json({ rosterPlayer: rosterPlayer.toObject({ getters: true }) })
}
//
//
//
//
//
//
//****************************************************************************************** */
//
//PATCH request where we can edit the Team Name or year for the current sloths team
//
//******************************************************************************************* */
const editTeam = async (req, res, next) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		throw new HttpError('Invalid inputs - something is empty', 422)
	}

	const { teamName, year } = req.body

	const teamId = req.params.teamId

	let team, previousTeamName, previousYear
	try {
		team = await Team.findById(teamId)
	} catch (err) {
		const error = new HttpError(err, 500)
		return next(error)
	}

	previousTeamName = team.teamName
	previousYear = team.year
	/* if (league.divisionName) {
		previousDivisionName = league.divisionName
	} */

	team.teamName = teamName.trim()
	team.year = year
	//league.session = session.trim()
	//divisionName && (league.divisionName = divisionName)

	try {
		await team.save()
	} catch (err) {
		const error = new HttpError(err, 500)
		return next(error)
	}

	//Now we need to find all the rosterPlayers in this league and update their leagueName,
	//session, and year in the rosterPlayer as well
	//SHOULD WE ALSO DO DIVISION?
	let rosterPlayers

	try {
		rosterPlayers = await RosterPlayer.find({
			teamId: teamId,
		}).orFail()
	} catch {}

	if (rosterPlayers) {
		rosterPlayers.forEach(async (player) => {
			player.teamName = teamName.trim()
			//player.session = session.trim()
			player.year = year
			try {
				await player.save()
			} catch (err) {
				const error = new HttpError(err, 500)
				return next(error)
			}
		})
	}
	//
	//Next, we want to find all GAMES for this team that just got its name
	//changed and be sure to change the team name in there too.
	let games

	try {
		games = await Game.find({
			homeTeamName: previousTeamName,
			//session: previousSession,
			year: previousYear,
		}).orFail()
	} catch {}

	if (games) {
		games.forEach(async (game) => {
			game.homeTeamName = teamName.trim()
			//game.session = session.trim()
			game.year = year
			try {
				await game.save()
			} catch (err) {
				const error = new HttpError(err, 500)
				return next(error)
			}
		})
	}
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	/* if (divisionName) {
		console.log('Looks like youre changing a DIVISION name')
		let teams

		try {
			teams = await Team.find({
				leagueId: leagueId,
			}).orFail()
		} catch {}

		teams.forEach(async (team) => {
			team.divisionName = divisionName
			try {
				await team.save()
			} catch (err) {
				const error = new HttpError(err, 500)
				return next(error)
			}
		})

		let rosters

		try {
			rosters = await Roster.find({
				leagueId: leagueId,
				divisionName: previousDivisionName,
			}).orFail()
		} catch {}

		rosters.forEach(async (roster) => {
			roster.divisionName = divisionName
			try {
				await roster.save()
			} catch (err) {
				const error = new HttpError(err, 500)
				return next(error)
			}
		})

		//Ok.  Now we need to find all the rosterPlayers for these teams and update
		//their divisionNames

		let rosterPlayers2

		try {
			rosterPlayers2 = await RosterPlayer.find({
				leagueId: leagueId,
				//divisionName: divisionName,
			}).orFail()
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}

		if (rosterPlayers2) {
			rosterPlayers2.forEach(async (player2) => {
				player2.divisionName = divisionName
				try {
					await player2.save()
				} catch (err) {
					const error = new HttpError(err, 500)
					return next(error)
				}
			})
		}

		league.leagueName = leagueName.trim()
		league.year = year
		league.session = session.trim()
		league.divisionName = divisionName

		try {
			await league.save()
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
	} */

	//set it to 200 instead of 201 because we're not creating anything new
	res.status(200).json({ team: team.toObject({ getters: true }) })
}
//
//
//****************************************************************************************** */
//
//PATCH request where we can move a current team to the archives
//   or move an archived team to current
//
//******************************************************************************************* */
const archiveCurrentToggleTeam = async (req, res, next) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		throw new HttpError('Invalid inputs - something is empty', 422)
	}
	console.log('you are here 1')
	const teamId = req.params.teamId

	let team, teamName, year, games
	try {
		team = await Team.findById(teamId)
	} catch (err) {
		const error = new HttpError('Team not found.  archiveTeam', 500)
		return next(error)
	}
	teamName = team.teamName
	//session = league.session
	year = team.year

	//Next, we want to find all the games that are schedule for this team, and
	//we will toggle the isCurrent for each of them too

	console.log('you are here 2')
	try {
		games = await Game.find({
			teamName: teamName,
			//session: session,
			year: year,
		})
	} catch (err) {
		const error = new HttpError('No games found for this team', 500)
		return next(error)
	}
	console.log('you are here 3')
	games && console.log('games: ' + games)

	games &&
		games.forEach(async (game) => {
			game.isCurrent ? (game.isCurrent = false) : (game.isCurrent = true)
			try {
				await game.save()
			} catch (err) {
				const error = new HttpError(err, 500)
				return next(error)
			}
		})
	console.log('you are here 4')
	//Here's where we toggle.  If team was current, let's archive it.  If team
	//was in archives, let's make it current
	console.log('team status BEFORE: ' + team.isCurrent)

	team.isCurrent ? (team.isCurrent = false) : (team.isCurrent = true)
	//
	//
	//
	console.log('changing to ' + team.isCurrent)
	try {
		await team.save()
	} catch (err) {
		const error = new HttpError(err, 500)
		return next(error)
	}

	console.log('team status AFTER: ' + team.isCurrent)

	res.status(200).json({ team: team.toObject({ getters: true }) })
}
//****************************************************************************************** */
//
//PATCH request where we can edit the Venue Name or Address
//
//******************************************************************************************* */
const editVenue = async (req, res, next) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		throw new HttpError('Invalid inputs - something is empty.   editVenue', 422)
	}

	const { venueName, venueAddress } = req.body

	const venueId = req.params.venueId

	let venue
	try {
		venue = await Venue.findById(venueId)
	} catch (err) {
		const error = new HttpError(err, 500)
		return next(error)
	}

	venue.venueName = venueName
	venue.venueAddress = venueAddress

	try {
		await venue.save()
	} catch (err) {
		const error = new HttpError(
			//'Something went wrong with saving the updated league.',
			err,
			500
		)
		return next(error)
	}

	//set it to 200 instead of 201 because we're not creating anything new
	res.status(200).json({ venue: venue.toObject({ getters: true }) })
}
//
//
//****************************************************************************************** */
//
//PATCH request where we can edit the Video Title, URL, or Caption
//
//******************************************************************************************* */
const editVideo = async (req, res, next) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		throw new HttpError('Invalid inputs - something is empty.   editVideo', 422)
	}

	const { videoTitle, videoURL, videoCaption } = req.body

	const videoId = req.params.videoId

	let video
	try {
		video = await Video.findById(videoId)
	} catch (err) {
		const error = new HttpError(err, 500)
		return next(error)
	}

	video.videoTitle = videoTitle
	video.videoURL = videoURL
	video.videoCaption = videoCaption

	try {
		await video.save()
	} catch (err) {
		const error = new HttpError(
			//'Something went wrong with saving the updated league.',
			err,
			500
		)
		return next(error)
	}

	//set it to 200 instead of 201 because we're not creating anything new
	res.status(200).json({ video: video.toObject({ getters: true }) })
}
//
//
//
//****************************************************************************************** */
//
//PATCH request where we can edit the first name, middle initial, or last name of a player
//
//******************************************************************************************* */
const editPlayerName = async (req, res, next) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		throw new HttpError('Invalid inputs - something is empty', 422)
	}

	//We're only getting playerId from the params, the rest come from the form
	const { firstName, middleInitial, lastName } = req.body
	const playerId = req.params.playerId

	let player
	try {
		player = await Player.findById(playerId)
	} catch (err) {
		const error = new HttpError(
			'Cant find player via playerId.  editPlayerName',
			500
		)
		return next(error)
	}

	player.firstName = firstName.trim().replace(/\s+/g, '-')
	player.middleInitial = middleInitial
	player.lastName = lastName.trim().replace(/\s+/g, '-')

	try {
		await player.save()
	} catch (err) {
		const error = new HttpError(
			'Something went wrong with saving the updated player name.  editPlayerName',
			500
		)
		return next(error)
	}

	//Now we need to edit all of this players names for all their rosters that
	//they've been a part of.
	let playersRosters
	try {
		playersRosters = await RosterPlayer.find({
			playerId: playerId,
		})
	} catch (err) {
		const error = new HttpError(
			'Cant find any rosters for this player: ' +
				firstName +
				' ' +
				middleInitial +
				' ' +
				lastName,
			404
		)
		return next(error)
	}

	playersRosters.forEach(async (roster) => {
		;(roster.firstName = firstName.trim().replace(/\s+/g, '-')),
			(roster.middleInitial = middleInitial),
			(roster.lastName = lastName.trim()).replace(/\s+/g, '-')

		try {
			await roster.save()
		} catch (err) {
			const error = new HttpError(
				'Couldnt change players rosterPlayers names for ' +
					firstName +
					' ' +
					middleInitial +
					' ' +
					lastName,
				404
			)
			return next(error)
		}
	})

	console.log('playersRosters: ' + playersRosters)

	//set it to 200 instead of 201 because we're not creating anything new
	res.status(200).json({ player: player.toObject({ getters: true }) })
}
//
//
//
//
//****************************************************************************************** */
//
//PATCH request where we can edit the details of a game
//
//******************************************************************************************* */
const editGame = async (req, res, next) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		throw new HttpError('Invalid inputs - something is empty', 422)
	}

	console.log('inside editGame')

	//We're only getting gameId from the params, the rest come from the form
	const {
		teamName,
		year1,
		time1,
		date1,
		tbd1IsChecked,
		playoff1IsChecked,
		championship1IsChecked,
		opponent,
		venue1,
	} = req.body
	const gameId = req.params.gameId

	const g1year = date1.substr(0, 4)
	const g1month = date1.substr(5, 2)
	const g1day = date1.substr(8, 2)
	const MDYdate1 = g1month + '-' + g1day + '-' + g1year

	const utcDate1 = new Date(MDYdate1)

	const dateString1 = utcDate1.toString()

	const dayOfWeek1 = dateString1.substr(0, 3)

	let game
	try {
		game = await Game.findById(gameId)
	} catch (err) {
		const error = new HttpError('Cant find game via gameId.  editGame', 500)
		return next(error)
	}
	game.teamName = teamName
	game.year = year1
	game.time = time1
	game.date = MDYdate1
	game.dayOfWeek = dayOfWeek1
	game.timeTBD = tbd1IsChecked
	game.playoff = playoff1IsChecked
	game.championship = championship1IsChecked
	game.opponent = opponent.trim()
	game.venueName = venue1.trim()

	try {
		await game.save()
	} catch (err) {
		const error = new HttpError(
			err,
			//'Something went wrong with saving the updated game.  editGame',
			500
		)
		return next(error)
	}

	//set it to 200 instead of 201 because we're not creating anything new
	res.status(200).json({ game: game.toObject({ getters: true }) })
}
//****************************************************************************************** */
//
//PATCH request where we can edit the details of an event
//
//******************************************************************************************* */
const editEvent = async (req, res, next) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		throw new HttpError('Invalid inputs - something is empty', 422)
	}

	//We're only getting gameId from the params, the rest come from the form
	const { eventName1, time1, endTime1, date1, tbd1IsChecked, venue1 } = req.body
	const gameId = req.params.gameId

	console.log('date1: ' + date1)

	const g1year = date1.substr(0, 4)
	const g1month = date1.substr(5, 2)
	const g1day = date1.substr(8, 2)
	const MDYdate1 = g1month + '-' + g1day + '-' + g1year

	const utcDate1 = new Date(MDYdate1)

	const dateString1 = utcDate1.toString()

	const dayOfWeek1 = dateString1.substr(0, 3)

	console.log('MDYdate1: ' + MDYdate1)

	let event
	try {
		event = await Event.findById(gameId)
	} catch (err) {
		const error = new HttpError('Cant find event via gameId.  editEvent', 500)
		return next(error)
	}

	event.eventName = eventName1
	event.time = time1
	event.endTime = endTime1
	event.date = MDYdate1
	event.dayOfWeek = dayOfWeek1
	event.timeTBD = tbd1IsChecked
	event.venueName = venue1

	try {
		await event.save()
	} catch (err) {
		const error = new HttpError(
			'Something went wrong with saving the updated event.  editEvent',
			500
		)
		return next(error)
	}

	//set it to 200 instead of 201 because we're not creating anything new
	res.status(200).json({ event: event.toObject({ getters: true }) })
}
//
//
//
//
//
//****************************************************************************************** */
//
//  Remove a current sloth team.
//  We also want to delete it's roster,
//  rostered players, and games.
//
//****************************************************************************************** */
const removeTeam = async (req, res, next) => {
	const teamId = req.params.teamId

	console.log('inside removeTeam')

	let team
	try {
		team = await Team.findById(teamId)
	} catch (err) {
		const error = new HttpError(
			'Cant find league to delete it (1).  removeTeam',
			500
		)
		return next(error)
	}
	const teamName = team.teamName
	const year = team.year

	console.log('inside removeTeam for ' + teamName + ' ' + year)
	//
	//
	try {
		await team.deleteOne()
	} catch (err) {
		const error = new HttpError(
			'Cant find team to delete it (2).  removeTeam',
			500
		)
		return next(error)
	}
	//Next, we need to delete the rosters for the teams that were deleted
	//We can also do this using the leagueId
	let rosters
	try {
		rosters = await Roster.find({
			teamId: teamId,
		})
	} catch (err) {
		const error = new HttpError('Could not find any rosters for this team', 404)
		return next(error)
	}
	console.log(rosters)

	//We found all the rosters, so let's delete them all...
	rosters.forEach(async (roster) => {
		try {
			await roster.deleteOne()
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
	})

	//Next, we need to find all rosteredPlayers for this team and delete them
	let rosterPlayers
	try {
		rosterPlayers = await RosterPlayer.find({
			teamId: teamId,
		})
	} catch (err) {
		const error = new HttpError(
			'Could not find any rostered players for this team',
			404
		)
		return next(error)
	}
	console.log(rosterPlayers)

	//We found all the rostered players, so let's delete them all...
	rosterPlayers.forEach(async (player) => {
		try {
			await player.deleteOne()
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
	})

	//Finally, we need to find any and all scheduled games for this league and
	//delete them as well
	let teamGames
	try {
		teamGames = await Game.find({
			teamName: teamName,
			year: year,
		})
	} catch (err) {
		const error = new HttpError(
			'Could not find any scheduled games for this team',
			404
		)
		return next(error)
	}

	teamGames.forEach(async (game) => {
		try {
			await game.deleteOne()
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
	})

	res.status(200).json({ message: 'Deleted the team' })
}
//
//
//
//
//****************************************************************************************** */
//
//  Remove a video
//
//
//****************************************************************************************** */
const removeVideo = async (req, res, next) => {
	const deletedVideoId = req.params.deletedVideoId
	//actually, this is the ROSTERPLAYER id, not the playerId

	//First, we need to get the roster player id from RosterPlayers
	let videoToDelete
	try {
		videoToDelete = await Video.findById(deletedVideoId)
	} catch (err) {
		const error = new HttpError('Could not find video to delete it', 404)
		return next(error)
	}
	//
	//
	try {
		await videoToDelete.deleteOne()
	} catch (err) {
		const error = new HttpError(err, 404)
		return next(error)
	}
	//
	res.status(200).json({
		message: 'Video has been deleted',
	})
}
//
//
//
//****************************************************************************************** */
//
//Here, we want to remove a player from a sloth team.  So obviously we want to remove them
//from the TEAMS database table, but we ALSO want to remove the teams roster object and all
//the rosteredPlayers on the team
//
//****************************************************************************************** */
const removePlayer = async (req, res, next) => {
	const playerId = req.params.playerId

	//Before we go deleting, we need to obtain the teamId (so we can delete roster and rosterPlayers)
	//So first, we need to find the team...
	let teamId
	let foundPlayer
	try {
		foundPlayer = await RosterPlayer.findById(playerId)
	} catch (err) {
		const error = new HttpError('Could not find team.  removePlayer', 500)
		return next(error)
	}

	teamId = foundPlayer.teamId

	try {
		await foundPlayer.deleteOne()
	} catch (err) {
		const error = new HttpError(
			'Cant find player to delete them.  removePlayer',
			404
		)
		return next(error)
	}

	//We have the leagueId, now let's delete the roster for this team.  We can look for both
	//leagueId AND teamId when deleting this.
	/* let roster
	let rosterId
	try {
		roster = await Roster.findOne({
			leagueId: leagueId,
			teamId: teamId,
		})
	} catch (err) {
		const error = new HttpError('Could not find roster for this team', 404)
		return next(error)
	}
	rosterId = roster._id
	try {
		await roster.deleteOne()
	} catch (err) {
		const error = new HttpError(err, 404)
		return next(error)
	} */
	//Next, we need to find all rosteredPlayers for this league and delete them
	/* let rosterPlayers
	try {
		rosterPlayers = await RosterPlayer.find({
			rosterId: rosterId,
		})
	} catch (err) {
		const error = new HttpError(
			'Could not find any rostered players for this league',
			404
		)
		return next(error)
	} */

	//We found all the rostered players, so let's delete them all...
	/* rosterPlayers.forEach(async (player) => {
		try {
			await player.deleteOne()
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
	}) */

	//Let's find the league, so that in the next step we can decrement numberOfTeams
	let foundTeam
	try {
		foundTeam = await Team.findById(teamId)
	} catch (err) {
		const error = new HttpError(err, 500)
		return next(error)
	}

	//Here's where, if we found the league, we decrement the numberOfTeams by 1
	if (foundTeam) {
		foundTeam.assignedPlayers--
		try {
			await foundTeam.save()
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
	}

	//Finally, we want to find any games that this team is involved in and delete them
	/* let homeGames, visitorGames
	let allGames = []
	try {
		homeGames = await Game.find({
			homeTeamId: teamId,
		})
	} catch (err) {
		const error = new HttpError(
			'Could not find games where this is the hometeam',
			404
		)
	} */

	/* for (let i = 0; i < homeGames.length; i++) {
		allGames.push(homeGames[i])
	} */

	/* try {
		visitorGames = await Game.find({
			visitorTeamId: teamId,
		})
	} catch (err) {
		const error = new HttpError(
			'Could not find games where this is the visitor team',
			404
		)
	}

	for (let i = 0; i < visitorGames.length; i++) {
		allGames.push(visitorGames[i])
	} */

	/* if (allGames.length !== 0) {
		try {
			await allGames.forEach((game) => {
				game.deleteOne()
			})
		} catch (err) {
			const error = new HttpError(err, 404)
			return next(error)
		}
	} */

	res.status(200).json({
		message: 'Deleted the player',
	})
}
//
//
//
//
//****************************************************************************************** */
//
//For this, when we go to remove a player, we want to send both the
//playerId AND the rosterID - because we're simply removing the player from
//this one team, in this one league.  We don't want to remove the player
//from the system completely, or remove him from other teams - we just want
//to remove the player from THIS team.
//
//****************************************************************************************** */
/* const removePlayer = async (req, res, next) => {
	const rosterPlayerId = req.params.rosterPlayerId
	//actually, this is the ROSTERPLAYER id, not the playerId

	//First, we need to get the roster player id from RosterPlayers
	let rosterPlayer, leagueId, teamName
	try {
		rosterPlayer = await RosterPlayer.findById(rosterPlayerId)
	} catch (err) {
		const error = new HttpError('Could not find player for this team', 404)
		return next(error)
	}
	//
	leagueId = rosterPlayer.leagueId
	teamName = rosterPlayer.teamName
	//
	//
	try {
		await rosterPlayer.deleteOne()
	} catch (err) {
		const error = new HttpError(err, 404)
		return next(error)
	}
	//
	//Next, we need to find the team that this rosterPlayer belonged to,
	//and decrement the assignedPlayers number by 1.
	//So we use the leagueId and teamName to find that team
	let foundTeam
	try {
		foundTeam = await Team.findOne({
			leagueId: leagueId,
			teamName: teamName,
		}).orFail()
	} catch (err) {
		const error = new HttpError(
			'Could not find team to obtain teamId.  removePlayers',
			404
		)
		return next(error)
	}
	//Here's where, if we found the team, we decrement the assignedPlayers number
	if (foundTeam) {
		//console.log('foundTeam: ' + foundTeam)
		foundTeam.assignedPlayers = foundTeam.assignedPlayers - 1
		try {
			await foundTeam.save()
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
	}

	res.status(200).json({
		message: 'Deleted the player from this team',
	})
} */
//
//
//
//
//****************************************************************************************** */
//
//   Find either an event or a game by the itemId and then delete it
//
//
//****************************************************************************************** */
const removeEvent = async (req, res, next) => {
	console.log('inside removeEvent')
	const itemId = req.params.itemId

	console.log('itemId: ' + itemId)
	//First, we need to see if it is a game
	let gameOrEvent, game, event, teamId
	try {
		game = await Game.findById(itemId)
	} catch (err) {
		const error = new HttpError('Could not find game for this itemId', 404)
	}

	console.log('game: ' + game)

	//If we find a game, let's grab the homeTeamRosterId and visitorTeamRosterId
	let homeTeam, status
	if (game) {
		homeTeam = game.teamName
		status = game.status

		console.log('homeTeam: ' + homeTeam)

		//Now that we have teamName, lets go get the current sloth team and
		//get their teamId
		let foundTeam
		try {
			foundTeam = await Team.findOne({
				teamName: homeTeam,
				isCurrent: true,
			})
		} catch (err) {
			const error = new HttpError(
				'Could not find team to get their teamId',
				404
			)
		}

		console.log('foundTeam: ' + foundTeam)

		teamId = foundTeam.id
		//
		//Now that we have teamId, let's get the current sloths team roster
		let foundRoster, rosterId
		try {
			foundRoster = await Roster.findOne({
				teamId: teamId,
			})
		} catch (err) {
			const error = new HttpError(
				'Could not find team to get their teamId',
				404
			)
		}
		rosterId = foundRoster._id
	}

	//
	//If we dont find the itemId as a Game, let's check to see if it's an Event
	if (!game) {
		console.log('its an event')
		try {
			event = await Event.findById(itemId)
		} catch (err) {
			const error = new HttpError(
				'Could not find game OR event for this itemId',
				404
			)
			return next(error)
		}
	}

	if (event) {
		console.log('event: ' + event)
	}

	//Before we delete the game, let's also see if there's gameStats for it.
	//If so, we'll delete those too.
	//If its a playoff game or championship game, lets remove those stats as well
	//
	//kraly 4
	if (!event) {
		console.log('matt you are here to remove a game!!')
		let gameStats, playoffStats, championshipStats
		try {
			gameStats = await GameStats.find({
				gameId: itemId,
			})
		} catch (err) {
			const error = new HttpError(
				'Could not find game stats for this itemId',
				404
			)
			return next(error)
		}
		//
		if (gameStats.length > 0) {
			console.log('gameStats: ' + gameStats)
			//gameStats.forEach((stat) => {
			//	stat.deleteOne()
			//})
		}
		//
		//
		//
		//
		//
		try {
			playoffStats = await PlayoffGameStats.find({ gameId: itemId })
		} catch {}

		if (playoffStats.length > 0) {
			console.log('playoffGameStats: ' + playoffStats)
			//playoffStats.forEach((stat) => {
			//	stat.deleteOne()
			//})
		}
		//
		//
		//
		//
		try {
			championshipStats = await ChampionshipGameStats.find({ gameId: itemId })
		} catch {}

		if (championshipStats.length > 0) {
			console.log('championshipStats: ' + championshipStats)
			//championshipStats.forEach((stat) => {
			//	stat.deleteOne()
			//})
		}

		if (
			!gameStats.length > 0 &&
			!playoffStats.length > 0 &&
			!championshipStats.length > 0
		) {
			console.log('there are no stats at all for this game yet...')
		}
		//
		//
		//
		//
		//
		//Let's determine the winner and loser of the game, and fix their records
		//remember that homeTeam and visitorTeam are their teamId's
		let homePoints,
			visitorPoints,
			minusWinForHomeTeam,
			minusLossForHomeTeam,
			minusOvertimeLossForHomeTeam,
			minusShootoutLossForHomeTeam,
			minusTieForHomeTeam,
			tie

		if (gameStats.length > 0) {
			homePoints = gameStats[0].homeGoalsTotal
			visitorPoints = gameStats[0].visitorGoalsTotal
			//If the home team was the winner, we need to tap into the team and remove a win from them
			//as well as tap into the visiting team and remove a loss from them
			//
			//
			//    if home team won
			//
			//
			console.log('homePoints: ' + homePoints)
			console.log('visitorPoints: ' + visitorPoints)
			//console.log('homePoints: ' + Number(homePoints))
			//console.log('visitorPoints: ' + Number(visitorPoints))

			if (homePoints > visitorPoints) {
				console.log('home team won this game that is about to be deleted...')
				try {
					minusWinForHomeTeam = await Team.findById(teamId)
				} catch (err) {
					const error = new HttpError(
						'Could not find homeTeam to delete their win.',
						404
					)
					return next(error)
				}
				//
				//
				minusWinForHomeTeam.wins = Number(minusWinForHomeTeam.wins) - 1
				//
				minusWinForHomeTeam.goalsFor =
					Number(minusWinForHomeTeam.goalsFor) - homePoints
				//
				minusWinForHomeTeam.goalsAgainst =
					Number(minusWinForHomeTeam.goalsAgainst) - visitorPoints
				//
				//
				if (status === 'Overtime') {
					console.log('visitor lost in overtime')
				} else if (status === 'Shootout') {
					console.log('visitor lost in shootout')
				} else {
					console.log('visitor lost in regulation')
				}

				try {
					console.log('saving home team after removing their win...')
					await minusWinForHomeTeam.save()
				} catch (err) {
					const error = new HttpError(
						'could not edit home team to take away a win',
						500
					)
					return next(error)
				}
				//
				//
				//
				//
				//
				try {
					console.log('deleting game stats 1...')
					//await gameStats.deleteOne()
					gameStats.forEach((stat) => {
						stat.deleteOne()
					})
				} catch (err) {
					const error = new HttpError(
						'Could not delete game stats: ' + err,
						404
					)
					return next(error)
				}
				//
				console.log('you are here 5')
				//
				try {
					console.log('deleting game...')
					//await gameOrEvent.deleteOne()
					await game.deleteOne()
				} catch (err) {
					const error = new HttpError(err, 404)
					return next(error)
				}
				//
				console.log('you are here 6')
				//
				//
				// IF VISITING TEAM WINS
				//
				//
				//
				//
			} else if (visitorPoints > homePoints) {
				console.log('visitor team won 1')

				try {
					minusOvertimeLossForHomeTeam = await Team.findById(teamId)
				} catch (err) {
					const error = new HttpError(
						'Could not find homeTeam to delete their Overtime loss.',
						404
					)
					return next(error)
				}

				try {
					minusShootoutLossForHomeTeam = await Team.findById(teamId)
				} catch (err) {
					const error = new HttpError(
						'Could not find homeTeam to delete their shootout loss.',
						404
					)
					return next(error)
				}

				try {
					minusLossForHomeTeam = await Team.findById(teamId)
				} catch (err) {
					const error = new HttpError(
						'Could not find homeTeam to delete their loss.',
						404
					)
					return next(error)
				}
				//
				//
				minusLossForHomeTeam.losses = Number(minusLossForHomeTeam.losses) - 1
				//
				minusLossForHomeTeam.goalsFor =
					Number(minusLossForHomeTeam.goalsFor) - homePoints
				//
				minusLossForHomeTeam.goalsAgainst =
					Number(minusLossForHomeTeam.goalsAgainst) - visitorPoints

				if (status === 'Overtime') {
					console.log(
						'home team lost in overtime in the game were about to delete...'
					)
					minusOvertimeLossForHomeTeam.overtimeLosses =
						Number(minusOvertimeLossForHomeTeam.overtimeLosses) - 1
					minusShootoutLossForHomeTeam.shootoutLosses = Number(
						minusShootoutLossForHomeTeam.shootoutLosses
					)
					//MATT TEST 2
					minusOvertimeLossForHomeTeam.goalsFor =
						Number(minusOvertimeLossForHomeTeam.goalsFor) - homePoints
					minusOvertimeLossForHomeTeam.goalsAgainst =
						Number(minusOvertimeLossForHomeTeam.goalsAgainst) - visitorPoints
				} else if (status === 'Shootout') {
					minusShootoutLossForHomeTeam.shootoutLosses =
						Number(minusShootoutLossForHomeTeam.shootoutLosses) - 1
					minusOvertimeLossForHomeTeam.overtimeLosses = Number(
						minusOvertimeLossForHomeTeam.overtimeLosses
					)
					minusShootoutLossForHomeTeam.goalsFor =
						Number(minusShootoutLossForHomeTeam.goalsFor) - homePoints
					minusShootoutLossForHomeTeam.goalsAgainst =
						Number(minusShootoutLossForHomeTeam.goalsAgainst) - visitorPoints
				} else {
					console.log(
						'home team lost in regulation in the game were about to delete...'
					)
					//minusLossForHomeTeam.losses = Number(minusLossForHomeTeam.losses) - 1
					minusOvertimeLossForHomeTeam.overtimeLosses = Number(
						minusOvertimeLossForHomeTeam.overtimeLosses
					)
					minusShootoutLossForHomeTeam.shootoutLosses = Number(
						minusShootoutLossForHomeTeam.shootoutLosses
					)
				}

				//
				//
				if (status === 'Overtime') {
					try {
						console.log('saving home team after deleting their overtime loss')
						await minusOvertimeLossForHomeTeam.save()
					} catch (err) {
						const error = new HttpError(
							'could not edit home team to take away overtime loss',
							500
						)
						return next(error)
					}
				} else if (status === 'Shootout') {
					try {
						console.log('saving home team after deleting their shootout loss')
						await minusShootoutLossForHomeTeam.save()
					} catch (err) {
						const error = new HttpError(
							'could not edit home team to take away a loss',
							500
						)
						return next(error)
					}
				} else if (status !== 'Shootout' || 'Overtime') {
					//console.log('whats the status?? ' + status)
					try {
						console.log(
							'saving home team after deleting their regulation loss...'
						)
						await minusLossForHomeTeam.save()
					} catch (err) {
						const error = new HttpError(
							'could not edit home team to take away a loss',
							500
						)
						return next(error)
					}
				}
				//
				//
				//
				try {
					console.log('deleting game stats 2...')
					gameStats.forEach((stat) => {
						stat.deleteOne()
					})
				} catch (err) {
					const error = new HttpError(
						'Could not delete game stats: ' + err,
						404
					)
					return next(error)
				}
				//
				//
				try {
					console.log('deleting game 2...')
					//await gameOrEvent.deleteOne()
					await game.deleteOne()
				} catch (err) {
					const error = new HttpError(err, 404)
					return next(error)
				}
				//
				//If it's a TIE
				//
				//
				//
				//
			} else if (homePoints === visitorPoints) {
				console.log('This game was a tie 1')

				try {
					minusTieForHomeTeam = await Team.findById(teamId)
				} catch (err) {
					const error = new HttpError(
						'Could not find homeTeam to delete their tie.',
						404
					)
					return next(error)
				}
				//
				minusTieForHomeTeam.ties = Number(minusTieForHomeTeam.ties) - 1
				//
				minusTieForHomeTeam.goalsFor =
					Number(minusTieForHomeTeam.goalsFor) - homePoints
				//
				minusTieForHomeTeam.goalsAgainst =
					Number(minusTieForHomeTeam.goalsAgainst) - visitorPoints

				//
				//
				try {
					console.log('saving home team...')
					await minusTieForHomeTeam.save()
				} catch (err) {
					const error = new HttpError(
						'could not edit home team to take away a tie',
						500
					)
					return next(error)
				}
				//
				//
				try {
					console.log('deleting game stats...')
					gameStats.forEach((stat) => {
						stat.deleteOne()
					})
				} catch (err) {
					const error = new HttpError(
						'Could not delete game stats: ' + err,
						404
					)
					return next(error)
				}
				//
				//
				try {
					console.log('deleting game...')
					//await gameOrEvent.deleteOne()
					await game.deleteOne()
				} catch (err) {
					const error = new HttpError(err, 404)
					return next(error)
				}
			}
			//
			//  if playoffStats
			//
			//
		} else if (playoffStats.length > 0) {
			homePoints = playoffStats[0].homeGoalsTotal
			visitorPoints = playoffStats[0].visitorGoalsTotal
			//If the home team was the winner, we need to tap into the team and remove a win from them
			//as well as tap into the visiting team and remove a loss from them
			//
			//
			//    if home team won
			//
			//
			if (homePoints > visitorPoints) {
				console.log('home team won this game that is about to be deleted...')
				try {
					minusWinForHomeTeam = await Team.findById(teamId)
				} catch (err) {
					const error = new HttpError(
						'Could not find homeTeam to delete their win.',
						404
					)
					return next(error)
				}
				//
				//
				minusWinForHomeTeam.wins = Number(minusWinForHomeTeam.wins) - 1
				//
				minusWinForHomeTeam.goalsFor =
					Number(minusWinForHomeTeam.goalsFor) - homePoints
				//
				minusWinForHomeTeam.goalsAgainst =
					Number(minusWinForHomeTeam.goalsAgainst) - visitorPoints
				//
				//
				//
				try {
					console.log('saving home team after removing their win...')
					await minusWinForHomeTeam.save()
				} catch (err) {
					const error = new HttpError(
						'could not edit home team to take away a win',
						500
					)
					return next(error)
				}
				//
				//
				//
				//
				//
				try {
					console.log('deleting game stats 1...')
					playoffStats.forEach((stat) => {
						stat.deleteOne()
					})
				} catch (err) {
					const error = new HttpError(
						'Could not delete game stats: ' + err,
						404
					)
					return next(error)
				}
				//
				//
				try {
					console.log('deleting playoff game...')
					//await gameOrEvent.deleteOne()
					await game.deleteOne()
				} catch (err) {
					const error = new HttpError(err, 404)
					return next(error)
				}
				//
				console.log('you are here 6')
				//
				//
				// IF VISITING TEAM WINS
				//
				//
			} else if (visitorPoints > homePoints) {
				console.log(
					'visitor team won in this playoff game that were about to delete'
				)

				try {
					minusLossForHomeTeam = await Team.findById(teamId)
				} catch (err) {
					const error = new HttpError(
						'Could not find homeTeam to delete their loss.',
						404
					)
					return next(error)
				}
				//
				//
				minusLossForHomeTeam.losses = Number(minusLossForHomeTeam.losses) - 1
				//
				minusLossForHomeTeam.goalsFor =
					Number(minusLossForHomeTeam.goalsFor) - homePoints
				//
				minusLossForHomeTeam.goalsAgainst =
					Number(minusLossForHomeTeam.goalsAgainst) - visitorPoints

				console.log(
					'home team lost in regulation in the playoff game were about to delete...'
				)

				//
				//
				try {
					console.log('saving home team after deleting their playoff loss...')
					await minusLossForHomeTeam.save()
				} catch (err) {
					const error = new HttpError(
						'could not edit home team to take away a loss',
						500
					)
					return next(error)
				}
				//
				//
				//
				try {
					console.log('deleting playoff game stats 2...')
					playoffStats.forEach((stat) => {
						stat.deleteOne()
					})
				} catch (err) {
					const error = new HttpError(
						'Could not delete game stats: ' + err,
						404
					)
					return next(error)
				}
				//
				//
				try {
					console.log('deleting playoff game 2...')
					//await gameOrEvent.deleteOne()
					await game.deleteOne()
				} catch (err) {
					const error = new HttpError(err, 404)
					return next(error)
				}
				//
				//If it's a TIE
			} else if (homePoints === visitorPoints) {
				console.log('This playoff game was a tie')

				try {
					minusTieForHomeTeam = await Team.findById(teamId)
				} catch (err) {
					const error = new HttpError(
						'Could not find homeTeam to delete their playoff tie.',
						404
					)
					return next(error)
				}
				//
				minusTieForHomeTeam.ties = Number(minusTieForHomeTeam.ties) - 1
				//
				minusTieForHomeTeam.goalsFor =
					Number(minusTieForHomeTeam.goalsFor) - homePoints
				//
				minusTieForHomeTeam.goalsAgainst =
					Number(minusTieForHomeTeam.goalsAgainst) - visitorPoints

				//
				//
				try {
					console.log('saving home team...')
					await minusTieForHomeTeam.save()
				} catch (err) {
					const error = new HttpError(
						'could not edit home team to take away a tie',
						500
					)
					return next(error)
				}
				//
				//
				try {
					console.log('deleting playoff game stats...')
					playoffStats.forEach((stat) => {
						stat.deleteOne()
					})
				} catch (err) {
					const error = new HttpError(
						'Could not delete game stats: ' + err,
						404
					)
					return next(error)
				}
				//
				//
				try {
					console.log('deleting game...')
					//await gameOrEvent.deleteOne()
					await game.deleteOne()
				} catch (err) {
					const error = new HttpError(err, 404)
					return next(error)
				}
			}
		} else if (championshipStats.length > 0) {
			console.log('looks like we want to delete a championship game!')
			homePoints = championshipStats[0].homeGoalsTotal
			visitorPoints = championshipStats[0].visitorGoalsTotal
			//If the home team was the winner, we need to tap into the team and remove a win from them
			//as well as tap into the visiting team and remove a loss from them
			//
			//
			//    if home team won
			//
			//
			if (homePoints > visitorPoints) {
				console.log(
					'home team won this championship game that is about to be deleted...'
				)
				try {
					minusWinForHomeTeam = await Team.findById(teamId)
				} catch (err) {
					const error = new HttpError(
						'Could not find homeTeam to delete their win.',
						404
					)
					return next(error)
				}
				//
				//
				minusWinForHomeTeam.wins = Number(minusWinForHomeTeam.wins) - 1
				//
				minusWinForHomeTeam.goalsFor =
					Number(minusWinForHomeTeam.goalsFor) - homePoints
				//
				minusWinForHomeTeam.goalsAgainst =
					Number(minusWinForHomeTeam.goalsAgainst) - visitorPoints
				//
				//
				//
				try {
					console.log('saving home team after removing their win...')
					await minusWinForHomeTeam.save()
				} catch (err) {
					const error = new HttpError(
						'could not edit home team to take away a win',
						500
					)
					return next(error)
				}
				//
				//
				//
				//
				//
				try {
					console.log('deleting game stats 1...')
					championshipStats.forEach((stat) => {
						stat.deleteOne()
					})
				} catch (err) {
					const error = new HttpError(
						'Could not delete game stats: ' + err,
						404
					)
					return next(error)
				}
				//
				//
				try {
					console.log('deleting championship game...')
					//await gameOrEvent.deleteOne()
					await game.deleteOne()
				} catch (err) {
					const error = new HttpError(err, 404)
					return next(error)
				}
				//
				console.log('you are here 61')
				//
				//
				// IF VISITING TEAM WINS
				//
				//
			} else if (visitorPoints > homePoints) {
				console.log(
					'visitor team won in this championship game that were about to delete'
				)

				try {
					minusLossForHomeTeam = await Team.findById(teamId)
				} catch (err) {
					const error = new HttpError(
						'Could not find homeTeam to delete their loss.',
						404
					)
					return next(error)
				}
				//
				//
				minusLossForHomeTeam.losses = Number(minusLossForHomeTeam.losses) - 1
				//
				minusLossForHomeTeam.goalsFor =
					Number(minusLossForHomeTeam.goalsFor) - homePoints
				//
				minusLossForHomeTeam.goalsAgainst =
					Number(minusLossForHomeTeam.goalsAgainst) - visitorPoints

				console.log(
					'home team lost in regulation in the championship game were about to delete...'
				)

				//
				//
				try {
					console.log(
						'saving home team after deleting their championship loss...'
					)
					await minusLossForHomeTeam.save()
				} catch (err) {
					const error = new HttpError(
						'could not edit home team to take away a loss',
						500
					)
					return next(error)
				}
				//
				//
				//
				try {
					console.log('deleting championship game stats 2...')
					championshipStats.forEach((stat) => {
						stat.deleteOne()
					})
				} catch (err) {
					const error = new HttpError(
						'Could not delete game stats: ' + err,
						404
					)
					return next(error)
				}
				//
				//
				try {
					console.log('deleting championship game 2...')
					//await gameOrEvent.deleteOne()
					await game.deleteOne()
				} catch (err) {
					const error = new HttpError(err, 404)
					return next(error)
				}
				//
				//If it's a TIE
			} else if (homePoints === visitorPoints) {
				console.log('This championship game was a tie')

				try {
					minusTieForHomeTeam = await Team.findById(teamId)
				} catch (err) {
					const error = new HttpError(
						'Could not find homeTeam to delete their championship tie.',
						404
					)
					return next(error)
				}
				//
				minusTieForHomeTeam.ties = Number(minusTieForHomeTeam.ties) - 1
				//
				minusTieForHomeTeam.goalsFor =
					Number(minusTieForHomeTeam.goalsFor) - homePoints
				//
				minusTieForHomeTeam.goalsAgainst =
					Number(minusTieForHomeTeam.goalsAgainst) - visitorPoints

				//
				//
				try {
					console.log('saving home team...')
					await minusTieForHomeTeam.save()
				} catch (err) {
					const error = new HttpError(
						'could not edit home team to take away a tie',
						500
					)
					return next(error)
				}
				//
				//
				try {
					console.log('deleting championship game stats...')
					championshipStats.forEach((stat) => {
						stat.deleteOne()
					})
				} catch (err) {
					const error = new HttpError(
						'Could not delete game stats: ' + err,
						404
					)
					return next(error)
				}
				//
				//
				try {
					console.log('deleting game...')
					//await gameOrEvent.deleteOne()
					await game.deleteOne()
				} catch (err) {
					const error = new HttpError(err, 404)
					return next(error)
				}
			}
		}
		//
		//
		//
		//
		//
		//if a game was entered, but nothing was ever filled in for it, and we delete it,
		//we still want it to delete
		try {
			console.log('deleting game...')
			//await gameOrEvent.deleteOne()
			await game.deleteOne()
		} catch (err) {
			const error = new HttpError(err, 404)
			return next(error)
		}

		//Next, we want to delete any rosterPlayerStatsPerGame for this game, if any exist
		let allPlayersWithGameStats
		console.log('looking up rosterPlayerStatsPerGame to delete...')
		try {
			allPlayersWithGameStats = await rosterPlayerStatsPerGame.find({
				gameId: itemId,
			})
		} catch (err) {
			const error = new HttpError(
				'No players with stats found for this game ' + err,
				500
			)
			return next(error)
		}

		console.log('allPlayersWithGameStats: ' + allPlayersWithGameStats)
		console.log(
			'allPlayersWithGameStats LENGTH: ' + allPlayersWithGameStats.length
		)

		//for each player that has stats that game, we want to go find their rosterPlayer and
		//remove any goals or assists that took place this game
		let rosterPlayer
		allPlayersWithGameStats.forEach(async (player) => {
			try {
				rosterPlayer = await RosterPlayer.findById(player.rosterPlayerId)
			} catch (err) {
				const error = new HttpError(
					'Could not find player for that id ' + err,
					500
				)
				return next(error)
			}
			rosterPlayer.goals = Number(rosterPlayer.goals) - player.goals
			rosterPlayer.assists = Number(rosterPlayer.assists) - player.assists
			//
			try {
				console.log('saving roster player to remove any goals or assists...')
				await rosterPlayer.save()
			} catch (err) {
				const error = new HttpError(
					'could not edit roster player to take away goals or assists',
					500
				)
				return next(error)
			}
		})

		if (allPlayersWithGameStats) {
			try {
				console.log('deleting allPlayersWithGameStats...')
				allPlayersWithGameStats.forEach((playerGameStats) => {
					playerGameStats.deleteOne()
				})
			} catch (err) {
				const error = new HttpError(err, 404)
				return next(error)
			}
		}
	}
	if (event) {
		try {
			console.log('deleting event...')
			await event.deleteOne()
		} catch (err) {
			const error = new HttpError(err, 404)
			return next(error)
		}
	}

	res.status(200).json({
		message: 'Deleted the game or event',
	})
}
//************************************************************************************ */
//
//
//
//
//************************************************************************************ */
const deleteAllRosterPlayerStatsPerGame = async (req, res, next) => {
	let allRosterPlayerStatsPerGame
	try {
		const filter = {}
		allRosterPlayerStatsPerGame = await RosterPlayerStatsPerGame.find(filter)
	} catch (err) {
		const error = new HttpError(err, 500)
		return next(error)
	}

	allRosterPlayerStatsPerGame.forEach(async (rpspg) => {
		try {
			await rpspg.deleteOne()
		} catch (err) {
			const error = new HttpError(err, 500)
			return next(error)
		}
	})

	res.json({ message: 'all roster player stats per game have been deleted' })
}

//
//
//****************************************************************************************** */
//
//Status code of 401 means authentication failed
//
//****************************************************************************************** */
const login = async (req, res, next) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		throw new HttpError('Invalid inputs - something is empty', 422)
	}

	const { email, password } = req.body

	if (email !== 'ahigareda@onmail.com') {
		const error = new HttpError('invalid EMAIL', 401)
		return next(error)
	}

	if (password !== 'admin1234') {
		const error = new HttpError('invalid PASSWORD', 401)
		return next(error)
	}

	let token
	try {
		//token = jwt.sign({ email: email }, 'supersecret_dont_share', {
		token = jwt.sign({ email: email }, process.env.JWT_KEY, {
			expiresIn: '1hr',
		})
	} catch (err) {
		const error = new HttpError(
			'Logging in failed, please try again later',
			500
		)
		return next(error)
	}

	res.json({ message: 'Logged in successfully', token: token })
}
//
//
//
//
//
//
//
exports.getArchivedTeams = getArchivedTeams
exports.getCurrentTeam = getCurrentTeam
exports.getVenues = getVenues
exports.getVideos = getVideos
exports.getTeamData = getTeamData
exports.getVenueData = getVenueData
exports.getVideoData = getVideoData
//exports.getTeamData = getTeamData
exports.getPlayerNumber = getPlayerNumber
exports.getPlayerData = getPlayerData
exports.getPlayerDataByRosterId = getPlayerDataByRosterId //< - - - used for testing
exports.getGameData = getGameData
exports.getEventData = getEventData
//exports.getTeamsInLeague = getTeamsInLeague
exports.getPlayersOnTeam = getPlayersOnTeam
exports.getTeamsInLeagueWithDivision = getTeamsInLeagueWithDivision
exports.getTeamsInLeagueByLeagueId = getTeamsInLeagueByLeagueId
exports.getTeamsInLeagueByLeagueName = getTeamsInLeagueByLeagueName
//exports.getPlayersOnTeam = getPlayersOnTeam
exports.getPlayersOnTeamWithDivision = getPlayersOnTeamWithDivision
exports.getGameRostersAndPointsPerPeriod = getGameRostersAndPointsPerPeriod
exports.getAllRosters = getAllRosters
exports.getAllPlayers = getAllPlayers
exports.allGamesAndEvents = allGamesAndEvents //This is the full schedule
exports.allGamesAndEventsWeek = allGamesAndEventsWeek //This is this weeks schedule
exports.createNewTeam = createNewTeam
exports.copyLeague = copyLeague
exports.createNewVenue = createNewVenue
exports.createNewVideo = createNewVideo
exports.createNewPlayer = createNewPlayer
exports.newPlayerOnTeam = newPlayerOnTeam
//exports.createNewTeam = createNewTeam
//exports.createNewTeamWithDivision = createNewTeamWithDivision
exports.createGames = createGames
exports.uploadGames = uploadGames
exports.createGameStats = createGameStats
exports.createPlayoffGameStats = createPlayoffGameStats
exports.createChampionshipGameStats = createChampionshipGameStats
exports.createEvents = createEvents
exports.addPlayerToTeam = addPlayerToTeam
exports.addPlayerToTeamWithDivision = addPlayerToTeamWithDivision
exports.editTeamName = editTeamName
exports.editTeamNameWithDivision = editTeamNameWithDivision
exports.editPlayerNumber = editPlayerNumber
exports.editTeam = editTeam
exports.archiveCurrentToggleTeam = archiveCurrentToggleTeam
exports.editVenue = editVenue
exports.editVideo = editVideo
exports.editPlayerName = editPlayerName
exports.editGame = editGame
exports.editEvent = editEvent
exports.removeTeam = removeTeam
exports.removeVideo = removeVideo
//exports.removeTeam = removeTeam
exports.removePlayer = removePlayer
exports.removeEvent = removeEvent
exports.deleteAllRosterPlayerStatsPerGame = deleteAllRosterPlayerStatsPerGame
exports.login = login
//  localhost:5000/api/admin/leagues/current       < - - - get all current leagues
//  http://localhost:5000/api/admin/Cadet%20Dek/Spring%20II/2022/teams    < - - getTeamsInLeague
//  http://localhost:5000/api/admin/Beaver%20Dek/Spring%20II/2022/Red/players   < - - getPlayersOnTeam
//  localhost:5000/api/admin/Beaver Dek/Spring II/2022/newTeam  < - - create a new team (Postman)
//  localhost:5000/api/admin/Beaver Dek/Spring II/2022/Orange/addPlayers   < - - - add player to roster (Postman)
//  localhost:5000/api/admin/Beaver Dek/Spring II/2022/t5/updateTeam   < - - - updateTeamName (Postman)
//  localhost:5000/api/admin/updateLeague/fed69cf6-87a7-462f-8264-3244e9640a60   < - - - - updateLeague (Postman) Chipmunk D
