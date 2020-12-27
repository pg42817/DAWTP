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
var archiver = require('archiver')
var fse = require('fs-extra')
var mime = require('mime-types')
var CryptoJS = require('crypto-js');
const { body, validationResult } = require('express-validator');
const { Console } = require('console');
const { CONNREFUSED } = require('dns');
var upload = multer({ dest: 'uploads/' })

//#region Registo
router.get('/registar', function (req, res) {
  res.render('registar')
  req.session.errors=null;
});

router.post('/registar',[body('mail','Endereço email inválido!').isEmail(),
  body('mail','Endereço email necessário!').notEmpty(),
  body('name','Nome necessário!').notEmpty(),
  body('course','Curso necessário!').notEmpty(),
  body('activity','Atividade necessária!').notEmpty(),
  body('department','Departamento necessário!').notEmpty(),
  body('password_enc','Password necessário!').notEmpty(),
  body('password_enc2','Passwords não coincidem!').custom((value,{req})=>{
    if (value!== req.body.password_enc){
      throw new Error('Passwords não coincidem')
    }else{
      return value;
    }
  })],(req, res) =>{
    var user = req.body
    var errors = validationResult(req).array();
    console.log(errors.length)
    if(errors.length!=0){
      res.render('registar',{title:'Erro',errors:errors})
    }
    else{
      User.insert(user)
      .then(data => res.render('login'))
      .catch(err => res.render('error', { error: err }))
    }
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

router.get('/pubs/download/:fname/:autor', (req, res) => {
  if (req.isAuthenticated() && (req.user.role == "consumidor" || req.user.role == "produtor" || req.user.role == "administrador")) {
    let filePath = path.join(__dirname, '../public/fileStore/', req.params.autor, '/')
    let zipPath = path.join(__dirname, '../public/fileStore/zip')
    let bagitPath = zipPath + '/bagit.txt'
    let manifestPath = zipPath + '/manifest-sha512.txt'

    fse.outputFileSync(bagitPath, 'BagIt-version: 1.0\nTag-File-Character-Encoding: UTF-8')

    let file = fse.readFile(filePath + req.params.fname)
    let sha512Hash = CryptoJS.SHA512(file).toString()
    fse.outputFileSync(manifestPath, sha512Hash + ' data/' + req.params.fname)
    fse.ensureDirSync(zipPath + '/data');
    fs.copyFile((filePath + req.params.fname), (zipPath + '/data/' + req.params.fname), (err) => {
      if (err) throw err;
      console.log(filePath + req.params.fname + ' was copied to ' + zipPath + '/data/' + req.params.fname);
    });

    var zipname = filePath + 'DIP.zip'

    var archive = archiver('zip');

    archive.on('error', function (err) {
      throw err;
    });

    archive.on('end', function () {
      console.log(archive.pointer() + ' total bytes');
      console.log('archiver has been finalized and the output file descriptor has closed.');
      fse.remove(zipPath)
      fse.remove(filePath + 'DIP.zip')
    });

    res.attachment(zipname);

    archive.pipe(res);

    archive.directory(zipPath, false);

    archive.finalize();
  }
  else {
    res.send("Nao tens permissoes para aceder a esta pagina")
  }
})


router.get('/pubs/upload', function (req, res) {
  if (req.isAuthenticated() && (req.user.role == "produtor" || req.user.role == "administrador")) {
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
    var extensoes = []
    var d = new Date().toISOString()
    author = req.user.mail
    description = req.body.description
    visibility = req.body.visibility
    //por cada ficheiro, guardar na pasta uploads com o nome original
    for (i = 0; i < req.files.length; i++) {
      let newPath = path.join(__dirname, '../public/fileStore/', req.files[i].originalname)
      let oldPath = path.join(__dirname, '../', req.files[i].path)

      fs.rename(oldPath, newPath, function (err) {
        if (err) throw err
      })

      //save extension file
      extensoes[i] = mime.extension(req.files[i].mimetype);

      if (req.files.length > 1) {
        var theme = req.body.theme[i]
        var title = req.body.title[i]
      } else {
        var theme = req.body.theme
        var title = req.body.title
      }

      recurso = {
        "type": req.files[i].mimetype,
        "theme": theme,
        "title": title,
        "data_created": d,
        "extension": extensoes[i]
      };
      recursos.push(recurso);
    }
    //guardar na BD e mudar nome do ficheiro no repositorio local
    Pub.insert(author, description, visibility, recursos)
      .then(dados => {
        //mudar nome do ficheiro na pasta para o id do ficheiro na bd
        for (i = 0; i < req.files.length; i++) {
          var file_name= dados.resources[i].id + '.'+ extensoes[i]
          
          dir=path.join(__dirname, '../public/fileStore/', author)
          console.log(dir)
          if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }

          let newPath = path.join(dir, file_name)
          let oldPath = path.join(__dirname, '../public/fileStore/', req.files[i].originalname)
          fs.rename(oldPath, newPath, function (err) {
            if (err) throw err
          })
        }
      })
      .catch(err => res.render('error', { error: err }))

    res.redirect('/users/perfil')
  }
  else {
    res.send("Nao tens permissoes para aceder a esta pagina")
  }

})

//#endregion

//apresenta os dados do utilizador e as suas publicações
router.get('/perfil', function (req, res) {
  mail = req.user.mail
  User.lookUp(mail)
    .then(utilizador => {
      console.log("tem pedido?:" + utilizador.pedido_produtor)
      Pub.lookUp(mail)
        .then(publicacoes => {
          res.render('perfil', { utilizador: utilizador, pubs:publicacoes});
        })
        .catch(erro => done(erro))
    })
    .catch(erro => done(erro))

});

//#region pedido produtor

router.get('/pedidos/', function (req, res) {
    //se for admin envia a lista de pedidos
      User.list_pedidos_produtor()
        .then(pedidos => {
          res.render('pedidos', {pedidos: pedidos})            
        })
        .catch(erro => done(erro))
});

router.post('/pedido-produtor/', function (req, res) {
  mail = req.user.mail
  User.update_pedir_produtor(mail, "sim")
    .then(utilizador => {
      res.end()
    })
    .catch(erro => done(erro))
});

//aceitar pedido
router.post('/aceitar-pedido/:mail', function (req, res) {
  console.log("APROVAR")
  mail = req.params.mail
  User.update_pedir_produtor(mail, "nao")
    .then(utilizador => {
      User.update_role(mail, "produtor")
        .then(utilizador => {
          res.end()
        })
        .catch(erro => done(erro))
    })
    .catch(erro => done(erro))
});

//recusar pedido
router.post('/recusar-pedido/:mail', function (req, res) {
  mail = req.params.mail
  console.log("RECUSAR")
  User.update_pedir_produtor(mail, "nao")
    .then(utilizador => {
      res.end()
    })
    .catch(erro => done(erro))
});

//#endregion


router.post('/adicionar_comentario', function (req, res) {
  var d = new Date().toISOString().substr(0, 16)

  pub_date=req.body.data
  text=req.body.text
  author=req.body.author
  pub_author=req.body.pub_author

  Pub.find_pub(pub_date,pub_author)
  .then(dados => {
      var comentario= {"text":text,
      "author_mail":author,
      "data":d}
      dados.comments.push(comentario)
      
      Pub.update(dados)
    .then(dados => {
    })
    .catch(erro => done(erro))
  })
  .catch(erro => done(erro))

});

//#region news
router.get('/news', function(req, res) {
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
          var news=get_news(p)
          console.log(news)
          res.render('news', { utilizador: req.user, pubs:news, d });
        })
    }
    else
    {
      var news=get_news(pubs)
      console.log(news)
      res.render('news', { utilizador: req.user, pubs:news, d });
    }
  })
  .catch(erro => done(erro))
});

function get_news(publicacoes){
  var news=[]
  var date_agora = Date.parse(new Date())
  publicacoes.forEach(pub => {
    var data=Date.parse(pub.data_created)
    const diffTime = Math.abs(date_agora - data);
    if(diffTime<86400000)
    {
      news.push(pub)
    }
  })
  return news
}
//#endregion

module.exports = router;