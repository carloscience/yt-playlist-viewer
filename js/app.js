requirejs.config({
    //By default load any module IDs from js/lib
    baseUrl: 'js',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
      jquery: 'http://ajax.googleapis.com/ajax/libs/jquery/1.9.0/jquery.min',
      client: 'http://apis.google.com/js/client.js?onload=googleApiClientReady',
      plugins: 'plugins',
      auth: 'auth',
      mainv3: 'mainv3'
    },

    shim: {
      'backbone': {
        deps: ['jquery', 'underscore'],
        exports: 'Backbone'
      },
      'mainv3': {
        deps: ['backbone', 'auth'],
        exports: 'mainv3'
      },
      'client': {
        deps: ['mainv3'],
        exports: 'client'
      },
      'foo': {
        deps: ['bar'],
        exports: 'Foo',
        init: function(bar) {
          return this.Foo.noConflict();
        }
      }
    }
});

define(['jquery', 'underscore', 'backbone', 'mainv3', 'client'], function() {

});


/*define(["jquery", "jquery.alpha", "jquery.beta"], function($) {
  $(function() {
    $('body').alpha().beta();
  });
});*/
//requirejs(['MyModel']);
//require(['plugins', 'auth']);

/*function(App) {
  window.bTask = new App();
});)*/


//require(['http://apis.google.com/js/client.js?onload=googleApiClientReady']);
