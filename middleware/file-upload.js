const multer = require('multer')
const { v4: uuidv4 } = require('uuid')

const MIME_TYPE_MAP = {
	'image/png': 'png',
	'image/jpeg': 'jpeg',
	'image/jpg': 'jpg',
}

//We configure this function to tell it where to store
//something and what types of files to accept.
//First, we set a limit (in bytes) of how much we want to be able
//to store.
//Multer also takes a storage key where we can control how our data
//should be stored. We chose disk storage, which we had to configure.
//We had to configure it's destination key to control the destination
//of where files will get stored.
//We also had to configure a filename key to control the files name.
//You'll see that we generate a file name using uuid.
//Both destination and filename each take in a function.
//Destination function gets the request object, the file that was extracted,
//and a callback which we have to call when we're done.
//Filename function takes the same parameters.  In filename, first we
//want to extract the extension of the incoming file (.png, .jpg, .jpeg) via
//the MIME TYPE MAP that we created above.
//the callback (cb) creates a random filename with the correct extension.
//We do something similar in destination.  Give it a location to put the image.
//fileFilter will validate that our file is of type jpg, jpeg, or png.
//Know that the !! converts undefined or null into 'false', because we're trying to see
//if the extension can be found in our mime type map above.
const fileUpload = multer({
	limits: 50000000,
	storage: multer.diskStorage({
		destination: (req, file, cb) => {
			cb(null, 'uploads/images')
		},
		filename: (req, file, cb) => {
			const ext = MIME_TYPE_MAP[file.mimetype]
			cb(null, uuidv4() + '.' + ext)
		},
	}),
	fileFilter: (req, file, cb) => {
		const isValid = !!MIME_TYPE_MAP[file.mimetype]
		let error = isValid ? null : new Error('Invalid mime type')
		cb(error, isValid)
	},
})

module.exports = fileUpload
