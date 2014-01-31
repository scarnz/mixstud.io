var mongoose = require('mongoose');
var User = mongoose.model('User');
var File = mongoose.model('File');
var Post = mongoose.model('Post');

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

//File Upload

exports.getFilesFromForm = function(newFiles,fn){
  var files = [];
  var file;
  for (var i = 0; i< newFiles.length; i++){
    file = fs.readFileSync(newFiles[i].tmpPath);
    files.push(file);
  }

  fn(null,files);
};

exports.createDir = function(newPath,fn){
  fs.exists(newPath, function (ex){
    if(ex){
      fn();
    } else {
      fs.mkdir(newPath, 0777, function (){
        fn();
      });
    }
  });
};

exports.createFiles = function(newFiles,fileData,email,postId,fn){
  var newIds = [];
  for (var i = 0; i< newFiles.length; i++){
    fs.writeFileSync(newFiles[i].newPath, fileData[i]);
    fs.unlinkSync(newFiles[i].tmpPath);
  }
  forEach(newFiles, function(file, index) {
    var done = this.async();
    var dbFile = new File();
    dbFile.name = file.name;
    dbFile.type = file.type;
    dbFile.post = postId;
    dbFile.createdBy = email;
    dbFile.save(function(err,result){
      newIds.push(result.id);
      done();
    });
  },function(){
    fn(null,newIds);
  });
};

exports.updatePostFiles = function(postId,fileIds,fn){
  Post.findById(postId,function(err,post){
    for(var x = 0; x < fileIds.length; x++){
      post.files.push(fileIds[x]);
    }
    post.save(function(err,p){
      fn();
    });
  });
};

// File Delete

exports.removeFile = function(fileId,fn){
  File.findByIdAndRemove(fileId,function(err,file){
    fn(err,file);
  });
};

exports.deleteFile = function(file,fn){
  var filePath = __dirname + '/../public/uploads/' + file.post + '/' + file.name;
  fs.exists(filePath, function (ex){
    if(ex){
      fs.unlinkSync(filePath);
    }
    fn();
  });
};

exports.detachFileFromPost = function(fileId,postId,fn){
  Post.findById(postId,function(err,post){
    var index = post.files.indexOf(fileId);
    if (index > -1) {
      post.files.splice(index, 1);
    }
    post.save(function(err){
      fn();
    });
  });
};

// Post Delete

exports.removePost = function(postId,fn){
  Post.findByIdAndRemove(postId, function(err,post){
    fn(err,post);
  });
};

exports.deletePostFiles = function(postId,fileIds,fn){
  var filePaths = [];
  var remainingFiles;
  if(fileIds.length > 0){
    forEach(fileIds, function(fileId, index) {
      var done = this.async();
      File.findByIdAndRemove(fileId,function(err,result){
        filePaths.push('public/uploads/' + postId + '/' + result.name);
        done();
      });
    },function(){
      for (var i = 0; i< filePaths.length; i++){
        fs.unlinkSync(filePaths[i]);
        remainingFiles = fs.readdirSync('public/uploads/'+postId+'/');
        if(remainingFiles.length === 0){
          fs.rmdirSync('public/uploads/'+postId+'/');
        }
      }
      fn();
    });
  } else {
    fs.exists('public/uploads/'+postId+'/', function(ex){
      if(ex){
        fs.rmdirSync('public/uploads/'+postId+'/');
      }
      fn();
    });
  }
};