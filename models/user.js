var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var User = mongoose.Schema({
  email     : {type: String, required: true, unique: true},
  password  : {type: String, required: true},
  isAdmin   : {type: Boolean, default: false},
  profile : {type: mongoose.Schema.Types.ObjectId, ref: 'userProfile', default: null},

  modifiedAt: {type: Date, default: Date.now},
  createdAt : {type: Date, default: Date.now}
});

User.plugin(uniqueValidator);
mongoose.model('User', User);
