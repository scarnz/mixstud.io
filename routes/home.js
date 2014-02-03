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
 * POST /upload
 */

exports.dropbox = function(req, res){
  var apiKey = '2ypofds0ov0hvat';
  var apiSecret = 'mxw1tn51mbbvy20';
  res.send({status: "ok", apiKey: apiKey, apiSecret: apiSecret});
};



/*
 * GET /posts
 */

exports.posts = function(req, res){
  Post.find().populate('files').exec(function(err,posts){
    res.render('home/posts',
      {
        title: 'Posts',
        heading: 'Posts',
        user: res.locals.user ? res.locals.user : null,
        posts: posts
      }
    );
  });
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