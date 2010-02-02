/**
 * Rails unobtrusive JS proof of concept.
 *
 * TODO: Update driver with the latest API (like removing legacy support)
 * TODO: Tests
 */

window.addEvent('domready', function() {

  var handleRemote = function(e) {
    e.preventDefault();
    this.railsRequest = new Request.Rails(this).send();
  };

  var hooks = {
    'form[data-remote="true"]:submit': handleRemote,
    'a[data-remote="true"], input[data-remote="true"], input[data-remote-submit="true"]:click': handleRemote,
    'a[data-popup], input[type="button"][data-popup]:click': function(e) {
      e.preventDefault();
      var url = this.get('data-url') || this.get('href'),
          options = this.get('data-popup');

      if(options === 'true') {
        window.open(url);
      } else {
        window.open(url, options);
      }
    },
    'script[data-periodical="true"]:domready': function() {
      var frequency = this.get('data-frequency') ? this.get('data-frequency').toFloat() : 10;

      var request = new Request.Rails(this);
      request.send.periodical(frequency * 1000, request);
    },
    'script[data-observe="true"]:domready': function() {
      var observed = document.id(this.get('data-observed')),
          frequency = this.get('data-frequency') ? this.get('data-frequency').toFloat() : 10,
          observesForm = observed.get('tag') == 'form',
          value = observesForm ? observed.toQueryString() : observed.get('value'),
          request = new Request.Rails(observed, {
            observer: this,
            update: document.id(this.get('data-update-success'))
          });

      var observe = function() {
        var newValue = observesForm ? observed.toQueryString() : observed.get('value');

        if(newValue !== value) {
          value = newValue;
          this.fireEvent('rails:observe');
          request.send();
        }
      };

      observe.periodical(frequency * 1000, this);
    }
  };

  for(var key in hooks) {
    if(hooks.hasOwnProperty(key)) {
      var split = key.split(':');
      $$(split[0]).addEvent(split[1], hooks[key]);
    }
  }
});

(function($) {
  Request.Rails = new Class({

    Extends: Request,

    options: {
      update: null,
      position: null,
      observer: null
    },

    initialize: function(element, options) {
      this.el = element;
      if(!this.conditionMet()) {
        return;
      }

      this.parent($merge({
        method: this.el.get('method') || this.el.get('data-method') || 'get',
        url: this.el.get('action') || this.el.get('data-url') || '#',
        async: this.el.get('data-remote-type') !== 'synchronous',
        update: $(this.el.get('data-update-success')),
        position: this.el.get('data-update-position')
      }, options));
      this.headers.Accept = '*/*';

      this.addRailsEvents();
    },

    send: function(options) {
      if(!this.checkConfirm()) {
        return;
      }
      this.setData();
      this.el.fireEvent('rails:before');
      this.parent(options);
    },

    addRailsEvents: function() {
      this.addEvent('request', function() {
        this.el.fireEvent('rails:after', this.xhr);
        this.el.fireEvent('rails:loading', this.xhr);
      });

      this.addEvent('success', function(responseText) {
        this.el.fireEvent('rails:success', this.xhr);

        if(this.options.update) {
          if(this.options.position) {
            new Element('div', {
              html: responseText
            }).inject(this.options.update, this.options.position);
          } else {
            this.options.update.set('html', responseText);
          }
        }
      });

      this.addEvent('complete', function() {
        this.el.fireEvent('rails:complete', this.xhr);
        this.el.fireEvent('rails:loaded', this.xhr);
      });

      this.addEvent('failure', function() {
        this.el.fireEvent('rails:failure', this.xhr);
      });

      this.setDisableWith();
    },

    checkConfirm: function() {
      var confirmMessage = this.el.get('data-confirm');
      if(confirmMessage && !confirm(confirmMessage)) {
        return false;
      }
      return true;
    },

    setDisableWith: function() {
      var button = this.el.get('data-disable-with') ? this.el : this.el.getElement('[data-disable-with]');
      if(!button) {
        return;
      }

      var disableWith = button.get('data-disable-with');
      if(disableWith) {
        var enableWith = button.get('value');

        this.el.addEvent('rails:before', function() {
          button.set({
            value: disableWith,
            disabled: true
          });
        }).addEvent('rails:complete', function() {
          button.set({
            value: enableWith,
            disabled: false
          });
        });
      }
    },

    setData: function() {
      if(this.el.get('data-submit')) {
        this.options.data = $(this.el.get('data-submit'));
      }
      else if(this.options.observer && this.options.observer.get('data-with')) {
        var observerWith = this.options.observer.get('data-with'),
            value = this.el.get('tag') == 'form' ? this.el.toQueryString() : this.el.get('value');

        this.options.data = observerWith + '=' + value;
      }
      else if(this.el.get('tag') == 'form') {
        this.options.data = this.el;
      }
      else if(this.el.get('tag') == 'input') {
        this.options.data = this.el.getParent('form');
      }
    },

    conditionMet: function() {
      var condition = this.el.get('data-condition');
      if(condition) {
        return eval(condition);
      }
      return true;
    }

  });

})(document.id);

/**
 * MooTools selector engine does not match data-* attributes.
 * This will be fixed in 1.3, when the engine is swapped for Slick.
 */
Selectors.RegExps.combined = (/\.([\w-]+)|\[([\w-]+)(?:([!*^$~|]?=)(["']?)([^\4]*?)\4)?\]|:([\w-]+)(?:\(["']?(.*?)?["']?\)|$)/g);
