module.exports = {
	GET: (req, res, next, pathInfo, locals) => {
		return res.renderMin(pathInfo.viewPath, locals, function(err, html) {
			if (err) return next(err);
			return res.send(html);
		});	
	}
}