function getArt( level, callback ) {
	var sparql = level.sparql,
		url = wdk.sparqlQuery( sparql );

	$( '#level' ).html( 'The order of things for this dungeon is: ' + level.description );

	$.ajax( {
		url: url,
		success: function( data ) {
			var items = _.shuffle( wdk.simplifySparqlResults( data ) );

			$.each( items, function( index, result ) {
				if ( !result.image ) {
					return;
				}

				var itemId = result.item,
					item = {
						label: result.label,
						description: result.description,
						image: decodeURIComponent( result.image.replace( /.*\//, '' ) )
					};

				callback( itemId, item );
			} );
		}
	} );
}


function changeImage( fileName ) {
	$.ajax( {
		url: 'https://commons.wikimedia.org/w/api.php',
		data: {
			format: 'json',
			action: 'query',
			titles: 'File:' + fileName,
			prop: 'imageinfo',
			iiprop: 'url',
			iiurlwidth: 340
		},
		dataType: 'jsonp',
		success: function ( data ) {
			var page = data.query.pages[Object.keys( data.query.pages )[0]];
			if ( page.imageinfo ) {
				var imageInfo = page.imageinfo[0];
				document.getElementById( 'painting' ).src = imageInfo.thumburl;
			}
		}
	} );
}
