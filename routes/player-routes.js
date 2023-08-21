const express = require('express')
const playerControllers = require('../controllers/player-controller')
const router = express.Router()
const fileUpload = require('../middleware/file-upload')

router.get('/:playerId/history', playerControllers.getPlayerHistoryByPlayerId)
//
//
console.log('you are here THREE')
router.post(
	'/:rosterPlayerId/photo',
	fileUpload.single('image'),
	playerControllers.uploadPhoto
)
//
//
module.exports = router
