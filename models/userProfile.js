var mongoose = require('mongoose');

var userProfile = mongoose.Schema({
  firstName : String,
  lastName  : String,
  city      : String,
  state     : String,
  picture     : String,
  modifiedAt : {type: Date, default: Date.now},
  createdAt : {type: Date, default: Date.now}
});

mongoose.model('userProfile', userProfile);
