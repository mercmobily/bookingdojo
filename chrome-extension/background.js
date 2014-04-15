// background.js

chrome.webRequest.onHeadersReceived.addListener(

  function(details) {
    if (details.tabId == -1) return; // Not related to any tab

    if( details.method == 'POST' ){
      chrome.tabs.get( details.tabId, function( tabInfo){
        if( tabInfo.title == 'Booking Dojo Application' ){
          //console.log("Sending message:", tabInfo, details);
          chrome.tabs.sendMessage( details.tabId, { responseHeaders: details.responseHeaders, url: details.url });
        }
      });
    }

  },
  {
    urls: ['*://*/*'], // e.g. all http(s) URLs. See match patterns docs
      // types: ['image'] // for example, defaults to **all** request types
  },
    ['responseHeaders']
);

// ALLOW FRAMING OF ANYTHING
chrome.webRequest.onHeadersReceived.addListener(
  function (details) {
    for (var i = 0; i < details.responseHeaders.length; ++i) {
      if (details.responseHeaders[i].name.toLowerCase() == 'x-frame-options') {
        details.responseHeaders.splice(i, 1);
        return {
          responseHeaders: details.responseHeaders
        };
      }
    }
  }, {
    urls: ["<all_urls>"]
  }, ["blocking", "responseHeaders"]);



