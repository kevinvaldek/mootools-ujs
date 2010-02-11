
Riot.run(function() {
  context('rails.csrf', function() {
    given('a meta tag named csrf-param', function() {
      should('set rails.csrf.param to the meta tag content', rails.csrf.param).equals('authenticity_token');
    });

    given('a meta tag named csrf-token', function() {
      should('set rails.csrf.token to the meta tag content', rails.csrf.token).equals('k2RViIJTPfc%2B0xyb8ELoPGg%2BSAjGkfzm4SW9DQGFlxU%3D');
    });
  });

  context('rails.confirmed', function() {
    given('an element with no data-confirm property', function() {
      var el = new Element('input', { type: 'submit' });

      should('return true', rails.confirmed(el)).isTrue();
    });

    given('an element with data-confirm set, and the user confirms', function() {
      var el = new Element('input', {
        type: 'submit',
        'data-confirm': 'Sure?'
      });
      window.confirm = $lambda(true);

      should('return true', rails.confirmed(el)).isTrue();
    });
    given('an element with data-confirm set, but the user does not confirm', function() {
      var el = new Element('input', {
        type: 'submit',
        'data-confirm': 'Sure?'
      });
      window.confirm = $lambda(false);

      should('return false', rails.confirmed(el)).isFalse();
    });
  });

  context('rails.disable', function() {
    given('an element with data-disable-with set', function() {
      var el = new Element('input', {
        type: 'button',
        'data-disable-with': 'So loading..',
        value: 'Hit me!'
      });
      rails.disable(el);

      should('set element value to data-disable-with value', el.get('value')).equals('So loading..');

      el.fireEvent('ajax:complete');
      should('reset element value after ajax:complete has been fired upon the element', el.get('value')).equals('Hit me!');
    });
  });

  context('rails.handleRemote', function() {
    // FIXME: can we avoid this exception?
    given('a form element with a forbidden action', function() {
      var form = new Element('form', {
        action: '/lost',
        'data-method': 'put'
      });
      var res = false;
      var e = {
        preventDefault: function() {
          res = true;
        }
      };

      rails.handleRemote.call(form, e);
      should('prevent the default behavior of the event', res).isTrue();
      should('set Accept header to */* to avoid chrome error on text/javascript response',
             form.request.headers['Accept']).equals('*/*');
      should('set data to the form element (that gets serialized on send)',
             form.request.options.data).equals(form);
      should('set action to "/lost"', form.request.options.url).equals('/lost');
      should('set method to "put"', form.request.options.method).equals('put');
    });
  });

});
