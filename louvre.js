function getArt( callback ) {
    var sparql = `
      PREFIX schema: <http://schema.org/>
      PREFIX wd: <http://www.wikidata.org/entity/>
      PREFIX wdt: <http://www.wikidata.org/prop/direct/>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      SELECT ?item ?label ?image ?description
      WHERE
      {
        ?item wdt:P195 wd:Q3044768 .
        ?item wdt:P18 ?image.
        ?item rdfs:label ?label .
        ?item schema:description ?description .
        filter (lang(?label) = "en") .
        filter (lang(?description) = "en") .
      }
    `;
    var url = wdk.sparqlQuery( sparql );
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
