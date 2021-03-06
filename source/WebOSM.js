enyo.kind({
	name: "WebOSM",
	kind: "enyo.VFlexBox",
	components: [
		{kind: "enyo.ApplicationEvents", onUnload: "disconnectGPS"},
		{kind: "enyo.AppMenu", components: [
			{kind: "enyo.EditMenu"},
			{caption: $L("About"), onclick: "showAboutDialog"}
		]},
		{name: "actionBar", kind: "WebOSM.ActionBar", onRoutingStarted: "doRouting", onBaseTileChanged: "setMapType", onSearchStarted: "doSearch", onToggleToaster: "toggleToaster", onMyLocationRequested: "showLocation"},
		{flex: 1, kind: "enyo.Pane", components: [
			{name: "map", kind: "WebOSM.MapControl", credentials: "8c92938a1540489f822ce0ade39e7acc", onLocationFound: "gotWiFiLocation", onLocationError: "gotWiFiLocationFailure"}
		]},
		{name: "routeInstructions", kind: "WebOSM.RouteInstructions", style: "width: 320px; top: 56px; bottom: 0;", flyInFrom: "right"},
		{name: "bluetoothGPS", kind: "WebOSM.SPPGPS", onGPSDeviceNotFound: "showLocation", onGPSDataReceived: "gotGPSData"},
		{name: "routeData", kind: "WebOSM.Route", credentials: "8c92938a1540489f822ce0ade39e7acc", onRoutingSuccess: "drawRoute", onRoutingFailure: ""}, //TODO reactiver bouton ok sur failure
		{name: "searchData", kind: "WebOSM.Search", credentials: "fTGKVi5e", onSearchSuccess: "drawSearchMarker"},
		{name: "aboutDialog", kind: "WebOSM.AboutDialog"},
		{kind: enyo.Hybrid, name: "plugin", executable: "db", width: 0, height: 0, onPluginReady: "handlePluginReady"}
	],
	
	create: function() {
		this.inherited(arguments);
		var currentLocale = new enyo.g11n.currentLocale();
		this.localeLanguage = currentLocale.getLanguage();
		this.locations = [];
	},
	
	handlePluginReady: function() {
		this.dao = new WebOSM.Database();
		this.dao.plugin = this.$.plugin;
		this.dao.openDatabase();
//		this.dao = new WebOSM.Database();
//		this.dao.plugin = this.$.plugin;
//		this.dao.openDatabase();
//		this.$.map.db = this.dao;
//		this.dao.selectItems(function(rows) {
//			console.log("onItemCallback.onCompletedCallback: " + rows.length + rows);
//		});
	},
	
	/******************
	** User location **
	*******************/
	
	/* Bluetooth */
	
	gotGPSData: function(inSender, inData) {
		
		this.$.map.clearGPSLayer(); //TODO: Faire un layer special pour la localisation de l'utilisateur et n'effacer que ce layer et un layer pour les markers
		
		var position = new L.LatLng(inData.lat, inData.lng);
		
		var marker = new L.Marker(position);
		this.$.map.hasGPSLayers().addLayer(marker);
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
		this.$.map.clearAll(); //TODO: refléchir quoi effacer
		this.$.map.hasMap().locate({setView: true, maxZoom: 16});
	},
	
	gotWiFiLocation: function(inSender, inResponse) {
		this.log(inSender + " : " + inResponse);
		var radius = inResponse.accuracy / 2;
		var marker = new L.Marker(inResponse.latlng);
		this.$.map.hasLayers().addLayer(marker);
		marker.bindPopup($L("You are within ") + radius + $L(" meters from this point")).openPopup();

		var circle = new L.Circle(inResponse.latlng, radius);
		this.$.map.hasLayers().addLayer(circle);
	},
	
	gotWiFiLocationFailure: function() {
		enyo.windows.addBannerMessage($L("Unable to find your location"), '{}');
	},
	
	/*******************
	** User interface **
	*******************/
	
	setMapType: function(inSender, mapType) {
		this.$.map.setMapType(mapType);
		if(mapType === "satellite" && this.$.map.hasMap().getZoom() > 11) {
			this.$.map.hasMap().setZoom(11);
		}
		else if(mapType === "offline"){
			this.$.map.setDb(this.dao);
		}
	},
	
	doSearch: function() {
		this.$.map.clearAll();
		var location = this.$.actionBar.getSearchInputValue();
		if (location) {
			this.$.searchData.findLocation(location);
		}
	},
	
	drawSearchMarker: function(inSender, inResults) {
		var markerLocation = new L.LatLng(inResults.lat, inResults.lng);
		
		var marker = new L.Marker(markerLocation);
		this.$.map.hasLayers().addLayer(marker);
		marker.bindPopup("<b>" + inResults.city + ", " + inResults.county + "<br/>" + inResults.state + ", " + inResults.country + "</b>").openPopup();
		
		if(this.$.map.getMapType() === "road") {
			this.$.map.hasMap().setView(markerLocation, 16);
		}
		else {
			this.$.map.hasMap().setView(markerLocation, 11);
		}
	},
	
	drawRoute: function(inSender, latlngs, instructions) {
	
		// Create a blue Polyline from an arrays of LatLng points
		var polyline = new L.Polyline(latlngs);
		
		// Create two markers with custom icons for route startPoint and endPoint
		var startMarker = new L.Marker(latlngs[0], {
			icon: new L.Icon({
				iconUrl: 'images/marker-a.png', iconSize: new L.Point(25, 41),
				iconAnchor: new L.Point(13, 41),
				popupAnchor: new L.Point(0, -33),
				shadowSize: new L.Point(41, 41)
			})
		});
		
		var endMarker = new L.Marker(latlngs[latlngs.length - 1], {
			icon: new L.Icon({
				iconUrl: 'images/marker-b.png',
				iconSize: new L.Point(25, 41),
				iconAnchor: new L.Point(13, 41),
				popupAnchor: new L.Point(0, -33),
				shadowSize: new L.Point(41, 41)
			})
		});
		
		// Add the to markers on the map
		this.$.map.hasLayers().addLayer(startMarker).addLayer(endMarker);
		
		// Zoom the map to the Polyline
		this.$.map.hasMap().fitBounds(polyline.getBounds());
		
		// Add the polyline to the map
		this.$.map.hasLayers().addLayer(polyline);
		this.$.actionBar.getRoutingOkButton().setActive(false);
		this.$.actionBar.getRoutingOkButton().setDisabled(false);
		
		// Show route instruction in a sidebar popup
		this.$.routeInstructions.setInstructionsList(instructions);
		this.showToaster();
	},
	
	toggleToaster: function() {
		this.$.routeInstructions.toggleToaster();
	},
	
	showToaster: function() {
		this.$.routeInstructions.showToaster();
	},
	
	showAboutDialog: function() {
		this.$.aboutDialog.showDialog();
	},
	
	doRouting: function() {
		var startPoint = this.$.actionBar.getStartPointInputValue();
		var endPoint = this.$.actionBar.getEndPointInputValue();
		this.$.map.clearAll();
		this.$.routeData.setLanguage(this.localeLanguage);
		this.$.routeData.doRouting(startPoint, endPoint);
	}
});
