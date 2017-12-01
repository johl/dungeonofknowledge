var levels =
[
  {
    sparql:  `
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
  },
  {
    sparql: `
      SELECT ?item ?label ?description ?image
      WHERE
      {
        ?item wdt:P180 wd:Q41213 .
        OPTIONAL {?item wdt:P18 ?image . }
        ?item rdfs:label ?label .
        ?item schema:description ?description .
        filter (lang(?label) = "en") .
        filter (lang(?description) = "en") .
      }
      `,
    description: "Towers of Babel"
  },
  {
    sparql: `
      SELECT ?item ?label ?description ?image
      WHERE
      {
        ?item wdt:P31 wd:Q26529 .
        ?item rdfs:label ?label .
        ?item schema:description ?description .
        filter (lang(?label) = "en") .
        filter (lang(?description) = "en") .
        OPTIONAL { ?item wdt:P18 ?image }
      }
      `,
    description: "Space probes"
  }
];
