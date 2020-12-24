const pub = require('../models/pub')
var Pub = require('../models/pub')

module.exports.list = () => {
    return Pub
        .find()
        .sort({author:1})
        .exec()
}

module.exports.list = (mail,role) => {
    console.log(role)
    if(role=="adiminstrador")
    {
        return Pub
        .find()
        .sort({author:1})
        .exec()
    }
    if(role=="produtor")
    {
        return Pub
        .find()
        .where('visibility').equals('Público')
        .sort({author:1})
        .exec()

       /* pub2=Pub
        .find()
        .where('visibility').equals('Privado')
        .where('author').equals(mail)
        .sort({author:1})
        .exec()
    */


    }
    if(role=="consumidor")
    {
        return Pub
        .find()
        .where('visibility').equals('Público')
        .sort({author:1})
        .exec()
    }
}


//devolve as publicacoes de um autor
module.exports.lookUp = author=> {
    return Pub
        .find({author: author })
        .exec()
}

module.exports.insert= (author,description,visibility,resources)  => {
    data = new Date().toISOString().substr(0,16)
    var newPub = new Pub()
    newPub.author=author
    newPub.description=description
    newPub.visibility=visibility
    newPub.resources=resources
    newPub.data_created= data
    newPub.number_likes= 0
    return newPub.save()
}
 