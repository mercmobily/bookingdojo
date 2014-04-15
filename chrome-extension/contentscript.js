// contentscript.js
chrome.runtime.onMessage.addListener(function(message) {
    // Assuming that all messages from the background are meant for the page:
    document.dispatchEvent(new CustomEvent('my-extension-event', {
        detail: message
    }));
});
