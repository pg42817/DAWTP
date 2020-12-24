var express = require('express');
var router = express.Router();
var Pub = require('../controllers/pub')

// GET home page. 
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/mural', verificaAutenticacao, function(req, res) {
  mail=req.user.mail
  role=req.user.role

  Pub.list(mail,role)
  .then(pubs => {
    var d = new Date().toISOString().substr(0, 16)
    res.render('mural', { utilizador: req.user, pubs, d });
  })
  .catch(erro => done(erro))
});

function verificaAutenticacao(req,res,next)
{
  console.log('User (verif.: )' + JSON.stringify(req.user))
  if(req.isAuthenticated()){
    next();
  }
  else{
    res.redirect("/users/login");
  }
}

module.exports = router;


