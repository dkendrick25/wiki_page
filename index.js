var express = require('express');
var app = express();
var fs = require('fs');
var session = require('express-session');
var bodyParser = require('body-parser');
var wikiLinkify = require('wiki-linkify');
var marked = require('marked');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/wiki-db');
var Page = require("./pagemodel");

app.use(session({
  secret: 'uheosahuhutnesohuntsoe',
  cookie: {
    maxAge: 24 * 60 * 60000
  }
}));


app.use(bodyParser.urlencoded({extended: false}));
app.set('view engine', 'hbs');
app.use(express.static('public'));

app.get("/", function(request, response) {
  response.redirect("/Homepage");
});


app.get('/login', function(request, response) {
  response.render('login.hbs', {
    title: 'Login'
  });
});

app.get('/logout', function(request, response) {
  request.session.user = null;
  response.rediret("/");
});

app.post('/login-submit', function(request,response) {
  var crendentials = request.body;
  console.log(crendentials);
  if(crendentials.username === 'Toby' && crendentials.password === 'abc') {
    request.session.user = crendentials.username;
    response.redirect("/");
  } else {
    response.redirect('/login');
  }
});

app.get('/:pageName', function(request, response) {
  var pageName = request.params.pageName;
  var user = request.session.user;

  Page.findById(pageName, function(err, data) {
    if(!data) {
      response.render('placeholder.hbs', {
          title: pageName
          });
      return;
    } else {
      console.log('heres the data:', data);
      var content = data.content;
      var wikiContent = wikiLinkify(content);
      response.render('page.hbs', {
        title: pageName,
        content: marked(wikiContent),
        pageName: pageName,
        user: user
      });
      return;
    }
  });
});
//checks to see if user is logged in
function authRequired(request, response, next) {
  if(!request.session.user) {
    response.redirect('/login');
  } else {
    next();
  }
}

app.get('/:pageName/edit', authRequired, function(request, response) {
  var pageName = request.params.pageName;

  Page.findById(pageName, function(err, data) {
    if(!data) {
      // console.log(err.message);
      response.render('edit.hbs', {
        title: 'Edit ' + pageName,
        pageName: pageName
      });
      return;
    } else {
      console.log(data.content);
      var content = data.content;
      var wikiContent = wikiLinkify(content);
      response.render('edit.hbs', {
        title: 'Edit ' + pageName,
        pageName: pageName
      });
      return;
    }
  });



});

app.post('/:pageName/save', authRequired, function(request, response) {
  var pageName = request.params.pageName;
  var content = request.body.content;

  Page.update(
    {_id: pageName},
    {
      $set: {
        content: content
      }
    },
    {upsert: true},
    function(err, reply) {
      if(err) {
        console.log(err.message);
        return;
      }
      console.log("update successful", reply);
    }
  );
  response.redirect('/' + pageName);
});

app.listen(3000, function() {
  console.log('listening on port 3000');
});
