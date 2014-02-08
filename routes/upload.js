var mongoose = require('mongoose');
var moment = require('moment');
var s3 = require('../lib/s3.js');
var ZipFile = mongoose.model('ZipFile');

/*
 * GET /upload
 */

exports.index = function(req, res){
  res.render('upload/index',
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

exports.upload = function(req, res){
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

exports.create = function(req, res){
  var zipFile = new ZipFile();
  zipFile.name = req.body.name;
  zipFile.size = req.body.size;
  zipFile.createdBy = req.body.createdBy;
  zipFile.save(function(err){
    if(err)
      {res.send({status: 'error'});}
    else
      {res.send({status: 'ok'});}
  });
};