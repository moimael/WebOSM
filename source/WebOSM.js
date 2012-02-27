enyo.kind({
	name: "WebOSM",
	kind: "enyo.VFlexBox",
	components: [
		{kind: "enyo.AppMenu", components: [
			{caption: "About", onclick: "showAboutDialog"}
		]},
		{kind: "enyo.PageHeader", layoutKind: "enyo.HFlexLayout", className: "enyo-header-dark", components: [
			{flex: 1, kind: "enyo.RoundedSearchInput", name : "searchInput", onkeypress: "doSearch"},
		]},
		{flex: 1, kind: "enyo.Pane", components: [
			{kind: "WebOSM.MapControl", name: "map"}
		]},
		{name: "getLocation", kind: "enyo.WebService", onSuccess: "gotLocation", onFailure: "gotLocationFailure"}
	],
	
	doSearch: function(inSender, inEvent){
		var kc = inEvent.keyCode;
		if (kc == 13) {
			var location = this.$.searchInput.getValue();
			this.$.getLocation.setUrl("http://where.yahooapis.com/geocode?location=" + location + "&flags=J&appid=fTGKVi5e");
			this.$.getLocation.call();
			return;
		}
	},
	
	gotLocation: function(inSender, inResponse, inRequest) {
		this.results = inResponse;
		var latitude = this.results.ResultSet.Results[0].latitude;
		var longitude = this.results.ResultSet.Results[0].longitude;
		var city = this.results.ResultSet.Results[0].city;
		var country = this.results.ResultSet.Results[0].country;
		var county = this.results.ResultSet.Results[0].county;
		var countycode = this.results.ResultSet.Results[0].countycode;
		var state = this.results.ResultSet.Results[0].state;
		var uzip = this.results.ResultSet.Results[0].uzip;
		
		var markerLocation = new L.LatLng(latitude, longitude);
		var marker = new L.Marker(markerLocation);
		this.$.map.getMap().addLayer(marker).setView(markerLocation, 16);
		marker.bindPopup("<b>" + city + ", " + county + "<br/>" + state + ", " + country + "</b>").openPopup();
	}
});
