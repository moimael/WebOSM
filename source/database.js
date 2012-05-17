/*
 * Main Database file. 
 */
enyo.kind({
	name: "WebOSM.Database",
	/* ctor */
	dbname: "OSMBrightSLValley.mbtiles",
	create: function() {
		this.inherited(arguments);
		this.plugin = undefined;
		this.db = null;
	},
	/*
	 * open the database
	 */
	openDatabase : function() {
		if (this.db != null && this.db['open'] == 1) {
			return;
		}

		var f = (function(dbname) {
			console.log(dbname);
			var ret = this.plugin.callPluginMethod("openDatabase", dbname);
			var json = enyo.json.parse(ret);
			console.log("openDatabase: " + enyo.json.stringify(json));
			this.db = json;	
		}).bind(this);
		f(this.dbname);
	},

	closeDbIfOpen: function() {
		if (this.db != null && this.db['open'] == 1) {
			var ret = this.plugin.callPluginMethod("closeDatabase", this.dbname);
			var json = enyo.json.parse(ret);
			this.db = null;
		}
	},
	
	selectItems : function(onCompletedCallback) {
		var callback = function() {
			var ret = this.plugin.callPluginMethod("executeSql", this.dbname, "select content from foo");
			console.log("selectItems: " + ret);
			var json = enyo.json.parse(ret);
			var rows = [];
			for (var i = 0; i < json.rows.length; i++) {
				rows[i] = json.rows[i];
			}
			onCompletedCallback(rows);
		};
		this.openDatabase(callback.bind(this));
	}
});
