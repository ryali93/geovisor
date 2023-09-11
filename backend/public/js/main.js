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
// Create a fetch request to get the data from the backend
const get_ts = async (collection_name, geometry, reducer, resolution, start_date, end_date, bands) => {
    const response = await fetch(`/earth-engine/get-ts?collection_name=${collection_name}&geometry=${geometry}&reducer=${reducer}&resolution=${resolution}&start_date=${start_date}&end_date=${end_date}&bands=${bands}`);
    const data = await response.json();
    return data;
};

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
});


const mapIdData = await get_mapid(geometry);
if (!mapIdData) {
    console.error('No se pudo obtener el Map ID.');
    return;
}
// Añadir la capa al mapa de OpenLayers
let tileLayer = new ol.layer.Tile({
source: new ol.source.XYZ({
    url: mapIdData, // Reemplaza esto con la URL que obtienes del backend
    maxZoom: 18,
}),
opacity: 0.5,
});
map.addLayer(tileLayer);

async function get_mapid(geometry) {
    try {
      const transformedCoordinates = geometry.getCoordinates()[0].map(coord => {
        return ol.proj.transform(coord, 'EPSG:3857', 'EPSG:4326');
      });
      const response = await fetch(`/earth-engine/mapid?area=${encodeURIComponent(JSON.stringify(transformedCoordinates))}`);
      if (!response.ok) {
        console.error('Ocurrió un error al obtener el Map ID:', response.statusText);
        return null;
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Ocurrió un error al obtener el Map ID:', error);
      return null;
    }
  }


// Event for when the button is clicked
// getTsButton.addEventListener('click', async function() {
//     const data = await get_ts(collectionName.value, geometry.value, reducer.value, resolution.value, startDate.value, endDate.value, bands.value);
//     console.log(data);
// });


// Widget de calendario
// const calendar = document.getElementById('calendar');

// calendar.addEventListener('change', function() {
//     const selectedDate = this.value;
// });

// Suponiendo que obtienes los datos desde tu backend como un array de objetos
// fetch('tu_url_para_obtener_datos')
//   .then(response => response.json())
//   .then(data => {
//     const combobox1 = document.getElementById('combobox1');
//     data.forEach(item => {
//       const option = document.createElement('option');
//       option.value = item.id; // Cambia 'id' por el campo apropiado de tu objeto
//       option.textContent = item.name; // Cambia 'name' por el campo apropiado de tu objeto
//       combobox1.appendChild(option);
//     });
//   });