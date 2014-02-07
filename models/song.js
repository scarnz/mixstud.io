var mongoose = require('mongoose');

var Song = mongoose.Schema({
  name        : {type: String, required: true},
  artist      : {type: String, required: true},
  album       : {type: String, required: true},
  zipFile     : {type: mongoose.Schema.Types.ObjectId, ref: 'ZipFile', default: null},
  mixes       : [{type: mongoose.Schema.Types.ObjectId, ref: 'Mix', default: null}],
  createdBy   : {type: String, required: true},
  createdAt   : {type: Date, default: Date.now}
});

mongoose.model('Song', Song);