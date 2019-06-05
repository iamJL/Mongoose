const express = require('express');
const router = express.Router();

let Post = require('../models/post');

let User = require('../models/user');

router.get('/add', ensureAuthenticated, function(req, res){
  res.render('add_post', {
    title:'Add Post'
  });
});

router.post('/add', function(req, res){
  req.checkBody('title','Title is required').notEmpty();

  req.checkBody('body','Body is required').notEmpty();

  let errors = req.validationErrors();

  if(errors){
    res.render('add_post', {
      title:'Add Post',
      errors:errors
    });
  } else {
    let post = new Post();
    post.title = req.body.title;
    post.author = req.user._id;
    post.body = req.body.body;

    post.save(function(err){
      if(err){
        console.log(err);
        return;
      } else {
        req.flash('success','Post Added');
        res.redirect('/');
      }
    });
  }
});

// Load Edit Form
router.get('/edit/:id', ensureAuthenticated, function(req, res){
  Post.findById(req.params.id, function(err, post){
    if(post.author != req.user._id){
      req.flash('danger', 'Not Authorized');
      res.redirect('/');
    }
    res.render('edit_post', {
      title:'Edit Post',
      post:post
    });
  });
});

// Update Submit POST Route
router.post('/edit/:id', function(req, res){
  let post = {};
  post.title = req.body.title;
  post.author = req.body.author;
  post.body = req.body.body;

  let query = {_id:req.params.id}

  Post.update(query, post, function(err){
    if(err){
      console.log(err);
      return;
    } else {
      req.flash('success', 'Post Updated');
      res.redirect('/');
    }
  });
});

// Delete Post
router.delete('/:id', function(req, res){
  if(!req.user._id){
    res.status(500).send();
  }

  let query = {_id:req.params.id}

  Post.findById(req.params.id, function(err, post){
    if(post.author != req.user._id){
      res.status(500).send();
    } else {
      Post.remove(query, function(err){
        if(err){
          console.log(err);
        }
        res.send('Success');
      });
    }
  });
});

// Get Single Post
router.get('/:id', function(req, res){
  Post.findById(req.params.id, function(err, post){
    User.findById(post.author, function(err, user){
      res.render('post', {
        post:post,
        author: user.name
      });
    });
  });
});

// Access Control
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    req.flash('danger', 'Please login');
    res.redirect('/users/login');
  }
}

module.exports = router;
