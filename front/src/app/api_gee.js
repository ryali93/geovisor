const express = require('express');
const ee = require('@google/earthengine');
const privateKey = require('../config/private-key.json');

const app = express();
const port = process.env.PORT || 3000;

ee.data.authenticateViaPrivateKey(privateKey, () => {
  ee.initialize(null, null, () => {
    console.log('Earth Engine client library initialized.');
    app.listen(port, () => {
      console.log(`Listening on port ${port}`);
    });
  });
});

app.get('/mapid', (req, res) => {
  // const image = ee.Image('srtm90_v4');
  // const slope = ee.Terrain.slope(image);
  // slope.getMap({ min: 0, max: 60 }, ({ urlFormat }) => res.send(urlFormat));

  var geometry = 
    ee.Geometry.Polygon(
        [[[-4.711838325816413,40.63813035954799],
          [-4.643173775035163,40.63813035954799],
          [-4.643173775035163,40.68396725227727],
          [-4.711838325816413,40.68396725227727],
          [-4.711838325816413,40.63813035954799]]], null, false);
  function getNDVI(image) {
    var NDVI = image.expression(
        '(NIR - RED) / (NIR +  RED)', {
            'NIR': image.select('B8').divide(10000),
            'RED': image.select('B4').divide(10000)
        }).rename("NDVI")
    image = image.addBands(NDVI)
    return(image)
  }
  var s2_sr = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
                  .filterMetadata('CLOUDY_PIXEL_PERCENTAGE', 'less_than', 20)
                  .filterBounds(geometry);
  s2_sr = s2_sr.map(getNDVI);
  s2_sr.select("NDVI").getMap({ min: -1, max: 1 }, ({ urlFormat }) => res.send(urlFormat));
  
});
