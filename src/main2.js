// main.js
//------------------------------
//
// 2014-12-06, Jonas Colmsjö
//
//------------------------------
//
// Template for tests
//
//
// Using Google JavaScript Style Guide:
// http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
//
//------------------------------
//
// Install with: `npm install`
// Run with: `npm start`


var http = require("http");
var url = require('url');
var test = require('tape');

var CONFIG = require('./config.js');
var odata = require('./odataserver.js');
var h = require('./helpers.js');

var log = new h.log0(CONFIG.mainLoggerOptions);

// NOTE - Should also add leveldb
var rdbms = require(CONFIG.ODATA.RDBMS_BACKEND);

var server;

//
// Start the OData server
// ---------------------

exports.start = function() {


  // handle request with odata server
  var odataServer = new odata.ODataServer();


  // start http server
  // -----------------

  server = http.createServer(function(request, response) {

    var parsedURL = url.parse(request.url, true, false);
    var a = parsedURL.pathname.split("/");

    log.log("Processing request: " +
              JSON.stringify(request.method) + " - " +
              JSON.stringify(request.url) + " - " +
              JSON.stringify(request.headers) + ' - ' + a);

    // Handle system operations
    if(a[1] === CONFIG.ODATA.SYS_PATH) {

      mysqlOps = ['create_account', 'reset_password', 'delete_account',
                 'create_table', 'create_privs', 'drop_table', 'create_bucket',
                  'drop_bucket' ]

      // check if the request should be handled by the rdbms backend
      if(mysqlOps.indexOf(a[2]) !== -1 ) {
        log.debug(a[2]);
        response.write(a[2]);

        odataServer.main(request, response, rdbms);
      }
      else {
        log.debug('unknow operation: '+a[2]);
        response.write('unknow operation: '+a[2]);
      }

      response.end();

    }

  });

  server.listen(CONFIG.ODATA.PORT);

  log.log("Server is listening on port " + CONFIG.ODATA.PORT);

};


//
// Stop the OData server
// ---------------------

exports.stop = function() {
  server.close();
};