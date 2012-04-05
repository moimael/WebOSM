enyo.kind({
	name: "WebOSM",
	kind: "enyo.VFlexBox",
	components: [
		{kind: "enyo.ApplicationEvents", onUnload: "disconnectGPS"},
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
			{name: "map", kind: "WebOSM.MapControl", credentials: "8c92938a1540489f822ce0ade39e7acc", onLocationFound: "gotWiFiLocation", onLocationError: "gotWiFiLocationFailure"}
		]},
		{name: "routeInstructions", kind: "WebOSM.RouteInstructions", style: "width: 320px; top: 56px; bottom: 0;", flyInFrom: "right"},
		{name: "bluetoothGPS", kind: "WebOSM.SPPGPS", onGPSDeviceNotFound: "showLocation", onGPSDataReceived: "gotGPSData"},
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
	
	/******************
	** User location **
	*******************/
	
	/* Bluetooth */
	
	gotGPSData: function(inSender, inData){
		
		this.$.map.clearAll();
		
		var position = new L.LatLng(inData.lat, inData.lng);
		
		var marker = new L.Marker(position);
		this.$.map.hasLayers().addLayer(marker);
		marker.bindPopup($L("You are here !")).openPopup();
		
		this.$.map.hasMap().setView(position, 16);
	},
	
	disconnectGPS: function() {
		/*
		** Disconnect SPP Device
		** Called when application is dismissed/closed
		** make sure to disconnect from the SPP SERVICE!
		*/
		this.$.bluetoothGPS.disconnectSPP();
	},
	
	/* WiFi */
	
	showLocation: function() {
		this.$.map.hasMap().locate({setView: true, maxZoom: 16});
	},
	
	gotWiFiLocation: function(inSender, inResponse){
		this.log(inSender + " : " + inResponse);
		var radius = e.accuracy / 2;
		var marker = new L.Marker(e.latlng);
		this.$.map.hasLayers().addLayer(marker);
		marker.bindPopup($L("You are within ") + radius + $L(" meters from this point")).openPopup();

		var circle = new L.Circle(e.latlng, radius);
		this.$.map.hasLayers().addLayer(circle);
	},
	
	gotWiFiLocationFailure: function() {
		enyo.windows.addBannerMessage($L("Unable to find your location"), '{}');
	},
	
	/*******************
	** User interface **
	*******************/
	
	
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
		this.$.routeInstructions.setInstructionsList(this.instructions);
		this.$.routeInstructions.open();
		this.$.routeInstructions.setupView();
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
		this.path = inResponse.route_geometry;
		this.instructions = inResponse.route_instructions;
		
		var latlngs = [];
		var i;
		
		for(i = 0; i < this.path.length; i++){
			latlngs.push(new L.LatLng(this.path[i]['0'], this.path[i]['1']));
		}

		// create a blue MultiPolyline from an arrays of LatLng points
		var polyline = new L.Polyline(latlngs);
		
		var startMarker = new L.Marker(latlngs[0], {icon: new L.Icon.Default({iconUrl: 'images/marker-a.png'})});
		var endMarker = new L.Marker(latlngs[latlngs.length - 1], {icon: new L.Icon.Default({iconUrl:'images/marker-b.png'})});
		this.$.map.hasLayers().addLayer(startMarker).addLayer(endMarker);
		
		// zoom the map to the MultiPolyline
		this.$.map.hasMap().fitBounds(polyline.getBounds());
		
		// add the polyline to the map
		this.$.map.hasLayers().addLayer(polyline);
		this.$.routingOkButton.setActive(false);
		this.$.routingOkButton.setDisabled(false);
		
		this.showToaster();
	},
	
	showAboutDialog: function() {
		this.$.aboutDialog.showDialog();
	},
	
	doRouting: function() {
		var startPoint = this.$.startPointInput.getValue();
		var endPoint = this.$.endPointInput.getValue();
		
		if(startPoint && endPoint){
			this.$.routingOkButton.setActive(true);
			this.$.routingOkButton.setDisabled(true);
			this.$.map.clearAll();
		
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
