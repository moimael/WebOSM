enyo.kind({
	name: "WebOSM.MapControl", 
	kind: "enyo.Control",
	nodeTag: "div",
	published: {
		map: this.map
	},
	create: function() {
		this.inherited(arguments);
	},

	rendered: function() {
		this.map = new L.Map('webOSM_map', {zoomControl : false});
		this.setMap(this.map);
		// create a CloudMade tile layer (or use other provider of your choice)
		var cloudmade = new L.TileLayer('http://{s}.tile.cloudmade.com/8c92938a1540489f822ce0ade39e7acc/997/256/{z}/{x}/{y}.png', {
			maxZoom: 18
		});
		
//		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
		
		this.map.on('locationfound', function(e) {
		
		var radius = e.accuracy / 2;

		var marker = new L.Marker(e.latlng);
		this.map.addLayer(marker);
		marker.bindPopup("You are within " + radius + " meters from this point").openPopup();

		var circle = new L.Circle(e.latlng, radius);
		this.map.addLayer(circle);
		});
		
		this.map.on('locationerror', function(e) { 
		alert(e.message);
		});
		
		this.map.locateAndSetView(16);
	
		// add the CloudMade layer to the map set the view to a given center and zoom
		this.map.addLayer(cloudmade).setView(new L.LatLng(51.505, -0.09), 13);
	}
});
