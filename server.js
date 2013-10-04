/**
 * Module dependencies.
 */

Error.stackTraceLimit = Infinity;

var dummy
    , express = require('express')
    , http = require('http')

    // Mongodb for sessions
    , MongoStore = require('connect-mongo')(express)
    , mongodb = require('mongodb')

    , fs = require('fs')
    , path = require('path')
    , mw = require('mongowrapper')
    , passport = require('passport')
    , FacebookStrategy = require('passport-facebook').Strategy

    ;

var hotplate = require('hotplate');

var app = express();


hotplate.setApp(app); // Associate "app" to hotplate

if( app.get('env') === 'development' ){

  var dbString = 'mongodb://localhost/hotplate';
  hotplate.set('hotDojoConfig', { 
    dojoUrl: '/dojo/dojo/dojo.js',
    cssUrl: '/dojo/dijit/themes/claro/claro.css'
  });

} else {
  var dbString = 'mongodb://nodejitsu_mercmobily:p7dgtpntv0p1vcsssvol01sr1g@ds051977.mongolab.com:51977/nodejitsu_mercmobily_nodejitsudb8390375706';
}


hotplate.set( 'errorPage', function( req, res, next ){
  console.log("PASSED ERROR:");
	console.log( req.hotError );
  console.log("NAME:");
  console.log( req.hotError.name );

  res.send("ERROR!!!");

});

hotplate.set( 'staticUrlPath', '/hotplate' );     // Set the static URL path for all modules
hotplate.set( 'dgrid-theme', 'claro' );   


// Multihome enabled
hotplate.set('hotCoreMultiHome', {
   enabled: true,
   multiHomeURL: '/wssssssssssssssssssss/:workspaceId', // MUST contain :workspaceId
   escapePick: true,
});


// *****************************
// Authentication configuration
// *****************************

hotplate.set('hotCoreAuth', {
   callbackURLBase: 'http://localhost:3000',
   //recoverURLexpiry: 60*5, // Seconds for which the recover URL works for
   recoverURLexpiry: 60*10, // Seconds for which the recover URL works for
});


hotplate.set('hotCoreAuth/strategies', {
  facebook: { 
    clientID: '453817548028633',
    clientSecret: '8219677eabdb22ea256d08f515978ee3',
  },

  local: { 
    // Nothing to set yet
  },
});


// The response page for hotCoreAuth. hotDojoAuth needs it in resume (the Facebook window won't
// close on resume, it will show something instead
hotplate.set('hotCoreAuth/responsePage', function( strategyId, action, user, profile ){
  var response = '';
  response += "<html><body><script type=\"text/javascript\">setTimeout(function(){ window.close() }, 5000);</script> RESPONSE</body></html>";
  return response;
});


hotplate.set('hotCoreAuth/redirectURLs/success', {
  signin: '/pages/pick',
  recover: '/pages/pick',
  register: '/pages/pick',
  manager: '/',
});

hotplate.set('hotCoreAuth/redirectURLs/fail', {
  signin: '/pages/welcome',
  recover: '/pages/welcome',
  register: '/pages/welcome',
  manager: '/',
});


/*
[16:51] <+julianduque> mercmobily: `jitsu env set MONGO_URL mongodb://......`
[16:52] <+julianduque> mercmobily: var dbString = process.env.MONGO_URL;
*/

 // mw.connect('mongodb://localhost/hotplate', {}, function( err, db ){
 mw.connect(dbString, {}, function( err, db ){

  
  // The connection is 100% necessary
  if( err ){
    console.log("Could not connect to the mongodb database. Aborting...");
    console.log( err );
    process.exit( 1 );
  }

  hotplate.set( 'logToScreen' , true );
  hotplate.set( 'db', mw.db );                  // The DB variable


  // Register modules
  hotplate.registerAllEnabledModules(/^hotCore/ ); // Register all core modules from hotplate's node_modules's dir
  hotplate.registerAllEnabledModules(/^hotDojo/ );
  hotplate.registerAllEnabledModules(/^hotMongo/ );

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

      // Passport
      app.use(passport.initialize());

      // Sessions
      //app.use(express.cookieParser('woodchucks are nasty animals'));
      app.use(express.cookieParser('woodchucks are nasty animals'));

      // Static routes -- they MUST go before the session!
      app.use(express.static(path.join(__dirname, 'public')));
      app.use( hotplate.getModule('hotCoreClientFiles').serve() );

      app.use(express.cookieSession({
        secret: 'woodchucks are nasty animal',
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
