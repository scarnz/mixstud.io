var mongoose = require('mongoose');

var ZipFile = mongoose.Schema({
  name        : {type: String, required: true},
  size        : {type: Number, required: true},
  createdBy   : {type: String, required: true},
  createdAt   : {type: Date, default: Date.now}
});

mongoose.model('ZipFile', ZipFile);