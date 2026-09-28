# Coastline asset

`ne_110m_coastline.geojson` is Natural Earth's 1:110m coastline geometry, downloaded 2026-09-17.

Source: https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_coastline.geojson

License: public domain. https://www.naturalearthdata.com/about/terms-of-use/

Only coastal LineString/MultiLineString paths are sampled; no administrative borders. Both the WebGL globe and server-rendered SVG fallback use `lib/coastline.ts` and this local file. No runtime geographic service is required.
