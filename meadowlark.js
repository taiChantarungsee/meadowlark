var express = require('express');
var app = express()
var formidable = require('formidable');
var handlebars = require('express3-handlebars')
	.create({ defaultLayout:'main' });

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.use(require('body-parser')());
app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(require('express-session')());

app.use(express.static(__dirname + '/public'));
app.use(function(req,res,next){
	res.locals.showTests = app.get('env') !== 'production' &&
		req.query.test === '1';
	next();	
});

app.set('port', process.env.PORT || 3000)

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
		console.log('received fields:');
		console.log(fields);
		console.log('received files:');
		console.log(files);
		res.redirect(303, '/thank-you');
	});
});

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

app.listen(app.get('port'), function(){
console.log( 'Express started on http://localhost:' +
app.get('port') + '; press Ctrl-C to terminate.' );
});