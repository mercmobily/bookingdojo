/**
 * Module dependencies.
 */

var hotplate = require('hotplate');

// Set ConnectDB. In a development environment, it's just a simple
// function that returns TingoDB. In a real environment, it will connect
// to process.env.MONGO_URL

exports.dbConnect = function( env, cb ){

  switch( env ){
    case 'production':

      console.log("Using MongoDB...");

      require('mongodb').MongoClient.connect( process.env.MONGO_URL, {} , function( err, db ){

        if( err ){
          hotplate.critical( "Could NOT connect to the database! Error: ", err );
          process.exit( 1 );
        }

        var DbLayerMixin = require('simpledblayer-mongo')
        var SchemaMixin = require('simpleschema-mongo');
        cb( null, db, DbLayerMixin, SchemaMixin );
      });
    break;

    default:

      hotplate.log("Using TingoDB...");

      var tingoDir = '/tmp/bookingdojo';;

      // Create the directory
      try { require('fs').mkdirSync( tingoDir ); } catch( e ){ }
    
      var Db = require('tingodb')().Db

      var db = new Db(tingoDir, {});
      var DbLayerMixin = require('simpledblayer-tingo')
      var SchemaMixin = require('simpleschema-tingo');

      cb( null, db, DbLayerMixin, SchemaMixin );
    break;

  }
}


exports.configure = function( app, db, DbLayerMixin, SchemaMixin ){

  // In development environment, get Dojo straight from the file system
  // (the default is the CDN)
  if( app.get('env') === 'development' || Number( process.env.LOCAL_DOJO ) ){
    hotplate.config.set('hotClientDojo.dojoUrl', '/dojo/dojo/dojo.js' );
    hotplate.config.set('hotClientDojo.cssUrl',  '/dojo/dijit/themes/claro/claro.css' );
    hotplate.config.set('hotClientDojo.dojoConfig.isDebug',  true );
  }

  hotplate.config.set( 'hotCoreStoreIndexer.zapIndexes', true )

  // DB-specific stuff
  hotplate.config.set( 'hotplate.db', db );
  hotplate.config.set( 'hotplate.DbLayerMixin', DbLayerMixin );
  hotplate.config.set( 'hotplate.SchemaMixin', SchemaMixin );

  // Facebook strategy turned on
  hotplate.config.set('hotCoreAuth.strategies', {
    facebook: {
      clientID: '453817548028633',
      clientSecret: '8219677eabdb22ea256d08f515978ee3',
    },
    local: {
    },
  
  });

}


