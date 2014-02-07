var express = require('express');
var mongoose = require('mongoose');

// model definitions
require('require-dir')('./models');

// route definitions
var home = require('./routes/home');
var users = require('./routes/users');
var admin = require('./routes/admin');

var app = express();
var RedisStore = require('connect-redis')(express);
mongoose.connect('mongodb://localhost/mixstudio');

// configure express
require('./config').initialize(app, RedisStore);

// Middleware
var m = require('./lib/middleware');

// ROUTES

//-- HOME
app.get('/', home.index);
app.get('/upload', m.checkAuth, home.upload);

app.post('/upload', m.checkAuth, home.dropbox);

//-- AUTH
app.get('/login', home.login);

app.put('/login', users.login);
app.delete('/logout', users.logout);

//-- ADMIN
app.get('/admin', m.checkAuth, m.checkAdmin, admin.index);

app.get('/admin/users', m.checkAuth, m.checkAdmin, admin.users);
app.delete('/admin/users', m.checkAuth, m.checkAdmin, admin.deleteUser);

//-- USER
app.get('/register', home.register);
app.post('/users', users.create);

app.get('/account/edit', m.checkAuth, users.editAccount);
app.put('/account/email', users.updateAccountEmail);
app.put('/account/password', users.updateAccountPassword);

app.get('/profile', m.checkAuth, users.profile);
app.get('/profile/edit', m.checkAuth, users.editProfile);
app.put('/profile/info', m.checkAuth, users.updateProfileInfo);
app.put('/profile/pic', m.checkAuth, users.updateProfilePic);

// 404 (ALWAYS Keep this as the last route)
app.get('*', function(req,res){res.render('home/404', {title: '404 - Not Found', heading: 'Not Found'});});

// start server
var server = require('http').createServer(app);
server.listen(app.get('port'));
console.log('\n>>>>>>>>>>>> APP LISTENING ON PORT ' + app.get('port') + ' <<<<<<<<<<<<<<');