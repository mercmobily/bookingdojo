"use strict";

/**
 * Module dependencies.
 */

Error.stackTraceLimit = Infinity;

var dummy
    , http = require('http')
    , express = require('express')
    , path = require('path')

    , mw = require('mongowrapper')
    , passport = require('passport')

    , hotplate = require('hotplate')
    , configServer = require('./configServer')
;


/*
 var console_log = console.log;
 console.log = function( m ){
   console_log("I WAS CALLED:");
   console_log( m );
    console_log( new Error().stack );
 }
*/

var app = express();

// Sane DB string that assumes mongoDb
var dbString = process.env.MONGO_URL || 'mongodb://localhost/hotplate';

 mw.connect(dbString, {}, function( err, db ){

  // The connection is 100% necessary
  if( err ){
    console.log("Could not connect to the mongodb database. Aborting...");
    console.log( err );
    process.exit( 1 );
  }

  // This is needed before anything else as it's used as prefix in
  // several default config files
  hotplate.config.set( 'hotplate.staticUrlPath', '/hotplate/somewhere/else/ahah' );

  // Require necessary modules
  hotplate.require( 'hotCore' );
  hotplate.require( 'hotDojo' );
  require( 'bd' );

  // Sets hotplate.config to non-defaults where necessary
  // (Do this after loading modules, which might set some defaults)
  configServer( db, app );

  //app.set('port', process.env.PORT || 3000);
  app.set('port',  3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');

  // Various middleware
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());

  app.use(passport.initialize()); // Passport initialize
  app.use(express.cookieParser('woodchucks are nasty animals'));

  // Static routes -- they MUST go before the session!
  app.use(express.static(path.join(__dirname, 'public')));
  app.use( hotplate.require('hotCoreClientFiles').serve() );

  app.use(express.cookieSession({
    secret: 'woodchucks are nasty animal',
  }));

  hotplate.hotEvents.emit( 'setRoutes', app, function() { 
    app.use( app.router);
    app.use( hotplate.require('hotCoreError').hotCoreErrorHandler );

    app.use( function( err, req, res, next){ res.send("Oh dear, this should never happen!"); next(err); } );

    hotplate.hotEvents.emit( 'run', function() { 
      // Create the actual server
      var server = http.createServer( app );
      server.listen(app.get('port'), function(){
        console.log("Express server listening on port " + app.get('port'));
      });

    });
  });     
});



