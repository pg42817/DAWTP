var User = require('../models/user')

// Returns user list
module.exports.list = () => {
    return User
        .find()
        .sort({nome:1})
        .exec()
}

module.exports.lookUp = mail=> {
    return User
        .findOne({mail: mail })
        .exec()
}

module.exports.insert = user => {
    var newUser = new User(user)
    console.log(user)
    console.log(newUser)
    return newUser.save()
}

module.exports.update = user => {
    var newUser = new User(user)
    User.update({"email" : newUser.email}, {$set: { "name" : newUser.name}, "activity": newUser.activity})
        .exec()
    return User
        .findOne({numero: newUser.email})
        .exec()
}

module.exports.delete= mail => {
    User.remove( {"mail" : mail})
        .exec()
    return User
        .find()
        .sort({name:1})
        .exec()
}