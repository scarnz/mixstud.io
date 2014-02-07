var mongoose = require('mongoose');
var Dropbox = require('dropbox');
var moment = require('moment');
var s3 = require('../lib/s3.js');

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
  // var policy = "{'expiration': '2020-01-01T12:00:00.000Z', 'conditions': [{'bucket': 'mixstudio'}]}";
  // var policy = "{'expiration': '2020-01-01T12:00:00.000Z', 'conditions': [{'bucket': 'mixstudio'},['starts-with', '$key', ''], ['starts-with', '$acl', ''], ['starts-with', '$Content-Type', ''], ['eq', '$success_action_status', '201']]}";

  // policy = new Buffer(policy).toString('base64')
  var key = s3.getKey();
  var policy = "eydleHBpcmF0aW9uJzogJzIwMjAtMDEtMDFUMTI6MDA6MDAuMDAwWicsICdjb25kaXRpb25zJzogWwp7J2J1Y2tldCc6ICdtaXhzdHVkaW8nfSwgWydzdGFydHMtd2l0aCcsICcka2V5JywgJ3VwbG9hZHMvJ11dfQ=="
  res.send({
    key: key,
    signature: '/54JU5c4qOaawa1QtZX+JAxyrrU=',
    policy: policy,
    email: res.locals.user.email
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