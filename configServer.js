/**
 * Module dependencies.
 */

var hotplate = require('hotplate');

exports = module.exports = function( app ){

  // In development environment, get Dojo straight from the file system
  // (the default is the CDN)
  if( app.get('env') === 'development' ){

    hotplate.config.set('hotDojoAdd.dojoUrl', '/dojo/dojo/dojo.js' );
    hotplate.config.set('hotDojoAdd.cssUrl',  '/dojo/dijit/themes/claro/claro.css' );
  }

  // Facebook
  hotplate.config.set('hotCoreAuth.strategies.facebook', {
    clientID: '453817548028633',
    clientSecret: '8219677eabdb22ea256d08f515978ee3',
  });

}


