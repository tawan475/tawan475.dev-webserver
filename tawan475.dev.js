const createError = require('http-errors');
const express = require('express');
const path = require('path');

const app = express();
app.__dirname = __dirname;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
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

module.exports = app;