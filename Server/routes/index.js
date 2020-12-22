var express = require('express');
var router = express.Router();
var mural = require('../templates/mural.js')

// GET home page. 
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/mural', verificaAutenticacao, function(req, res) {
  res.writeHead(200,{'Content-Type': 'text/html; charset=utf-8'})
  res.write(mural.mural(req.user))
  res.end()
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


