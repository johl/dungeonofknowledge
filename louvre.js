function getArt( callback ) {
    var wdskim = "https://tools.wmflabs.org/hay/wdskim/index.php";
    var query = "?prop=P195&item=Q3044768&language=en&withimages=on&format=json";

    function createCORSRequest( method, url ) {
        var xhr = new XMLHttpRequest();
        if ( 'withCredentials' in xhr ) {
            // Check if the XMLHttpRequest object has a "withCredentials" property.
            // "withCredentials" only exists on XMLHTTPRequest2 objects.
            xhr.open( method, url, true );
        } else if ( typeof XDomainRequest != "undefined" ) {
            // Otherwise, check if XDomainRequest.
            // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
            xhr = new XDomainRequest();
            xhr.open( method, url );
        } else {
            // Otherwise, CORS is not supported by the browser.
            xhr = null;
        }
        return xhr;
    }

    var query_xhr = createCORSRequest( 'GET', wdskim + query );
    if ( !query_xhr ) {
        throw new Error( 'CORS not supported' );
    }

    query_xhr.onload = function() {
        var response = query_xhr.responseText;
        var items = $.parseJSON( response ).items;
        $.each( items, function( itemId, item ) {
            callback( itemId, item );
        } );
    };
    query_xhr.onerror = function() {
        throw new Error( 'Error making the request' );
    };
    query_xhr.send();
}


function changeImage( fileName ) {
    var fileName = "File:" + fileName;
    $.ajax({
        url: "https://commons.wikimedia.org/w/api.php",
        data: {
          format: "json",
          action: "query",
          titles: fileName,
          prop:"imageinfo",
          iiprop: "url",
          iiurlwidth: 340
        },
        dataType: 'jsonp',
        success: function (data) {
          var url = data.query.pages[Object.keys(data.query.pages)[0]].imageinfo[0].thumburl;
          document.getElementById( 'painting' ).src = url;
        }
    });
}
