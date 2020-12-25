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

// devolve utilizadores que pediram para serem produtores
module.exports.list_pedidos_produtor=() => {
    return User
        .find({pedido_produtor: "sim" })
        .exec()
}

module.exports.insert = user => {
    data = new Date().toISOString().substr(0,16)
    var newUser = new User(user)
    newUser.data_register=data
    newUser.data_last_login=data
    newUser.role="consumidor"
    newUser.pedido_produtor="nao"
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

//altera o pedido do utilizador para ser/nao ser produtor
module.exports.update_pedir_produtor = (mail,mudar_pedido) => {

    User.update({"mail" : mail },
    { $set:
        {
            "pedido_produtor": mudar_pedido
        }
    }).exec()

    return User
        .findOne({mail: mail})
        .exec()
}

//altera o papel do utilizador
module.exports.update_role = (mail,role) => {

    User.update({"mail" : mail },
    { $set:
        {
            "role": role
        }
    }).exec()

    return User
        .findOne({mail: mail})
        .exec()
}

//altera a data do ultimo login
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