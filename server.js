var express = require('express');
var fs = require('fs');
var app = express();

app.engine('html', require('ejs')
  .renderFile);
app.set('views', __dirname + '/views');
app.configure(function() {
  app.use(express.static(__dirname));
  app.use(express.bodyParser());
});

app.get('/', function(req, res) {
  res.render('index.html');
});

app.post('/api/auth', function(req, res) {
  var pass = req.body.password;

  fs.readFile('passwd', function(err, data) {
    if (err) throw err;

    var actual = data.toString();

    if (actual === pass) {
      res.status(200).type('json').send({
        login: true
      });
    } else {
      res.status(200).type('json').send({
        login: false
      });
    }

  });
});

app.use(function(req, res) {
  res.status(404);

  res.type('txt')
    .send('Not found');

});

app.listen(3000);
console.log('Server running on 3000');