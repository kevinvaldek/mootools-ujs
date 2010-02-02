/**
 * Rails unobtrusive JS proof of concept.
 *
 * TODO: Update driver with the latest API
 *    - Encapsulate ajax:before to stop the request on falsy return values
 *
 * TODO: Tests
 */

window.addEvent('domready', function() {

  var handleRemote = function(e) {
    e.preventDefault();
    this.railsRequest = new Request.Rails(this).send();
  };

  $$('form[data-remote="true"]').addEvent('submit', handleRemote);
  $$('a[data-remote="true"], input[data-remote="true"], input[data-remote-submit="true"]').addEvent('click', handleRemote);
});

(function($) {
  Request.Rails = new Class({

    Extends: Request,

    initialize: function(element, options) {
      this.el = element;
      this.parent($merge({
        method: this.el.get('method') || this.el.get('data-method') || 'get',
        url: this.el.get('action') || this.el.get('href')
      }, options));
      this.headers.Accept = '*/*';

      this.addRailsEvents();
    },

    send: function(options) {
      if(!this.checkConfirm()) {
        return;
      }
      this.el.fireEvent('ajax:before');
      if(this.el.get('tag') == 'form') {
        this.options.data = this.el;
      }
      this.parent(options);
      this.el.fireEvent('ajax:after', this.xhr);
    },

    addRailsEvents: function() {
      this.addEvent('request', function() {
        this.el.fireEvent('ajax:loading', this.xhr);
      });

      this.addEvent('success', function() {
        this.el.fireEvent('ajax:success', this.xhr);
      });

      this.addEvent('complete', function() {
        this.el.fireEvent('ajax:complete', this.xhr);
        this.el.fireEvent('ajax:loaded', this.xhr);
      });

      this.addEvent('failure', function() {
        this.el.fireEvent('ajax:failure', this.xhr);
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

        this.el.addEvent('ajax:before', function() {
          button.set({
            value: disableWith,
            disabled: true
          });
        }).addEvent('ajax:complete', function() {
          button.set({
            value: enableWith,
            disabled: false
          });
        });
      }
    }
  });

})(document.id);

/**
 * MooTools selector engine does not match data-* attributes.
 * This will be fixed in 1.3, when the engine is swapped for Slick.
 */
Selectors.RegExps.combined = (/\.([\w-]+)|\[([\w-]+)(?:([!*^$~|]?=)(["']?)([^\4]*?)\4)?\]|:([\w-]+)(?:\(["']?(.*?)?["']?\)|$)/g);
