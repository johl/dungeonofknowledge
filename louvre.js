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
			// Do something with the items
			//alert( item.label );
			callback( itemId, item );
		} );
	};
	query_xhr.onerror = function() {
		throw new Error( 'Error making the request' );
	};
	query_xhr.send();
}


function getImageUrl( fileName ) {
	var fileName = fileName.replace( / /g, '_' );
	var hash = md5( fileName );
	//https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/XXX.jpg/320px-XXX.jpg
	return 'https://upload.wikimedia.org/wikipedia/commons/thumb/'
		+ hash.substr( 0, 1 ) + '/' + hash.substr( 0, 2 ) + '/'
		+ fileName + '/320px-' + fileName;
}
