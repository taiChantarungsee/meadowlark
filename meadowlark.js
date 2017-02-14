var express = require('express');
var app = express()
var dataDir = __dirname + '/date';
var formidable = require('formidable');
var https = require('https');
var mongoose = require('mongoose');
var rest = require('connect-rest');
var vacation = require('./models/vacation.js');
var vacationPhotoDir = dataDir + '/vacation-photo';
var handlebars = require('express3-handlebars')
	.create({ defaultLayout:'main' });

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

// set up handlebars view engine
var handlebars = require('express3-handlebars').create({
		defaultLayout:'main',
		helpers: {
			static: function(name) {
			return require('./lib/static.js').map(name);
		}
	}
});

app.use(require('body-parser')());
app.use(require('cookie-parser'));
app.use(require('express-session')());
//for api subdomain comment out if causing problems on development environments
app.use(vhost('api.*', rest.rester(apiOptions));

app.use(express.static(__dirname + '/public'));
app.use(function(req,res,next){
	res.locals.showTests = app.get('env') !== 'production' &&
		req.query.test === '1';
	next();	
});

//set up the db connections
var opts = {
	server: {
		socketOptions: { keepAlive: 1 }
	}
};
switch(app.get('env')){
	case 'development':
		mongoose.connect(credentials.mongo.development.connectionString, opts);
		break;
	case 'production':
		moongoose.connect(credentials.mongo.production.connectionString,opts);
		break;
	default:
		throw new Error('Unknown execution environment: ' + app.get('env'));
}

app.set('port', process.env.PORT || 3000)

app.use(function(req,res,next){
	var cluster = require('cluster');
	if(cluster.isWorker) console.log('Worker %d received request', cluster.worker.id);
});

app.get('/', function(req, res) {
res.render('home');
});

app.get('/about', function(req, res) {
res.render('about');
});

app.get('/newsletter', function(req,res){
	res.render('newsletter', { csrf: 'CSRF token goes here'});
});

app.post('/process', function(req,res){
	console.log('Form (from querystring): ' + req.query.form);
	console.log('CSRF token (from hidden form field): ' + req.body._csrf);
	console.log('Name (from visible form field): ' + req.body.name);
	console.log('Email (from visible form field): ' + req.body.email);
res.redirect(303, '/thank-you');
});

function saveContest(contestName, email, year, month, photoPath){
	//TODO
}

app.get('/contest/vacation-photo', function (req,res){
	var now = new Date();
	res.render('contest/vacation-photo',{
		year: now.getFullYear(),month: now.getMont()
	});
});

app.post('/contest/vacation-photo/:year/:month', function(req, res){
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files){
		if(err) return res.redirect(303, '/error');
		if(err){
			res.session.flash = {
				type: 'danger',
				intro: 'Oops!',
				message: 'There was an error processing your submission. ' +
					'Please try again',
			};
			return res.redirect(303, '/contest/vacation-photo');
		}
		var photo = files.photo; 
		var dir = vacationPhotoDir + '/' + Date.now();
		var path = dir + '/' + photo.name;
		fs.mkdirSynch(dir);
		fs.renameSync(photo.path, dir + '/' + photo.name); // safer to randomize the photo name
		saveContestEntry('vacation-photo', fields.email, req.params.year, req.params.month, path);
		req.session.flash = {
			type: 'success',
			intro: 'Good luck!',
			message: 'You have been entered into the contest.',
		};	
		return res.redirect(303, 'contest/vacation-photo/entries');
	});
});

//api routers
app.use('/api', require('cors')()); //...

rest.get('/attraction', function(req,content,cb){
	Attraction.find({ approved: true }, function(err, attractions){
		if(err) return cb({ error: 'Internal error.' });
		cb(null, attractions.map(function(a){
			return {
				name: a.name,
				description: a.description,
				location: a.location,
			};
		}));
	});
});

rest.post('/attraction', function(req, content, cb){
	var a = new Attraction({
		name: req.body.name,
		description: req.body.description,
		location: { lat: req.body.lat, lng: req.body.lng },
		history: {
		event: 'created',
		email: req.body.email,
		date: new Date(),
	},
		approved: false,
	});
	a.save(function(err, a){
		if(err) return cb({ error: 'Unable to add attraction.' });
		cb(null, { id: a._id });
	});
});

rest.get('/attraction/:id', function(req, content, cb){
	Attraction.findById(req.params.id, function(err, a){
		if(err) return cb({ error: 'Unable to retrieve attraction.' });
			cb(null, {
				name: attraction.name,
				description: attraction.description,
				location: attraction.location,
		});
	});
});

//API Configuration
var apiOptions = {
	context: '/',
	domain: require('domain').create()
};

apiOptions.domain.on('error', function(err){
	console.log('API domain error.\n', err.stack);
	setTimeout(function(){
		console.log('Server shutting down after API domain error.');
		process.exit(!);
	}, 5000);
	server.close();
	var worker = require('cluster').worker;
	if(worker) worker.disconnect();
});

//link API into pipeline
app.use(rest.rester(apiOptions));

app.use(function(req,res) {
	res.type('text/plain');
	res.status(404);
	res.send('404 - not found');
});

app.use(function(err, req, res, next){
	console.error(err.stack);
	res.type('text/plain');
	res.status(500);
	res.send('500 - Server Error');
});

//https options
var options = {
	key: fs.readFileSync(__dirname + '/meadowlark.pem');
	cert: fs.readFileSync(__dirname + '/ssl/meadowlark.crt');
};

// Wrapped in a function in order to enable appclusters
function startServer() {
		https.createServer(options, app).listen(app.get('port'), function(){
		console.log( 'Express started on http://localhost:' +
		app.get('port') + 'in environment ' + app.get('env') + '; press Ctrl-C to terminate.' );
	});
}

if(require.main === module){
	startServer();
} else {
	module.exports = startServer;
}		

switch(app.get('env')){
	case 'development':
		app.use(require('morgan')('dev'));
		break;
	case 'production':
		app.use(require('express-logger')({
			path: __dirname + '/log/requests.log'
		}));
}

//seed the database

Vacation.find(function(err, vacations){
	if(vacation.length) return;

	new Vacation({
		name: 'Hood River Day Trip',
		slug: 'hood-river-day-trip',
		category: 'Day Trip',
		sku: 'HR199',
		description: 'Spend a day sailing on the Columbia and ' +
		'enjoying craft beers in Hood River!',
		priceInCents: 9995,
		tags: ['day trip', 'hood river', 'sailing', 'windsurfing', 'breweries'],
		inSeason: true,
		maximumGuests: 16,
		available: true,
		packagesSold: 0,
		}).save();
		new Vacation({
		name: 'Oregon Coast Getaway',
		slug: 'oregon-coast-getaway',
		category: 'Weekend Getaway',
		sku: 'OC39',
		description: 'Enjoy the ocean air and quaint coastal towns!',
		priceInCents: 269995,
		tags: ['weekend getaway', 'oregon coast', 'beachcombing'],
		inSeason: false,
		maximumGuests: 8,
		available: true,
		packagesSold: 0,
		}).save();
		new Vacation({
		name: 'Rock Climbing in Bend',
		slug: 'rock-climbing-in-bend',
		category: 'Adventure',
		sku: 'B99',
		description: 'Experience the thrill of climbing in the high desert.',
		priceInCents: 289995,
		tags: ['weekend getaway', 'bend', 'high desert', 'rock climbing'],
		inSeason: true,
		requiresWaiver: true,
		maximumGuests: 4,
		available: false,
		packagesSold: 0,
		notes: 'The tour guide is currently recovering from a skiing accident.',
}).save();
});