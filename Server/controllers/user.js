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
    data = new Date().toISOString().substr(0,16)
    var newUser = new User(user)
    newUser.data_register=data
    newUser.data_last_login=data
    newUser.role="consumidor"
    return newUser.save()
}

module.exports.update_last_login = user => {

    User.update({"mail" : user.mail },
    { $set:
        {
            "data_last_login": user.data_last_login
        }
    }).exec()

    return User
        .findOne({numero: user.email})
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