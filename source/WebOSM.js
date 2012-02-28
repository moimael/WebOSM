enyo.kind({
	name: "WebOSM",
	kind: "enyo.VFlexBox",
	components: [
		{kind: "enyo.AppMenu", components: [
			{caption: "About", onclick: "showAboutDialog"}
		]},
		{kind: "enyo.Toolbar", layoutKind: "enyo.HFlexLayout", components: [
			{flex: 1, kind: "enyo.ToolSearchInput", name : "searchInput", onkeypress: "doSearch"},
			{icon: "images/menu-icon-forward.png", onclick: "showToaster"}
		]},
		{flex: 1, kind: "enyo.Pane", components: [
			{kind: "WebOSM.MapControl", name: "map"}
		]},
		
		{kind: "Toaster", flyInFrom: "right", style: "width: 320px; top: 56px; bottom: 0;", className: "enyo-bg", components: [
			{kind: "VFlexBox", height: "100%", components: [
				{content: "Are you sure?"},
				{name: "rightPane", kind: "Pane", flex: 1, components: [
				]},
				{kind: "Toolbar", align: "center", components: [
					{name: "dragHandle", kind: "GrabButton", onclick: "close"}
				]}
			]}
		]},
		
		{name: "getLocation", kind: "enyo.WebService", onSuccess: "gotLocation", onFailure: "gotLocationFailure"}
	],
	
	showToaster: function() {
    this.$.toaster.open();
},
	
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
