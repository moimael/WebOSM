/*
A map control which is a wrapper around Leaflet map control.

To initialize a Map control:

	{name: "map", kind: "MapControl", credentials: "my_cloudmade_credentials"}
	
You can get a handle to the actual Leaflet map control uisng hasMap(), like this:

	var mapControl = this.$.map.hasMap();
	
*/

enyo.kind({
	name: "WebOSM.MapControl", 
	kind: "enyo.Control",
	published: {
		credentials: ""
	},
	create: function() {
		this.inherited(arguments);
	},

	rendered: function() {
		this.renderMap();
	},
	
	createMap: function(){
		this.map = new L.Map(this.hasNode(), {zoomControl : false});
		this.layerGroup = new L.LayerGroup();
	},
	
	destroyMap: function(){
		this.map = null;
	},
	
	renderMap: function() {
		this.destroyMap();
		try {
			this.createMap();
		} catch (e) {
//			this.doLoadFailure(e);
			return;
		}
		
		// create a CloudMade tile layer
		var cloudmade = new L.TileLayer('http://{s}.tile.cloudmade.com/' + this.credentials + '/997/256/{z}/{x}/{y}.png', {
			maxZoom: 18
		});

		// add the CloudMade layer to the map and set the view to a given center
		this.map.addLayer(cloudmade).setView(new L.LatLng(51.505, -0.09), 3);
		this.map.addLayer(this.layerGroup);
		this.connectEvents();
	},
	
	hasMap: function() {
		return this.map;
	},
	
	hasLayers: function() {
		return this.layerGroup;
	},
	
	clearAll: function() {
		this.layerGroup.clearLayers();
	},
	
	connectEvents: function() {
		this.map.on('locationfound', enyo.bind(this, "gotLocation"));
		this.map.on('locationerror', enyo.bind(this, "gotLocationError"));
	},
	
	gotLocationError: function(e) {
			enyo.windows.addBannerMessage($L("Unable to find your location"), '{}');
	},
	
	gotLocation: function(e) {
			if (typeof marker == 'undefined' && typeof circle == 'undefined'){
				var radius = e.accuracy / 2;
				var marker = new L.Marker(e.latlng);
				this.layerGroup.addLayer(marker);
				marker.bindPopup($L("You are within ") + radius + $L(" meters from this point")).openPopup();

				var circle = new L.Circle(e.latlng, radius);
				this.layerGroup.addLayer(circle);
			}
	}
});
