var express = require('express');
var fs = require('fs');
var app = express();

var Datastore = require('nedb'),
  db = new Datastore({
    filename: 'datastore.db',
    autoload: true
  });

app.engine('html', require('ejs')
  .renderFile);
app.set('views', __dirname + '/views');
app.configure(function() {
  app.use(express.static(__dirname));
  app.use(express.json());
  app.use(express.urlencoded());
});

app.get('/', function(req, res) {
  res.render('index.html');
});

// Authentication API
app.post('/api/auth', function(req, res) {
  var pass = req.body.password;

  // Read the password file
  fs.readFile('passwd', function(err, data) {
    if (err) throw err;

    // Split the passwd file into key:value pairs
    var pairs = [];
    data = data.toString();
    data.split('\n')
      .forEach(function(item) {
        var key = item.split('=')[0],
          value = item.split('=')[1];
        pairs[key] = value;
      });

    // If pass is empty, the user can log straight in
    if (pairs.admin === pass) {
      res.status(200)
        .type('json')
        .send({
          login: true,
          isAdmin: true
        });
    } else if (pairs.readonly === pass) {
      res.status(200)
        .type('json')
        .send({
          login: true,
          isAdmin: false
        });
    } else {
      res.status(200).type('json').send({
        login: false
      });
    }
  });
});

// GET
app.get('/api/events', function(req, res) {
  db.find({}, function(err, docs) {
    res.send(docs);
  });
});

// POST
app.post('/api/events', function(req, res) {
  var event = req.body;
  db.insert(event, function(err, newDoc) {
    res.status(200)
      .send(newDoc);
  });
});

// PUT
app.put('/api/events', function(req, res) {
  var event = req.body;
  db.update({
    _id: event._id
  }, event, {}, function(err, updatedDoc) {
    res.status(200)
      .send(updatedDoc);
  });
});

// DELETE
app.delete('/api/events', function(req, res) {
  var event = req.body;
  db.remove({
    _id: event._id
  }, {}, function(err) {
    res.status(200)
      .send();
  });
});


app.use(function(req, res) {
  res.status(404);

  res.type('txt')
    .send('Not found');
});

app.listen(3000);
console.log('Server running on 3000');