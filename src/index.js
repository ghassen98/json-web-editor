var addedFromXYInput = false,
	tempLngLat;
var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
	osmAttrib = '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	osm = L.tileLayer(osmUrl, { maxZoom: 18, attribution: osmAttrib }),
	map = new L.Map('map', { center: new L.LatLng(36.79443996, 10.17711639), zoom: 13 }),
	drawnItems = L.featureGroup().clearLayers().addTo(map);

L.control.layers({
	'OpenStreetMap': osm.addTo(map),
	"Google Satellite": L.tileLayer('http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}', {
		attribution: 'Google Satellite'
	})
}, { 'Points d\'Activité et d\'Intérêt': drawnItems }, { position: 'topright', collapsed: true }).addTo(map);

var drawControl = new L.Control.Draw({
	edit: {
		featureGroup: drawnItems,
		remove: true,
		edit: true
	},
	draw: {
		marker: {
			repeatMode: false
		},
		polygon: false,
		polyline: false,
		circlemarker: false,
		rectangle: false,
		circle: false
	}
});
	
L.Control.FileLayerLoad.LABEL = '<img class="icon" src="libs/svg/folder.svg" alt="File Icon"/>';
var control = L.Control.fileLayerLoad({
	fitBounds: true,
	fileSizeLimit: 6144,
	formats: ['.geojson', '.json'],
	layerOptions: {
		pointToLayer: function (data, latlng) {
			return L.marker(latlng,{});
		},
		onEachFeature: function (feature, layer) {
			layer.bindPopup('<span><b>Nom Fr :</b> '+ feature.properties.nom_fr +'</span><br/><span><b>Nom Ar :</b> '+ feature.properties.nom_ar +'</span>');
			var myLayer = layer;
			drawnItems.addLayer(myLayer);
		}
	}
}).addTo(map);

//File read control
control.loader.on('data:loaded', function (e) {
	var layer = e.layer;
	
	document.getElementById('lngLatControl').style.visibility = 'visible';
	document.getElementById('delete').style.visibility = 'visible';
	document.getElementById('export').style.visibility = 'visible';
	
	map.addControl(drawControl);
});

// When a new marker is drawn on map
map.on('draw:created', function (event) {
	var layer = event.layer;
		feature = layer.feature = layer.feature || {};
		feature.type = feature.type || "Feature";
		
	var props = feature.properties = feature.properties || {};
	props.nom_fr = null;
	props.nom_ar = null;
	
	var insertPopup = L.popup();
	var content = '<span><b>Nom Fr :</b></span><br/><input id="nom_fr" type="text"/><br/><br/><span><b>Nom Ar :<b/></span><br/><input id="nom_ar" type="text"/><br/><br/><input type="button" id="okBtn" value="Save" onclick="saveAttrib()"/>';
	insertPopup.setContent(content);
	insertPopup.setLatLng(layer.getLatLng());
	insertPopup.openOn(map);
	
	drawnItems.addLayer(layer);
	addedFromXYInput = false;
});

function saveAttrib() {
	var nom_fr = $('#nom_fr').val();
	var nom_ar = $('#nom_ar').val();
	
	var drawings = drawnItems.getLayers(); //drawnItems is a container for the drawn objects
	
	var len = drawings.length - 1;
	
	if (!drawings[len].feature) {
		var obj = {type: "Feature", properties: {nom_ar: "", nom_fr: ""}, geometry: {coordinates: [], type: "Point"}};
		obj.geometry.coordinates[0] = tempLngLat[0];
		obj.geometry.coordinates[1] = tempLngLat[1];
		
		Object.assign(drawings[len], {feature: obj});
	}
	drawings[len].feature.properties.nom_fr = nom_fr;
	drawings[len].feature.properties.nom_ar = nom_ar;
	
	map.closePopup();
}

var customControl =  L.Control.extend({
	options: {
		position: 'topleft'
	},

	onAdd: function (map) {
		var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
		container.setAttribute('id','lngLatControl');
		
		container.style.backgroundColor = 'white';     
		container.style.backgroundImage = "url(libs/images/winds-star.png)";
		container.style.backgroundSize = "30px 30px";
		container.style.width = '30px';
		container.style.height = '30px';
		container.style.visibility = "hidden";

		container.onclick = function(){
			document.getElementById('longInput').value = "";
			document.getElementById('latInput').value = "";
		}
		return container;
	}
});

map.addControl(new customControl());

$(document).on("click", "#lngLatControl", function(e) {
	var elem = document.getElementById('formLongLat');
	if (elem.style.visibility=='visible') {
		elem.style.visibility = 'hidden';
	}else {
		document.getElementById('longInput').value = "";
		document.getElementById('latInput').value = "";
		elem.style.visibility = 'visible';
	}
});

//	10.18						36.36
var marker = L.marker([36.36, 10.18]);
$(document).on("click", "#okButton", function(e) {
	addedFromXYInput = true;
	
	var lng = $('#longInput').val();
	var lat = $('#latInput').val();
	
	tempLngLat = [lng, lat];
	
	var latLng = new L.LatLng(lat, lng);
	map.panTo(latLng);
	marker.setLatLng(latLng);
	
	var insertPopup = L.popup();
	var content = '<span><b>Nom Fr :</b></span><br/><input id="nom_fr" type="text"/><br/><br/><span><b>Nom Ar :<b/></span><br/><input id="nom_ar" type="text"/><br/><br/><input type="button" id="okBtn" value="Save" onclick="saveAttrib()"/>';
	insertPopup.setContent(content);
	insertPopup.setLatLng(latLng);
	marker.bindPopup(content);
	insertPopup.openOn(map);
	
	var tmpLayer = new L.Marker(latLng);
	
	drawnItems.addLayer(tmpLayer);
});

// Add Watermark logo NA
L.Control.Watermark = L.Control.extend({
	onAdd: function(map) {
		var img = L.DomUtil.create('img');

		img.src = 'libs/images/Leaflet_logo.png';
		img.style.width = '200px';

		return img;
	}
});

L.control.watermark = function(opts) {
	return new L.Control.Watermark(opts);
}

L.control.watermark({ position: 'bottomleft' }).addTo(map);


// on click, clear all layers
$(document).on("click", "#delete", function(e) {
	drawnItems.clearLayers();
});

//Export button 
$(document).on("click", "#export", function(e) {
	var data = drawnItems.toGeoJSON();

	var convertedData = 'text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data));

	document.getElementById('export').setAttribute('href', 'data:' + convertedData);
	document.getElementById('export').setAttribute('download','data.geojson');
});