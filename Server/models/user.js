var mongoose = require('mongoose')
var uniqueValidator = require('mongoose-unique-validator');

var userSchema = new mongoose.Schema({
    mail: { type: String, unique: true,required : true},
    name: { type:String, required : true},
    activity: { type:String, required : true},
    course: { type:String, required : true},
    department: { type:String, required : true},
    role: { type:String, required : true},
    data_register: { type:String, required : true},
    data_last_login: { type:String, required : true},
    password_enc: { type:String, required : true},
});



module.exports = mongoose.model('user', userSchema)
