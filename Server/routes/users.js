var express = require('express');
var router = express.Router();
var jsonfile = require('jsonfile')
var fs = require('fs')
var path = require('path')

var passport = require('passport')

var multer = require('multer')

var upload = multer({ dest: 'uploads/' })

// GET users listing. 
router.get('/login', function (req, res) {
  console.log('Na cb do GET login...')
  console.log(req.sessionID)
  res.render('login-form')
});

router.post('/login', passport.authenticate('local'), function (req, res) {
  console.log('Na cb do POST login...')
  console.log('Do form: ' + JSON.stringify(req.body))
  console.log('Do passport: ' + JSON.stringify(req.user))
  res.redirect('/protegida')
});

router.get('/logout', function (req, res) {
  req.logout();
  req.session.destroy(function (err) {
    if (!err) {
      res.redirect('/');
    } else {
      console.log('Destroy session error: ', err)
    }
  });
})

router.get('/registar', function (req, res) {
  res.render('registar')
});

router.post('/registar', function (req, res) {
  var user = req.body
  User.insert(user)
    .then(data => res.render('login-form'))
    .catch(err => res.render('error', { error: err }))
});

router.get('/administrador', function (req, res) {
  if (req.isAuthenticated() && req.user.role == "administrador") {
    res.render('administrador', { utilizador: req.user });
  }
  else {
    res.send("Nao tens permissoes para aceder a esta pagina")
  }
});

router.get('/consumidor', function (req, res) {
  if (req.isAuthenticated() && req.user.role == "consumidor") {
    res.render('consumidor', { utilizador: req.user });
  }
  else {
    res.send("Nao tens permissoes para aceder a esta pagina")
  }
});

router.get('/files', function (req, res) {
  if (req.isAuthenticated() && (req.user.role == "consumidor" || req.user.role == "produtor" || req.user.role == "administrador")) {
    var d = new Date().toISOString().substr(0, 16)
    var files = jsonfile.readFileSync('./public/dbFiles.json')
    res.render('fileList', { utilizador: req.user, files, d });
  }
  else {
    res.send("Nao tens permissoes para aceder a esta pagina")
  }
});

router.get('/files/download/:fname', (req, res) => {
  if (req.isAuthenticated() && (req.user.role == "consumidor" || req.user.role == "produtor" || req.user.role == "administrador")) {
    let reqPath = path.join(__dirname, '../public/fileStore/', req.params.fname)
    res.download(reqPath)
  }
  else {
    res.send("Nao tens permissoes para aceder a esta pagina")
  }
})

router.get('/produtor', function (req, res) {
  if (req.isAuthenticated() && req.user.role == "produtor") {
    res.render('produtor', { utilizador: req.user });
  }
  else {
    res.send("Nao tens permissoes para aceder a esta pagina")
  }
});

router.get('/files/upload', function (req, res) {
  if (req.isAuthenticated() && req.user.role == "produtor") {
    var d = new Date().toISOString().substr(0, 16)
    res.render('fileForm', { utilizador: req.user, d });
  }
  else {
    res.send("Nao tens permissoes para aceder a esta pagina")
  }
});

router.post('/files', upload.array('myFile'), function (req, res) {

  if (req.isAuthenticated() && req.user.role == "produtor") {
    var i;
    for (i = 0; i < req.files.length; i++) {
      let newPath = path.join(__dirname, '../public/fileStore/', req.files[i].originalname)
      let oldPath = path.join(__dirname, '../', req.files[i].path)

      fs.rename(oldPath, newPath, function (err) {
        if (err) throw err
      })
      var files = jsonfile.readFileSync('./public/dbFiles.json')
      var d = new Date().toISOString().substr(0, 16)

      if (req.files.length > 0) {
        var descri = req.body.desc[i]
      } else {
        var descri = req.body.desc
      }

      files.push(
        {
          date: d,
          name: req.files[i].originalname,
          size: req.files[i].size,
          mimetype: req.files[i].mimetype,
          desc: descri
        }
      )

      jsonfile.writeFileSync('./public/dbFiles.json', files)

    }
    res.redirect('/users/produtor')
  }
  else {
    res.send("Nao tens permissoes para aceder a esta pagina")
  }

})

module.exports = router;


