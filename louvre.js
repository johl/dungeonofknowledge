function getArt( callback ) {
    $.ajax({
        url: "https://tools.wmflabs.org/hay/wdskim/index.php",
        data: {
          format: "json",
          action: "query",
          language: "en",
          prop:"P195",
          item: "Q3044768",
          withimages: "on"
        },
//        dataType: 'jsonp',
        success: function (data) {
            var items = data.items;
            $.each( items, function( itemId, item ) {
                callback( itemId, item );
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
          var url = data.query.pages[Object.keys(data.query.pages)[0]].imageinfo[0].thumburl;
          document.getElementById( 'painting' ).src = url;
        }
    });
}
