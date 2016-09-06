var levels =
[
  {
    sparql:  `
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
      `,
    description: "Paintings in the Louvre, Paris"
  },
  {
    sparql: `
      PREFIX schema: <http://schema.org/>
      PREFIX wd: <http://www.wikidata.org/entity/>
      PREFIX wdt: <http://www.wikidata.org/prop/direct/>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

      SELECT ?item ?label ?image ?description
      WHERE
      {
        ?item ?x1 wd:Q146 . 
        OPTIONAL {
          ?item wdt:P18 ?image
        }
          ?item rdfs:label ?label .
          ?item schema:description ?description .
        filter (lang(?label) = "en") .
          filter (lang(?description) = "en") .

      }
    `,
    description: "Cat things"
  }
]
