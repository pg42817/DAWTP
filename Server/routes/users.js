var express = require('express');
var router = express.Router();

var passport = require('passport')

// GET users listing. 
router.get('/login', function(req, res) {
  console.log('Na cb do GET login...')
  console.log(req.sessionID)
  res.render('login-form')
});

router.get('/logout', function(req,res){
  req.logout();
  req.session.destroy(function (err) {
    if (!err) {
        res.redirect('/');
    } else {
        console.log('Destroy session error: ', err)
    }
  });
})

router.post('/login', passport.authenticate('local'), function(req, res) {
  console.log('Na cb do POST login...')
  console.log('Do form: ' +JSON.stringify(req.body))
  console.log('Do passport: ' +JSON.stringify(req.user))
  res.redirect('/protegida')

  
});

router.get('/administrador', function(req, res) {
  if(req.isAuthenticated() && req.user.role=="administrador"){
    res.render('administrador', {utilizador: req.user});
  }
  else{
    res.send("Nao tens permissoes para aceder a esta pagina")
  }
});

router.get('/consumidor', function(req, res) {
  if(req.isAuthenticated() && req.user.role=="consumidor"){
    res.render('consumidor', {utilizador: req.user});
  }
  else{
    res.send("Nao tens permissoes para aceder a esta pagina")
  }
});

router.get('/produtor', function(req, res) {
  if(req.isAuthenticated() && req.user.role=="produtor"){
    res.render('produtor', {utilizador: req.user});
  }
  else{
    res.send("Nao tens permissoes para aceder a esta pagina")
  }
});


module.exports = router;


