const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');


const db = 'mongodb://localhost:27017/nodekb'

mongoose.connect(db, { useMongoClient: true }, () => {
    console.log('Connected to MongoDB.');
});

// Init App
const app = express();

let Post = require('./models/post');

app.use('*',function(req,res,next){
  res.set('Access-Control-Allow-Origin','*');
  res.set('Access-Control-Allow-Headers','content-type, authorization');
  next();
})


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'tatti',
  resave: true,
  saveUninitialized: true
}));

app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

require('./config/passport')(passport);

app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
  res.locals.user = req.user || null;
  next();
});

// Home Route
app.get('/', function(req, res){
  Post.find({}, function(err, posts){
    if(err){
      console.log(err);
    } else {
      res.render('index', {
        title:'Posts',
        posts: posts
      });
    }
  });
});


let posts = require('./routes/posts');
let users = require('./routes/users');
app.use('/posts', posts);
app.use('/users', users);

app.listen(3000, function(){
  console.log('Server started on port 3000...');
});
