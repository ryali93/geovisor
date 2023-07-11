const express = require('express');
const ee = require('@google/earthengine');
const privateKey = require('./config/private-key.json');

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
    const area = req.query.area;
    if (!area) {
      res.status(400).send('Debe proporcionar el parámetro de área');
      return;
    }
    let geometry;
    try {
      geometry = ee.Geometry.Polygon(JSON.parse(area));
    } catch (error) {
      res.status(400).send('El parámetro de área no es válido');
      return;
    }
    function getNDVI(image) {
      var NDVI = image.expression(
          '(NIR - RED) / (NIR +  RED)', {
              'NIR': image.select('B8').divide(10000),
              'RED': image.select('B4').divide(10000)
          }).rename("NDVI");
      image = image.addBands(NDVI);
      return image;
    }
    var s2_sr = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
                    .filterMetadata('CLOUDY_PIXEL_PERCENTAGE', 'less_than', 20)
                    .filterBounds(geometry);
    s2_sr = s2_sr.map(getNDVI).median();
    s2_sr = s2_sr.clip(geometry);
    s2_sr.select("NDVI").getMap({ min: -1, max: 1 }, ({ urlFormat }) => res.send(urlFormat));
});

app.get('/get-time-series', (req, res) => {
  const area = req.query.area;
  if (!area) {
    res.status(400).send('Debe proporcionar el parámetro de área');
    return;
  }
  let geometry;
  try {
    geometry = ee.Geometry.Polygon(JSON.parse(area));
  } catch (error) {
    res.status(400).send('El parámetro de área no es válido');
    return;
  }
  function getNDVI(image) {
    var NDVI = image.expression(
        '(NIR - RED) / (NIR +  RED)', {
            'NIR': image.select('B8').divide(10000),
            'RED': image.select('B4').divide(10000)
        }).rename("NDVI");
    image = image.addBands(NDVI);
    return image;
  }
  function clipNDMI(image) {
    var NDMI = image.expression(
        '(SWIR1 - NIR) / (SWIR1 + NIR)', {
            'NIR': image.select('B8').divide(10000),
            'SWIR1': image.select('B11').divide(10000)
        }).rename("NDMI");
    image = image.addBands(NDMI);
    return image;
  }
  function clipArea(image) {
    return image.clip(geometry);
  }
  // Calcular la media del NDVI y NDMI en la región
  function reduce_region(image){
    mean = image.reduceRegion(reducer=ee.Reducer.mean(), geometry=geometry, scale=10)
    return image.set('NDVI', mean.get('NDVI')).set('NDMI', mean.get('NDMI'))
  }

  var s2_sr = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
                  .filterMetadata('CLOUDY_PIXEL_PERCENTAGE', 'less_than', 20)
                  .filterBounds(geometry)
                  .filterDate('2021-01-01', '2023-06-30');
  s2_sr = s2_sr.map(getNDVI).map(clipNDMI);
  s2_sr = s2_sr.map(clipArea).map(reduce_region);
  s2_sr = s2_sr.select(["NDVI", "NDMI"])

  // res.send(s2_sr.getInfo());
  s2_sr.evaluate((result, error) => {
    if (error) {
      console.log('Error:', error);
      res.status(500).send('Error al procesar la imagen');
    } else {
      res.send(result);
    }
  });
});

// '[[[-4.690932512848409,40.63479884404164],[-4.690932512848409,40.657722371758105],[-4.657959889075778,40.657722371758105],[-4.657959889075778,40.63479884404164]]]'