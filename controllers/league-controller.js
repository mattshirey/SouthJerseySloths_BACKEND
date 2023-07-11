const { v4: uuidv4 } = require('uuid')
const { validationResult } = require('express-validator')
const HttpError = require('../models/http-error')
const League = require('../models/league')
const Team = require('../models/team')
const Roster = require('../models/roster')
const Player = require('../models/player')
const RosterPlayer = require('../models/rosterPlayer')
const Game = require('../models/game')
const Event = require('../models/event')
const GameStats = require('../models/gameStats')
const Venue = require('../models/venue')

//
//
//****************************************************************************************** */
//
// Get standings. This is non-admin
//
//****************************************************************************************** */
const getStandings = async (req, res, next) => {
	const leagueId = req.params.leagueId
	let leagueName
	let session
	let year

	try {
		foundLeague = await League.findById(leagueId)
	} catch (err) {
		const error = new HttpError(
			'Could not find league to obtain leagueName, session, or year.  getStandings',
			404
		)
		return next(error)
	}

	leagueName = foundLeague.leagueName
	session = foundLeague.session
	year = foundLeague.year

	//Now lets find a list of teams that are in this league
	let listOfTeams
	try {
		listOfTeams = await Team.find({
			leagueId: leagueId,
		}).orFail()
	} catch (err) {
		const error = new HttpError(
			'No teams yet for this league.  Stay tuned...',
			403
		)
		return next(error)
	}

	if (listOfTeams) {
		listOfTeams.sort((a, b) => (a.points < b.points ? 1 : -1))
	}

	//else {
	//	return next(
	//		new HttpError('Could not find teams for the provided leagueId', 404)
	//	)
	//}

	res.json({ listOfTeams, leagueName, session, year })
	//res.json({ leagueName, session, year })
}
//
//
//
//
//
//
//****************************************************************************************** */
//
// Get Scoring Leaders by League Id.  This is non-admin
//
//
//****************************************************************************************** */
const getScoringLeadersByLeagueId = async (req, res, next) => {
	const leagueId = req.params.leagueId
	//First, find the leagueName, session, and year via the leagueId in the params.
	//Make sure it is current league
	let leagueName
	let session
	let year
	try {
		foundLeague = await League.findById(leagueId)
	} catch (err) {
		const error = new HttpError(
			'League not found.  getScoringLeadersByLeagueId',
			404
		)
		return next(error)
	}
	leagueName = foundLeague.leagueName
	session = foundLeague.session
	year = foundLeague.year
	//
	//
	//
	//
	//Next we want to GET every player in the leagueId.
	//To do that, we need to GET all the rosters in that league
	let allRosteredPlayersInLeague
	try {
		allRosteredPlayersInLeague = await RosterPlayer.find({
			leagueId: leagueId,
		}).orFail()
	} catch (err) {
		const error = new HttpError(
			'No Players yet for this league.  Stay tuned...',
			404
		)
		return next(error)
	}
	// console.log('allRosteredPlayersInLeague: ' + allRosteredPlayersInLeague)

	let scoringLeaders

	if (allRosteredPlayersInLeague) {
		scoringLeaders = allRosteredPlayersInLeague.sort((a, b) =>
			a.goals + a.assists < b.goals + b.assists ? 1 : -1
		)
	}

	scoringLeaders = scoringLeaders.slice(0, 10)

	res.json({ scoringLeaders, leagueName, session, year })
}
//
//
//
//
//
//****************************************************************************************** */
//
// Get Players on a team. This is non-admin.
// this also returns wins, losses, overtime losses, and shootout losses
//
//****************************************************************************************** */
const getPlayersOnTeam = async (req, res, next) => {
	const leagueId = req.params.leagueId
	const teamName = req.params.teamName
	//const session = req.params.session
	//const year = req.params.year
	//
	//
	//Get the leagueName - we'll want this so it displays at the top of the players list page
	let leagueName, divisionName, session, year
	try {
		foundLeague = await League.findById(leagueId)
	} catch (err) {
		const error = new HttpError(
			'Could not find league to obtain leagueName.  getPlayersOnTeam',
			404
		)
		return next(error)
	}
	leagueName = foundLeague.leagueName
	divisionName = foundLeague.divisionName
	session = foundLeague.session
	year = foundLeague.year
	console.log('divisionName: ' + divisionName)
	//
	//
	//GET THE TEAM ID
	//We have the leagueId, and we have the teamName from the params.
	//So lets get the teamId
	//MATT:  I have no idea why this works differently than Players.js in the
	//frontend, but whatever...
	let teamId, rosterId, foundRoster, rosteredPlayers
	let foundTeam, foundLeagueWithDivisions
	let wins
	let losses, overtimeLosses, shootoutLosses, ties
	//
	if (divisionName) {
		console.log('we have divisions here!  getPlayersOnTeam')
		try {
			foundLeagueWithDivisions = await League.find({
				leagueName: leagueName,
				session: session,
				year: year,
			}).orFail()
		} catch (err) {
			const error = new HttpError(
				'Could not find league to obtain leagueId. WITH divisions. getPlayersOnTeam',
				500
			)
			return next(error)
		}
		//
		//
		//So we have multiple leagues here.  Let's make an array of all teams
		let allTeamsInThisLeague, teams
		//MATT START
		allTeamsInThisLeague = []
		for (let i = 0; i < foundLeagueWithDivisions.length; i++) {
			try {
				teams = await Team.find({
					leagueName: foundLeagueWithDivisions[i].leagueName,
					divisionName: foundLeagueWithDivisions[i].divisionName,
				}).orFail()
			} catch {}
			teams.forEach((team) => {
				allTeamsInThisLeague.push(team)
			})
		}

		allTeamsInThisLeague.forEach(async (team) => {
			if (team.teamName === teamName) {
				foundTeam = team
			}
		})

		console.log('foundTeam: ' + foundTeam)

		teamId = foundTeam.id
		wins = foundTeam.wins
		losses = foundTeam.losses
		overtimeLosses = foundTeam.overtimeLosses
		shootoutLosses = foundTeam.shootoutLosses
		ties = foundTeam.ties
		//
		//
		//
		////GET THE ROSTER ID FOR THIS TEAMID
		console.log('leagueId: ' + leagueId)
		console.log('divisionName: ' + foundTeam.divisionName)
		console.log('teamId: ' + foundTeam._id)
		try {
			foundRoster = await Roster.findOne({
				leagueId: foundTeam.leagueId,
				divisionName: foundTeam.divisionName,
				teamId: foundTeam._id,
			}).orFail()
		} catch (err) {
			const error = new HttpError(
				'Could not find roster to obtain rosterId.  getPlayersOnTeam ' + err,
				404
			)
			return next(error)
		}
		rosterId = foundRoster.id
		//
		//Get all players in that roster.  This is where player id's and jersey numbers will be
		//let rosteredPlayers
		try {
			rosteredPlayers = await RosterPlayer.find({
				rosterId: rosterId,
			})
		} catch (err) {
			const error = new HttpError('Trouble finding players for this team', 404)
			return next(error)
		}
	}
	//
	//
	//  No divisions
	//
	//
	if (!divisionName) {
		console.log('NO divisions')
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
		wins = foundTeam.wins
		losses = foundTeam.losses
		overtimeLosses = foundTeam.overtimeLosses
		shootoutLosses = foundTeam.shootoutLosses
		ties = foundTeam.ties
		//
		////GET THE ROSTER ID FOR THIS TEAMID
		//let rosterId
		//let foundRoster
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
		//
		//Get all players in that roster.  This is where player id's and jersey numbers will be
		//let rosteredPlayers
		try {
			rosteredPlayers = await RosterPlayer.find({
				rosterId: rosterId,
			})
		} catch (err) {
			const error = new HttpError('Trouble finding players for this team', 404)
			return next(error)
		}
	}

	rosteredPlayers.sort((a, b) =>
		a.goals + a.assists < b.goals + b.assists ? 1 : -1
	)

	res.json({
		rosteredPlayers,
		wins,
		losses,
		overtimeLosses,
		shootoutLosses,
		ties,
		leagueName,
	})
}
//****************************************************************************************** */
//
// Get Team Schedule to display on the RosterAndSchedulePage. This is non-admin.
//
//****************************************************************************************** */
const getTeamSchedule = async (req, res, next) => {
	const leagueId = req.params.leagueId
	const teamName = req.params.teamName
	const session = req.params.session
	const year = req.params.year
	//
	//
	//Get the leagueName - we'll want this so it displays at the top of the players list page
	let leagueName, divisionName, foundLeagueWithDivisions
	try {
		foundLeague = await League.findById(leagueId)
	} catch (err) {
		const error = new HttpError(
			'Could not find league to obtain leagueName.  getPlayersOnTeam',
			404
		)
		return next(error)
	}
	leagueName = foundLeague.leagueName
	divisionName = foundLeague.divisionName
	//
	//
	//GET THE TEAM ID
	//We have the leagueId, and we have the teamName from the params.
	//So lets get the teamId

	let teamId
	let foundTeam
	//
	//7/6/2023  For NBHL, I got rid of the session finder and replaced with isCurrent
	//
	//
	if (divisionName) {
		console.log('we have divisions here! getTeamSchedule')
		try {
			foundLeagueWithDivisions = await League.find({
				leagueName: leagueName,
				//session: session,
				isCurrent: true,
				year: year,
			}).orFail()
		} catch (err) {
			const error = new HttpError(
				'Could not find league to obtain leagueId. WITH divisions. getTeamSchedule',
				500
			)
			return next(error)
		}

		//So we have multiple leagues here.  Let's make an array of all teams
		let allTeamsInThisLeague, teams
		//MATT START
		allTeamsInThisLeague = []
		for (let i = 0; i < foundLeagueWithDivisions.length; i++) {
			try {
				teams = await Team.find({
					leagueName: foundLeagueWithDivisions[i].leagueName,
					divisionName: foundLeagueWithDivisions[i].divisionName,
				}).orFail()
			} catch {}
			teams.forEach((team) => {
				allTeamsInThisLeague.push(team)
			})
		}

		//let homeTeamId
		//let foundHomeTeam
		allTeamsInThisLeague.forEach(async (team) => {
			if (team.teamName === teamName) {
				foundTeam = team
			}
		})
		//console.log('foundHomeTeam1: ' + foundHomeTeam1)
		teamId = foundTeam.id
	}

	//
	//
	//
	//
	//
	if (!divisionName) {
		try {
			foundTeam = await Team.findOne({
				leagueId: leagueId,
				teamName: teamName,
			}).orFail()
		} catch (err) {
			const error = new HttpError(
				'Could not find team to obtain teamId 4.  getTeamSchedule',
				404
			)
			return next(error)
		}
		teamId = foundTeam.id
	}

	//
	//
	//
	//Now we should tap into the games table
	let teamGamesHome
	try {
		teamGamesHome = await Game.find({
			homeTeamId: teamId,
		})
	} catch (err) {
		const error = new HttpError(
			err,
			// 'Trouble finding games for this team.  teamGamesHome',
			404
		)
		return next(error)
	}
	//console.log('teamGamesHome: ' + teamGamesHome)
	//
	//
	//
	//
	let teamGamesVisitor
	try {
		teamGamesVisitor = await Game.find({
			visitorTeamId: teamId,
		})
	} catch (err) {
		const error = new HttpError(
			'Trouble finding games for this team.  teamGamesVisitor',
			404
		)
		return next(error)
	}
	//console.log('teamGamesVisitor: ' + teamGamesVisitor)

	let allGamesArray
	allGamesArray = []

	for (let i = 0; i < teamGamesHome.length; i++) {
		allGamesArray.push(teamGamesHome[i])
	}

	for (let i = 0; i < teamGamesVisitor.length; i++) {
		allGamesArray.push(teamGamesVisitor[i])
	}

	//This little algorithm will sort all games and events based on first the
	//date, then the times
	allGamesArray.sort(function (a, b) {
		if (a.date === b.date) {
			return a.time < b.time ? -1 : a.time > b.time ? 1 : 0
		} else {
			return new Date(b.date) < new Date(a.date) ? 1 : -1
		}
	})

	//console.log('ALL GAMES ARRAY: ' + allGamesArray)

	res.json({ allGamesArray: allGamesArray, teamId: teamId })
}
//****************************************************************************************** */
//
// Get Team Schedule to display main schedule page, via the 'search by team' dropdown.
// This is non-admin.
//
//****************************************************************************************** */
const getTeamSchedule2 = async (req, res, next) => {
	console.log('inside getTeamSchedule2')
	const leagueName = req.params.leagueName
	const session = req.params.session
	const year = req.params.year
	const teamName = req.params.teamName
	//
	//
	console.log('teamName: ' + teamName)
	//
	//
	//First, let's find the leagueId
	//7/6/2023  For NBHL, I got rid of the session finder and replaced with isCurrent
	let leagueId, teamId, wins, losses, overtimeLosses, shootoutLosses, ties
	let foundLeague, divisionName, foundLeagueWithDivisions
	try {
		foundLeague = await League.findOne({
			leagueName: leagueName,
			//session: session,
			isCurrent: true,
			year: year,
			//teamName: teamName,
		}).orFail()
	} catch (err) {
		const error = new HttpError(
			'Could not find league to obtain leagueId.  getTeamSchedule2',
			404
		)
		return next(error)
	}
	leagueId = foundLeague._id
	divisionName = foundLeague.divisionName

	//7/6/2023  For NBHL, I got rid of the session finder and replaced with isCurrent
	if (divisionName) {
		console.log('we have divisions!')
		try {
			foundLeagueWithDivisions = await League.find({
				leagueName: leagueName,
				//session: session,
				isCurrent: true,
				year: year,
			}).orFail()
		} catch (err) {
			const error = new HttpError(
				'Could not find league to obtain leagueId WITH divisions.  getTeamSchedule2',
				500
			)
			return next(error)
		}

		console.log('foundLeagueWithDivisions: ' + foundLeagueWithDivisions)

		//So we have multiple leagues here.  Let's make an array of all teams
		let allTeamsInThisLeague, teams
		//MATT START
		allTeamsInThisLeague = []
		for (let i = 0; i < foundLeagueWithDivisions.length; i++) {
			try {
				teams = await Team.find({
					leagueName: foundLeagueWithDivisions[i].leagueName,
					divisionName: foundLeagueWithDivisions[i].divisionName,
				}).orFail()
			} catch (err) {
				const error = new HttpError(err + ' getTeamSchedule2', 404)
				console.log(error)
			}
			console.log('teams: ' + teams)
			teams.forEach((team) => {
				allTeamsInThisLeague.push(team)
			})
		}
		//
		//
		//let teamId
		let foundHomeTeam
		allTeamsInThisLeague.forEach(async (team) => {
			if (team.teamName === teamName) {
				foundHomeTeam = team
			}
		})
		//console.log('foundHomeTeam WITH a division: ' + foundHomeTeam)
		teamId = foundHomeTeam.id
		wins = foundHomeTeam.wins
		losses = foundHomeTeam.losses
		overtimeLosses = foundHomeTeam.overtimeLosses
		shootoutLosses = foundHomeTeam.shootoutLosses
		ties = foundHomeTeam.ties
	}

	if (!divisionName) {
		//
		//GET THE TEAM ID
		//We have the leagueId, and we have the teamName from the params.
		//So lets get the teamId
		//let teamId
		let foundTeam
		try {
			foundTeam = await Team.findOne({
				leagueId: leagueId,
				teamName: teamName,
			}).orFail()
		} catch (err) {
			const error = new HttpError(
				'Could not find team to obtain teamId 5.  getTeamSchedule2',
				404
			)
			return next(error)
		}
		teamId = foundTeam.id
		wins = foundTeam.wins
		losses = foundTeam.losses
		overtimeLosses = foundTeam.overtimeLosses
		shootoutLosses = foundTeam.shootoutLosses
		ties = foundTeam.ties

		console.log('foundHomeTeam WITHOUT a division: ' + foundTeam)
		console.log('teamId: ' + teamId)
	}
	//
	//
	//
	//Now we should tap into the games table
	let teamGamesHome
	try {
		teamGamesHome = await Game.find({
			homeTeamId: teamId,
		})
	} catch (err) {
		const error = new HttpError(
			err,
			// 'Trouble finding games for this team.  teamGamesHome',
			404
		)
		return next(error)
	}
	console.log('teamGamesHome: ' + teamGamesHome)
	//
	//
	//
	//
	let teamGamesVisitor
	try {
		teamGamesVisitor = await Game.find({
			visitorTeamId: teamId,
		})
	} catch (err) {
		const error = new HttpError(
			'Trouble finding games for this team.  getTeamSchedule2',
			404
		)
		return next(error)
	}
	console.log('teamGamesVisitor: ' + teamGamesVisitor)

	let allTeamGamesArray
	allTeamGamesArray = []

	for (let i = 0; i < teamGamesHome.length; i++) {
		allTeamGamesArray.push(teamGamesHome[i])
	}

	for (let i = 0; i < teamGamesVisitor.length; i++) {
		allTeamGamesArray.push(teamGamesVisitor[i])
	}

	//This little algorithm will sort all games and events based on first the
	//date, then the times
	allTeamGamesArray.sort(function (a, b) {
		if (a.date === b.date) {
			return a.time < b.time ? -1 : a.time > b.time ? 1 : 0
		} else {
			return new Date(b.date) < new Date(a.date) ? 1 : -1
		}
	})

	//console.log('ALL GAMES ARRAY: ' + allTeamGamesArray)

	res.json({
		allTeamGamesArray: allTeamGamesArray,
		teamId,
		wins,
		losses,
		ties,
		overtimeLosses,
		shootoutLosses,
	})
}
//****************************************************************************************** */
//
//  Get League Schedule.  This is non-admin.
//  THIS IS FOR WHEN YOU'RE IN THE SEARCH BY LEAGUE OR SEARCH BY TEAM PAGE!!!!!!!!!!!!!!!
//
//****************************************************************************************** */
const getLeagueSchedule = async (req, res, next) => {
	const leagueId = req.params.leagueId
	console.log('INSIDE getLeagueSchedule')
	//
	//
	//Get the leagueName - we'll want this so it displays at the top of the players list page
	let leagueName, session, year, divisionName
	try {
		foundLeague = await League.findById(leagueId)
	} catch (err) {
		const error = new HttpError(
			'Could not find league to obtain leagueName.  getLeagueSchedule',
			404
		)
		return next(error)
	}
	leagueName = foundLeague.leagueName
	session = foundLeague.session
	year = foundLeague.year
	divisionName = foundLeague.divisionName

	//console.log(divisionName)

	let allLeagueGamesArray
	allLeagueGamesArray = []

	if (divisionName) {
		console.log('we have divisions here!  getLeagueSchedule ' + divisionName)
		//So...I think the first thing we need to do here is find all the teams in this
		//division
		let allTeamsInDivision
		try {
			allTeamsInDivision = await Team.find({
				leagueName: leagueName,
				divisionName: divisionName,
				session: session,
				year: year,
			}).orFail()
		} catch (err) {
			const error = new HttpError(
				'Could not find any teams in this division.  getLeagueSchedule',
				404
			)
			return next(error)
		}

		//Now we need to find all games that include teamName, leagueName, session, year
		//We'll do this for both home team and visitor team possibilities
		//allLeagueGamesBefore.  This is an array that will be created by searching for
		//games where the team is the home team, THEN adding games when team is the visitor.
		//Then we search allLeagueGamesBefore for duplicates.  Once we have a unique array of
		//game ids there, we'll find the games for those id's (just one) and populate
		//allLeagueGames with those.
		let allLeagueGames,
			allHomeTeamGames,
			allVisitorTeamGames,
			allLeagueGamesBefore
		allLeagueGamesBefore = []
		allLeagueGames = []

		for (let i = 0; i < allTeamsInDivision.length; i++) {
			try {
				allHomeTeamGames = await Game.find({
					leagueName: leagueName,
					homeTeamName: allTeamsInDivision[i].teamName,
					session: session,
					year: year,
				}).orFail()
			} catch {}
			allHomeTeamGames &&
				allHomeTeamGames.forEach((game) => {
					allLeagueGamesBefore.push(game)
				})
		}

		for (let i = 0; i < allTeamsInDivision.length; i++) {
			try {
				allVisitorTeamGames = await Game.find({
					leagueName: leagueName,
					visitorTeamName: allTeamsInDivision[i].teamName,
					session: session,
					year: year,
				}).orFail()
			} catch {}
			allVisitorTeamGames &&
				allVisitorTeamGames.forEach((game) => {
					allLeagueGamesBefore.push(game)
				})
		}

		const uniqueValues = new Set(allLeagueGamesBefore.map((v) => v.id))

		console.log(uniqueValues.size)

		//So at this point, we have a list of all non-duplicate game id's.
		//I can't think of any better way to do this - I'm kinda stuck.  So,
		//I'm going to do an extra hit to the database unfortunately.  I'm
		//going to find all the games that match the game id in the uniqueValues list.
		//I'll see if findOne works.  That way, we wont have duplicates.  Duplicates
		//were created when I searched for allHomeTeamGames and allVisitorTeamGames

		//But first, I need to convert the Set to an Array so I can iterate through it
		//This is the most convoluted damn thing...
		let uniqueValuesArray
		uniqueValuesArray = [...uniqueValues]

		let findAGame

		for (let i = 0; i < uniqueValuesArray.length; i++) {
			try {
				findAGame = await Game.findOne({
					// isCurrent: true,
					_id: uniqueValuesArray[i],
				})
			} catch (err) {
				console.log(err)
			}
			allLeagueGames.push(findAGame)
		}

		for (let i = 0; i < allLeagueGames.length; i++) {
			allLeagueGamesArray.push(allLeagueGames[i])
		}

		//This little algorithm will sort all games and events based on first the
		//date, then the times
		allLeagueGamesArray.sort(function (a, b) {
			if (a.date === b.date) {
				return a.time < b.time ? -1 : a.time > b.time ? 1 : 0
			} else {
				return new Date(b.date) < new Date(a.date) ? 1 : -1
			}
		})

		//console.log('ALL GAMES ARRAY: ' + allLeagueGamesArray)
		//
		//
		//
	} else {
		//
		//
		//
		//
		console.log('no divisions!    getLeagueSchedule')
		//Now we need to find all games that include leagueName, session, and year
		//
		//7/6/2023.  For NBHL, I took out the session finder below and put in isCurrent
		//
		//
		let allLeagueGames
		try {
			allLeagueGames = await Game.find({
				leagueName: leagueName,
				//session: session,
				isCurrent: true,
				year: year,
			}).orFail()
		} catch (err) {
			const error = new HttpError(
				'Could not find league to obtain games.  getLeagueSchedule',
				404
			)
			return next(error)
		}

		for (let i = 0; i < allLeagueGames.length; i++) {
			allLeagueGamesArray.push(allLeagueGames[i])
		}

		//This little algorithm will sort all games and events based on first the
		//date, then the times
		allLeagueGamesArray.sort(function (a, b) {
			if (a.date === b.date) {
				return a.time < b.time ? -1 : a.time > b.time ? 1 : 0
			} else {
				return new Date(b.date) < new Date(a.date) ? 1 : -1
			}
		})

		//console.log('ALL GAMES ARRAY: ' + allLeagueGamesArray)
	}

	res.json({
		allLeagueGamesArray: allLeagueGamesArray,
		divisionName: divisionName,
	})
}
//
//
//
//****************************************************************************************** */
//
//  Get League Schedule ADMIN.  This is for the admin view, which shows all games.
//  THIS IS FOR WHEN YOU'RE IN THE SEARCH BY LEAGUE ON THE ADMIN PAGE!!!!!!!!!!!!!!!
//
//****************************************************************************************** */
const getAdminLeagueSchedule = async (req, res, next) => {
	const leagueId = req.params.leagueId
	console.log('INSIDE getAdminLeagueSchedule ' + leagueId)
	//
	//
	//Get the leagueName - we'll want this so it displays at the top of the players list page
	let leagueName, session, year, divisionName
	try {
		foundLeague = await League.findById(leagueId)
	} catch (err) {
		const error = new HttpError(
			'Could not find league to obtain leagueName 1.  getAdminLeagueSchedule ' +
				err,
			404
		)
		return next(error)
	}
	leagueName = foundLeague.leagueName
	//session = foundLeague.session
	year = foundLeague.year
	divisionName = foundLeague.divisionName

	console.log('leagueName 1 ' + leagueName)

	let allLeagueGamesArray
	allLeagueGamesArray = []
	//
	//
	//
	//
	//
	//
	//
	//console.log('no divisions!    getAdminLeagueSchedule')
	//Now we need to find all games that include leagueName, session, and year
	//7-6-2023 got rid of the session finder and replaced with isCurrent
	let allLeagueGames
	console.log('leagueName 2 ' + leagueName)
	try {
		allLeagueGames = await Game.find({
			leagueName: leagueName,
			//session: session,
			isCurrent: true,
			year: year,
		}).orFail()
	} catch (err) {
		const error = new HttpError(
			'Could not find league to obtain games 1.  getAdminLeagueSchedule ' + err,
			404
		)
		return next(error)
	}

	for (let i = 0; i < allLeagueGames.length; i++) {
		allLeagueGamesArray.push(allLeagueGames[i])
	}

	//This little algorithm will sort all games and events based on first the
	//date, then the times
	allLeagueGamesArray.sort(function (a, b) {
		if (a.date === b.date) {
			return a.time < b.time ? -1 : a.time > b.time ? 1 : 0
		} else {
			return new Date(b.date) < new Date(a.date) ? 1 : -1
		}
	})

	res.json({
		allLeagueGamesArray: allLeagueGamesArray,
	})
}
//
//
//
//****************************************************************************************** */
//
//  Get Venue Schedule.
//  THIS IS FOR WHEN YOU'RE IN THE SEARCH BY LEAGUE OR SEARCH BY TEAM PAGE!!!!!!!!!!!!!!!
//
//****************************************************************************************** */
const getVenueSchedule = async (req, res, next) => {
	const venueId = req.params.venueId

	console.log('INSIDE getVenueSchedule ' + venueId)
	//
	//
	//Get the leagueName - we'll want this so it displays at the top of the players list page
	let venueName
	try {
		foundVenue = await Venue.findById(venueId)
	} catch (err) {
		const error = new HttpError(
			'Could not find venue to obtain venueName.  getVenueSchedule ' + err,
			404
		)
		return next(error)
	}
	//
	//July 6, 2023   MATT:  this used to be venueName = foundVenue.venueName.toUpperCase()
	//but I got rid of that toUpperCase when I was trying to upload games for
	//NBHL.  It wasnt working when I tried to look up games per league until I
	//got rid of that part.
	venueName = foundVenue.venueName
	//
	//
	//
	let allVenueGames
	console.log('looking for games at venue: ' + venueName)
	try {
		allVenueGames = await Game.find({
			isCurrent: true,
			venueName: venueName,
		}).orFail()
	} catch (err) {
		const error = new HttpError(
			'Could not find games in this venue.  getVenueSchedule ' + err,
			404
		)
		return next(error)
	}

	//console.log('allVenueGames: ' + allVenueGames)

	let allVenueGamesAndEventsArray
	allVenueGamesAndEventsArray = []

	for (let i = 0; i < allVenueGames.length; i++) {
		allVenueGamesAndEventsArray.push(allVenueGames[i])
	}

	//Now lets get all the EVENTS that are scheduled for that venue:
	let allVenueEvents
	try {
		allVenueEvents = await Event.find({
			venueName: venueName,
		}).orFail()
	} catch {} /* (err) {
		const error = new HttpError(
			'Could not find events in this venue.  getVenueSchedule ' + err,
			404
		)
		return next(error)
	} */

	//let allVenueEventsArray
	//allVenueEventsArray = []

	if (allVenueEvents) {
		for (let i = 0; i < allVenueEvents.length; i++) {
			allVenueGamesAndEventsArray.push(allVenueEvents[i])
		}
	}

	//This little algorithm will sort all games and events based on first the
	//date, then the times

	allVenueGamesAndEventsArray.sort(function (a, b) {
		if (a.date === b.date) {
			return a.time < b.time ? -1 : a.time > b.time ? 1 : 0
		} else {
			return new Date(b.date) < new Date(a.date) ? 1 : -1
		}
	})

	//Here, I want to return all games and events just from the previous 3 days onward.
	//No need to go back in time forever...

	let currentDate = new Date()
	const before21Daysdate = new Date(
		currentDate.setDate(currentDate.getDate() - 3) //< - - - used to be 21 days
	)
	let allVenueGamesArrayFilteredByThreeWeeks
	allVenueGamesArrayFilteredByThreeWeeks = []

	for (let i = 0; i < allVenueGamesAndEventsArray.length; i++) {
		const split = allVenueGamesAndEventsArray[i].date.split('-')
		const month = split[0]
		const day = split[1]
		const year = split[2]
		const stringDate = '"' + year + '-' + month + '-' + day + '"'
		const convertedDate = new Date(stringDate)
		if (
			convertedDate > before21Daysdate ||
			convertedDate === before21Daysdate
		) {
			allVenueGamesArrayFilteredByThreeWeeks.push(
				allVenueGamesAndEventsArray[i]
			)
		}
	}

	//console.log('allVenueGamesAndEventsArray: ' + allVenueGamesAndEventsArray)
	console.log(
		'allVenueGamesArrayFilteredByThreeWeeks: ' +
			allVenueGamesArrayFilteredByThreeWeeks
	)

	res.json({
		allVenueGamesAndEventsArray: allVenueGamesAndEventsArray,
		allVenueGamesAndEventsArrayThreeWeeks:
			allVenueGamesArrayFilteredByThreeWeeks,
	})
}
//****************************************************************************************** */
//
// Get all Current Teams
//
// Here, we just want to go and find all the teams out there that are in a current league.
// This is used on the main schedule page, for the 'search by team' dropdown
//
//****************************************************************************************** */
const getAllCurrentTeams = async (req, res, next) => {
	let currentLeagues
	try {
		currentLeagues = await League.find({
			isCurrent: true,
		}).orFail()
	} catch (err) {
		const error = new HttpError(
			'Cannot find any current leagues.  getAllCurrentCurrentTeams',
			404
		)
		return next(error)
	}

	//console.log('currentLeagues: ' + JSON.stringify(currentLeagues))

	//Now let's get a list of ALL teams
	let allTeams
	try {
		const filter = {}
		allTeams = await Team.find(filter)
	} catch (err) {
		const error = new HttpError(
			'Cannot find any teams.  getAllCurrentTeams',
			404
		)
		return next(error)
	}

	//Now, lets try to compare the two lists

	let currentTeamsArray
	currentTeamsArray = []
	allTeams.forEach((team) => {
		//console.log('inside the forEach loop')
		for (let i = 0; i < currentLeagues.length; i++) {
			if (team.leagueId == currentLeagues[i]._id) {
				//console.log('WE HAVE A MATCH!!!!!!!!!!!!!!!!!!!!!!')
				currentTeamsArray.push(
					currentLeagues[i].leagueName +
						' - ' +
						currentLeagues[i].session +
						' - ' +
						currentLeagues[i].year +
						' - ' +
						team.teamName
				)
			}
		}
	})
	//This will simply sort the list alphabetically
	currentTeamsArray.sort()

	//console.log('currentTeamsArray: ' + currentTeamsArray)

	res.json({ currentTeamsArray: currentTeamsArray })
	//res.json({ currentLeagues: currentLeagues.toObject({ getters: true }) })
}
//****************************************************************************************** */
//
//  Get previous leagues
//
//****************************************************************************************** */
const getPreviousLeagues = async (req, res, next) => {
	let previousLeagues
	try {
		previousLeagues = await League.find({
			isCurrent: false,
		}).orFail()
	} catch (err) {
		const error = new HttpError(
			'Cannot find any archived leagues.  getArchivedLeagues',
			404
		)
	}

	previousLeagues && previousLeagues.reverse()

	res.json({ previousLeagues })
}
//
//
//
//
//
exports.getStandings = getStandings
exports.getScoringLeadersByLeagueId = getScoringLeadersByLeagueId
exports.getPlayersOnTeam = getPlayersOnTeam
exports.getTeamSchedule = getTeamSchedule
exports.getTeamSchedule2 = getTeamSchedule2
exports.getLeagueSchedule = getLeagueSchedule
exports.getAdminLeagueSchedule = getAdminLeagueSchedule
exports.getVenueSchedule = getVenueSchedule
exports.getAllCurrentTeams = getAllCurrentTeams
exports.getPreviousLeagues = getPreviousLeagues
