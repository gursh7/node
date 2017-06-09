var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    u_id: String,
    name: String,
    password: String
});

module.exports = mongoose.model('user', userSchema);