enyo.kind({
	name: "WebOSM.MapControl", 
	kind: "enyo.Control",
	nodeTag: "div",
	published: {
		map: null
	},
	create: function() {
		this.inherited(arguments);
	},

	rendered: function() {
		map = new L.Map('webOSM_map', {zoomControl : false});
		this.setMap(map);
		// create a CloudMade tile layer (or use other provider of your choice)
		var cloudmade = new L.TileLayer('http://{s}.tile.cloudmade.com/8c92938a1540489f822ce0ade39e7acc/997/256/{z}/{x}/{y}.png', {
			maxZoom: 18
		});
		
//		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',

		// add the CloudMade layer to the map set the view to a given center and zoom
		map.addLayer(cloudmade);
		
		map.on('locationfound', function(e) {
			var radius = e.accuracy / 2;

			var marker = new L.Marker(e.latlng);
			map.addLayer(marker);
			marker.bindPopup("You are within " + radius + " meters from this point").openPopup();

			var circle = new L.Circle(e.latlng, radius);
			map.addLayer(circle);
		});
		
		map.on('locationerror', function(e) { 
			alert(e.message);
		});
		
		map.locateAndSetView(16);
	}
});
