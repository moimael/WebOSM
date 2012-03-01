enyo.kind({
	name: "WebOSM",
	kind: "enyo.VFlexBox",
	components: [
		{kind: "ApplicationEvents", onLoad: "showLocation"},
		{kind: "enyo.AppMenu", components: [
			{caption: "About", onclick: "showAboutDialog"}
		]},
		{kind: "enyo.Toolbar", layoutKind: "enyo.HFlexLayout", components: [
			{icon: "images/menu-icon-mylocation.png", onclick: "showLocation"},
			{flex: 1, kind: "enyo.ToolSearchInput", name : "searchInput", onkeypress: "doSearch"},
//			{kind: "RadioToolButtonGroup", name: "myGroup", onclick: "myGroupClick",
//      components: [
//          {kind: "RadioToolButton", className: "enyo-grouped-toolbutton-dark", icon: "images/facebook-32x32.png"},
//          {kind: "RadioToolButton", className: "enyo-grouped-toolbutton-dark", icon: "images/gmail-32x32.png"},
//          {kind: "RadioToolButton",className: "enyo-grouped-toolbutton-dark", icon: "images/yahoo-32x32.png"}
//      ]
//  }
		]},
		{flex: 1, kind: "enyo.Pane", components: [
			{kind: "WebOSM.MapControl", name: "map"}
		]},
		
		{kind: "Toaster", flyInFrom: "right", style: "width: 320px; top: 56px; bottom: 0;", className: "enyo-bg", components: [
			{kind: "VFlexBox", height: "100%", components: [
				{kind: "enyo.Toolbar", layoutKind: "enyo.HFlexLayout", components: [
				]},
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
		this.results = inResponse.ResultSet.Results;
		var latitude = this.results[0].latitude;
		var longitude = this.results[0].longitude;
		var city = this.results[0].city;
		var country = this.results[0].country;
		var county = this.results[0].county;
		var countycode = this.results[0].countycode;
		var state = this.results[0].state;
		var uzip = this.results[0].uzip;
		
		var markerLocation = new L.LatLng(latitude, longitude);
		var marker = new L.Marker(markerLocation);
		this.$.map.getMap().addLayer(marker);
		this.$.map.getMap().setView(markerLocation, 16);
		marker.bindPopup("<b>" + city + ", " + county + "<br/>" + state + ", " + country + "</b>").openPopup();
	},
	
	showLocation: function() {
		this.$.map.getMap().locateAndSetView(16);
	}
});
