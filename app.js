const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
//const { MongoClient, ServerApiVersion } = require('mongodb')
//
//
//
//
//
//
const adminRoutes = require('./routes/admin-routes')
const leagueRoutes = require('./routes/league-routes')
const playerRoutes = require('./routes/player-routes')
const registrationRoutes = require('./routes/registration-routes')
const HttpError = require('./models/http-error')

const app = express()

app.use(bodyParser.json())

//app.use(cors())

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*')
	res.setHeader(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept, Authorization'
	)
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
	next()
})

//middlewares
app.use('/api/admin', adminRoutes)
app.use('/api/league', leagueRoutes)
app.use('/api/player', playerRoutes)
app.use('/api/registration', registrationRoutes)

//Here, if we get to this point, that means we haven't found the route, so
//we'll throw an error and a 404 code
app.get('/', (req, res) => {
	res.send('API is running....')
})
//
//
app.use((req, res, next) => {
	const error = new HttpError(
		'Could not find this route.' + req + ' ' + res,
		404
	)
	throw error
})

//if there's four parameters, like below, express knows that this
//will be an error middleware function, and will only be reached when
//there is a request that have an error attached to it.
//Watch video 93: Handling Errors.
//If we have an error, throw it.  If not, just throw a 500
app.use((error, req, res, next) => {
	if (res.headersSent) {
		return next(error)
	}
	res.status(error.code || 500)
	res.json({
		message: error.message || 'An unknown error has occurred!',
	})
})

mongoose
	.connect(
		`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.5uzmyz5.mongodb.net/?retryWrites=true&w=majority`
	)
	.then(() => {
		app.listen(process.env.PORT || 5000)
	})
	.catch((err) => {
		console.log('ERROR here: ' + err)
	})
