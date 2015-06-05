function(){
var wdskim = "https://tools.wmflabs.org/hay/wdskim/index.php";
var query = "?prop=P195&item=Q3044768&language=en&withimages=on&format=json";

function createCORSRequest(method, url) {
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {
    // Check if the XMLHttpRequest object has a "withCredentials" property.
    // "withCredentials" only exists on XMLHTTPRequest2 objects.
    xhr.open(method, url, true);
  } else if (typeof XDomainRequest != "undefined") {
    // Otherwise, check if XDomainRequest.
    // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
    xhr = new XDomainRequest();
    xhr.open(method, url);
  } else {
    // Otherwise, CORS is not supported by the browser.
    xhr = null;
  }
  return xhr;
  }
  if (!query_xhr) {
    throw new Error('CORS not supported');
}

function getArt() {
  var query_xhr = createCORSRequest('GET', wdskim+query);
  query_xhr.onload = function(){
    var response = query_xhr.responseText;
    var data = $.parseJSON(response).response;
    $.each(data, function(index, value) {
      // Do something with the data 
      
      alert(value); 
      entity_xhr.onerror = function() {
        throw new Error('Error making the request');
      };
      entity_xhr.send();
    });
  };
  query_xhr.onerror = function() {
    throw new Error('Error making the request');
  };
  query_xhr.send();
};
}();
