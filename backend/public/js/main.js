//////////////////////////////////////////////////////////////////////
// Initialize the map
const map = new ol.Map({
    target: 'map',
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM()
      })
    ],
    view: new ol.View({
      center: ol.proj.fromLonLat([-4.7240425, 39.7825346]),
      zoom: 7
    })
  });

//////////////////////////////////////////////////////////////////////
// Toggle advanced options
document.getElementById('toggleAdvanced').addEventListener('click', function() {
  // this.classList.toggle('active');
  const advancedOptions = document.getElementById('advancedOptions');
  if (advancedOptions.style.display === 'none' || advancedOptions.style.display === '') {
    advancedOptions.style.display = 'block';
  } else {
    advancedOptions.style.display = 'none';
  }
});

//////////////////////////////////////////////////////////////////////
// Example of data
// const data = {
// "COPERNICUS": {
//     "S2_SR_HARMONIZED": {
//     "bands": ["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B8A", "B9", "B10", "B11", "B12", "B2A", "QA10", "QA20", "QA60"],
//     },
//     "S2_TOA": {
//     "bands": ["B1", "B10", "B11", "B12", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B8A", "B9", "QA10", "QA20", "QA60"],
//     }
// },
// "LANDSAT": {
//     "LANDSAT_8_C1": {
//     "bands": ["B1", "B10", "B11", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9", "BQA"],
//     }
// }
// };

let globalData;

// Load data from JSON file
fetch('./gee_catalog.json')
  .then(response => response.json())
  .then(data => {
    globalData = data;
    initializeMissionComboBox(data);
  })
  .catch(error => console.error('Error al cargar el archivo JSON:', error));

function initializeMissionComboBox(data) {
  const missionSelect = document.getElementById('missionSelect');
  const uniqueMissions = [...new Set(data.map(item => item.MISSION))];  // Get unique missions

  uniqueMissions.forEach(mission => {
    const option = document.createElement('option');
    option.value = mission;
    option.textContent = mission;
    missionSelect.appendChild(option);
  });

  missionSelect.addEventListener('change', function() {
    const selectedMission = this.value;
    initializeProductComboBox(selectedMission);
  });
}

function initializeProductComboBox(selectedMission) {
  const productSelect = document.getElementById('productSelect');
  productSelect.innerHTML = '<option value="">Select product</option>';
  productSelect.disabled = false;

  const relevantProducts = globalData.filter(item => item.MISSION === selectedMission);

  relevantProducts.forEach(product => {
    const option = document.createElement('option');
    option.value = product.PRODUCT;
    option.textContent = product.PRODUCT;
    productSelect.appendChild(option);
  });

  productSelect.addEventListener('change', function() {
    const selectedProduct = this.value;
    initializeBandComboBox(selectedMission, selectedProduct);
  });
}

function initializeBandComboBox(selectedMission, selectedProduct) {
  const bandSelect = document.getElementById('bandSelect');
  bandSelect.innerHTML = '<option value="">Select bands</option>';
  bandSelect.disabled = false;

  const relevantProduct = globalData.find(item => item.MISSION === selectedMission && item.PRODUCT === selectedProduct);

  if (relevantProduct && Array.isArray(relevantProduct.band_values)) {
    relevantProduct.band_values.forEach((band, index) => {
      const option = document.createElement('option');
      option.value = relevantProduct.band_values[index] || band;
      option.textContent = relevantProduct.band_values[index] + " - " + relevantProduct.band_description[index] || band;
      option.title = relevantProduct.band_description[index] || band;

      bandSelect.appendChild(option);
    });
  }
}

//////////////////////////////////////////////////////////////////////
// Calendar widget with flatpickr
flatpickr('#calendar-range', {
    "mode": "range"
});

//////////////////////////////////////////////////////////////////////
// First, define the source and vector layer
let source = new ol.source.Vector();
let vector = new ol.layer.Vector({
  source: source
});

// Add the layer to the map
map.addLayer(vector);

// Define a function that adds the draw interaction to the map
let draw;
function addDrawInteraction(type) {
  if (draw) {
    map.removeInteraction(draw);
  }
  draw = new ol.interaction.Draw({
    source: source,
    type: type === 'Rectangle' ? 'Circle' : type,
    geometryFunction: type === 'Rectangle' ? ol.interaction.Draw.createRegularPolygon(4) : undefined
  });
  map.addInteraction(draw);
  
  draw.on('drawend', function(evt) {
    let geometry = evt.feature.getGeometry();
    console.log(geometry.getCoordinates());
  });
}

// Add event listeners for the buttons
document.getElementById('drawRectangle').addEventListener('click', function() {
  vector = addDrawInteraction('Rectangle');
});
document.getElementById('drawPolygon').addEventListener('click', function() {
  vector = addDrawInteraction('Polygon');
});
document.getElementById('drawClear').addEventListener('click', function() {
  source.clear();
});

//////////////////////////////////////////////////////////////////////
// Get elements from the DOM in a function
document.getElementById('getDataButton').addEventListener('click', async function() {
    // Get the value of the mission select
    const collectionName = document.getElementById('missionSelect').value;
  
    // Get the geometry drawn (if exists)
    const features = source.getFeatures();
    let geometry;
    if (features.length > 0) {
      geometry = features[0].getGeometry();
    }
  
    const reducer = "mean"
    const resolution = 30 
  
    // Get the dates from the Flatpickr calendar
    const dateRange = document.getElementById('calendar-range')._flatpickr.selectedDates;
    const startDate = dateRange.length > 0 ? dateRange[0].toLocaleDateString('en-CA') : null;
    const endDate = dateRange.length > 1 ? dateRange[1].toLocaleDateString('en-CA') : null;
  
    // Get the selected bands (if any)
    const bandSelect = document.getElementById('bandSelect');
    const selectedOptions = Array.from(bandSelect.selectedOptions);
    const bands = selectedOptions.map(option => option.value);
  
    // Show in console
    console.log({
      collectionName,
      geometry: geometry ? geometry.getCoordinates() : null,
      reducer,
      resolution,
      startDate,
      endDate,
      bands
    });

    // Get the mapid
    const mapid = await get_mapid(geometry);
    console.log(mapid);

    // Add the XYZ image to the map
    const xyzSource = new ol.source.XYZ({
        url: mapid,
        attributions: "XYZ",
        maxZoom: 18
    });
    const xyzLayer = new ol.layer.Tile({ source: xyzSource });
    map.addLayer(xyzLayer);

});

const get_mapid = async (geometry) => {
  const coordinates = geometry.getCoordinates()[0].map(coord => {
    return ol.proj.transform(coord, 'EPSG:3857', 'EPSG:4326');
  });
  const response = await fetch(`http://localhost:3000/ee/mapid?area=${encodeURIComponent(JSON.stringify(coordinates))}`);
  const data = await response.text();
  return data;
};
