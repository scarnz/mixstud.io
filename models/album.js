var mongoose = require('mongoose');

var Album = mongoose.Schema({
  name        : {type: String, required: true},
  artist      : {type: String, required: true},
  songs       : [{type: mongoose.Schema.Types.ObjectId, ref: 'Song', default: null}],
  createdBy   : {type: String, required: true},
  createdAt   : {type: Date, default: Date.now}
});

mongoose.model('Album', Album);