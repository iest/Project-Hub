App = Ember.Application.create();

App.Node = Ember.Object.extend({
  isEditing: false,
  date: '',
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

  isAdmin: false,

  isLoggedIn: false,

  activate: function() {
    if (this.get('isLoggedIn')) {
      this.transitionTo('timeline');
    } else {
      this.transitionTo('login');
    }
  },

  actions: {
    checkLogin: function(pass) {
      var _this = this;

      $.post('/api/auth', {
        password: pass
      })
        .then(function(res) {

          if (res.login) {
            _this.set('isLoggedIn', true);
            _this.transitionTo('timeline');
          } else {
            console.log('Failed');
          }
        });
    }
  }

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
  setupController: function(controller) {
    controller.set('isAdmin', this.get('isAdmin'));
  }
});

App.TimelineController = Ember.Controller.extend({
  isAdmin: null,

  nodes: [App.Node.create({
    date: moment()
      .format('MMM Do YYYY'),
    content: 'Project kickoff meeting',
    linkUrl: '#',
    linkText: 'View the notes'
  })],

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
      node.set('isEditing', false);
      this.set('isNewNode', false);
    },

    deleteNode: function(node) {
      if (confirm('Are you sure you want to delete this node?')) {
        this.set('isNewNode', false);
        this.get('nodes')
          .removeObject(node);
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

App.InstantFocusView = Ember.View.extend({
  didInsertElement: function() {
    this.$('textarea')
      .focus();
  }
});