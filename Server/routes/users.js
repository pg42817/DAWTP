var express = require('express');
var router = express.Router();
var User = require('../controllers/user')
var Pub = require('../controllers/pub')
var jsonfile = require('jsonfile')
var fs = require('fs')
var path = require('path')
var passport = require('passport')

var multer = require('multer');
const pub = require('../models/pub');

var upload = multer({ dest: 'uploads/' })

//#region Registo
router.get('/registar', function (req, res) {
  res.render('registar')
});

router.post('/registar', function (req, res) {
  var user = req.body
  User.insert(user)
    .then(data => res.render('login'))
    .catch(err => res.render('error', { error: err }))
});

//#endregion

//#region login e autorizaçao

// GET users listing. 
router.get('/login', function (req, res) {
  console.log('Na cb do GET login...')
  console.log(req.sessionID)
  res.render('login')
});


router.post('/login', passport.authenticate('local'), function (req, res) {

  //alterar a data do last_login
  req.user.data_last_login = new Date().toISOString().substr(0, 16)
  User.update_last_login(req.user)
    .then(dados => {
    })
    .catch(erro => done(erro))

  console.log('Na cb do POST login...')
  console.log('Do form: ' + JSON.stringify(req.body))
  console.log('Do passport: ' + JSON.stringify(req.user))
  res.redirect('/mural')
}) 

router.get('/logout', function (req, res) {
  req.logout();
  req.session.destroy(function (err) {
    if (!err) {
      res.redirect('/');
    } else {
      console.log('Destroy session error: ', err)
    }
  });
});

//#endregion

//#region pubs
router.get('/pubs', function (req, res) {
  if (req.isAuthenticated() && (req.user.role == "consumidor" || req.user.role == "produtor" || req.user.role == "administrador")) {
    var d = new Date().toISOString().substr(0, 16)
    Pub.list()
    .then(pubs => {
      res.render('pubs/list', { utilizador: req.user, pubs, d });
    })
    .catch(erro => done(erro))
  }
  else {
    res.send("Nao tens permissoes para aceder a esta pagina")
  }
});

router.get('/pubs/download/:fname', (req, res) => {
  if (req.isAuthenticated() && (req.user.role == "consumidor" || req.user.role == "produtor" || req.user.role == "administrador")) {
    let reqPath = path.join(__dirname, '../public/fileStore/', req.params.fname)
    res.download(reqPath)
  }
  else {
    res.send("Nao tens permissoes para aceder a esta pagina")
  }
})


router.get('/pubs/upload', function (req, res) {
  if (req.isAuthenticated() && req.user.role == "produtor") {
    var d = new Date().toISOString().substr(0, 16)
    res.render('pubs/form', { utilizador: req.user, d });
  }
  else {
    res.send("Nao tens permissoes para aceder a esta pagina")
  }
});


router.post('/pubs', upload.array('myFile'), function (req, res) {
  if (req.isAuthenticated() && (req.user.role == "produtor" || req.user.role == "administrador")) {
    var i;

    var recursos = []
    var d = new Date().toISOString().substr(0, 16)
    author=req.user.mail
    description=req.body.description

    //por cada ficheiro, guardar na pasta uploads com o nome original
    for (i = 0; i < req.files.length; i++) {
      let newPath = path.join(__dirname, '../public/fileStore/', req.files[i].originalname)
      let oldPath = path.join(__dirname, '../', req.files[i].path)

      fs.rename(oldPath, newPath, function (err) {
        if (err) throw err
      })
      
      if (req.files.length > 1) {
        var theme = req.body.theme[i]
        var title = req.body.title[i]
        var visibility = req.body.visibility[i]
      } else {
        var theme = req.body.theme
        var title = req.body.title
        var visibility = req.body.visibility
      }

      recurso = { "type":req.files[i].mimetype,
                      "theme":theme,
                      "title":title,
                      "visibility":visibility, 
                      "data_created":d };
      recursos.push(recurso);
    }

    //guardar na BD e mudar nome do ficheiro no repositorio local
    Pub.insert(author,description,recursos)
    .then(dados => {
      //mudar nome do ficheiro na pasta para o id do ficheiro na bd
      for (i = 0; i < req.files.length; i++) {
        let newPath = path.join(__dirname, '../public/fileStore/', dados.resources[i].id)
        let oldPath = path.join(__dirname, '../public/fileStore/', req.files[i].originalname)
        fs.rename(oldPath, newPath, function (err) {
          if (err) throw err
        })
      }
    })
    .catch(err => res.render('error', { error: err }))

    res.redirect('/users/pubs')
  }
  else {
    res.send("Nao tens permissoes para aceder a esta pagina")
  }

})

//#endregion

module.exports = router;

