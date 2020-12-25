var mongoose = require('mongoose')
var uniqueValidator = require('mongoose-unique-validator');

var pubSchema = new mongoose.Schema({
    author: { type:String,required : true},
    description: { type:String,required : true},
    data_created: { type:String,required : true},
    visibility:{ type:String,required : true},
    number_likes: {type:String, required: true},
    resources:[{
        extension: { type:String,required : true},
        type: { type:String,required : true},
        theme: { type:String,required : true},
        title: { type:String,required : true},
        data_created: { type:String,required : true},
    }],
    comments:[{
        author_mail: { type:String},
        data: { type:String},
        text: { type:String},
    }]
})

module.exports = mongoose.model('pub', pubSchema)