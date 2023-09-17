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

// Function to update the list of layers
function updateLayerList() {
  const layerUl = document.getElementById('layerUl');
  layerUl.innerHTML = ""; // Clear the current list

  map.getLayers().forEach((layer, index) => {
    const layerLi = document.createElement('li');

    // Create an input field for the layer name
    const layerNameInput = document.createElement('input');
    layerNameInput.type = 'text';
    layerNameInput.value = layer.get('name') || `Capa ${index}`;
    layerNameInput.addEventListener('change', function() {
      layer.set('name', this.value);
      updateLayerList(); // Update the list to reflect the new name
    });

    // Create an input field for opacity
    const opacityInput = document.createElement('input');
    opacityInput.type = 'range';
    opacityInput.min = 0;
    opacityInput.max = 1;
    opacityInput.step = 0.1;
    opacityInput.value = layer.getOpacity();
    opacityInput.addEventListener('input', function() {
      layer.setOpacity(this.value);
    });

    // Create a delete button for the layer
    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = 'X';
    deleteButton.addEventListener('click', function() {
      map.removeLayer(layer);
      updateLayerList(); // Update the list after removal
    });

    // Append elements to the list item
    layerLi.appendChild(layerNameInput);
    layerLi.appendChild(opacityInput);
    layerLi.appendChild(deleteButton);


    // Append the list item to the list
    layerUl.appendChild(layerLi);
  });
}

// Listen for changes to the layer collection and update the layer list
map.getLayers().on(['add', 'remove'], updateLayerList);

// Call the function once to initialize the layer list
updateLayerList();


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
  // Cancel the draw interaction
  map.removeInteraction(draw);
});

//////////////////////////////////////////////////////////////////////
// Get elements from the DOM in a function
document.getElementById('getDataButton').addEventListener('click', async function() {
    // Get the value of the mission select
    const collectionName = document.getElementById('missionSelect').value;
    const productName = document.getElementById('productSelect').value;

    const idName = collectionName + "/" + productName;
  
    // Get the geometry drawn (if exists)
    const features = source.getFeatures();
    let geometry;
    if (features.length > 0) {
      geometry = features[0].getGeometry();
    }
  
    const reducer = "mean"
  
    // Get the dates from the Flatpickr calendar
    const dateRange = document.getElementById('calendar-range')._flatpickr.selectedDates;
    const startDate = dateRange.length > 0 ? dateRange[0].toLocaleDateString('en-CA') : null;
    const endDate = dateRange.length > 1 ? dateRange[1].toLocaleDateString('en-CA') : null;
  
    // Get the selected bands (if any)
    const bandSelect = document.getElementById('bandSelect');
    const selectedOptions = Array.from(bandSelect.selectedOptions);
    const selectedBands = selectedOptions.map(option => option.value);
    const bands = selectedOptions.map(option => option.value).join(",");

    const item_data = globalData.find(item => item.MISSION === collectionName && item.PRODUCT === productName);
    
    // Get the selected scales
    const selectedScales = selectedBands.map(selectedBand => {
      const bandIndex = item_data.band_values.indexOf(selectedBand);
      if (bandIndex === -1) {
        console.error(`La banda ${selectedBand} no se encontró en la información de datos`);
        return null;
      }
      return item_data.band_scale[bandIndex];
    });
    // Get the mean scale
    const scale = selectedScales.reduce((a, b) => a + b, 0) / selectedScales.length;

    // Get the selected type
    const relevantProduct = globalData.find(item => item.MISSION === collectionName && item.PRODUCT === productName);
    const type = relevantProduct.gee_type;

    // Show in console
    // console.log({
    //   idName,
    //   geometry: geometry ? geometry.getCoordinates() : null,
    //   bands,
    //   type,
    //   scale,
    //   startDate,
    //   endDate
    // });

    // Get the mapid
    // const mapid = await get_mapid(geometry);
    const mapid = await get_mapid(idName, geometry, bands, type, scale, startDate, endDate);
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

const get_mapid = async (idName, geometry, bands, type, scale, start_date, end_date) => {
  const coordinates = geometry.getCoordinates()[0].map(coord => {
    return ol.proj.transform(coord, 'EPSG:3857', 'EPSG:4326');
  });
  
  // Crear la URL con todos los parámetros necesarios
  const url = new URL("http://localhost:3000/ee/mapid");
  url.search = new URLSearchParams({
    id: idName,
    area: JSON.stringify(coordinates),
    bands: bands,
    type: type,
    scale: scale,
    start_date: start_date,
    end_date: end_date
  });
  const response = await fetch(url);
  const data = await response.text(); 
  return data; 
};


const layers = map.getLayers().getArray();
layers.forEach((layer, index) => {
  console.log(`Capa ${index + 1}:`);
  console.log('Tipo: ', layer.getType());
  console.log('Visible: ', layer.getVisible());
  // Agrega más propiedades aquí si es necesario
});

