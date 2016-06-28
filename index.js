var express = require('express');
var app = express();
var fs = require('fs');
var session = require('express-session');
var bodyParser = require('body-parser');
var wikiLinkify = require('wiki-linkify');
var marked = require('marked');

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
  var filename = 'pages/' + pageName + '.txt';
  var user = request.session.user;
  fs.access(filename, fs.R_OK, function(err) {
    if (err) {
      // cannot read, rendering place holder page
      response.render('placeholder.hbs', {
        title: pageName
      });
    } else {
      fs.readFile(filename, function(err, data) {
        if (err) {
          response.statusCode = 500;
          response.send('Sorry, problem reading file.');
          return;
        }
        var content = data.toString();
        var wikiContent = wikiLinkify(content);
        response.render('page.hbs', {
          title: pageName,
          content: marked(wikiContent),
          pageName: pageName,
          user: user
        });
      });
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
  var filename = 'pages/' + pageName + '.txt';
  fs.readFile(filename, function(err, data) {
    var content;
    if (err) {
      content = '';
    } else {
      content = data.toString();
    }

    response.render('edit.hbs', {
      title: 'Edit ' + pageName,
      pageName: pageName,
      content: content
    });
  });

});

app.post('/:pageName/save', authRequired, function(request, response) {
  var pageName = request.params.pageName;
  var content = request.body.content;
  var filename = 'pages/' + pageName + '.txt';
  fs.writeFile(filename, content, function(err) {
    response.redirect('/' + pageName);
  });
});

app.listen(3000, function() {
  console.log('listening on port 3000');
});
