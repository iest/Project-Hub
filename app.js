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
  // put your routes here
});

App.ApplicationRoute = Ember.Route.extend({

});

App.ApplicationController = Ember.Controller.extend({

  nodes: [],

  isNewNode: false,

  actions: {
    newNode: function() {
      var node = App.Node.create();
      node.setProperties({
        'isEditing': true,
        date: moment()
          .format('MMM Do YYYY'),
        content: 'test',
        linkText: 'test'
      });
      this.get('nodes')
        .insertAt(0, node);
      this.set('isNewNode', true);
    },
    saveNode: function(node) {
      node.set('isEditing', false);
      this.set('isNewNode', false);
    }
  }
});