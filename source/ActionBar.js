enyo.kind({
	name: "WebOSM.ActionBar",
	kind: "enyo.Toolbar",
	events: {
		onSearchStarted: "",
		onRoutingStarted: "",
		onBaseTileChanged: "",
		onToggleToaster: "",
		onMyLocationRequested: ""
	},
	components: [
		{name: "searchType", kind: "enyo.RadioToolButtonGroup", onChange: "searchTypeChanged",
			components: [
				{kind: "enyo.RadioToolButton", icon: "images/topbar-search-icon.png", className: "enyo-grouped-toolbutton-dark"},
				{kind: "enyo.RadioToolButton", icon: "images/topbar-direct-icon.png", className: "enyo-grouped-toolbutton-dark"}
			]
		},
		{icon: "images/menu-icon-mylocation.png", onclick: "doMyLocationRequested"},
		{name: "searchInput", kind: "enyo.ToolSearchInput", flex: 1, onkeypress: "searchInputKeypress"},
		{name: "startPointInput", kind: "enyo.ToolInput", flex: 3, hint: $L("Start point"), showing: false},
		{name: "switchInputIcon", icon: "images/menu-icon-swap.png", onclick: "switchInputsContent", showing: false},
		{name: "endPointInput", kind: "enyo.ToolInput", flex: 3, hint: $L("End point"), showing: false},
		{name: "routingOkButton", kind: "enyo.ActivityButton", flex: 1, className: "enyo-button-blue", caption: "OK", showing: false, onclick: "routingOkClicked"},
		{icon: "images/menu-icon-info.png", onclick: "showBaseTileMenu"},
		{name: "baseTileMenu", kind: "enyo.Menu", defaultKind: "MenuCheckItem", components: [
			{name: "roadTileMenuItem", caption: $L("Road"), icon: "images/map-type-road.png", value: "0", checked: true, onclick: "changeBaseTile"},
			{name: "satelliteTileMenuItem", caption: $L("Satellite"), icon: "images/map-type-satellite.png", value: "1", onclick: "changeBaseTile"},
			{name: "offlineTileMenuItem", caption: $L("Offline"), icon: "images/.png", value: "2", onclick: "changeBaseTile"}
		]},
		{name: "routeInstructionsIcon", icon: "images/menu-icon-log.png", onclick: "doToggleToaster"}
	],
	
	create: function() {
		this.inherited(arguments);
	},
		
	searchTypeChanged: function(inSender) {
		if(inSender.getValue() === 0) {
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
		
	searchInputKeypress: function(inSender, inEvent) {
		if (inEvent.keyCode === 13) {
			this.doSearchStarted();
		}
	},
	
	routingOkClicked: function() {
		var startPoint = this.$.startPointInput.getValue();
		var endPoint = this.$.endPointInput.getValue();
		
		if(startPoint && endPoint) {
			this.$.routingOkButton.setActive(true);
			this.$.routingOkButton.setDisabled(true);
			this.doRoutingStarted();
		}
	},
	
	getSearchInputValue: function() {
		return this.$.searchInput.getValue();
	},
	
	getStartPointInputValue: function() {
		return this.$.startPointInput.getValue();
	},
	
	getEndPointInputValue: function() {
		return this.$.endPointInput.getValue();
	},
	
	getRoutingOkButton: function() {
		return this.$.routingOkButton;
	},
	
	switchInputsContent: function() {
		var tmp = this.$.endPointInput.getValue();
		this.$.endPointInput.setValue(this.$.startPointInput.getValue());
		this.$.startPointInput.setValue(tmp);
		
	},
	
	showBaseTileMenu: function(inSender) {
		this.$.baseTileMenu.openAroundControl(inSender);
	},
	
	changeBaseTile: function(inSender) {
		var mapType;
		if (inSender.getValue() === '0'){
			inSender.setChecked(true);
			this.$.satelliteTileMenuItem.setChecked(false);
			this.$.offlineTileMenuItem.setChecked(false);
			mapType = "road";
		}
		else if (inSender.getValue() === '1'){
			inSender.setChecked(true);
			this.$.offlineTileMenuItem.setChecked(false);
			this.$.roadTileMenuItem.setChecked(false);
			mapType = "satellite";
		}
		else {
			inSender.setChecked(true);
			this.$.satelliteTileMenuItem.setChecked(false);
			this.$.roadTileMenuItem.setChecked(false);
			mapType = "offline";
		}
		this.doBaseTileChanged(mapType);
	}
});
