const ee = require('@google/earthengine');

// Get url parameters
const image_to_url = (image_name, vis_params = {}) => { 
    try {
        const ee_image = ee.image(image_name);
        const tile_url = ee_image.getMap(vis_params).url_format;
        return tile_url;
    } catch (error) {
        console.log(error);
    }
}

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
// const get_time_series = (collection_name, geometry, reducer, scale = 10) => {
//     try {
//         const ee_collection = ee.ImageCollection(collection_name);
//         const time_series = ee_collection.reduceRegion({
//             reducer: reducer,
//             geometry: geometry,
//             scale: scale
//         });
//         return time_series;
//     } catch (error) {
//         console.log(error);
//     }
// }

const get_time_series = async(collection_name, geometry, reducer, scale = 10) => {
    try {
        const area = ee.Geometry.Polygon(JSON.parse(geometry));
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
        const ee_collection = ee.ImageCollection(collection_name)
            .filterDate("2021-01-01", "2021-01-31")
            .filterBounds(area)
            .map(clipArea)
            .select(["B4", "B8"]);
        console.log(ee_collection);
        const time_series = ee_collection.map((img) => {
            var img_red = img.reduceRegion({
                reducer:reducers[reducer], 
                geometry:area,
                scale: 10,
                maxPixels: 1e9
            });
            return ee.Feature(null, {
                'B4': img_red.get("B4"),
                'B8': img_red.get("B8"),
                't': img.get('system:time_start')
            });
        });
        console.log(time_series);
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