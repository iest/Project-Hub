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

      if (ENV.permissions === 'private' || ENV.permissions === 'login') {

        if (docCookies.getItem('phub_admin')) {
          var isAdmin = docCookies.getItem('phub_admin');
          this.send('login', isAdmin);
          return;
        }

        $.post('/api/auth', {
          password: pass
        })
          .then(function(res) {
            if (res.login) {
              _this.send('login', res.isAdmin);
              docCookies.setItem('phub_admin', res.isAdmin, Infinity);

            } else {
              _this.controllerFor('login')
                .set('message', 'Incorrect login or password');
            }
          })
          .fail(function() {
            controller.set('error', 'Failed to check login');
          });
      } else if (ENV.permissions === 'public') {
        controller.set('isLoggedIn', true);
        controller.set('isAdmin', true);
        _this.transitionTo('timeline');
      } else {
        controller.send('handleFail', 'Permissons arent set properly in the config file');
      }
    },
    login: function(isAdmin) {
      var controller = this.controllerFor('application');

      controller.set('isLoggedIn', true);
      controller.set('isAdmin', isAdmin || false);
      this.transitionTo('timeline');
    },
    handleFail: function(fail) {
      this.controllerFor('application')
        .set('error', fail);
    }
  }
});

App.ApplicationController = Ember.Controller.extend({
  isLoggedIn: function() {
    return !!docCookies.getItem('phub_admin');
  }.property(),
  isAdmin: function() {
    var isAdmin = docCookies.getItem('phub_admin');
    return isAdmin === 'true' ? true: false;
  }.property(),
  error: '',
  actions: {
    reload: function() {
      document.location.reload(true);
    },
    logout: function() {
      docCookies.removeItem('phub_admin');
      document.location = '/';
    }
  }
});

App.LoginController = Ember.Controller.extend({
  password: '',
  persistLogin: true,
  actions: {
    attemptLogin: function(password) {
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
        _this.send('handleFail', 'Failed to fetch events. Is the server running?');
      });
  },
  setupController: function(controller, model) {
    controller.set('nodes', model);
    this._super();
  }
});

App.TimelineController = Ember.Controller.extend({
  needs: ['application'],
  isAdmin: function() {
    return this.get('controllers.application.isAdmin');
  }.property('controllers.application.isAdmin'),

  nodes: [],

  isNewNode: false,

  actions: {
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
            _this.send('handleFail', 'Failed to save the event. Please try again.');
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
            _this.send('handleFail', 'Failed to delete node. Please try again');
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
      newEpoch = moment(formatted, 'MMM D YYYY')
        .valueOf();
    this.set('epoch', newEpoch);
  }.observes('formatted'),

  willInsertElement: function() {
    var epoch = this.get('epoch') || new Date()
      .getTime(),
      formatted = moment(parseFloat(epoch))
        .format('MMM Do YYYY');

    this.set('formatted', formatted);
  },

  didInsertElement: function() {
    var _this = this;
    var picker = new Pikaday({
      field: _this.$('input')[0],
      format: 'MMM Do YYYY'
    });
  },

  actions: {
    setToday: function() {
      this.set('formatted', moment()
        .format('MMM Do YYYY'));
    }
  }
});

Ember.Handlebars.registerBoundHelper('date', function(value) {
  return new moment(parseFloat(value))
    .format('MMM Do YYYY');
});


/*\
|*|
|*|  :: cookies.js ::
|*|
|*|  A complete cookies reader/writer framework with full unicode support.
|*|
|*|  https://developer.mozilla.org/en-US/docs/DOM/document.cookie
|*|
|*|  This framework is released under the GNU Public License, version 3 or later.
|*|  http://www.gnu.org/licenses/gpl-3.0-standalone.html
|*|
|*|  Syntaxes:
|*|
|*|  * docCookies.setItem(name, value[, end[, path[, domain[, secure]]]])
|*|  * docCookies.getItem(name)
|*|  * docCookies.removeItem(name[, path], domain)
|*|  * docCookies.hasItem(name)
|*|  * docCookies.keys()
|*|
\*/

var docCookies = {
  getItem: function(sKey) {
    return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey)
      .replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
  },
  setItem: function(sKey, sValue, vEnd, sPath, sDomain, bSecure) {
    if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) {
      return false;
    }
    var sExpires = "";
    if (vEnd) {
      switch (vEnd.constructor) {
        case Number:
          sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
          break;
        case String:
          sExpires = "; expires=" + vEnd;
          break;
        case Date:
          sExpires = "; expires=" + vEnd.toUTCString();
          break;
      }
    }
    document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
    return true;
  },
  removeItem: function(sKey, sPath, sDomain) {
    if (!sKey || !this.hasItem(sKey)) {
      return false;
    }
    document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
    return true;
  },
  hasItem: function(sKey) {
    return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey)
      .replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\="))
      .test(document.cookie);
  }
};