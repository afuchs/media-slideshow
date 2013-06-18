var instagram = require('instagram-node').instagram();
var config = require('../config');

instagram.use({ 
	client_id: config.instagram.client_id,
	client_secret: config.instagram.client_secret
});

exports.auth = function(req, res){
	res.redirect(instagram.get_authorization_url(
		config.instagram.redirect_uri, {
			scope: ['likes'], state: 'a state'
		})
	);
};

exports.auth_callback = function(req, res) {
	instagram.authorize_user(req.query.code, config.instagram.redirect_uri, function(err, result) {
		if (err) {
			console.log(err);
			res.send('oops!');
		} else {
			console.log('access toke: ' + result.access_token);
			res.send(result.access_token);
		}
	});
};

exports.search = function(req, res) {
	var tag = req.query.code || 'aviary';

	instagram.use({ access_token: config.instagram.access_token });

	var retry = 0;
	instagram.tag_media_recent(tag, function(err, result, limit) {
	  
		if(result && limit) {
			console.log(result);
			res.send(JSON.stringify(result));
		} else {
			if(retry < 2) {
				err.retry();
			} else {
				res.ok = false;
				console.log('error');
				console.log(err);
				res.send(JSON.stringify(err));
			}
		}
	});
}