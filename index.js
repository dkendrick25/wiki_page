var express = require('express');
var app = express();
var fs = require('fs');
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: false}));
app.set('view engine', 'hbs');
app.use(express.static('public'));

app.get("/", function(request, response) {
  response.redirect("/Homepage");
});

app.get('/:pageName', function(request, response) {
  var pageName = request.params.pageName;
  fs.readFile("pages/" + pageName + ".txt", function(err, data) {
    if (err) {
      response.render('placeholder.hbs', {
        pageName: pageName
      });
      return;
    }
    var content = data.toString();
    console.log(content);
    response.send(content);
  });

});

app.get("/:pageName/edit", function(request, response) {
  var pageName = request.params.pageName;
  response.render('edit.hbs', {
    pageName: pageName
  });
});

app.post("/:pageName/save", function(request, response){
  var pageName = request.params.pageName;
  var data = request.body;
  console.log(data.wikiText);
  fs.writeFile("pages/" + pageName + ".txt", data.wikiText, function(err) {
    if (err) {
      console.log(err);
      return;
    }
  });
  response.redirect('/' + pageName);
});

app.listen(3000, function() {
  console.log('listening on port 3000');
});
