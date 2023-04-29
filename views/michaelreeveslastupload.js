const ytpl = require('ytpl');
const ytdl = require('ytdl-core');

module.exports = {
	GET: async (req, res, next, pathInfo, locals) => {
        let channel = await ytpl('UCtHaxi4GTYDpJgMSGy7AeSw');
        let lastVideoId = channel.items[0].id;
        let lastVideo = await ytdl.getInfo(lastVideoId); 
        let lastUploadTime = new Date(lastVideo.videoDetails.publishDate).getTime();
        
        Object.assign(locals, { lastUpload: lastUploadTime, lastVideoId: lastVideoId })

		return res.renderMin(pathInfo.viewPath, locals, function(err, html) {
			if (err) return next(err);
			return res.send(html);
		});	
	}
}