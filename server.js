"use strict";

/**
 * Module dependencies.
 */

Error.stackTraceLimit = Infinity;

var dummy
  , http = require('http')
  , express = require('express')
  , path = require('path')

  , passport = require('passport')

  , hotplate = require('hotplate')
  , configServer = require('./configServer')
;


var app = express();

configServer.dbConnect( app.get('env'), function( err, db, DbLayerMixin, SchemaMixin ){

  // The connection is 100% necessary
  if( err ){
    hotplate.logger.error("Could not connect to the database. Aborting. Error: ", err );
    process.exit( 1 );
  }

  // This is needed before anything else as it's used as prefix in
  // several default config files
  hotplate.config.set( 'hotplate.moduleFilesPrefix', '/app/hotplate/somewhere/else/ahah' );
  hotplate.config.set( 'hotplate.routeUrlsPrefix', '/app' );

  // Require necessary modules
  hotplate.require( 'hotCore' );
  hotplate.require( 'hotDojo' );
  require( 'bd' );

  // Sets hotplate.config (user-defined values)
  // (Do this after loading modules, which might set some defaults for themselves)
  configServer.configure( app, db, DbLayerMixin, SchemaMixin );

  //app.set('port', process.env.PORT || 3000);
  app.set('port',  3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');

  // Various middleware
  app.use(express.favicon());
  if( app.get( 'env' ) === 'development' ) app.use(express.logger('dev'));
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

  app.get('/pureExpressAndJade', pureExpressAndJade );

  hotplate.hotEvents.emit( 'setRoutes', app, function() { 
    app.use( app.router);
    app.use( hotplate.require('hotCoreError').hotCoreErrorHandler );

    app.use( function( err, req, res, next){ res.send("Oh dear, this should never happen!"); next(err); } );

    hotplate.hotEvents.emit( 'run', function() { 
      // Create the actual server
      var server = http.createServer( app );
      server.listen(app.get('port'), function(){
        hotplate.logger.info("Express server listening on port " + app.get('port'));

        if( app.get( 'env' ) !== 'development' ) hotplate.killLogging();

      });

    });
  });     
});


function pureExpressAndJade( req, res, next ){

  var hotCorePage = hotplate.require('hotCorePage');

  hotCorePage.getElementsAsStrings( null, req, 'PureExpress', function( err, elements ){
    if( err ) {
      next( err );
    } else {
      res.render('index', elements );
    }
  });
};

