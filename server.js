var express = require('express');
var app = express();
var moment = require('moment');
var util = require('./helper');

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

var permission_type = util.getConfig().permissions;

/**
  Setup our routes.

  These will be different depening on the permission type set:
    - 'login': 2 routes. One for viewing ('index.html'), one for editing ('edit.html')
    - 'private' and 'public': 1 route ('edit.html'). Readonly and admin users are setup by the ember app inside edit.html
*/
if (permission_type === 'login') {
  // Index
  app.get('/', function(req, res) {
    db.find({}, function(err, docs) {
      if (err) throw err;
      res.render('index.html', {
        project_name: util.getConfig().project_name,
        nodes: docs
      });

    });
  });

  // Editing
  app.get('/edit', function(req, res) {
    res.render('edit.html', {
      project_name: util.getConfig().project_name,
      test: permission_type
    });
  });
} else {

  app.get('/', function(req, res) {
    db.find({}, function(err, docs) {
      if (err) throw err;
      res.render('edit.html', {
        project_name: util.getConfig()
          .project_name,
        test: permission_type
      });

    });
  });

}


// Authentication API
app.post('/api/auth', function(req, res) {
  var pass = req.body.password;

  // Split the passwd file into key:value pairs
  var pairs = util.getConfig();

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
      res.status(500)
        .send();
      throw err;
    }
    res.status(200)
      .send();
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