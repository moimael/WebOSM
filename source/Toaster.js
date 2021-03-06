enyo.kind({
	name: "WebOSM.RouteInstructions",
	kind: "enyo.Toaster",
	published: {
		instructionsList: ""
	},
	components: [
			{name: "shadow", className: "enyo-sliding-view-shadow"},
			{kind: "enyo.VFlexBox", height: "100%", components: [
				{kind: "enyo.Toolbar", layoutKind: "enyo.HFlexLayout", components: [
				]},
				{name: "client", kind: "enyo.Scroller", flex: 1, className: "enyo-bg", components: [
					{name: "instructionsList", kind: "enyo.VirtualRepeater", flex: 1, onSetupRow: "setupRow", components: [
						{name: "instructionsItem", kind: "enyo.Item", layoutKind: "HFlexLayout", tapHighlight: true, components: [
							{name: "title", flex: 1}
//							{kind: "enyo.CheckBox", onChange: "checkboxClicked"},
//							{kind: "Spacer", flex: 1},
//							{kind: "enyo.VFlexBox", flex: 10, onclick: "episodeDetails", components: [
//								{name: "title", flex: 1},
//								{kind: "Spacer", flex: 1},
//								{name: "airDate", flex: 1}
//							]}
						]}
					]}
				]},
				{kind: "enyo.Toolbar", align: "center", components: [
					{name: "dragHandle", kind: "enyo.GrabButton", onclick: "close"}
//					{name: "routeType", kind: "enyo.RadioToolButtonGroup", onChange: "routeTypeChanged", components: [
//						{kind: "enyo.RadioToolButton", icon: "images/footer-button-icon-walking.png", className: "enyo-grouped-toolbutton-dark"},
//						{kind: "enyo.RadioToolButton", icon: "images/topbar-direct-icon.png", className: "enyo-grouped-toolbutton-dark"},
//						{kind: "enyo.RadioToolButton", icon: "images/footer-button-icon-car.png", className: "enyo-grouped-toolbutton-dark"}
//					]}
				]}
			]}
	],
	
	create: function() {
		this.inherited(arguments);
	},
	
	setupRow: function(inSender, inIndex) {
		if(this.instructionsList != []){
			if (inIndex < this.instructionsList.length) {
				this.$.title.setContent(this.instructionsList[inIndex][0]);
				return true;
			}
		}
	},
	
	toggleToaster: function() {
		
		if(this.showing){
			this.close();
			this.$.instructionsList.render();
		} else {
			this.open();
			this.$.instructionsList.render();
		}
	},
	
	showToaster: function() {
		
		this.open();
		this.$.instructionsList.render();
	},
	
	close: function() {
		this.inherited(arguments);
	}
});
