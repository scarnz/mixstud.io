var mongoose = require('mongoose');

var File = mongoose.Schema({
  name       : {type: String, required: true},
  type       : {type: String, required: true},
  post     : {type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true},
  createdBy    : {type: String, required: true},
  createdAt  : {type: Date, default: Date.now}
});

mongoose.model('File', File);