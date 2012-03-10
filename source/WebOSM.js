enyo.kind({
	name: "WebOSM",
	kind: "enyo.VFlexBox",
	components: [
		{kind: "enyo.ApplicationEvents", onLoad: "showLocation"},
		{kind: "enyo.AppMenu", components: [
			{kind: "enyo.EditMenu"},
			{caption: $L("About"), onclick: "showAboutDialog"}
		]},
		{kind: "enyo.Toolbar", layoutKind: "enyo.HFlexLayout", components: [
			{name: "searchType", kind: "enyo.RadioToolButtonGroup", onChange: "searchTypeChanged",
				components: [
					{kind: "enyo.RadioToolButton", icon: "images/topbar-search-icon.png", className: "enyo-grouped-toolbutton-dark"},
					{kind: "enyo.RadioToolButton", icon: "images/topbar-direct-icon.png", className: "enyo-grouped-toolbutton-dark"}
				]
			},
			{icon: "images/menu-icon-mylocation.png", onclick: "showLocation"},
			{name: "searchInput", kind: "enyo.ToolSearchInput", flex: 1, onkeypress: "searchInputKeypress"},
			{name: "startPointInput", kind: "enyo.ToolInput", flex: 4, hint: $L("Start point"), showing: false},
			{name: "switchInputIcon", icon: "images/menu-icon-swap.png", onclick: "switchInputsContent", showing: false},
			{name: "endPointInput", kind: "enyo.ToolInput", flex: 4, hint: $L("End point"), showing: false},
			{name: "routingOkButton", kind: "enyo.ActivityButton", flex: 1, className: "enyo-button-blue", caption: "OK", showing: false, onclick: "doRouting"},
			{icon: "images/menu-icon-info.png", onclick: "showBaseTileMenu"}
		]},
		
		{name: "baseTileMenu", kind: "enyo.Menu", defaultKind: "MenuCheckItem", components: [
			{name: "roadTileMenuItem", caption: $L("Road"), icon: "images/map-type-road.png", value: "0", checked: true, onclick: "changeBaseTile"},
			{name: "satelliteTileMenuItem", caption: $L("Satellite"), icon: "images/map-type-satellite.png", value: "1", onclick: "changeBaseTile"}
		]},
		
		{flex: 1, kind: "enyo.Pane", components: [
			{name: "map", kind: "WebOSM.MapControl", credentials: "8c92938a1540489f822ce0ade39e7acc"}
		]},
		
		{kind: "enyo.Toaster", flyInFrom: "right", style: "width: 320px; top: 56px; bottom: 0;", className: "enyo-bg", components: [
			{kind: "enyo.VFlexBox", height: "100%", components: [
				{kind: "enyo.Toolbar", layoutKind: "enyo.HFlexLayout", components: [
				]},
				{name: "rightPane", kind: "enyo.Pane", flex: 1, components: [
				]},
				{kind: "enyo.Toolbar", align: "center", components: [
					{name: "dragHandle", kind: "enyo.GrabButton", onclick: "close"}
				]}
			]}
		]},
		
		{name: "getLocation", kind: "enyo.WebService", onSuccess: "gotLocation", onFailure: "gotLocationFailure"},
		{name: "getLocationStart", kind: "enyo.WebService", onSuccess: "gotLocationStart", onFailure: "gotLocationStartFailure"},
		{name: "getLocationEnd", kind: "enyo.WebService", onSuccess: "gotLocationEnd", onFailure: "gotLocationEndFailure"},
		{name: "getRouting", kind: "enyo.WebService", onSuccess: "gotRouting", onFailure: "gotRoutingFailure"},
		{name: "aboutDialog", kind: "WebOSM.AboutDialog"}
	],
	
	create: function() {
		this.inherited(arguments);
		var currentLocale = new enyo.g11n.currentLocale();
		this.localeLanguage = currentLocale.getLanguage();
		this.locations = [];
	},
	
	searchTypeChanged: function(inSender) {
		if(inSender.getValue() == 0){
			this.$.startPointInput.hide();
			this.$.switchInputIcon.hide();
			this.$.endPointInput.hide();
			this.$.routingOkButton.hide();
			this.$.searchInput.show();
		}
		else {
			this.$.startPointInput.show();
			this.$.switchInputIcon.show();
			this.$.endPointInput.show();
			this.$.routingOkButton.show();
			this.$.searchInput.hide();
		}
	},
	
	switchInputsContent: function(){
		var tmp = this.$.endPointInput.getValue();
		this.$.endPointInput.setValue(this.$.startPointInput.getValue());
		this.$.startPointInput.setValue(tmp);
		
	},
	
	showToaster: function() {
		this.$.toaster.open();
	},
	
	showBaseTileMenu: function(inSender) {
		this.$.baseTileMenu.openAroundControl(inSender);
	},
	
	changeBaseTile: function(inSender) {
		if (inSender.getValue() == 0){
			inSender.setChecked(true);
			this.$.satelliteTileMenuItem.setChecked(false);
			this.$.map.setMapType("road");
		}
		else{
			inSender.setChecked(true);
			this.$.roadTileMenuItem.setChecked(false);
			this.$.map.setMapType("satellite");
			if(this.$.map.hasMap().getZoom() > 11){
				this.$.map.hasMap().setZoom(11);
			}
		}
	},

	searchInputKeypress: function(inSender, inEvent) {
		if (inEvent.keyCode == 13) {
			this.doSearch();
		}
	},

	doSearch: function(){
			this.$.map.clearAll();
			var location = this.$.searchInput.getValue();
			if (location){
				this.findLocation(location);
				return;
			}
	},
	
	findLocation: function(location) {
 		this.$.getLocation.setUrl("http://where.yahooapis.com/geocode?location=" + location + "&flags=J&appid=fTGKVi5e");
		this.$.getLocation.call();
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
		this.$.map.hasLayers().addLayer(marker);
		marker.bindPopup("<b>" + city + ", " + county + "<br/>" + state + ", " + country + "</b>").openPopup();
		
		if(this.$.map.getMapType() == "road"){
			this.$.map.hasMap().setView(markerLocation, 16);
		}
		else{
			this.$.map.hasMap().setView(markerLocation, 11);
		}
	},
	
	gotLocationStart: function(inSender, inResponse, inRequest) {
		this.results = inResponse.ResultSet.Results;
		var latlng = new L.LatLng(this.results[0].latitude, this.results[0].longitude);
		this.locations.push(latlng);
		this.test();
	},
	
	gotLocationEnd: function(inSender, inResponse, inRequest) {
		this.results = inResponse.ResultSet.Results;
		var latlng = new L.LatLng(this.results[0].latitude, this.results[0].longitude);
		this.locations.push(latlng);
		this.test();
	},
	
	gotRouting: function(inSender, inResponse, inRequest) {
		this.results = inResponse.route_geometry;
		var latlngs = [];
		var test = [];
		for(i = 0; i < this.results.length - 1; i++){
			test.push(new L.LatLng(this.results[i]['0'], this.results[i]['1']));
			test.push(new L.LatLng(this.results[i+1]['0'], this.results[i+1]['1']));
			latlngs.push(test);
			test = [];
		}

		// create a blue MultiPolyline from an arrays of LatLng points
		var mpolyline = new L.MultiPolyline(latlngs);
		
		// zoom the map to the MultiPolyline
		this.$.map.hasMap().fitBounds(new L.LatLngBounds(latlngs['0']['0'], latlngs[latlngs.length - 1]['0']));
		
		// add the polyline to the map
		this.$.map.hasLayers().addLayer(mpolyline);
		this.$.routingOkButton.setActive(false);
		this.$.routingOkButton.setDisabled(false);
	},
	
	showLocation: function() {
		this.$.map.hasMap().locate({setView: true, maxZoom: 16});
	},
	
	showAboutDialog: function() {
		this.$.aboutDialog.showDialog();
	},
	
	doRouting: function() {
		this.$.routingOkButton.setActive(true);
		this.$.routingOkButton.setDisabled(true);
//		this.$.map.clearAll();
		var startPoint = this.$.startPointInput.getValue();
		var endPoint = this.$.endPointInput.getValue();
		
		if(startPoint && endPoint){
			this.$.getLocationStart.setUrl("http://where.yahooapis.com/geocode?location=" + startPoint + "&flags=J&appid=fTGKVi5e");
			this.$.getLocationStart.call();
			this.$.getLocationEnd.setUrl("http://where.yahooapis.com/geocode?location=" + endPoint + "&flags=J&appid=fTGKVi5e");
			this.$.getLocationEnd.call();
		}
	},
	
	test: function(){
		if(this.locations.length == 2){
			this.$.getRouting.setUrl("http://routes.cloudmade.com/8c92938a1540489f822ce0ade39e7acc/api/0.3/" + this.locations[0].lat + "," + this.locations[0].lng + "," + this.locations[1].lat + "," + this.locations[1].lng + "/car.js?lang=" + this.localeLanguage + "&units=km");
			this.$.getRouting.call();
			this.locations = [];
		}
	}
});
