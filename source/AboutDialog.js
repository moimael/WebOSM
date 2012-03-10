enyo.kind({
	name: "WebOSM.AboutDialog",
	kind: "enyo.ModalDialog",
	caption: "WebOSM",
	components: [
		{name: "content", kind: "HtmlContent", allowHtml: true, content: $L("WebOSM is distributed under the terms of <a href=\"http://www.gnu.org/licenses/gpl.html\">GPLv3</a> license.<br/>Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>.<br/>Imagery © <a href=\"http://cloudmade.com\">CloudMade</a>.<br/>Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency.<br/>OpenAerials Tiles Courtesy of <a href=\"http://www.mapquest.com/\">MapQuest</a>.<br/>Leaflet is distributed under the terms of BSD license.<br/>Some images are distributed under the terms of Apache license.<br/>Copyright © 2012 Maël Lavault<br/><br/>"),
		onLinkClick: "linkClicked", style: "padding-left: 10px"},
		// Generic palm service to use for call to application manager
		{name: "AppManService", kind: "PalmService", service: "palm://com.palm.applicationManager/", method: "open"},
		{layoutKind: "VFlexLayout", pack: "center", components: [
			{kind: "Button", caption: $L("Project website"), onclick: "confirmClick"},
			{kind: "Button", caption: $L("Close"), onclick: "cancelClick"}
		]}
	],
	
	showDialog: function() {
		this.openAtCenter();
	},
	
	confirmClick: function() {
		// process confirmation
		this.doConfirm();
		// then close dialog
		this.close();
	},
	
	cancelClick: function() {
		this.close();
	},
	
	doConfirm: function() {
		// confirm things
		var projectWebsiteURL = "https://github.com/moimael/WebOSM";
		this.$.AppManService.call({target: projectWebsiteURL});
	},

	linkClicked: function (inSender, inUrl, inEvent) {
		this.$.AppManService.call({target: inUrl});
	}
});

