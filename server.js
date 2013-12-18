var express = require('express');
var app = express();

app.engine('html', require('ejs').renderFile);
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.use(app.router);

app.get('/', function(req, res) {
  res.render('index.html');
});

app.use(function(req, res) {
  res.status(404);

  res.type('txt').send('Not found');

});

app.listen(3000);
console.log('Server running on 3000');