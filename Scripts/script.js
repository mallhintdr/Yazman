var map = L.map('map').setView([31,68], 5); // Set to your default view

var googleHybrid = L.tileLayer('http://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
}).addTo(map);

var googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
}).addTo(map);

var baseLayers = {
    "Google Hybrid": googleHybrid,
    "Google Satellite": googleSat
};

L.control.layers(baseLayers, null, {collapsed: false, position: 'bottomright' }).addTo(map);

L.control
  .locate({
    position: "topleft",
    strings: {
      title: "Show My Location"
    },
    locateOptions: {
      enableHighAccuracy: true
    }
  })
  .addTo(map);


function customSort(array) {
    return array.sort((a, b) => {
        // Splitting each string at the space
        let [numA, alphaA] = a.split(" ");
        let [numB, alphaB] = b.split(" ");

        // Parsing the numeric parts as integers
        numA = parseInt(numA, 10);
        numB = parseInt(numB, 10);

        // Comparing the numeric parts
        if (numA !== numB) {
            return numA - numB;
        }

        // If the numeric parts are equal, compare the alphabetical parts
        return alphaA.localeCompare(alphaB);
    });
}

// Example usage


var data = ["95 DB","96 DB","97 DB","98 DB","99 DB","48 DB","50-A DB","51 DB","52 DB","54 DB","55 DB","59 DB","60 DB","61 DB","62 DB","90 DB","91 DB","100 DB","101 DB","103 DNB","104 DNB","108 DB","109 DB","114 DB","115 DB","116 DB","53 DB","50 DB","47 DB","88 DB","89 DB","91-A DB","93 DB","94 DB","102 DB","39 DB","40 DB","45 DB","46 DB","63 DB","64 DB","65 DB","68 DB","69 DB","70 DB","72 DB","86 DB","87 DB","104 DB","105 DB","103 DB","106 DB","107 DB","140 DB","39 DNB","48 DNB","29 DNB","47 DNB","23 DNB","22 DNB","5 DNB","4 DNB","117 DB","116 DNB","17 DNB", "35 DNB", "112 DNB","113 DNB","110 DB","56-A DB","56 DB","57 DB","58 DB","111 DB","112 DB","113 DB","114 DNB"]; // Your predefined array
let chakNames=customSort(data);
var currentLayer = null;
var Murabba_Layer = null;

// Populate first dropdown
chakNames.forEach(function(name) {
    var option = document.createElement('option');
    option.value = option.textContent = name;
    document.getElementById('chak-dropdown').appendChild(option);
});

// Handle chak dropdown change
document.getElementById('chak-dropdown').addEventListener('change', function(e) {
    var chakName = e.target.value;
    if (currentLayer) {
        map.removeLayer(currentLayer);
        map.removeLayer(Murabba_Layer);

    }
    if (chakName !== "Select Chak") {
        loadGeoJson( "JSON Murabba/"+chakName + '.geojson', function(geojsonData) {
            currentLayer = L.geoJSON(geojsonData,{
                style: function() {
                    return {
                        fillColor: "#000000", // Black, but it will be transparent due to fillOpacity
                        fillOpacity: 0, // Transparent fill
                        color: "#ff0c04", // Border color
                        weight: 3 // Border width
                    };
                },
                onEachFeature: function(feature, layer) {
                    if (feature.properties && feature.properties.Murabba_No) {
                        layer.bindTooltip(feature.properties.Murabba_No,{ permanent: true ,direction: 'center',className: 'mustateel'}).openTooltip();
                    }
                }
            }).addTo(map);
            
            let bounds = currentLayer.getBounds();
            map.setView(bounds.getCenter());
            map.fitBounds(bounds);
            
            
            // Clear and populate second dropdown
var Murabba_NoDropdown = document.getElementById('Murabba_No-dropdown');
Murabba_NoDropdown.innerHTML = '<option>Select Muraba</option>';

// Collect all Murabba_No values into an array
var murabbaNumbers = geojsonData.features.map(function(feature) {
    return feature.properties.Murabba_No;
});

// Sort the numbers in ascending order
murabbaNumbers.sort(function(a, b) {
    return parseInt(a, 10) - parseInt(b, 10);
});

// Create and append option elements to the dropdown
murabbaNumbers.forEach(function(number) {
    var option = document.createElement('option');
    option.value = option.textContent = number;
    Murabba_NoDropdown.appendChild(option);
});

            
        });
    }
});

document.getElementById('Murabba_No-dropdown').addEventListener('change', function(e) {
    var selectedMurabba_No = e.target.value;
    var chakName = document.getElementById('chak-dropdown').value;
    
    if (Murabba_Layer) {
        map.removeLayer(Murabba_Layer);
    }

    if (selectedMurabba_No !== "Select Muraba") {
        loadGeoJson("JSON Khasra/"+chakName + ' ' + 'Khasra' + '.geojson', function(geojsonData) {
            // Filter the GeoJSON data
            var filteredGeoJson = {
                ...geojsonData,
                features: geojsonData.features.filter(feature => 
                    feature.properties.Murabba_No === selectedMurabba_No)
            };

            // Add the filtered data to the map
            Murabba_Layer = L.geoJSON(filteredGeoJson,{
                style: function() {
                    return {
                        fillColor: "#000000", // Black, but it will be transparent due to fillOpacity
                        fillOpacity: 0, // Transparent fill
                        color: "#ede88f", // Border color
                        weight: 1 // Border width
                    };
                },
                onEachFeature: function(feature, layer) {
                    if (feature.properties && feature.properties.Killa) {
                        layer.bindTooltip(feature.properties.Killa,{ permanent: true ,direction: 'center',className: 'labelstyle'}).openTooltip();
                    }
                }
            }).addTo(map);

            let bounds = Murabba_Layer.getBounds();
            map.setView(bounds.getCenter());
            map.fitBounds(bounds);
        }, function() {
            console.error("Error loading Murabba_No GeoJSON");
        });
    }
});

// ... rest of the code remains the same
function loadGeoJson(url, onSuccess, onError) {
    fetch(url)
        .then(function(response) {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(onSuccess)
        .catch(function(error) {
            console.error('Error loading GeoJSON: ', error);
            if (typeof onError === 'function') {
                onError(error);
            }
        });
}


