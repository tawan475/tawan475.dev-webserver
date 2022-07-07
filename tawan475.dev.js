require('dotenv').config();
const fs = require('fs');
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.dirname = __dirname;

// view engine setup
app.set('views', path.join(app.dirname, 'views'));
app.set('view engine', 'ejs');


// require middlwares
require('./libs/middlewares')(app);


app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

function errorHandler(err, req, res, next) {
    if (!err) return; // no error
    // render the error page
	let errorID = uuidv4();
	let errorRequestLog = `o:${req.get('origin') || "direct"} code:${res.statusCode} ${req.trustedip} ${req.method}:${req.protocol}://${req.get('host')}${req.url}`;
	let errorMessage = `[${Date.now()}] errorID: ${errorID} | ${errorRequestLog}\r\n${err.stack}`
	
	console.log(errorMessage)
	
	fs.appendFile(path.join(req.app.dirname, "./error_logs.log"), errorMessage + "\r\n", (err) => {
		if (err) console.log(err)
	});

	if (!err.status || err.status == 500) err.message = 'Internal Server Error';

    res.status(err.status || 500).json({ status: err.status || 500, errorID: errorID, message: err.message || 'Internal Server Error' });
}

// error handler
app.use(errorHandler);

if (process.env.NODE_ENV !== 'production') process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
const options = process.env.NODE_ENV === "production" ? {
    key: fs.readFileSync('/etc/letsencrypt/live/tawan475.dev-0001/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/tawan475.dev-0001/fullchain.pem'),
} : {
    key: fs.readFileSync('./libs/ssl/localhost/localhost.key'),
    cert: fs.readFileSync('./libs/ssl/localhost/localhost.crt')
}

require('http').createServer(app).listen(process.env.PORT, () => {
    console.log(`listening at HTTP`)
});

require('https').createServer(options, app).listen(process.env.SECURE_PORT, () => {
    console.log(`listening at HTTPS`)
});