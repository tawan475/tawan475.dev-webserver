require('dotenv').config();
const fs = require('fs');
const createError = require('http-errors');
const express = require('express');
const path = require('path');

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

// error handler
app.use(function (err, req, res, next) {
    if (!err) return; // no error
    // render the error page
    res.status(err.status || 500).json({ status: err.status || 500, message: err.message || 'Internal Server Error' });
});

if (process.env.NODE_ENV !== 'production') process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
const options = process.env.NODE_ENV === "production" ? {
    key: fs.readFileSync('./libs/ssl/private.key.pem'),
    cert: fs.readFileSync('./libs/ssl/domain.cert.pem'),
    ca: fs.readFileSync('./libs/ssl/intermediate.cert.pem')
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