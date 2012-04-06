enyo.kind({
	name: "WebOSM.Route",
	kind: "enyo.Component",
	published: {
		credentials: "",
		language: ""
	},
	events: {
		onRoutingSuccess: ""
	},
	components: [
		{name: "getLocation", kind: "WebOSM.Search", onSearchSuccess: "gotLocation"},
		{name: "getRouting", kind: "enyo.WebService", onSuccess: "gotRouting", onFailure: "gotRoutingFailure"}
	],
	
	create: function() {
		this.inherited(arguments);
		this.locations = [];
	},
	
	doRouting: function(startPoint, endPoint) {
		this.$.getLocation.findLocation(startPoint);
		this.$.getLocation.findLocation(endPoint);
	},

	gotLocation: function(inSender, inResponse) {
		var latlng = new L.LatLng(inResponse.lat, inResponse.lng);
		this.locations.push(latlng);
		this.startRouting();
	},
	
	gotRouting: function(inSender, inResponse) {
		this.path = inResponse.route_geometry;
		this.instructions = inResponse.route_instructions;
		var latlngs = [];
		var i;
		for(i = 0; i < this.path.length; i++){
			latlngs.push(new L.LatLng(this.path[i]['0'], this.path[i]['1']));
		}
		this.doRoutingSuccess(latlngs, this.instructions);
	},
	
	startRouting: function(){
		if(this.locations.length == 2){
			this.$.getRouting.setUrl("http://routes.cloudmade.com/" + this.credentials + "/api/0.3/" + this.locations[0].lat + "," + this.locations[0].lng + "," + this.locations[1].lat + "," + this.locations[1].lng + "/car.js?lang=" + this.language + "&units=km");
			this.$.getRouting.call();
			this.locations = [];
		}
	}
});
