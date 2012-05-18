enyo.kind({
	name: "WebOSM.Route",
	kind: "enyo.Component",
	published: {
		credentials: "",
		language: ""
	},
	events: {
		onRoutingSuccess: "",
		onRoutingFailure: ""
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
		if(this.locations.length === 2){
//			if(this.locations[0].type === "endPoint"){
//				this.locations.reverse();
//			}
			this.startRouting(this.locations[0], this.locations[1]);
			this.locations = [];
		}
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
	
	gotRoutingFailure: function(inSender, inResponse) {
		this.doRoutingFailure();
	},
	
	startRouting: function(startPoint, endPoint){
		this.$.getRouting.setUrl("http://routes.cloudmade.com/" + this.credentials + "/api/0.3/" + startPoint.lat + "," + startPoint.lng + "," + endPoint.lat + "," + endPoint.lng + "/car.js?lang=" + this.language + "&units=km");
		this.$.getRouting.call();
	}
});
