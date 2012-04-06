enyo.kind({
	name: "WebOSM.Search",
	kind: "enyo.Component",
	published: {
		credentials: ""
	},
	events: {
		onSearchSuccess: ""
	},
	components: [
		{name: "getLocation", kind: "enyo.WebService", onSuccess: "gotLocation", onFailure: "gotLocationFailure"}
	],
	
	create: function() {
		this.inherited(arguments);
	},
	
	findLocation: function(location) {
		this.$.getLocation.setUrl("http://where.yahooapis.com/geocode?location=" + location + "&flags=J&appid=" + this.credentials);
		this.$.getLocation.call();
	},
	
	gotLocation: function(inSender, inResponse, inRequest) {
		var results = inResponse.ResultSet.Results;

		var locationProperties = {
			lat: results[0].latitude,
			lng: results[0].longitude,
			city: results[0].city,
			country: results[0].country,
			county: results[0].county,
			countycode: results[0].countycode,
			state: results[0].state,
			uzip: results[0].uzip
		};
		
		this.doSearchSuccess(locationProperties);
	}
});
