const express = require('express')
const playerControllers = require('../controllers/player-controller')
const router = express.Router()
const fileUpload = require('../middleware/file-upload')

router.get('/:playerId/history', playerControllers.getPlayerHistoryByPlayerId)
//
//
console.log('inside player-routes...')
router.post(
	'/:rosterPlayerId/photo',
	fileUpload.single(fieldname),
	playerControllers.uploadPhoto
)
//
//
module.exports = router
