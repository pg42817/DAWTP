var express = require('express');
var router = express.Router();
var Pub = require('../controllers/pub')

// GET home page. 
router.get('/', function (req, res, next) {
  res.render('index');
});
/*
router.get('/mural', verificaAutenticacao, function (req, res) {
  var d = new Date().toISOString().substr(0, 16)
  mail = req.user.mail
  role = req.user.role

  Pub.list(mail, role)
    .then(pubs => {
      //tive de fazer isto para o produtor porque precisava de ir buscar os publicos e os proprios
      if (role == "produtor") {
        Pub.list_aux(mail)
          .then(publicacoes => {
            var p = []
            publicacoes.forEach(element => {
              p.push(element)
            });
            pubs.forEach(element => {
              p.push(element)
            });
            res.render('mural', { utilizador: req.user, pubs: p, d });
          })
      }
      else {
        res.render('mural', { utilizador: req.user, pubs, d });
      }
    })
    .catch(erro => done(erro))
});
*/
router.get('/mural', verificaAutenticacao, function (req, res) {
  var d = new Date().toISOString().substr(0, 16)
  mail = req.user.mail
  role = req.user.role

  if (Object.keys(req.query).length == 0) {
    Pub.list(mail, role)
      .then(pubs => {
        //tive de fazer isto para o produtor porque precisava de ir buscar os publicos e os proprios
        if (role == "produtor") {
          Pub.list_aux(mail)
            .then(publicacoes => {
              var p = []
              publicacoes.forEach(element => {
                p.push(element)
              });
              pubs.forEach(element => {
                p.push(element)
              });
              res.render('mural', { utilizador: req.user, pubs: p, d });
            })
        }
        else {
          res.render('mural', { utilizador: req.user, pubs, d });
        }
      })
      .catch(erro => done(erro))
  }
  else if (Object.keys(req.query).length == 1 && Object.keys(req.query).indexOf("recnome") == 0) {
    Pub.list_by_title(mail, role, req.query.recnome)
      .then(pubs => {
        //tive de fazer isto para o produtor porque precisava de ir buscar os publicos e os proprios
        if (role == "produtor") {
          Pub.list_aux_by_title(mail, req.query.recnome)
            .then(publicacoes => {
              var p = []
              publicacoes.forEach(element => {
                p.push(element)
              });
              pubs.forEach(element => {
                p.push(element)
              });
              res.render('mural', { utilizador: req.user, pubs: p, d });
            })
        }
        else {
          res.render('mural', { utilizador: req.user, pubs, d });
        }
      })
      .catch(erro => done(erro))
  }
  else if (Object.keys(req.query).length == 1 && Object.keys(req.query).indexOf("data") == 0) {
    Pub.list_by_date(mail, role, req.query.data)
      .then(pubs => {
        //tive de fazer isto para o produtor porque precisava de ir buscar os publicos e os proprios
        if (role == "produtor") {
          Pub.list_aux_by_date(mail, req.query.data)
            .then(publicacoes => {
              var p = []
              publicacoes.forEach(element => {
                p.push(element)
              });
              pubs.forEach(element => {
                p.push(element)
              });
              res.render('mural', { utilizador: req.user, pubs: p, d });
            })
        }
        else {
          res.render('mural', { utilizador: req.user, pubs, d });
        }
      })
      .catch(erro => done(erro))
  }
  else if (Object.keys(req.query).length == 2 && Object.keys(req.query).indexOf("data") != -1 && Object.keys(req.query).indexOf("recnome") != -1) {
    Pub.list_by_date_and_title(mail, role, req.query.data, req.query.recnome)
      .then(pubs => {
        //tive de fazer isto para o produtor porque precisava de ir buscar os publicos e os proprios
        if (role == "produtor") {
          Pub.list_aux_by_date_and_title(mail, req.query.data, req.query.recnome)
            .then(publicacoes => {
              var p = []
              publicacoes.forEach(element => {
                p.push(element)
              });
              pubs.forEach(element => {
                p.push(element)
              });
              res.render('mural', { utilizador: req.user, pubs: p, d });
            })
        }
        else {
          res.render('mural', { utilizador: req.user, pubs, d });
        }
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

