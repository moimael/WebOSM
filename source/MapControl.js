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
		this.map = new L.Map(this.hasNode(), {zoomControl : false});

		// create a CloudMade tile layer (or use other provider of your choice)
		var cloudmade = new L.TileLayer('http://{s}.tile.cloudmade.com/' + this.credentials + '/997/256/{z}/{x}/{y}.png', {
			maxZoom: 18
		});
		
//		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',

		// add the CloudMade layer to the map set the view to a given center and zoom
		this.map.addLayer(cloudmade).setView(new L.LatLng(51.505, -0.09), 3);
		
		var marker;
		var circle;
		map = this.map;
		this.map.on('locationfound', function(e) {
			if (typeof marker == 'undefined' && typeof circle == 'undefined'){
				var radius = e.accuracy / 2;
				marker = new L.Marker(e.latlng);
				map.addLayer(marker);
				marker.bindPopup("You are within " + radius + " meters from this point").openPopup();

				circle = new L.Circle(e.latlng, radius);
				map.addLayer(circle);
			}
		});
		this.map.on('locationerror', function(e) {
			enyo.windows.addBannerMessage("Unable to find your location", '{}');
		});
	},
	
	hasMap: function() {
		return this.map;
	},
});
