/**
 * Module dependencies.
 */

Error.stackTraceLimit = Infinity;

var dummy

  // Node and Express' basic modules
  , http = require('http')
  , express = require('express')
  , path = require('path')

  // Modules that used to be in connect in Express 3
  , favicon = require('serve-favicon')
  , logger = require('morgan')
  , cookieParser = require('cookie-parser')
  , cookieSession = require('cookie-session')
  , bodyParser = require('body-parser')

  , passport = require('passport')

  , hotplate = require('hotplate')
  , configServer = require('./configServer')

  , SimpleDbLayer = require('simpledblayer')
  , JsonRestStores = require('jsonreststores')

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
  hotplate.config.set( 'hotplate.moduleFilesPrefix', '/app/hotplate' );
  hotplate.config.set( 'hotplate.routeUrlsPrefix', '/app' );

  // Require necessary modules
  // (You CAN be more selective if you like)
  require( 'hotplate/node_modules/hotCore' );
  require( 'hotplate/node_modules/hotClientDojo' );

  // Require your app's main module(s) here
  require( 'bd' );

  // More hotplate.config.set() commands can go here
  // (After loading modules, which might set some defaults for themselves)
  // It's good practice to aggregate all customisations in
  // one spot, in this case configServer.configure()...
  configServer.configure( app, db, DbLayerMixin, SchemaMixin );

  //app.set('port', process.env.PORT || 3000);
  app.set('port',  3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');

  // Various middleware
  app.use(favicon(__dirname + '/public/favicon.ico'));
  if( app.get( 'env' ) === 'development' ) app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser('woodchucks are nasty animals!!!'));
  app.use(cookieSession({ secret: 'woodchucks are nasty animals!!!' }));

  app.use(passport.initialize()); // Passport initialize

  // Static routes -- they MUST go before the session!
  app.use( require('hotplate/node_modules/hotCoreClientFiles').serve( app, {} ) );
  app.use(express.static(path.join(__dirname, 'public')));

  app.get('/pureExpressAndJade', pureExpressAndJade );


  hotplate.hotEvents.emitCollect( 'stores',function( err ) {

    if( err ){
      console.error( "Error running the stores:", err );
      process.exit();
    }

    // Important!
    JsonRestStores.init();
    SimpleDbLayer.init();

    hotplate.hotEvents.emitCollect( 'setRoutes', app, function( err ) {

      if( err ){
        console.error( "Error setting the routes:", err );
        process.exit();
      }

      app.use( require('hotplate/node_modules/hotCoreError').hotCoreErrorHandler );

      app.use( function( err, req, res, next){
        res.send("Oh dear, this should never happen!");
        next(err);
      });

      hotplate.hotEvents.emitCollect( 'run', function() {

        if( err ){
          console.error( "Error running the hook 'run':", err );
          process.exit();
        }

        // Create the actual server
        var server = http.createServer( app );
        server.listen(app.get('port'), function(){
          console.log("Express server listening on port " + app.get('port'));
        });

      });
    });
  });
});


function pureExpressAndJade( req, res, next ){

  var hotCorePage = require('hotplate/node_modules/hotCorePage');

  hotCorePage.getElementsAsStrings( null, req, 'PureExpress', function( err, elements ){
    if( err ) {
      next( err );
    } else {
      res.render('folder/index', elements );
    }
  });
};
