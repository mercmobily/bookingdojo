/**
 * Module dependencies.
 */
var express = require('express'),
    http = require('http'),

    // Mongodb for sessions
    MongoStore = require('connect-mongo')(express),
    mongodb = require('mongodb'),

    fs = require('fs'),
    path = require('path'),
    mw = require('mongowrapper');

var hotplate = require('hotplate');

var app = express();

hotplate.setApp(app); // Associate "app" to hotplate

if( app.get('env') === 'development' ){
  var dbString = 'mongodb://localhost/hotplate';
} else {
  var dbString = 'mongodb://nodejitsu_mercmobily:p7dgtpntv0p1vcsssvol01sr1g@ds051977.mongolab.com:51977/nodejitsu_mercmobily_nodejitsudb8390375706';
}



 // mw.connect('mongodb://localhost/hotplate', {}, function( err, db ){
 mw.connect(dbString, {}, function( err, db ){

  
  // The connection is 100% necessary
  if( err ){
    console.log("Could not connect to the mongodb database. Aborting...");
    console.log( err );
    process.exit( 1 );
  }

  hotplate.set( 'logToScreen' , true );
  hotplate.set( 'staticUrlPath', '/dojo' );     // Set the static URL path for all modules
  hotplate.set( 'afterLoginPage', '/ws/' );     // Page to go after logging in. Remember / at the end!
  hotplate.set( 'db', mw.db );                  // The DB variable

  // hotplate.set( 'dbCheckObjectId', mw.checkObjectId );
  // hotplate.set( 'dbObjectId', mw.ObjectId );


  // Register modules
  hotplate.registerAllEnabledModules('node_modules', /^hotCore/ ); // Register all core modules from hotplate's node_modules's dir
  hotplate.registerAllEnabledModules('node_modules', /^hotDojo/ );
  hotplate.registerAllEnabledModules('node_modules', /^hotMongo/ );

  // The following two forms are equivalent
  // hotplate.registerAllEnabledModules('node_modules', 'bd', __dirname ); // Register 'bd' from this module's node_modules dir
  hotplate.registerModule( 'bd', require('bd') );

  hotplate.initModules( function() {

    app.configure(function(){

      app.set('port', process.env.PORT || 3000);
      app.set('views', __dirname + '/views');
      app.set('view engine', 'jade');

      // Various middleware
      app.use(express.favicon());
      app.use(express.logger('dev'));
      app.use(express.bodyParser());
      app.use(express.methodOverride());

      // Sessions
      app.use(express.cookieParser('woodchucks are nasty animals'));

      // Static routes -- they MUST go before the session!
      app.use(express.static(path.join(__dirname, 'public')));
      app.use( hotplate.getModule('hotCoreClientFiles').serve() );

      app.use(express.session({
        // secret: settings.cookie_secret,
        secret: 'woodchucks are nasty animals',
        store: new MongoStore({
          // db: settings.db
          // db: hotplate.get('db').client
           db: db
        })
      }));

      app.use(app.router);


      app.use( hotplate.getModule('hotCoreError').hotCoreErrorHandler );

      // If using hotCoreError, this should never ever happen. But still...
      app.use( function( err, req, res, next){ res.send("Oh dear, this should never happen!"); next(err); } );
    });


    app.configure('development', function(){
      // app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    });

    app.configure('production', function(){
      // app.use(express.errorHandler());
    });


    hotplate.runModules( function() { 

      // Create the actual server
      var server = http.createServer(app);

      server.listen(app.get('port'), function(){
        console.log("Express server listening on port " + app.get('port'));
      });
    }); // runModules

  }); // initModules

});
