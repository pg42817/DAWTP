var Pub = require('../models/pub')

module.exports.list = () => {
    return Pub
        .find()
        .sort({author:1})
        .exec()
}

module.exports.insert= (author,description,resources)  => {
    data = new Date().toISOString().substr(0,16)
    var newPub = new Pub()
    newPub.author=author
    newPub.description=description
    newPub.resources=resources
    newPub.data_created= data
    newPub.number_likes= 0
    return newPub.save()
}
 