var express = require('express');
var router = express.Router();
var Pub = require('../controllers/pub')

// GET home page. 
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/mural', verificaAutenticacao, function(req, res) {
  var d = new Date().toISOString().substr(0, 16)
  mail=req.user.mail
  role=req.user.role

  Pub.list(mail,role)
  .then(pubs => {
    //tive de fazer isto para o produtor porque precisava de ir buscar os publicos e os proprios
    if(role=="produtor")
    {
      Pub.list_aux(mail)
        .then(publicacoes=> {
          var p = []
          publicacoes.forEach(element => {
            p.push(element)
          });
          pubs.forEach(element => {
            p.push(element)
          });
          console.log(p)
          res.render('mural', { utilizador: req.user, pubs:p, d });
        })
    }
    else
    {
      console.log(pubs)
      res.render('mural', { utilizador: req.user, pubs, d });
    }
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



module.exports = router;


