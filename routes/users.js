var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var async = require('async');
var m = require('../lib/middleware');
var User = mongoose.model('User');
var userProfile = mongoose.model('userProfile');


exports.profile = function(req, res){
  User.findById(res.locals.user.id).populate('profile').exec(function(err,user){
    res.render('user/profile', {
      title: 'My Profile',
      heading: 'My Profile',
      user: res.locals.user ? res.locals.user : null,
      profile: user.profile ? user.profile : null
    });
  });
};

exports.editProfile = function(req, res){
  var states = [{abbr:"AL", name: "Alabama"},{abbr:"AK", name: "Alaska"},{abbr:"AZ", name: "Arizona"},{abbr:"AR", name: "Arkansas"},{abbr:"CA", name: "California"},{abbr:"CO", name: "Colorado"},{abbr:"CT", name: "Connecticut"},{abbr:"DE", name: "Delaware"},{abbr:"DC", name: "District of Columbia"},{abbr:"FL", name: "Florida"},{abbr:"GA", name: "Georgia"},{abbr:"HI", name: "Hawaii"},{abbr:"ID", name: "Idaho"},{abbr:"IL", name: "Illinois"},{abbr:"IN", name: "Indiana"},{abbr:"IA", name: "Iowa"},{abbr:"KS", name: "Kansas"},{abbr:"KY", name: "Kentucky"},{abbr:"LA", name: "Louisiana"},{abbr:"ME", name: "Maine"},{abbr:"MD", name: "Maryland"},{abbr:"MA", name: "Massachusetts"},{abbr:"MI", name: "Michigan"},{abbr:"MN", name: "Minnesota"},{abbr:"MS", name: "Mississippi"},{abbr:"MO", name: "Missouri"},{abbr:"MT", name: "Montana"},{abbr:"NE", name: "Nebraska"},{abbr:"NV", name: "Nevada"},{abbr:"NH", name: "New Hampshire"},{abbr:"NJ", name: "New Jersey"},{abbr:"NM", name: "New Mexico"},{abbr:"NY", name: "New York"},{abbr:"NC", name: "North Carolina"},{abbr:"ND", name: "North Dakota"},{abbr:"OH", name: "Ohio"},{abbr:"OK", name: "Oklahoma"},{abbr:"OR", name: "Oregon"},{abbr:"PA", name: "Pennsylvania"},{abbr:"RI", name: "Rhode Island"},{abbr:"SC", name: "South Carolina"},{abbr:"SD", name: "South Dakota"},{abbr:"TN", name: "Tennessee"},{abbr:"TX", name: "Texas"},{abbr:"UT", name: "Utah"},{abbr:"VT", name: "Vermont"},{abbr:"VA", name: "Virginia"},{abbr:"WA", name: "Washington"},{abbr:"WV", name: "West Virginia"},{abbr:"WI", name: "Wisconsin"},{abbr:"WY", name: "Wyoming"}];
  User.findById(res.locals.user.id).populate('profile').exec(function(err,user){
    for(var i=0;i<states.length;i++){
      states[i].abbr === user.profile.state ? states[i].selected = true:states[i].selected = false;

    }
    res.render('user/editProfile', {
      title: 'Edit Profile',
      heading: 'Edit Profile',
      user: res.locals.user ? res.locals.user : null,
      profile: user.profile ? user.profile : null,
      states: states
    });
  });
};

exports.editAccount = function(req, res){
  res.render('user/editAccount', {
      title: 'Edit Account',
      heading: 'Edit Account',
      user: res.locals.user ? res.locals.user : null
    });
};

exports.create = function(req,res){
  var $email = req.body.email.toLowerCase();
  async.waterfall([
    function(fn){m.validateEmail($email,res,fn);},
    function(fn){m.passwordsMatch(req.body.password, req.body.password2,res,fn);},
    function(fn){m.accountExists($email,res,fn);},
    function(fn){
      var user = new User();
      user.email = $email;
      bcrypt.hash(req.body.password, 10, function(err, hash){
        user.password = hash;
        new userProfile().save(function(err,profile){
          user.profile = profile.id;
          user.save(function(err){
          if(err)
            {res.send({status: 'error'});}
          else
            {res.send({status: 'ok'});}
          });
        });
      });
    }
  ]);
};

exports.updateAccountPassword = function(req,res){
  var $oldPassword = req.body.oldPassword ? req.body.oldPassword:null;
  var $newPassword = req.body.newPassword ? req.body.newPassword:null;
  var $newPassword2 = req.body.newPassword2 ? req.body.newPassword2:null;
  User.findById(req.session.userId, function(err, user){
    async.waterfall([
      function(fn){if($oldPassword){fn();}else{res.send({status: 'nooldpassword', message: 'Please Enter Your Current Password!'});};},
      function(fn){bcrypt.compare($oldPassword, user.password, function(err, isMatch){if(isMatch){fn();}else{res.send({status: 'badpassword', message: 'Invalid Password!'});}});},
      function(fn){m.passwordsMatch($newPassword,$newPassword2,res,fn);},
      function(fn){
        bcrypt.hash($newPassword, 10, function(err, hash){
          user.password = hash;
          user.save(function(err){
            res.send({status:'ok', message: 'Your password has been updated successfully!'});
          });
        });
      }
    ]);
  });
};

exports.updateAccountEmail = function(req,res){
  var $email = req.body.email.toLowerCase();
  var $email2 = req.body.email2 ? req.body.email2.toLowerCase():null;
  User.findById(req.session.userId, function(err, user){
    async.waterfall([
      function(fn){m.validateEmail($email,res,fn);},
      function(fn){m.isNewEmail($email,user.email,res,fn);},
      function(fn){if($email2){fn();}else{res.send({status: 'noemail2', message: 'Please Re-Enter your new Email Address!'});};},
      function(fn){m.emailsMatch($email,$email2,res,fn);},
      function(fn){m.accountExists($email,res,fn);},
      function(fn){
        user.email = $email;
        user.save(function(err){
          res.send({status:'ok', newEmail: user.email, message: 'Your email address has been updated successfully!'});
        });
      }
    ]);
  });
};

exports.updateProfileInfo = function(req,res){
  User.findById(req.session.userId, function(err, user){
    userProfile.findById(user.profile, function(err,profile){
      profile.firstName = req.body.firstName;
      profile.lastName = req.body.lastName;
      profile.city = req.body.city;
      profile.state = req.body.state;
      profile.save(function(err,result){
        console.log(result);
        res.send('success');
      });
    });
  });
};

exports.updateProfilePic = function(req,res){

};

exports.login = function(req, res){
  var email = req.body.email;
  User.findOne({email: email}, function(err, user){
    if(user){
      bcrypt.compare(req.body.password, user.password, function(err, isMatch){
        if(isMatch){
          req.session.regenerate(function(err){
            req.session.userId = user.id;
            req.session.isAdmin = user.isAdmin;
            req.session.save(function(err){
              res.send({status: 'ok'});
            });
          });
        } else {
          req.session.destroy(function(err){
            res.send({status: 'error'});
          });
        }
      });
    } else {
      req.session.destroy(function(err){
        res.send({status: 'error'});
      });
    }
  });
};

exports.logout = function(req, res){
  req.session.destroy();
  res.redirect('/');
};