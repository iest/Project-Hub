App = Ember.Application.create();

App.Router.map(function() {
  // put your routes here
});

App.ApplicationRoute = Ember.Route.extend({
  model: function() {
    return [{
      date: 'August 14th, 2013',
      content: 'Kickoff Meeting',
      link: 'View da notes'
    }];
  }
});
