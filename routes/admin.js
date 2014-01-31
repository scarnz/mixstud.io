//var __ = require('lodash');
var mongoose = require('mongoose');
var async = require('async');
var m = require('../lib/middleware');
var moment = require('moment');
var File = mongoose.model('File');
var Post = mongoose.model('Post');
var User = mongoose.model('User');



/*
 * GET /admin
 */

exports.index = function(req, res){
  User.find(function(err,users){
    Post.find(function(err,posts){
      File.find(function(err,files){
        res.render('admin/index',
          {
            title: 'Admin',
            heading: 'Admin',
            userCount: users ? users.length : null,
            postCount: posts ? posts.length : null,
            fileCount: files ? files.length : null,
            user: res.locals.user ? res.locals.user : null
          }
        );
      });
    });
  });
};

/*
 * GET /admin/users
 */

exports.users = function(req, res){
  User.find(function(err,users){
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
 * GET /admin/posts
 */

exports.posts = function(req, res){
  Post.find(function(err,posts){
    res.render('admin/posts',
      {
        title: 'Admin - Posts',
        heading: 'Admin - Posts',
        posts: posts ? posts : null,
        user: res.locals.user ? res.locals.user : null,
        moment: moment
      }
    );
  });
};

/*
 * GET /admin/posts/new
 */

exports.newPost = function(req, res){
  res.render('admin/newPost',
    {
      title: 'Admin - New Post',
      heading: 'Admin - New Post',
      user: res.locals.user ? res.locals.user : null
    }
  );
};

/*
 * GET /admin/files
 */

exports.files = function(req, res){
  File.find().populate('post').exec(function(err,files){
    res.render('admin/files',
      {
        title: 'Admin - Files',
        heading: 'Admin - Files',
        files: files ? files : null,
        user: res.locals.user ? res.locals.user : null,
        moment: moment
      }
    );
  });
};


/*
 * GET /admin/posts/:id
 */

exports.editPost = function(req, res){
  var postId = req.params.id;
  Post.findById(postId).populate('files').exec(function(err,post){
    res.render('admin/newPost',
      {
        title: 'Admin - Edit Post',
        heading: 'Admin - Edit Post',
        post: post ? post : null
      }
    );
  });
};

/*
 * POST /admin/posts
 */

exports.createPost = function(req, res){
  var title = req.body.postTitle;
  var content = req.body.postContent;
  var author = res.locals.user.email;
  var newPost = new Post();
  newPost.title = title;
  newPost.content = content;
  newPost.createdBy = author;
  newPost.save(function(err, post){
    if(err){res.send({status: 'error'});} else {res.send({status: 'ok', newPostId: post.id});}
  });
};

/*
 * POST /admin/files
 */

exports.createFiles = function(req, res){
  var newDirname = req.body.postId + '/';
  var newDir = __dirname + '/../public/uploads/' + newDirname;
  var newFiles = [];
  var newFile, $FILEDATA;

  for(var i in req.files) {
    newFile = {};
    newFile.name = req.files[i].name;
    newFile.tmpPath = req.files[i].path;
    newFile.newPath = newDir + req.files[i].name;
    newFile.type = req.files[i].type;
    newFiles.push(newFile);
  }

  async.waterfall([
    function(fn){m.getFilesFromForm(newFiles,fn);},
    function(files,fn){$FILEDATA = files; m.createDir(newDir,fn);},
    function(fn){m.createFiles(newFiles,$FILEDATA,res.locals.user.email,req.body.postId,fn);},
    function(newIds,fn){m.updatePostFiles(req.body.postId,newIds,fn);},
    function(fn){res.send({status: 'ok'});}
  ]);
};


/*
 * PUT /admin/posts/:id
 */

exports.updatePost = function(req, res){
  var postId = req.params.id;
  var title = req.body.postTitle;
  var content = req.body.postContent;
  Post.findById(postId, function(err,post){
    post.title = title;
    post.content = content;
    post.save(function(err, post){
      if(err){res.send({status: 'error'});} else {res.send({status: 'ok', postId: post.id});}
    });
  });
};


/*
 * DELETE /admin/files
 */

exports.deleteFile = function(req,res){
  var fileId = req.body.fileId;
  var $FILE;
  if(fileId){
    async.waterfall([
      function(fn){m.removeFile(fileId,fn);},
      function(file,fn){$FILE = file;m.deleteFile($FILE,fn);},
      function(fn){m.detachFileFromPost($FILE.id,$FILE.post,fn);},
      function(fn){res.send({status: 'ok'});}
    ]);
  }
};


/*
 * DELETE /admin/posts
 */

exports.deletePost = function(req,res){
  var postId = req.body.postId;
  var $POST;
  if(postId){
    async.waterfall([
      function(fn){m.removePost(postId,fn);},
      function(post,fn){$POST = post;m.deletePostFiles(postId,$POST.files,fn);},
      function(fn){res.send({status: 'ok'});}
    ]);
  }
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