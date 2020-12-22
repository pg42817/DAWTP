var mongoose = require('mongoose')
var uniqueValidator = require('mongoose-unique-validator');

var pubsSchema = new mongoose.Schema({
    author: { type:String,required : true},
    type: { type:String,required : true},
    theme: { type:String,required : true},
    title: { type:String,required : true},
    data_created: { type:String,required : true},
    data_Registed: { type:String,required : true},
    visibility:{ type:String,required : true},
    //number_likes: {type:Integer, required: true},
    comments:[{
        author_mail: { type:String, required : true},
        data: { type:String, required : true},
        text: { type:String, required : true},
    }]
})

module.exports = mongoose.model('pubs', pubsSchema)