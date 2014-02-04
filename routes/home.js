var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Dropbox = require('dropbox');
var moment = require('moment');

/*
 * GET /
 */

exports.index = function(req, res){
  res.render('home/index',
    {
      title: 'Mixstud.io',
      heading: 'Home',
      user: res.locals.user ? res.locals.user : null
    }
  );
};

/*
 * GET /upload
 */

exports.upload = function(req, res){
  res.render('home/upload',
    {
      title: 'Mixstud.io',
      heading: 'Upload',
      user: res.locals.user ? res.locals.user : null
    }
  );
};

/*
 * POST /upload
 */

exports.dropbox = function(req, res){
  var apiKey = '2ypofds0ov0hvat';
  var apiSecret = 'mxw1tn51mbbvy20';
  res.send({email: res.locals.user.email, apiKey: apiKey, apiSecret: apiSecret});
};

/*
 * GET /register
 */

exports.register = function(req, res){
  res.render('home/register',
    {
      title: 'Sign-Up',
      heading: 'Sign-Up'
    }
  );
};

/*
 * GET /login
 */

exports.login = function(req, res){
  res.render('home/login',
    {
      title: 'Login',
      heading: 'Login',
      signup: req.query.signup
    }
  );
};