var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose')
var User = require('../Server/controllers/user')

 
//#region mongoose Configuration
//Set up default mongoose connection
var mongoDB = 'mongodb://127.0.0.1/DAW2020';
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});

//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error...'));
db.once('open', function() {
    console.log("Conexão ao MongoDB realizada com sucesso...")
});

//#endregion

//#region Autenticaçao ------------------------------------------------------
var { v4: uuidv4 } = require('uuid');
var session = require('express-session');
const FileStore = require('session-file-store')(session);

var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy
var axios = require('axios')


// Configuração da estratégia local
passport.use(new LocalStrategy(
  {usernameField: 'id'}, function(id, password, done) {
    User.lookUp(id)
      .then(dados => {
        const user = dados
        console.log(dados)
        console.log(id)
        console.log(password)
        if(!user) { return done(null, false, {message: 'Utilizador inexistente!\n'})}
        if(password != user.password_enc) { return done(null, false, {message: 'Credenciais inválidas!\n'})}
        return done(null, user)
      })
      .catch(erro => done(erro))
    })
)

//#endregion

//#region passport
// Indica-se ao passport como serializar o utilizador
passport.serializeUser((user,done) => {
  console.log('Serielização, id: ' + JSON.stringify(user))
  done(null, user.mail)
})
  
// Desserialização: a partir do id obtem-se a informação do utilizador
passport.deserializeUser((uid, done) => {
  console.log('Desserielização, id: ' + uid)
  User.lookUp(uid)
    .then(dados => {
      console.log(dados)
      done(null, dados)})
    .catch(erro => done(erro, false))
})

//#endregion

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const { RequestHeaderFieldsTooLarge } = require('http-errors');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//#region session
app.use(session({
  genid: function(req) {
    return uuidv4()
  },
  store: new FileStore(),
  secret: 'DAW2020auth',
  resave: false,
  saveUninitialized: true
}))

app.use(function(req,res,next){
  console.log(req.sessionID)
  next()
})

app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next){
  console.log('Signed Cookies: ', JSON.stringify(req.signedCookies))
  console.log('Session: ', JSON.stringify(req.session))
  next()
})

//#endregion

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('DAW2020auth'));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
