App = Ember.Application.create();

App.Node = Ember.Object.extend({
  isEditing: false,
  epoch: '',
  content: '',
  linkUrl: '',
  linkText: '',
  isValid: Em.computed.and('epoch', 'content'),
  isInvalid: Em.computed.not('isValid')
});

App.Router.map(function() {
  this.resource('login');
  this.resource('timeline');
});

App.ApplicationRoute = Ember.Route.extend({

  activate: function() {
    var controller = this.controllerFor('application');
    if (controller.get('isLoggedIn')) {
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
            controller.set('isAdmin', res.isAdmin);
            _this.transitionTo('timeline');
          } else {
            _this.controllerFor('login')
              .set('message', 'Incorrect login or password');
          }
        })
        .fail(function() {
          controller.set('error', 'Failed to check login');
        });
    }
  }
});

App.ApplicationController = Ember.Controller.extend({
  isLoggedIn: true,
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

  model: function() {

    var _this = this;

    return $.get('/api/events')
      .then(function(res) {
        var arr = [];
        res.forEach(function(event) {
          var node = App.Node.create(event);

          arr.push(node);
        });
        return arr.sort(function(a, b) {
          if (a.epoch < b.epoch) {
            return 1;
          } else if (a.epoch > b.epoch) {
            return -1;
          }
          return 0;
        });
      })
      .fail(function(fail) {
        _this.send('handleFail', fail);
      });
  },
  setupController: function(controller, model) {
    controller.set('nodes', model);
    this._super();
  },

  actions: {
    handleFail: function(fail) {
      console.log('Failed');
      console.log(fail);
    }
  }
});

App.TimelineController = Ember.Controller.extend({
  needs: ['application'],
  isAdmin: Em.computed.alias('controllers.application.isAdmin'),

  nodes: [],

  isNewNode: false,

  actions: {
    setToday: function(node) {
      node.set('epoch', new Date().getTime());
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
    editNode: function(node) {
      node.set('isEditing', true);
    },
    saveNode: function(node) {

      var _this = this;

      // If we have an id, it was retrieved from the API, so put it.
      if (node.get('_id')) {
        $.ajax({
          url: '/api/events',
          type: 'PUT',
          data: node.getProperties('epoch', 'content', 'linkUrl', 'linkText', '_id')
        })
          .fail(function(fail) {
            _this.send('handleFail', fail);
          });
      } else {

        // Otherwise it's a new event, so post it.
        $.post('/api/events', node.getProperties('epoch', 'content', 'linkUrl', 'linkText'))
          .then(function(res) {
            node.setProperties(res);

            var sorted = [];
            _this.get('nodes')
              .forEach(function(item) {
                sorted.pushObject(item);
              });

            sorted = sorted.sort(function(a, b) {
              if (a.epoch < b.epoch) {
                return 1;
              } else if (a.epoch > b.epoch) {
                return -1;
              }
              return 0;
            });

            _this.set('nodes', null);
            _this.set('nodes', sorted);

          });
      }

      node.set('isEditing', false);
      this.set('isNewNode', false);

    },

    deleteNode: function(node) {

      var _this = this;

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
          })
          .fail(function(fail) {
            _this.send('handleFail', fail);
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

App.XPikadayComponent = Ember.Component.extend({
  formatted: null,
  epoch: null,

  setEpoch: function() {
    var formatted = this.get('formatted'),
      newEpoch = moment(formatted, 'MMM D YYYY').valueOf();
    this.set('epoch', newEpoch);
  }.observes('formatted'),

  willInsertElement: function() {
    var epoch = this.get('epoch'),
      formatted = moment(parseFloat(epoch)).format('MMM Do YYYY');
    this.set('formatted', formatted);
  },

  didInsertElement: function() {
    var _this = this;
    var picker = new Pikaday({
      field: _this.$('input')[0],
      format: 'MMM Do YYYY'
    });
  }
});

Ember.Handlebars.registerBoundHelper('date', function(value) {
  return new moment(parseFloat(value))
    .format('MMM Do YYYY');
});