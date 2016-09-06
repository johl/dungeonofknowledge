function getArt( level, callback ) {
    var sparql = level.sparql;
    var url = wdk.sparqlQuery( sparql );
    $( "#level" ).html("The order of things for this dungeon is: " + level.description );
    $.ajax({
      url: url,
      success: function( data ) {
        var items = _.shuffle( wdk.simplifySparqlResults( data ) );
        var item = {};
        $.each( items, function( result ) {
                if ( items[result].image ){
                    item.label = items[result].label;
                    item.description = items[result].description;
                    item.image = items[result].image;
                    item.image = item.image.replace( "http://commons.wikimedia.org/wiki/Special:FilePath/", "" );
                    item.image = decodeURIComponent( item.image );
                    var itemId = items[result].item;
                    callback( itemId, item );
                }
        } );
      }
    });
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
          if ( data.query.pages[Object.keys(data.query.pages)[0]].imageinfo ) {
            var url = data.query.pages[Object.keys(data.query.pages)[0]].imageinfo[0].thumburl;
            document.getElementById( 'painting' ).src = url;
          }
        }
    });
}
