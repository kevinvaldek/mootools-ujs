Rails 3 driver
==============

A MooTools driver for the Ruby on Rails 3 unobtrusive JavaScript API.
Instead on injecting inline JavaScript, Rails 3 adds HTML5 data-* attributes to elements. These hooks are used by JS drivers to create remote forms, links, buttons and PUT/DELETE HTTP requests.
This driver picks up all hooks on domready and attaches appropriate event listeners.

![Screenshot](http://cannedapps.com/posterous/kevinvaldek/mootools-rails-driver.png)

How to use
----------

Given that you already have included MooTools -core in your app, just put rails.js in your public/javascripts folder and include it in your page head.

	#HTML
        <head> 
          <title>MooTooled Rails App</title> 
          <script type="text/javascript" src="/javascripts/mootools-core-1.4.js"></script> 
          <script type="text/javascript" src="/javascripts/rails.js"></script> 
        </head> 

Example
-------

Sample output from a Rails 3 helper method for a remote form:

	#HTML
        <form action="/posts" id="create-post" method="post" data-remote="true">
          <!-- lots of inputs -->
        </form>
        
In this case, *data-remote="true"* is matched by the driver, adding a *submit* event that prevents the default behavior, and sends the form as a XMLHttpRequest instead.

Antoher case is a link element that is not remote, but needs to use DELETE as HTTP method (not supported by most browsers).

	#HTML
        <a href="/posts/33" data-method="delete">Delete this post</a>
        
This link is hooked with a *click* event that returns false. Instead, a hidden form - including an input named *_method* with value *delete* - is created and submitted with POST.

All hooks are described in the documentation of Rails 3.

Adding events to dynamically injected elements
----------------------------------------------

Hooks/events are added by default on domready. If you inject any elements afterwards, you can apply events to a container element by using rails.applyEvents($('elementId')).

Example when events are applied to an element that has been updated by XHR:

	#JS
        new Request.HTML({
          update: updateElement,
          onSuccess: function() {
            rails.applyEvents(updateElement);
          }
        });
