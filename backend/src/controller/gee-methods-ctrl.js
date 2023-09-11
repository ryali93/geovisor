const ee = require('@google/earthengine');
const indices = require('../controller/operations/indices');
// const utils = require('../controller/operations/utils');

// Get url tile for image
const image_to_url = (image_name, vis_params = {}) => { 
    try {
        const ee_image = ee.image(image_name);
        const tile_url = ee_image.getMap(vis_params).url_format;
        return tile_url;
    } catch (error) {
        console.log(error);
    }
}

// Get url tile for image collection
const collection_to_url = (collection_name, vis_params = {}) => {
    try {
        const ee_collection = ee.ImageCollection(collection_name);
        const tile_url = ee_collection.getMap(vis_params).url_format;
        return tile_url;
    } catch (error) {
        console.log(error);
    }
}

// Get time series
const get_time_series = async(collection_name, geometry, reducer, resolution = 10, start_date, end_date, bands) => {
    try {
        const area = ee.Geometry.Polygon(JSON.parse(geometry));
        const mision = collection_name.split("/")[0];
        const sensor = collection_name.split("/")[1];
        const reducers = {
            "mean": ee.Reducer.mean(),
            "median": ee.Reducer.median(),
            "max": ee.Reducer.max(),
            "min": ee.Reducer.min(),
            "stdDev": ee.Reducer.stdDev(),
            "count": ee.Reducer.count(),
            "sum": ee.Reducer.sum()
        }
        const clipArea = function (img) {
            return img.clip(area);
        }
        const addIndices = function (img) {
            if("NDVI" in bands){
                img = indices.getExpresion(
                    img, 
                    indices.indices_ic[mision][sensor]["NDVI"]["expression"], 
                    indices.indices_ic[mision][sensor]["NDVI"]["map"])
            }
            if("NDMI" in bands){ img = indices.getExpresion(img, indices.indices_ic[mision][sensor]["NDMI"]["expression"], indices.indices_ic[mision][sensor]["NDMI"]["map"])  }
            return img;
        }
        console.log(indices.indices_ic[mision][sensor]["NDVI"]["expression"])
        console.log(indices.indices_ic[mision][sensor]["NDVI"]["map"])
        console.log("bands", bands);
        
        const ee_collection = ee.ImageCollection(collection_name)
            .filterDate(start_date, end_date)
            .filterBounds(area)
            .map(clipArea)
            .map(addIndices)
            .select(bands);
        const time_series = ee_collection.map((img) => {
            var imgReduced = img.reduceRegion({
                reducer: reducers[reducer], 
                geometry: area,
                scale: Number(resolution),
                maxPixels: 1e9
            });
            var featureProps = {};
            bands.forEach(band => {
                featureProps[band] = imgReduced.get(band);
            });
            featureProps['t'] = img.get('system:time_start');
            return ee.Feature(null, featureProps);
        });
        return time_series;
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    image_to_url,
    collection_to_url,
    get_time_series
}