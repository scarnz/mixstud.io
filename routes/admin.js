//var __ = require('lodash');
var mongoose = require('mongoose');
var async = require('async');
var m = require('../lib/middleware');
var moment = require('moment');
var User = mongoose.model('User');

/*
 * GET /admin
 */

exports.index = function(req, res){
  User.find(function(err,users){
    res.render('admin/index',
      {
        title: 'Admin',
        heading: 'Admin',
        userCount: users ? users.length : null,
        user: res.locals.user ? res.locals.user : null
      }
    );
  });
};

/*
 * GET /admin/users
 */

exports.users = function(req, res){
  User.find().populate('profile').exec(function(err,users){
    res.render('admin/users',
      {
        title: 'Admin - Users',
        heading: 'Admin - Users',
        userData: users ? users : null,
        user: res.locals.user ? res.locals.user : null,
        moment: moment
      }
    );
  });
};

/*
 * DELETE /admin/users
 */

exports.deleteUser = function(req,res){
  var userId = req.body.userId;
  if(userId){
    User.findByIdAndRemove(userId, function(err,user){
      if(err){
        res.send({status: 'error'});
      } else {
        res.send({status: 'ok'});
      }
    });
  }
};