const router = require('express').Router();
const ee = require('@google/earthengine');
const geeMethodsCtrl = require('../controller/gee-methods-ctrl');
const e = require('express');

router.get('/mapid', (req, res) => {
    const id = req.query.id;
    const area_s = req.query.area;
    const bands_s = req.query.bands;
    const type = req.query.type;
    const scale_s = req.query.scale;
    const start_date_s = req.query.start_date;
    const end_date_s = req.query.end_date;

    let scale
    if (!scale_s) {
      scale = Number(1);
    }else {
      scale = Number(scale_s);
    }

    let area;
    try {
      area = ee.Geometry.Polygon(JSON.parse(area_s));
    } catch (error) {
      res.status(400).send('El parámetro de área no es válido');
      return;
    }
    
    let bands;
    if (!bands_s) {
      bands = [];
    }else {
      bands = bands_s.split(",");
    }

    let start_date;
    if (!start_date_s) {
      start_date = new Date('2019-01-01');
    }else {
      start_date = new Date(start_date_s);
    }

    let end_date;
    if (!end_date_s) {
      end_date = new Date('2020-01-01');
    }else {
      end_date = new Date(end_date_s);
    }

    // console.log("id: ", id);
    // console.log("area: ", area);
    // console.log("bands: ", bands);
    // console.log("type: ", type);
    // console.log("scale: ", scale);
    // console.log("start_date: ", start_date);
    // console.log("end_date: ", end_date);

    // Create a vizualization for bands selected with the min and max values
    viz = {min:0, max:0.3}
    if (type == "image") {
      var map_sr = ee.Image(id);
      map_sr = map_sr.clip(area);
      map_sr.getMap(viz, ({ urlFormat }) => res.send(urlFormat));
    } else if (type == "image_collection") {
      var map_sr = ee.ImageCollection(id).filterBounds(area);
      map_sr = map_sr.filterDate(start_date, end_date);
      map_sr = map_sr.mean();
      map_sr = map_sr.clip(area);
      map_sr = map_sr.select(bands);
      map_sr.multiply(scale).getMap(viz, ({ urlFormat }) => res.send(urlFormat));
    } else if (type == "table") {
      var map_sr = ee.FeatureCollection(id);
      map_sr = map_sr.filterBounds(area);
    } else if (type == "table_collection") {
      var map_sr = ee.FeatureCollection(id);
      map_sr = map_sr.filterBounds(area);
    }
    
});

router.get('/get-time-series', (req, res) => {
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
  function getNDMI(image) {
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
  s2_sr = s2_sr.map(getNDVI).map(getNDMI);
  s2_sr = s2_sr.map(clipArea).map(reduce_region);
  s2_sr = s2_sr.select(["NDVI", "NDMI"])
  s2_sr.evaluate((result, error) => {
    if (error) {
      console.log('Error:', error);
      res.status(500).send('Error al procesar la imagen');
    } else {
      res.send(result);
    }
  });
});

router.post('/get-ts', async(request, response) => {
    const { collection_name, geometry, reducer, resolution, start_date, end_date, bands } = request.query;
    const data = await geeMethodsCtrl.get_time_series(collection_name, geometry, reducer, resolution, start_date, end_date, bands);
    data.evaluate((result, error) => {
      if (error) {
          console.log('Error:', error);
          response.status(500).send('Error al procesar la imagen');
      } else {
          response.send(result);
      }});
});

module.exports = router;