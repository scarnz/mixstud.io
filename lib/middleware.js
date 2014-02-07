var mongoose = require('mongoose');
var User = mongoose.model('User');

var fs = require('fs');
var async = require('async');
var forEach = require('async-foreach').forEach;

exports.validateEmail = function(email,res,fn){
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  var isValid = re.test(email);
  if(!isValid){
    res.send({status: 'invalid', message: 'Please enter a valid Email Address!'});
  } else {
    fn();
  }
};

exports.isNewEmail = function(newEmail,oldEmail,res,fn){
  if(newEmail === oldEmail){
    res.send({status: 'nochanges', message: 'No Changes!'});
  } else {
    fn();
  }
};

exports.emailsMatch = function(email1,email2,res,fn){
  if(email1 !== email2){
    res.send({status: 'nomatch', message: 'Email Addresses must match exactly!'});
  } else {
    fn();
  }
};

exports.accountExists = function(email,res,fn){
  User.find({email: email},function(err,user){
    if(user && user.length){
      res.send({status:'emailexists', message: 'An account with that email address already exists!'});
    } else {
      fn();
    }
  });
};

exports.passwordsMatch = function(password1,password2,res,fn){
  if(!password1){
    res.send({status: 'nopassword',message: 'Please enter a new password'});
  } else if(!password2){
    res.send({status: 'nopassword2',message: 'Please re-enter your new password'});
  } else if(password1 !== password2){
    res.send({status: 'nomatch',message: 'Passwords must match exactly'});
  } else {
    fn();
  }
};

// Get User Object
exports.getUser = function(req,res,next) {
  if (req.session.userId) {
    User.findById(req.session.userId,function(err, user){
      res.locals.user = user;
      next();
    });
  } else {
    next();
  }
};

// Restrict Page Views
exports.checkAuth = function(req,res,next){
  if (req.session.userId) {
    next();
  } else {
    var lastPage = req.url.substr(1,req.url.length);
    res.redirect('/login?redirect='+lastPage);
  }
};

// Restrict ADMIN PAGE Views
exports.checkAdmin = function(req,res,next){

  if (req.session.isAdmin) {
    next();
  } else {
    res.redirect('/');
  }
};