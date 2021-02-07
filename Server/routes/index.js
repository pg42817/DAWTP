var express = require('express');
var router = express.Router();
var Pub = require('../controllers/pub')

// GET home page. 
router.get('/', function (req, res, next) {
  res.render('index');
});

router.get('/mural', verificaAutenticacao, function (req, res) {
  var d = new Date().toISOString().substr(0, 16)
  mail = req.user.mail
  role = req.user.role

  if (Object.keys(req.query).length == 0) {
    Pub.list()
      .then(pubs => {
<<<<<<< HEAD
          pubs.forEach(pub=>{
            pub.pub_rating=pub.pub_rating.toFixed(2);
          })
=======
>>>>>>> 19f4d044ff3522476b357327fe05dc1c71872873
          res.render('mural', { utilizador: req.user, pubs, d ,autor:0  });
      })
      .catch(erro => done(erro))
  }
  else if (req.query.orderby && req.query.order) {
    if(req.query.order==2)
    {
      var order=-1
    }
    Pub.listOrder(req.query.orderby,order)
      .then(pubs => {
<<<<<<< HEAD
        pubs.forEach(pub=>{
          pub.pub_rating=pub.pub_rating.toFixed(2);
        })
=======
>>>>>>> 19f4d044ff3522476b357327fe05dc1c71872873
        res.render('mural', { utilizador: req.user, pubs, d });
      })
      .catch(erro => done(erro))
  }
  else if (Object.keys(req.query).length == 1 && Object.keys(req.query).indexOf("recnome") == 0) {
    Pub.list_by_title( req.query.recnome)
      .then(pubs => {
        Pub.list_by_theme(req.query.recnome)
        .then(publicacoes=>{
          var p=[]
<<<<<<< HEAD
          pubs.forEach(pub=>{
            pub.pub_rating=pub.pub_rating.toFixed(2);
          })
          publicacoes.forEach(element=>{
            if(!p.includes(element)){
              p.push(element)
            }
          })
          pubs.forEach(element=>{
            if(!p.includes(element)){
              p.push(element)
            }
=======
          publicacoes.forEach(element=>{
            p.push(element)
          })
          pubs.forEach(element=>{
            p.push(element)
>>>>>>> 19f4d044ff3522476b357327fe05dc1c71872873
          }) 
          console.log(p)
          res.render('mural', { utilizador: req.user, pubs:p, d });
        })
       
      })
      .catch(erro => done(erro))
  }
  else if (Object.keys(req.query).length == 1 && Object.keys(req.query).indexOf("data") == 0) {
    Pub.list_by_date(req.query.data)
      .then(pubs => {
<<<<<<< HEAD
        pubs.forEach(pub=>{
          pub.pub_rating=pub.pub_rating.toFixed(2);
        })
=======
>>>>>>> 19f4d044ff3522476b357327fe05dc1c71872873
        res.render('mural', { utilizador: req.user, pubs, d });
      })
      .catch(erro => done(erro))
  }
  else if (Object.keys(req.query).length == 2 && Object.keys(req.query).indexOf("data") != -1 && Object.keys(req.query).indexOf("recnome") != -1) {
    Pub.list_by_date_and_title(req.query.data, req.query.recnome)
      .then(pubs => {
<<<<<<< HEAD
         pubs.forEach(pub=>{
          pub.pub_rating=pub.pub_rating.toFixed(2);
        })
=======
>>>>>>> 19f4d044ff3522476b357327fe05dc1c71872873
        res.render('mural', { utilizador: req.user, pubs, d });
      })
      .catch(erro => done(erro))
  }
});

function verificaAutenticacao(req, res, next) {
  console.log('User (verif.: )' + JSON.stringify(req.user))
  if (req.isAuthenticated()) {
    next();
  }
  else {
    res.redirect("/users/login");
  }
}

module.exports = router;

