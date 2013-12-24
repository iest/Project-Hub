var express = require('express');
var fs = require('fs');
var app = express();
var moment = require('moment');

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

// Config reading function
function getConfig() {

  // Read the config file
  var file = fs.readFileSync('config');

  // Setup an array we'll use shortly
  var pairs = [];

  // Data comes out as a buffer, so stringify it
  file.toString()
  // Split it on newlines
  .split('\n')
  // Loop through each line
  .forEach(function(item) {
    // Split the item on the `=`
    var pair = item.split('=');
    // Make sure the item has `=` in it
    if (!pair[1]) return;
    // Set the nth item in the pairs array to be key:value from 'key=value'
    pairs[item.split('=')[0]] = item.split('=')[1];
  });
  return pairs;
}

// Index
app.get('/', function(req, res) {

  db.find({}, function(err, docs) {
    if (err) throw err;

    res.render('index.html', {
      project_name: getConfig()
        .project_name,
      nodes: docs
    });

  });
});

// Editing
app.get('/edit', function(req, res) {

  // I'm using EJS so can pass variables into the template on render
  res.render('edit.html', {
    project_name: getConfig()
      .project_name
  });
});



// Authentication API
app.post('/api/auth', function(req, res) {
  var pass = req.body.password;

  // Read the password file
  fs.readFile('config', function(err, data) {
    if (err) throw err;

    // Split the passwd file into key:value pairs
    var pairs = getConfig();

    // If pass is empty, the user can log straight in
    if (pairs.admin_password === pass) {
      res.status(200)
        .type('json')
        .send({
          login: true,
          isAdmin: true
        });
    } else if (pairs.readonly_password === pass) {
      res.status(200)
        .type('json')
        .send({
          login: true,
          isAdmin: false
        });
    } else {
      res.status(200)
        .type('json')
        .send({
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
  }, event, {}, function(err, numReplaced) {
    if (err) {
      res.status(500).send();
      throw err;
    }
    res.status(200).send();
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