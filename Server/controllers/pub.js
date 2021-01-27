const pub = require('../models/pub')
var Pub = require('../models/pub')
var mongoose = require('mongoose')


module.exports.list = (mail, role) => {
    if (role == "administrador") {
        return Pub
            .find()
            .sort({ author: 1 })
            .exec()
    }
    if (role == "produtor") {
        return Pub
            .find()
            .where('visibility').equals('Privado')
            .where('author').equals(mail)
            .sort({ author: 1 })
            .exec()
    }
    if (role == "consumidor") {
        return Pub
            .find()
            .where('visibility').equals('Público')
            .sort({ author: 1 })
            .exec()
    }
}

//funçao para complementar o list dos produtores
module.exports.list_aux = (mail) => {
    return Pub
    .find( { 'author': { $ne: 'author' } } )
    .where('visibility').equals('Público')
    .sort({author:1})
    .exec()
}

//devolve as publicacoes de um autor
module.exports.my_lookUp = (author) => {
    return Pub
        .find({ author: author })
        .exec()
}

module.exports.lookUp = (mail, role) => {
    if (role == "administrador") {
        return Pub
            .find({author:mail})
            .sort({ author: 1 })
            .exec()
    }
    else{
        return Pub
            .find()
            .where('visibility').equals('Público')
            .where('author').equals(mail)
            .sort({ author: 1 })
            .exec()
    }
}


module.exports.insertRating = (pub_id, resource_id, user, newvalue) => {
    return Pub
        .updateOne({ _id: pub_id, "resources._id": resource_id }, { $addToSet: { "resources.$.rating_list": { "rating_mail": user, value: newvalue } } })
        .exec()
}

module.exports.updateRating = (pub_id, resource_id, user, newvalue) => {
    return Pub
        .updateOne({ _id: pub_id }, { $set: { "resources.$[i].rating_list.$[j].value": newvalue } }, { arrayFilters: [{ "i._id": resource_id }, { "j.rating_mail": user }] })
        .exec()
}

module.exports.handleRating = (pub_id, resource_id, user, callback) => {
    Pub.findOne({ _id: pub_id, "resources._id": resource_id, "resources": { "$elemMatch": { "_id": resource_id, "rating_list": { "$elemMatch": { "rating_mail": user } } } } }, function (err, userObj) {
        if (err) {
            return callback(err);
        } else if (userObj) {
            return callback(null, userObj);
        } else {
            return callback();
        }
    });
}


module.exports.overallRating = (pub_id, resource_id, callback) => {
    p_id = new mongoose.Types.ObjectId(pub_id)
    r_id = new mongoose.Types.ObjectId(resource_id)
    Pub.aggregate([{ $match: { _id: p_id, "resources._id": r_id } },
    { $unwind: "$resources" },
    { $unwind: "$resources.rating_list" },
    { $group: { "_id": { "id": "$resources._id" }, "sumRatings": { "$sum": "$resources.rating_list.value" }, "numRatings": { "$sum": 1 } } }], function (err, result) {
        if (err) {
            return callback(err);
        } else if (result) {
            var i = 0;
            for (i = 0; i < result.length; i++) {
                if (result[i]["_id"]["id"] == resource_id) {

                    return callback(null, result[i]);
                }
            }
            return callback(null, result);
        } else {
            return callback();
        }
    })
}

module.exports.updateOverallRating = (pub_id, resource_id, newvalue) => {
    return Pub
        .updateOne({ _id: pub_id }, { $set: { "resources.$[i].rating": newvalue } }, { arrayFilters: [{ "i._id": resource_id }] })
        .exec()
}

module.exports.pubRating = (pub_id, callback) => {
    p_id = new mongoose.Types.ObjectId(pub_id)
    Pub.aggregate([{ $match: { _id: p_id } },
    { $unwind: "$resources" },
    { $group: { "_id": { "id": "$_id" }, "sumRatings": { "$sum": "$resources.rating" }, "numRatings": { "$sum": 1 } } }], function (err, result) {
        if (err) {
            return callback(err);
        } else if (result) {
            return callback(null, result);
        } else {
            return callback();
        }
    })
}

module.exports.updatePubRating = (pub_id, newvalue) => {
    return Pub
        .updateOne({ _id: pub_id }, { $set: { "pub_rating": newvalue } })
        .exec()
}



module.exports.insert = (author, description, visibility, resources) => {
    data = new Date().toISOString()
    var newPub = new Pub()
    newPub.author = author
    newPub.description = description
    newPub.visibility = visibility
    newPub.resources = resources
    newPub.data_created = data
    newPub.pub_rating = 0
    return newPub.save()
}

module.exports.find_pub = (pub_date, pub_author) => {

    return Pub
        .findOne()
        .where('author').equals(pub_author)
        .where('data_created').equals(pub_date)
        .sort({ author: 1 })
        .exec()
}

module.exports.update = (pub) => {
    Pub.update({ "author": pub.author, "data_created": pub.data_created },
        {
            $set:
            {
                "comments": pub.comments
            }
        })
        .exec()

    return Pub
        .find({ author: pub_author })
        .where('data_created').equals(pub_date)
        .sort({ author: 1 })
        .exec()
}


module.exports.find_pub_by_id = (pub_id) => {

    return Pub
        .findOne({ _id: pub_id })
        .exec()
}


module.exports.edit_pub = (pub_id, pub) => {

    return Pub
        .updateOne({ _id: pub_id }, { $set: { resources: pub.resources, author: pub.author, description: pub.description, visibility: pub.visibility } })
        .exec()
}


module.exports.delete_pub = (pub_id) => {

    return Pub
        .remove({ _id: pub_id })
        .exec()
}

