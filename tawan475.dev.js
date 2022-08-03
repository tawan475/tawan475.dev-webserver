require('dotenv').config();
const fs = require('fs');
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.dirname = __dirname;
app.viewPath = path.join(app.dirname, 'views');

// view engine setup
app.set('views', app.viewPath);
app.set('view engine', 'ejs');


// require middlwares
require('./libs/middlewares')(app);

let viewFolder = fs.readdirSync(app.viewPath, {withFileTypes: true});
routerGenerator(viewFolder, app.viewPath)

function routerGenerator(dirent, AbsPath){
	viewFolder.forEach((dirent) => {
		if (!dirent.name.endsWith('.js')) return;
		
		let direntRelativePath = path.join(path.relative(app.viewPath, AbsPath), dirent.name);
		let absDirentPath = path.join(app.viewPath, direntRelativePath)
		
		if (dirent.isDirectory()) {
			return routerGenerator(fs.readdirSync(absDirentPath, {withFileTypes: true}), absDirentPath)
		}
		
		let filePath = absDirentPath;
		let fileName = dirent.name;
		let routerPath = path.normalize('/' + direntRelativePath.replace(/\.js$/, '')).replace(/[\\\/]/g, '/');
		let viewPath = absDirentPath.replace(/\.js$/, '.ejs');
		let viewName = fileName.replace(/\.js$/, '.ejs');
		
		
		if (filePath === path.join(app.viewPath, 'index.js')) return;
		console.log(`use ${filePath}+${viewName} for ${routerPath}`)
		
		let pathInfo = {
			filePath: filePath,
			fileName: fileName,
			routerPath: routerPath,
			viewPath: viewPath,
			viewName: viewName,
		};
		
		app.all(routerPath, function (req, res, next) {
			let locals = {
				lastServerUpdate: fs.statSync(pathInfo.filePath).mtime,
				lastHTMLUpdate: fs.statSync(pathInfo.viewPath).mtime,
			}
			
			let logic = require(filePath);
			if (!logic[req.method]) return next(createError(405))
				
			return logic[req.method](req, res, next, pathInfo, locals);
		})
	});
}

app.get('/', function (req, res) {
	res.renderMin('index');
})


//app.use('/users', require('./routes/users'));


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
    key: fs.readFileSync('/etc/letsencrypt/live/tawan475.dev/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/tawan475.dev/fullchain.pem'),
} : {
    key: fs.readFileSync('../ssl/localhost.key'),
    cert: fs.readFileSync('../ssl/localhost.crt')
}

require('http').createServer(app).listen(process.env.PORT, () => {
    console.log(`listening at HTTP ${process.env.PORT}`)
});

require('https').createServer(options, app).listen(process.env.SECURE_PORT, () => {
    console.log(`listening at HTTPS ${process.env.SECURE_PORT}`)
});
