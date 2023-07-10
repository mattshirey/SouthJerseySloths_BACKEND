//Matt:  Max did this.  To prevent non-admin people from accessing
//admin functions.  Not sure if I'm going to use it, but I'm going to write
//it just in case.
const jwt = require('jsonwebtoken')
const HttpError = require('../models/http-error')

module.exports = (req, res, next) => {
	try {
		const token = req.headers.authorization.split(' ')[1] //Authorization: 'Bearer Token'
		if (!token) {
			throw new Error('Authentication failed!')
		}
		//const decodedToken = jwt.verify(token, 'supersecret_dont_share')
		const decodedToken = jwt.verify(token, process.env.JWT_KEY)
		req.userData = { email: decodedToken.email }
		next()
	} catch (err) {
		const error = new HttpError('Authentication failed!', 401)
		return next(error)
	}
}
