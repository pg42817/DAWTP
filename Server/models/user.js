var mongoose = require('mongoose')
var uniqueValidator = require('mongoose-unique-validator');

var userSchema = new mongoose.Schema({
    mail: { type: String, unique: true },
    name: String,
    activity: String,
    course: String,
    department: String,
    role: String,
    data_register: String,
    data_last_login: String,
    password_enc: String,
});

module.exports = mongoose.model('user', userSchema)