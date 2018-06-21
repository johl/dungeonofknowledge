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
  },
  {
    sparql: `
      SELECT ?item ?label ?description ?image
      WHERE
      {
	wd:Q55075439 wdt:P180 ?item.
        ?item rdfs:label ?label .
        ?item schema:description ?description .
        filter (lang(?label) = "en") .
        filter (lang(?description) = "en") .
        OPTIONAL { ?item wdt:P18 ?image }
      }
      `,
    description: "Art depicted in the videoclip 'Apeshit' by The Carters (Beyoncé and Jay-Z)"
  },
  {
    sparql: `
       SELECT ?item ?label ?description ?image
       WHERE 
       {
        ?item wdt:P136 wd:Q40446;
        wdt:P180/wdt:P31? wd:Q146.
        filter (lang(?label) = "en") .
        filter (lang(?description) = "en") .
        OPTIONAL { ?item wdt:P18 ?image. }
       }
       `,
    description: "Nudes with cats"
  }
];
