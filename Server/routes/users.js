<<<<<<< HEAD
var express = require('express');
var router = express.Router();
var User = require('../controllers/user')
var Pub = require('../controllers/pub')
var fs = require('fs')
var path = require('path')
var passport = require('passport')
var multer = require('multer');
var templates = require('../templates/infor')

var AdmZip = require('adm-zip');
var archiver = require('archiver')
var fse = require('fs-extra')
var mime = require('mime-types')
var CryptoJS = require('crypto-js');
const { body, validationResult } = require('express-validator');
const { get } = require('http');
var upload = multer({ dest: 'uploads/' })

//#region Registo
router.get('/registar', function (req, res) {
  res.render('registar')
  req.session.errors = null;
});

router.post('/registar', [
  body('mail', 'Endereço email inválido!').isEmail(),
  body('mail', 'Endereço email necessário!').notEmpty(),
  body('name', 'Nome necessário!').notEmpty(),
  body('course', 'Curso necessário!').notEmpty(),
  body('activity', 'Atividade necessária!').notEmpty(),
  body('department', 'Departamento necessário!').notEmpty(),
  body('password_enc', 'Password necessário!').notEmpty(),
  body('password_enc2', 'Passwords não coincidem!').custom((value, { req }) => {
    if (value !== req.body.password_enc) {
      throw new Error('Passwords não coincidem')
    } else {
      return value;
    }
  }),
  body('mail', 'Email já se encontra registado!').custom(async (value, { req }) => {
    await User.lookUp(req.body.mail)
      .then(dados => {
        if (dados) {
          console.log('\n\nEXISTE\n\n')
          throw erro = new Error('Esse email já se encontra registado!')
        }
        else {
          console.log('\n\nNAO EXISTE\n\n')
        }
      })
      .catch(erro => {
        erro = 'Esse email já se encontra registado!'
        throw new Error('Esse email já se encontra registado!')
      })
  })
], (req, res) => {
  var user = req.body
  var errors = validationResult(req).array();
  console.log(errors.length)
  if (errors.length != 0) {
    res.render('registar', { title: 'Erro', errors: errors })
  }
  else {
    User.insert(user)
      .then(data => res.redirect('/users/login'))
      .catch(err => res.render('error', { error: err }))
  }
});

router.post('/validateEmail/', function (req, res) {
  User.lookUp(req.body.mail).then(user => {
    if (user) {
      res.render('registar', req.body)
    }
    else {
      res.render('login')
    }
  })
})

//#endregion

//#region login e autorizaçao

// GET users listing. 
router.get('/login', function (req, res) {
  console.log('Na cb do GET login...')
  console.log(req.sessionID)
  res.render('login', { message: req.flash('loginMessage') })
});

router.post('/login', passport.authenticate('local', {
  failureRedirect: '/users/login',
  failureFlash: true
}), function (req, res) {
  //alterar a data do last_login
  req.user.data_last_login = new Date().toLocaleDateString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  User.update_last_login(req.user)
    .then(dados => {
    })
    .catch(erro => done(erro))
  console.log()
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


router.get('/pubs/download/:fileid/:filename/:autor', verificaAutenticacao, (req, res) => {
  if (req.isAuthenticated() && (req.user.role == "consumidor" || req.user.role == "produtor" || req.user.role == "administrador")) {
    let filePath = path.join(__dirname, '../public/fileStore/', req.params.autor, '/')
    let zipPath = path.join(__dirname, '../public/fileStore/zip')
    let bagitPath = zipPath + '/bagit.txt'
    let manifestPath = zipPath + '/manifest-sha512.txt'

    fse.outputFileSync(bagitPath, 'BagIt-version: 1.0\nTag-File-Character-Encoding: UTF-8')

    console.log(res)

    let file = fse.readFile(filePath + req.params.fileid)
    let sha512Hash = CryptoJS.SHA512(file).toString()

    let extension = req.params.fileid.slice((req.params.fileid.lastIndexOf(".") - 1 >>> 0) + 2);

    fse.outputFileSync(manifestPath, sha512Hash + ' data/' + req.params.filename + '.' + extension)
    fse.ensureDirSync(zipPath + '/data');
    fs.copyFile((filePath + req.params.fileid), (zipPath + '/data/' + req.params.filename + '.' + extension), (err) => {
      if (err) throw err;
      console.log(filePath + req.params.fileid + ' was copied to ' + zipPath + '/data/' + req.params.fileid);
    });



    var zipname = filePath + req.params.filename + '_DIP.zip'

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
});

router.get('/pubs/downloadtodos/:pubid/:autor', verificaAutenticacao, (req, res) => {
  if (req.isAuthenticated() && (req.user.role == "consumidor" || req.user.role == "produtor" || req.user.role == "administrador")) {
    let filePath = path.join(__dirname, '../public/fileStore/', req.params.autor, '/')
    let zipPath = path.join(__dirname, '../public/fileStore/zip')
    let bagitPath = zipPath + '/bagit.txt'
    let manifestPath = zipPath + '/manifest-sha512.txt'
    var checkManifest = true

    fse.outputFileSync(bagitPath, 'BagIt-version: 1.0\nTag-File-Character-Encoding: UTF-8')

    fse.outputFileSync(manifestPath, "")


    fse.ensureDirSync(zipPath + '/data');

    Pub.find_pub_by_id(req.params.pubid)
      .then(publicacao => {
        for (i = 0; i < publicacao.resources.length; i++) {

          let filename = publicacao.resources[i].id + '.' + publicacao.resources[i].extension
          let file = fse.readFile(filePath + filename)
          let sha512Hash = CryptoJS.SHA512(file).toString()
          let checksum = publicacao.resources[i].hash

          if (sha512Hash != checksum) {
            checkManifest = false;
          }

          let realfilename = publicacao.resources[i].title + '.' + publicacao.resources[i].extension

          fs.appendFileSync(manifestPath, sha512Hash + ' data/' + realfilename + "\n");
          fs.copyFile((filePath + filename), (zipPath + '/data/' + realfilename), (err) => {
            if (err) throw err;
            console.log(filePath + realfilename + ' was copied to ' + zipPath + '/data/' + realfilename);
          });
        }

        var zipname = filePath + req.params.pubid + '_DIP.zip'

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

      })
      .catch(erro => done(erro))
  }
  else {
    res.send("Nao tens permissoes para aceder a esta pagina")
  }
});

router.post('/pubs/rating/:pubid/:resourceid', verificaAutenticacao, function (req, res) {
  Pub.handleRating(req.params.pubid, req.params.resourceid, req.user.mail, function (err, obj) {
    if (err) {
      throw err;
    }
    else {
      if (obj == null) {
        Pub.insertRating(req.params.pubid, req.params.resourceid, req.user.mail, req.body.rating)
          .then(() => {
            Pub.overallRating(req.params.pubid, req.params.resourceid, function (err, obj1) {
              if (err) {
                throw err;
              } else {
                var avg_rating = (obj1['sumRatings']) / (obj1['numRatings'])
                Pub.updateOverallRating(req.params.pubid, req.params.resourceid, avg_rating)
                  .then(() => {
                    Pub.pubRating(req.params.pubid, function (err, result) {
                      if (err) {
                        throw err;
                      } else {
                        var avg_pub_rating = (result[0]['sumRatings']) / (result[0]['numRatings'])
                        Pub.updatePubRating(req.params.pubid, avg_pub_rating)
                          .then(() => {
                            Pub.find_pub_by_id(req.params.pubid)
                              .then(publicacao => {
                                //usar template para o html em vez de pug
                                //res.render('pubs/info', { pub:publicacao,utilizador: req.user });
                                res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' })
                                res.write(templates.infor(publicacao, req.user))
                                res.end()
                              })
                              .catch(erro => done(erro))
                          })
                          .catch(erro => done(erro))
                      }
                    })
                  })
                  .catch(erro => done(erro))
              }
            })
          })
          .catch(erro => done(erro))
      } else {
        Pub.updateRating(req.params.pubid, req.params.resourceid, req.user.mail, req.body.rating)
          .then(() => {
            Pub.overallRating(req.params.pubid, req.params.resourceid, function (err, obj2) {
              if (err) {
                throw err;
              } else {
                var avg_rating = (obj2['sumRatings']) / (obj2['numRatings'])
                Pub.updateOverallRating(req.params.pubid, req.params.resourceid, avg_rating)
                  .then(() => {
                    Pub.pubRating(req.params.pubid, function (err, result) {
                      if (err) {
                        throw err;
                      } else {
                        var avg_pub_rating = (result[0]['sumRatings']) / (result[0]['numRatings'])
                        Pub.updatePubRating(req.params.pubid, avg_pub_rating)
                          .then(() => {
                            Pub.find_pub_by_id(req.params.pubid)
                              .then(publicacao => {
                                //usar template para o html em vez de pug
                                //res.render('pubs/info', { pub:publicacao,utilizador: req.user });
                                res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' })
                                res.write(templates.infor(publicacao, req.user))
                                res.end()
                              })
                              .catch(erro => done(erro))
                          })
                          .catch(erro => done(erro))
                      }
                    })
                  })
                  .catch(erro => done(erro))
              }
            })
          })
          .catch(erro => done(erro))
      }
    }
  })
});

router.get('/pubs/upload', verificaAutenticacao, function (req, res) {
  if (req.isAuthenticated() && (req.user.role == "produtor" || req.user.role == "administrador")) {
    var d = new Date().toLocaleDateString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
    res.render('pubs/form', { utilizador: req.user, d });
  }
  else {
    res.send("Nao tens permissoes para aceder a esta pagina")
  }
});

router.get('/pubs/edit/:pubid', verificaAutenticacao, function (req, res) {
  if (req.isAuthenticated() && (req.user.role == "produtor" || req.user.role == "administrador")) {
    Pub.find_pub_by_id(req.params.pubid)
      .then(publicacao => {
        res.render('pubs/edit', { pub: publicacao });
      })
      .catch(erro => done(erro))
  }
  else {
    res.send("Nao tens permissoes para aceder a esta pagina")
  }
});

router.post('/pubs/edit/:pubid', upload.array('myFile'), verificaAutenticacao, function (req, res) {
  if (req.isAuthenticated() && (req.user.role == "produtor" || req.user.role == "administrador")) {

    Pub.find_pub_by_id(req.params.pubid)
      .then(publicacao => {
        publicacao.description = req.body.description;
        publicacao.visibility = req.body.visibility;
        publicacao.theme = req.body.theme
        var i;
        for (i = 0; i < publicacao.resources.length; i++) {
          if (publicacao.resources.length > 1) {
            publicacao.resources[i].title = req.body.title[i]
          } else {
            publicacao.resources[i].title = req.body.title
          }
        }
        Pub.edit_pub(req.params.pubid, publicacao)
          .then(() => {
            res.redirect('/users/perfil')
          })
          .catch(erro => done(erro))
      })
      .catch(erro => done(erro))
  }
  else {
    res.send("Nao tens permissoes para aceder a esta pagina")
  }
});

router.post('/pubs', upload.array('myFile'), verificaAutenticacao, function (req, res) {
  if (req.isAuthenticated() && (req.user.role == "produtor" || req.user.role == "administrador")) {
    var i;
    var recursos = []
    var extensoes = []
    var d = new Date().toLocaleDateString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
    d = d.toString();
    author = req.user.mail
    description = req.body.description
    visibility = req.body.visibility
    var theme = req.body.theme
    if (req.body.SIP_check == "on") {
      var checkManifest = true;
      let oldPath = path.join(__dirname, '../', req.files[0].path)
      let dir = path.join(__dirname, '../public/fileStore/SIP')

      fse.ensureDir(dir, err => {
        if (err) throw err
      })

      var zip = new AdmZip(oldPath);

      let tempPath = path.join(__dirname, '../public/fileStore/SIP/')

      zip.extractAllTo(tempPath, true);

      let SIP_data = tempPath + 'data/'

      let manifest = zip.readAsText("manifest-sha512.txt").split(/\r?\n/)

      fs.unlink(oldPath, (err) => {
        if (err) throw err;
      });

      var nfiles = 0;
      var filenames = []
      fs.readdir(SIP_data, function (err, files) {
        if (err) {
          console.error("Could not list the directory.", err);
          process.exit(1);
        }

        files.forEach(function (filename, index) {

          let sha512Hash = CryptoJS.SHA512(filename).toString()
          if (sha512Hash != manifest[index]) {
            checkManifest = false;
          }

          let dir = path.join(__dirname, '../public/fileStore/', author)
          console.log(dir)
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
          }

          let newPath = path.join(dir, filename)
          let oldPath = path.join(SIP_data, filename)

          fs.rename(oldPath, newPath, function (err) {
            if (err) throw err
          })


          extensoes[index] = filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);

          let title = filename.replace(/\.[^/.]+$/, "")

          recurso = {
            "type": extensoes[index],
            "hash": sha512Hash,
            "title": title,
            "data_created": d,
            "extension": extensoes[index],
            "rating": 0
          };
          recursos.push(recurso);
          nfiles = index;
          filenames.push(filename);
        });

        //guardar na BD e mudar nome do ficheiro no repositorio local
        Pub.insert(author, theme, description, visibility, recursos)
          .then(dados => {
            console.log("NFiles=  " + nfiles)
            for (j = 0; j < nfiles + 1; j++) {
              var file_name = dados.resources[j].id + '.' + extensoes[j]

              let dir = path.join(__dirname, '../public/fileStore/', author)
              let newPath = path.join(dir, file_name)
              let oldPath = path.join(dir, filenames[j])
              fs.rename(oldPath, newPath, function (err) {
                if (err) throw err
              })
            }
            res.redirect('/users/perfil')

          })
          .catch(err => res.render('error', { error: err }))
      });

    } else {
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
          var title = req.body.title[i]
        } else {
          var title = req.body.title
        }

        let sha512Hash = CryptoJS.SHA512(req.files[i].originalname).toString()

        recurso = {
          "type": req.files[i].mimetype,
          "title": title,
          "hash": sha512Hash,
          "data_created": d,
          "extension": extensoes[i],
          "rating": 0
        };
        recursos.push(recurso);
      }

      //guardar na BD e mudar nome do ficheiro no repositorio local
      Pub.insert(author, theme, description, visibility, recursos)
        .then(dados => {
          //mudar nome do ficheiro na pasta para o id do ficheiro na bd
          for (i = 0; i < req.files.length; i++) {
            var file_name = dados.resources[i].id + '.' + extensoes[i]

            dir = path.join(__dirname, '../public/fileStore/', author)
            console.log(dir)
            fse.ensureDir(dir, err => {
              if (err) throw err
            })

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
  }
  else {
    res.send("Nao tens permissoes para aceder a esta pagina")
  }

});

router.get('/pubs/delete/:pubid', verificaAutenticacao, function (req, res) {
  let fileStorePath = path.join(__dirname, '../public/fileStore/')
  Pub.find_pub_by_id(req.params.pubid)
    .then(publicacao => {
      for (i = 0; i < publicacao.resources.length; i++) {
        let filename = publicacao.resources[i].id + '.' + publicacao.resources[i].extension
        let filePath = path.join(fileStorePath, publicacao.author, filename)

        fs.unlink(filePath, (err) => {
          if (err) throw err;
        });
      }
      Pub.delete_pub(req.params.pubid)
        .then(() => {
          res.redirect('/mural')
        })
        .catch(erro => done(erro))
    })
    .catch(erro => done(erro))
});

router.get('/pub/:pubid', verificaAutenticacao, function (req, res) {
  Pub.find_pub_by_id(req.params.pubid)
    .then(publicacao => {
      publicacao.pub_rating=publicacao.pub_rating.toFixed(2);
      console.log(publicacao)
      //usar template para o html em vez de pug
      //res.render('pubs/info', { pub:publicacao,utilizador: req.user });
      res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' })
      res.write(templates.infor(publicacao, req.user))
      res.end()
    })
    .catch(erro => done(erro))
});

//#endregion

//#region perfis
//apresenta os dados do utilizador e as suas publicações
router.get('/perfil', verificaAutenticacao, function (req, res) {
  mail = req.user.mail
  User.lookUp(mail)
    .then(utilizador => {
      Pub.my_lookUp(mail)
        .then(publicacoes => {
          res.render('perfil', { utilizador: utilizador, pubs: publicacoes });
        })
        .catch(erro => done(erro))
    })
    .catch(erro => done(erro))

});

router.get('/perfis/:mail', verificaAutenticacao, function (req, res) {
  let perfil = req.params.mail;
  let p_user = req.user.mail;
  let role = req.user.role;


  //verificar se o perfil do dono da publicaçao é o proprio
  if (p_user == perfil) {
    User.lookUp(p_user)
      .then(utilizador => {
        Pub.lookUp(p_user)
          .then(publicacoes => {
            res.render('perfil', { utilizador: utilizador, pubs: publicacoes });
          })
          .catch(erro => done(erro))
      })
      .catch(erro => done(erro))
  }
  else {
    User.lookUp(perfil)
      .then(utilizador => {
        Pub.lookUp(perfil, role)
          .then(publicacoes => {
            res.render('perfis', { utilizador: utilizador, pubs: publicacoes, myuser: req.user });
          })
          .catch(erro => done(erro))
      })
      .catch(erro => done(erro))
  }


});

router.get('/perfil/delete/:pubid', verificaAutenticacao, function (req, res) {
  let fileStorePath = path.join(__dirname, '../public/fileStore/')
  Pub.find_pub_by_id(req.params.pubid)
    .then(publicacao => {
      for (i = 0; i < publicacao.resources.length; i++) {
        let filename = publicacao.resources[i].id + '.' + publicacao.resources[i].extension
        let filePath = path.join(fileStorePath, publicacao.author, filename)

        fs.unlink(filePath, (err) => {
          if (err) throw err;
        });
      }
      Pub.delete_pub(req.params.pubid)
        .then(() => {
          res.redirect('/users/perfil')
        })
        .catch(erro => done(erro))
    })
    .catch(erro => done(erro))
});

//#endregion

//#region pedido produtor

router.get('/pedidos/', verificaAutenticacao, function (req, res) {
  //se for admin envia a lista de pedidos
  User.list_pedidos_produtor()
    .then(pedidos => {
      res.render('pedidos', { pedidos: pedidos })
    })
    .catch(erro => done(erro))
});

router.post('/pedido-produtor/', verificaAutenticacao, function (req, res) {
  mail = req.user.mail
  User.update_pedir_produtor(mail, "sim")
    .then(utilizador => {
      res.end()
    })
    .catch(erro => done(erro))
});

//aceitar pedido
router.post('/aceitar-pedido/:mail', verificaAutenticacao, function (req, res) {
  let filePath = path.join(__dirname, '../public/fileStore/', req.params.mail, '/')
  mail = req.params.mail
  User.update_pedir_produtor(mail, "nao")
    .then(utilizador => {
      fse.ensureDirSync(filePath);
      User.update_role(mail, "produtor")
        .then(utilizador => {
          res.end()
        })
        .catch(erro => done(erro))
    })
    .catch(erro => done(erro))
});

//recusar pedido
router.post('/recusar-pedido/:mail', verificaAutenticacao, function (req, res) {
  mail = req.params.mail
  User.update_pedir_produtor(mail, "nao")
    .then(utilizador => {
      res.end()
    })
    .catch(erro => done(erro))
});

//#endregion

router.post('/adicionar_comentario', verificaAutenticacao, function (req, res) {
  var d = new Date().toLocaleDateString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })

  pub_date = req.body.data
  text = req.body.text
  author = req.body.author
  pub_author = req.body.pub_author

  Pub.find_pub(pub_date, pub_author)
    .then(dados => {
      var comentario = {
        "text": text,
        "author_mail": author,
        "data": d
      }
      dados.comments.push(comentario)
      Pub.update(dados)
        .then(dados => {
        })
        .catch(erro => done(erro))
    })
    .catch(erro => done(erro))

});

//#region news
//#region news
router.get('/news', verificaAutenticacao, function (req, res) {
  Pub.list()
    .then(pubs => {
        var news = get_news(pubs)
        res.render('news', { utilizador: req.user, pubs: news});
    })
    .catch(erro => done(erro))
});

function get_news(publicacoes) {
  var news = []
  publicacoes.forEach(pub => {
    var data = new Date().toLocaleDateString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
    data= Date.parse(data)
    data_created=Date.parse(pub.data_created)
    var diff = (data - data_created)
    var hours = 60 * 60 * 24 * 1000
    pub.pub_rating=pub.pub_rating.toFixed(2);
    if ((diff-hours)>0)
    {
      console.log("\n\n"+diff)
      news.push(pub)
    }
  })
  return news
}

//#endregion

function verificaAutenticacao(req, res, next) {
  console.log('User (verif.: )' + JSON.stringify(req.user))
  if (req.isAuthenticated()) {
    next();
  }
  else {
    res.redirect("/users/login");
  }
}

=======
var express = require('express');
var router = express.Router();
var User = require('../controllers/user')
var Pub = require('../controllers/pub')
var fs = require('fs')
var path = require('path')
var passport = require('passport')
var multer = require('multer');
var templates = require('../templates/infor')

var AdmZip = require('adm-zip');
var archiver = require('archiver')
var fse = require('fs-extra')
var mime = require('mime-types')
var CryptoJS = require('crypto-js');
const { body, validationResult } = require('express-validator');
const { get } = require('http');
var upload = multer({ dest: 'uploads/' })

//#region Registo
router.get('/registar', function (req, res) {
  res.render('registar')
  req.session.errors = null;
});

router.post('/registar', [
  body('mail', 'Endereço email inválido!').isEmail(),
  body('mail', 'Endereço email necessário!').notEmpty(),
  body('name', 'Nome necessário!').notEmpty(),
  body('course', 'Curso necessário!').notEmpty(),
  body('activity', 'Atividade necessária!').notEmpty(),
  body('department', 'Departamento necessário!').notEmpty(),
  body('password_enc', 'Password necessário!').notEmpty(),
  body('password_enc2', 'Passwords não coincidem!').custom((value, { req }) => {
    if (value !== req.body.password_enc) {
      throw new Error('Passwords não coincidem')
    } else {
      return value;
    }
  }),
  body('mail', 'Email já se encontra registado!').custom(async (value, { req }) => {
    await User.lookUp(req.body.mail)
      .then(dados => {
        if (dados) {
          console.log('\n\nEXISTE\n\n')
          throw erro = new Error('Esse email já se encontra registado!')
        }
        else {
          console.log('\n\nNAO EXISTE\n\n')
        }
      })
      .catch(erro => {
        erro = 'Esse email já se encontra registado!'
        throw new Error('Esse email já se encontra registado!')
      })
  })
], (req, res) => {
  var user = req.body
  var errors = validationResult(req).array();
  console.log(errors.length)
  if (errors.length != 0) {
    res.render('registar', { title: 'Erro', errors: errors })
  }
  else {
    User.insert(user)
      .then(data => res.redirect('/users/login'))
      .catch(err => res.render('error', { error: err }))
  }
});

router.post('/validateEmail/', function (req, res) {
  User.lookUp(req.body.mail).then(user => {
    if (user) {
      res.render('registar', req.body)
    }
    else {
      res.render('login')
    }
  })
})

//#endregion

//#region login e autorizaçao

// GET users listing. 
router.get('/login', function (req, res) {
  console.log('Na cb do GET login...')
  console.log(req.sessionID)
  res.render('login', { message: req.flash('loginMessage') })
});

router.post('/login', passport.authenticate('local', {
  failureRedirect: '/users/login',
  failureFlash: true
}), function (req, res) {
  //alterar a data do last_login
  req.user.data_last_login = new Date().toLocaleDateString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  User.update_last_login(req.user)
    .then(dados => {
    })
    .catch(erro => done(erro))
  console.log()
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


router.get('/pubs/download/:fileid/:filename/:autor', verificaAutenticacao, (req, res) => {
  if (req.isAuthenticated() && (req.user.role == "consumidor" || req.user.role == "produtor" || req.user.role == "administrador")) {
    let filePath = path.join(__dirname, '../public/fileStore/', req.params.autor, '/')
    let zipPath = path.join(__dirname, '../public/fileStore/zip')
    let bagitPath = zipPath + '/bagit.txt'
    let manifestPath = zipPath + '/manifest-sha512.txt'

    fse.outputFileSync(bagitPath, 'BagIt-version: 1.0\nTag-File-Character-Encoding: UTF-8')

    console.log(res)

    let file = fse.readFile(filePath + req.params.fileid)
    let sha512Hash = CryptoJS.SHA512(file).toString()

    let extension = req.params.fileid.slice((req.params.fileid.lastIndexOf(".") - 1 >>> 0) + 2);

    fse.outputFileSync(manifestPath, sha512Hash + ' data/' + req.params.filename + '.' + extension)
    fse.ensureDirSync(zipPath + '/data');
    fs.copyFile((filePath + req.params.fileid), (zipPath + '/data/' + req.params.filename + '.' + extension), (err) => {
      if (err) throw err;
      console.log(filePath + req.params.fileid + ' was copied to ' + zipPath + '/data/' + req.params.fileid);
    });



    var zipname = filePath + req.params.filename + '_DIP.zip'

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
});

router.get('/pubs/downloadtodos/:pubid/:autor', verificaAutenticacao, (req, res) => {
  if (req.isAuthenticated() && (req.user.role == "consumidor" || req.user.role == "produtor" || req.user.role == "administrador")) {
    let filePath = path.join(__dirname, '../public/fileStore/', req.params.autor, '/')
    let zipPath = path.join(__dirname, '../public/fileStore/zip')
    let bagitPath = zipPath + '/bagit.txt'
    let manifestPath = zipPath + '/manifest-sha512.txt'
    var checkManifest = true

    fse.outputFileSync(bagitPath, 'BagIt-version: 1.0\nTag-File-Character-Encoding: UTF-8')

    fse.outputFileSync(manifestPath, "")


    fse.ensureDirSync(zipPath + '/data');

    Pub.find_pub_by_id(req.params.pubid)
      .then(publicacao => {
        for (i = 0; i < publicacao.resources.length; i++) {

          let filename = publicacao.resources[i].id + '.' + publicacao.resources[i].extension
          let file = fse.readFile(filePath + filename)
          let sha512Hash = CryptoJS.SHA512(file).toString()
          let checksum = publicacao.resources[i].hash

          if (sha512Hash != checksum) {
            checkManifest = false;
          }

          let realfilename = publicacao.resources[i].title + '.' + publicacao.resources[i].extension

          fs.appendFileSync(manifestPath, sha512Hash + ' data/' + realfilename + "\n");
          fs.copyFile((filePath + filename), (zipPath + '/data/' + realfilename), (err) => {
            if (err) throw err;
            console.log(filePath + realfilename + ' was copied to ' + zipPath + '/data/' + realfilename);
          });
        }

        var zipname = filePath + req.params.pubid + '_DIP.zip'

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

      })
      .catch(erro => done(erro))
  }
  else {
    res.send("Nao tens permissoes para aceder a esta pagina")
  }
});

router.post('/pubs/rating/:pubid/:resourceid', verificaAutenticacao, function (req, res) {
  Pub.handleRating(req.params.pubid, req.params.resourceid, req.user.mail, function (err, obj) {
    if (err) {
      throw err;
    }
    else {
      if (obj == null) {
        Pub.insertRating(req.params.pubid, req.params.resourceid, req.user.mail, req.body.rating)
          .then(() => {
            Pub.overallRating(req.params.pubid, req.params.resourceid, function (err, obj1) {
              if (err) {
                throw err;
              } else {
                var avg_rating = (obj1['sumRatings']) / (obj1['numRatings'])
                Pub.updateOverallRating(req.params.pubid, req.params.resourceid, avg_rating)
                  .then(() => {
                    Pub.pubRating(req.params.pubid, function (err, result) {
                      if (err) {
                        throw err;
                      } else {
                        var avg_pub_rating = (result[0]['sumRatings']) / (result[0]['numRatings'])
                        Pub.updatePubRating(req.params.pubid, avg_pub_rating)
                          .then(() => {
                            Pub.find_pub_by_id(req.params.pubid)
                              .then(publicacao => {
                                //usar template para o html em vez de pug
                                //res.render('pubs/info', { pub:publicacao,utilizador: req.user });
                                res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' })
                                res.write(templates.infor(publicacao, req.user))
                                res.end()
                              })
                              .catch(erro => done(erro))
                          })
                          .catch(erro => done(erro))
                      }
                    })
                  })
                  .catch(erro => done(erro))
              }
            })
          })
          .catch(erro => done(erro))
      } else {
        Pub.updateRating(req.params.pubid, req.params.resourceid, req.user.mail, req.body.rating)
          .then(() => {
            Pub.overallRating(req.params.pubid, req.params.resourceid, function (err, obj2) {
              if (err) {
                throw err;
              } else {
                var avg_rating = (obj2['sumRatings']) / (obj2['numRatings'])
                Pub.updateOverallRating(req.params.pubid, req.params.resourceid, avg_rating)
                  .then(() => {
                    Pub.pubRating(req.params.pubid, function (err, result) {
                      if (err) {
                        throw err;
                      } else {
                        var avg_pub_rating = (result[0]['sumRatings']) / (result[0]['numRatings'])
                        Pub.updatePubRating(req.params.pubid, avg_pub_rating)
                          .then(() => {
                            Pub.find_pub_by_id(req.params.pubid)
                              .then(publicacao => {
                                //usar template para o html em vez de pug
                                //res.render('pubs/info', { pub:publicacao,utilizador: req.user });
                                res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' })
                                res.write(templates.infor(publicacao, req.user))
                                res.end()
                              })
                              .catch(erro => done(erro))
                          })
                          .catch(erro => done(erro))
                      }
                    })
                  })
                  .catch(erro => done(erro))
              }
            })
          })
          .catch(erro => done(erro))
      }
    }
  })
});

router.get('/pubs/upload', verificaAutenticacao, function (req, res) {
  if (req.isAuthenticated() && (req.user.role == "produtor" || req.user.role == "administrador")) {
    var d = new Date().toLocaleDateString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
    res.render('pubs/form', { utilizador: req.user, d });
  }
  else {
    res.send("Nao tens permissoes para aceder a esta pagina")
  }
});

router.get('/pubs/edit/:pubid', verificaAutenticacao, function (req, res) {
  if (req.isAuthenticated() && (req.user.role == "produtor" || req.user.role == "administrador")) {
    Pub.find_pub_by_id(req.params.pubid)
      .then(publicacao => {
        res.render('pubs/edit', { pub: publicacao });
      })
      .catch(erro => done(erro))
  }
  else {
    res.send("Nao tens permissoes para aceder a esta pagina")
  }
});

router.post('/pubs/edit/:pubid', upload.array('myFile'), verificaAutenticacao, function (req, res) {
  if (req.isAuthenticated() && (req.user.role == "produtor" || req.user.role == "administrador")) {

    Pub.find_pub_by_id(req.params.pubid)
      .then(publicacao => {
        publicacao.description = req.body.description;
        publicacao.visibility = req.body.visibility;
        publicacao.theme = req.body.theme
        var i;
        for (i = 0; i < publicacao.resources.length; i++) {
          if (publicacao.resources.length > 1) {
            publicacao.resources[i].title = req.body.title[i]
          } else {
            publicacao.resources[i].title = req.body.title
          }
        }
        Pub.edit_pub(req.params.pubid, publicacao)
          .then(() => {
            res.redirect('/users/perfil')
          })
          .catch(erro => done(erro))
      })
      .catch(erro => done(erro))
  }
  else {
    res.send("Nao tens permissoes para aceder a esta pagina")
  }
});

router.post('/pubs', upload.array('myFile'), verificaAutenticacao, function (req, res) {
  if (req.isAuthenticated() && (req.user.role == "produtor" || req.user.role == "administrador")) {
    var i;
    var recursos = []
    var extensoes = []
    var d = new Date().toLocaleDateString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
    d = d.toString();
    author = req.user.mail
    description = req.body.description
    visibility = req.body.visibility
    var theme = req.body.theme
    if (req.body.SIP_check == "on") {
      var checkManifest = true;
      let oldPath = path.join(__dirname, '../', req.files[0].path)
      let dir = path.join(__dirname, '../public/fileStore/SIP')

      fse.ensureDir(dir, err => {
        if (err) throw err
      })

      var zip = new AdmZip(oldPath);

      let tempPath = path.join(__dirname, '../public/fileStore/SIP/')

      zip.extractAllTo(tempPath, true);

      let SIP_data = tempPath + 'data/'

      let manifest = zip.readAsText("manifest-sha512.txt").split(/\r?\n/)

      fs.unlink(oldPath, (err) => {
        if (err) throw err;
      });

      var nfiles = 0;
      var filenames = []
      fs.readdir(SIP_data, function (err, files) {
        if (err) {
          console.error("Could not list the directory.", err);
          process.exit(1);
        }

        files.forEach(function (filename, index) {

          let sha512Hash = CryptoJS.SHA512(filename).toString()
          if (sha512Hash != manifest[index]) {
            checkManifest = false;
          }

          let dir = path.join(__dirname, '../public/fileStore/', author)
          console.log(dir)
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
          }

          let newPath = path.join(dir, filename)
          let oldPath = path.join(SIP_data, filename)

          fs.rename(oldPath, newPath, function (err) {
            if (err) throw err
          })


          extensoes[index] = filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);

          let title = filename.replace(/\.[^/.]+$/, "")

          recurso = {
            "type": extensoes[index],
            "hash": sha512Hash,
            "title": title,
            "data_created": d,
            "extension": extensoes[index],
            "rating": 0
          };
          recursos.push(recurso);
          nfiles = index;
          filenames.push(filename);
        });

        //guardar na BD e mudar nome do ficheiro no repositorio local
        Pub.insert(author, theme, description, visibility, recursos)
          .then(dados => {
            console.log("NFiles=  " + nfiles)
            for (j = 0; j < nfiles + 1; j++) {
              var file_name = dados.resources[j].id + '.' + extensoes[j]

              let dir = path.join(__dirname, '../public/fileStore/', author)
              let newPath = path.join(dir, file_name)
              let oldPath = path.join(dir, filenames[j])
              fs.rename(oldPath, newPath, function (err) {
                if (err) throw err
              })
            }
            if (checkManifest == false) {
              alert("SHA512 não estava correto para todos os ficheiros. Mas foi corrigido.")
            }

            res.redirect('/users/perfil')

          })
          .catch(err => res.render('error', { error: err }))
      });

    } else {
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
          var title = req.body.title[i]
        } else {
          var title = req.body.title
        }

        let sha512Hash = CryptoJS.SHA512(req.files[i].originalname).toString()

        recurso = {
          "type": req.files[i].mimetype,
          "title": title,
          "hash": sha512Hash,
          "data_created": d,
          "extension": extensoes[i],
          "rating": 0
        };
        recursos.push(recurso);
      }

      //guardar na BD e mudar nome do ficheiro no repositorio local
      Pub.insert(author, theme, description, visibility, recursos)
        .then(dados => {
          //mudar nome do ficheiro na pasta para o id do ficheiro na bd
          for (i = 0; i < req.files.length; i++) {
            var file_name = dados.resources[i].id + '.' + extensoes[i]

            dir = path.join(__dirname, '../public/fileStore/', author)
            console.log(dir)
            fse.ensureDir(dir, err => {
              if (err) throw err
            })

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
  }
  else {
    res.send("Nao tens permissoes para aceder a esta pagina")
  }

});

router.get('/pubs/delete/:pubid', verificaAutenticacao, function (req, res) {
  let fileStorePath = path.join(__dirname, '../public/fileStore/')
  Pub.find_pub_by_id(req.params.pubid)
    .then(publicacao => {
      for (i = 0; i < publicacao.resources.length; i++) {
        let filename = publicacao.resources[i].id + '.' + publicacao.resources[i].extension
        let filePath = path.join(fileStorePath, publicacao.author, filename)

        fs.unlink(filePath, (err) => {
          if (err) throw err;
        });
      }
      Pub.delete_pub(req.params.pubid)
        .then(() => {
          res.redirect('/mural')
        })
        .catch(erro => done(erro))
    })
    .catch(erro => done(erro))
});

router.get('/pub/:pubid', verificaAutenticacao, function (req, res) {
  Pub.find_pub_by_id(req.params.pubid)
    .then(publicacao => {
      console.log(publicacao)
      //usar template para o html em vez de pug
      //res.render('pubs/info', { pub:publicacao,utilizador: req.user });
      res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' })
      res.write(templates.infor(publicacao, req.user))
      res.end()
    })
    .catch(erro => done(erro))
});

//#endregion

//#region perfis
//apresenta os dados do utilizador e as suas publicações
router.get('/perfil', verificaAutenticacao, function (req, res) {
  mail = req.user.mail
  User.lookUp(mail)
    .then(utilizador => {
      Pub.my_lookUp(mail)
        .then(publicacoes => {
          res.render('perfil', { utilizador: utilizador, pubs: publicacoes });
        })
        .catch(erro => done(erro))
    })
    .catch(erro => done(erro))

});

router.get('/perfis/:mail', verificaAutenticacao, function (req, res) {
  let perfil = req.params.mail;
  let p_user = req.user.mail;
  let role = req.user.role;


  //verificar se o perfil do dono da publicaçao é o proprio
  if (p_user == perfil) {
    User.lookUp(p_user)
      .then(utilizador => {
        Pub.lookUp(p_user)
          .then(publicacoes => {
            res.render('perfil', { utilizador: utilizador, pubs: publicacoes });
          })
          .catch(erro => done(erro))
      })
      .catch(erro => done(erro))
  }
  else {
    User.lookUp(perfil)
      .then(utilizador => {
        Pub.lookUp(perfil, role)
          .then(publicacoes => {
            res.render('perfis', { utilizador: utilizador, pubs: publicacoes, myuser: req.user });
          })
          .catch(erro => done(erro))
      })
      .catch(erro => done(erro))
  }


});

router.get('/perfil/delete/:pubid', verificaAutenticacao, function (req, res) {
  let fileStorePath = path.join(__dirname, '../public/fileStore/')
  Pub.find_pub_by_id(req.params.pubid)
    .then(publicacao => {
      for (i = 0; i < publicacao.resources.length; i++) {
        let filename = publicacao.resources[i].id + '.' + publicacao.resources[i].extension
        let filePath = path.join(fileStorePath, publicacao.author, filename)

        fs.unlink(filePath, (err) => {
          if (err) throw err;
        });
      }
      Pub.delete_pub(req.params.pubid)
        .then(() => {
          res.redirect('/users/perfil')
        })
        .catch(erro => done(erro))
    })
    .catch(erro => done(erro))
});

//#endregion

//#region pedido produtor

router.get('/pedidos/', verificaAutenticacao, function (req, res) {
  //se for admin envia a lista de pedidos
  User.list_pedidos_produtor()
    .then(pedidos => {
      res.render('pedidos', { pedidos: pedidos })
    })
    .catch(erro => done(erro))
});

router.post('/pedido-produtor/', verificaAutenticacao, function (req, res) {
  mail = req.user.mail
  User.update_pedir_produtor(mail, "sim")
    .then(utilizador => {
      res.end()
    })
    .catch(erro => done(erro))
});

//aceitar pedido
router.post('/aceitar-pedido/:mail', verificaAutenticacao, function (req, res) {
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
router.post('/recusar-pedido/:mail', verificaAutenticacao, function (req, res) {
  mail = req.params.mail
  User.update_pedir_produtor(mail, "nao")
    .then(utilizador => {
      res.end()
    })
    .catch(erro => done(erro))
});

//#endregion

router.post('/adicionar_comentario', verificaAutenticacao, function (req, res) {
  var d = new Date().toLocaleDateString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })

  pub_date = req.body.data
  text = req.body.text
  author = req.body.author
  pub_author = req.body.pub_author

  Pub.find_pub(pub_date, pub_author)
    .then(dados => {
      var comentario = {
        "text": text,
        "author_mail": author,
        "data": d
      }
      dados.comments.push(comentario)
      Pub.update(dados)
        .then(dados => {
        })
        .catch(erro => done(erro))
    })
    .catch(erro => done(erro))

});

//#region news
//#region news
router.get('/news', verificaAutenticacao, function (req, res) {
  Pub.list()
    .then(pubs => {
      var news = get_news(pubs)
      res.render('news', { utilizador: req.user, pubs: news });
    })
    .catch(erro => done(erro))
});

function get_news(publicacoes) {
  var news = []
  publicacoes.forEach(pub => {
    var data = new Date().toLocaleDateString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
    data = Date.parse(data)
    data_created = Date.parse(pub.data_created)
    var diff = (data - data_created)
    var hours = 60 * 60 * 24 * 1000
    if (diff < hours) {
      news.push(pub)
    }
  })
  return news
}

//#endregion

function verificaAutenticacao(req, res, next) {
  console.log('User (verif.: )' + JSON.stringify(req.user))
  if (req.isAuthenticated()) {
    next();
  }
  else {
    res.redirect("/users/login");
  }
}

>>>>>>> 19f4d044ff3522476b357327fe05dc1c71872873
module.exports = router;