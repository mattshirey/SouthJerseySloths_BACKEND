const express = require('express')
const playerControllers = require('../controllers/player-controller')
const router = express.Router()

router.get('/:playerId/history', playerControllers.getPlayerHistoryByPlayerId)
//
//

module.exports = router
