App = Ember.Application.create();

App.Node = Ember.Object.extend({
  isEditing: false,
  date: '',
  epoch: function() {
    // debugger;
    return moment(this.get('date'), 'MMM-D-YYYY').toDate();
  }.property('date'),
  content: '',
  linkUrl: '',
  linkText: '',
  isValid: Em.computed.and('date', 'content'),
  isInvalid: Em.computed.not('isValid')
});

App.Router.map(function() {
  this.resource('login');
  this.resource('timeline');
});

App.ApplicationRoute = Ember.Route.extend({

  isLoggedIn: true,

  activate: function() {
    if (this.get('isLoggedIn')) {
      this.transitionTo('timeline');
    } else {
      this.transitionTo('login');
    }
  },

  actions: {
    checkLogin: function(pass) {
      var _this = this,
        controller = this.controllerFor('application');

      $.post('/api/auth', {
        password: pass
      })
        .then(function(res) {

          if (res.login) {
            controller.set('isLoggedIn', true);
            controller.set('isAdmin', true);
            _this.transitionTo('timeline');
          } else {
            console.log('Failed');
          }
        });
    }
  }
});

App.ApplicationController = Ember.Controller.extend({
  isAdmin: true
});

App.LoginController = Ember.Controller.extend({
  password: '',

  actions: {
    login: function(password) {
      this.send('checkLogin', password);
    }
  }
});

App.TimelineRoute = Ember.Route.extend({
  /**
    TODO:
      - Order the events as they come in by date
  */

  model: function() {
    return $.get('/api/events')
      .then(function(res) {
        var arr = [];
        res.forEach(function(event) {
          var node = App.Node.create(event);
          node.set('date', moment(node.get('epoch')).format('MMM Do YYYY'));
          arr.push(node);
        });
        return arr.sortBy('epoch');
      });
  },
  setupController: function(controller, model) {

    controller.set('nodes', model);
    this._super();
  }
});

App.TimelineController = Ember.Controller.extend({
  needs: ['application'],
  isAdmin: Em.computed.alias('controllers.application.isAdmin'),

  nodes: [],

  isNewNode: false,

  actions: {
    setToday: function(node) {
      node.set('date', moment()
        .format('MMM Do YYYY'));
    },
    newNode: function() {
      var node = App.Node.create();
      node.setProperties({
        'isEditing': true
      });
      this.get('nodes')
        .insertAt(0, node);
      this.set('isNewNode', true);
    },
    saveNode: function(node) {

      // If we have an id, it was retrieved from the API, so put it.
      if (node.get('_id')) {
        $.ajax({
          url: '/api/events',
          type: 'PUT',
          data: node.getProperties('epoch', 'content', 'linkIrl', 'linkText', '_id')
        })
          .then(function(res) {
            node.setProperties(res);
          });
      } else {

        // Otherwise it's a new event, so post it.
        $.post('/api/events', node.getProperties('epoch', 'content', 'linkIrl', 'linkText'))
          .then(function(res) {
            node.setProperties(res);
          });
      }

      node.set('isEditing', false);
      this.set('isNewNode', false);

    },

    deleteNode: function(node) {
      if (confirm('Are you sure you want to delete this node?')) {
        this.set('isNewNode', false);
        this.get('nodes')
          .removeObject(node);

        $.ajax({
          url: '/api/events',
          type: 'DELETE',
          data: node.getProperties('_id')
        })
          .then(function(res) {
            node.setProperties(res);
          });

      }
    },

    cancelNode: function(node) {

      if (this.get('isNewNode')) {
        this.set('isNewNode', false);
        this.get('nodes')
          .removeObject(node);
      }

      node.set('isEditing', false);
    },
    editNode: function(node) {
      node.set('isEditing', true);
    }
  }
});

App.NodeEditView = Ember.View.extend({
  didInsertElement: function() {

    // Focus on the text area
    this.$('textarea')
      .focus();
  }
});