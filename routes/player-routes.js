const express = require('express')
const playerControllers = require('../controllers/player-controller')
const router = express.Router()
const fileUpload = require('../middleware/file-upload')

router.get('/:playerId/history', playerControllers.getPlayerHistoryByPlayerId)
//
//
console.log('inside player-routes...')
router.post(
	'/:playerId/photo',
	fileUpload.single('photo'),
	playerControllers.uploadPhoto
)
//
//
module.exports = router
