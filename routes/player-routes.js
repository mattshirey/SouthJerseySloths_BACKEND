const express = require('express')
const playerControllers = require('../controllers/player-controller')
const router = express.Router()

router.get(
	'/:playerId/history',
	fileUpload.single('image'),
	playerControllers.getPlayerHistoryByPlayerId
)
//
//

module.exports = router
