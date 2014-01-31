var mongoose = require('mongoose');

var Post = mongoose.Schema({
  title      : {type: String, required: true},
  content   : String,
  files     : [{type: mongoose.Schema.Types.ObjectId, ref: 'File'}],
  createdBy  : {type: String, required: true},
  createdAt  : {type: Date, default: Date.now}
});

mongoose.model('Post', Post);