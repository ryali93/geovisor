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
      center: ol.proj.fromLonLat([0, 0]),
      zoom: 2
    })
  });

//////////////////////////////////////////////////////////////////////
// Example of data to fill the comboboxes with autocomplete
const data = {
"COPERNICUS": {
    "S2_SR_HARMONIZED": {
    "bands": ["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B8A", "B9", "B10", "B11", "B12", "B2A", "QA10", "QA20", "QA60"],
    },
    "S2_TOA": {
    "bands": ["B1", "B10", "B11", "B12", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B8A", "B9", "QA10", "QA20", "QA60"],
    }
},
"LANDSAT": {
    "LANDSAT_8_C1": {
    "bands": ["B1", "B10", "B11", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9", "BQA"],
    }
}
};

// Get elements from the DOM
const missionSelect = document.getElementById('missionSelect');
const satelliteSelect = document.getElementById('satelliteSelect');
const bandSelect = document.getElementById('bandSelect');

// Fill the first combobox with the missions
Object.keys(data).forEach(mission => {
  const option = document.createElement('option');
  option.value = mission;
  option.textContent = mission;
  missionSelect.appendChild(option);
});

// Event for when a mission is selected
missionSelect.addEventListener('change', function() {
  const selectedMission = this.value;

  // Clear and enable the next combobox
  satelliteSelect.innerHTML = '<option value="">Select a satellite</option>';
  satelliteSelect.disabled = false;

  // Fill the combobox with satellites
  Object.keys(data[selectedMission]).forEach(satellite => {
    const option = document.createElement('option');
    option.value = satellite;
    option.textContent = satellite;
    satelliteSelect.appendChild(option);
  });
});

// Event for when a satellite is selected
satelliteSelect.addEventListener('change', function() {
  const selectedMission = missionSelect.value;
  const selectedSatellite = this.value;

  // Clear and enable the next combobox
  bandSelect.innerHTML = '<option value="">Select bands</option>';
  bandSelect.disabled = false;

  // Fill the combobox with bands
  data[selectedMission][selectedSatellite].bands.forEach(band => {
    const option = document.createElement('option');
    option.value = band;
    option.textContent = band;
    bandSelect.appendChild(option);
  });
});

//////////////////////////////////////////////////////////////////////
// Calendar widget with flatpickr
flatpickr('#calendar-range', {
    "mode": "range"
});


//////////////////////////////////////////////////////////////////////
// Primero, define la fuente y la capa vectorial
let source = new ol.source.Vector();
let vector = new ol.layer.Vector({
  source: source
});

// Añadir la capa al mapa
map.addLayer(vector);

// Definir la función addDrawInteraction
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

// Añadir escuchadores de eventos para los botones
document.getElementById('drawRectangle').addEventListener('click', function() {
  vector = addDrawInteraction('Rectangle');
});
document.getElementById('drawPolygon').addEventListener('click', function() {
  vector = addDrawInteraction('Polygon');
});
// document.getElementById('drawCircle').addEventListener('click', function() {
//   vector = addDrawInteraction('Circle');
// });
document.getElementById('drawClear').addEventListener('click', function() {
  source.clear();
});

//////////////////////////////////////////////////////////////////////
// Get elements from the DOM in a function
document.getElementById('getDataButton').addEventListener('click', async function() {
    // Obtener el valor del select de la misión
    const collectionName = document.getElementById('missionSelect').value;
  
    // Obtener la geometría dibujada (si existe)
    const features = source.getFeatures();
    let geometry;
    if (features.length > 0) {
      geometry = features[0].getGeometry();
    }
  
    // Para este ejemplo, asumo que tienes select o input para reducer y resolution
    const reducer = "mean"//document.getElementById('reducerSelect').value; // reemplaza con tu propio elemento
    const resolution = 30 //document.getElementById('resolutionInput').value; // reemplaza con tu propio elemento
  
    // Obtener las fechas del calendario Flatpickr
    const dateRange = document.getElementById('calendar-range')._flatpickr.selectedDates;
    const startDate = dateRange.length > 0 ? dateRange[0].toLocaleDateString('en-CA') : null;
    const endDate = dateRange.length > 1 ? dateRange[1].toLocaleDateString('en-CA') : null;
  
    // Obtener las bandas seleccionadas (si se seleccionaron)
    const bandSelect = document.getElementById('bandSelect');
    const selectedOptions = Array.from(bandSelect.selectedOptions);
    const bands = selectedOptions.map(option => option.value);
  
    // Mostrar en consola
    console.log({
      collectionName,
      geometry: geometry ? geometry.getCoordinates() : null, // o como quieras almacenar la geometría
      reducer,
      resolution,
      startDate,
      endDate,
      bands
    });

    // Obtener el mapid
    const mapid = await get_mapid(geometry);
    console.log(mapid);

    // Añadir la imagen XYZ al mapa
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
