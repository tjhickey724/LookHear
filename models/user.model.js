const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let userSchema = Schema({
  googleid: String,
  googletoken: String,
  googlename: String,
  googleemail: String,
});

module.exports = mongoose.model('User', userSchema);
