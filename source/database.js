/*
 * Main Database file. 
 */
enyo.kind({
	name: "WebOSM.Database",
	/* ctor */
	create: function() {
		this.inherited(arguments);
		this.plugin = undefined;
		this.dbname = "foobar.db";
		this.db = null;
	},
	/*
	 * open the database
	 */
	openDatabase : function(callback) {
		if (this.db != null && this.db['open'] == 1) {
			return;
		}

		var f = (function() {
			var ret = this.plugin.callPluginMethod("openDatabase", this.dbname);
			var json = enyo.json.parse(ret);
			console.log("openDatabase: " + json);
			this.db = json;	
			callback();
		}).bind(this);

		f();
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
			var rows = $A();
			for (var i = 0; i < json.rows.length; i++) {
				rows[i] = json.rows[i];
			}
			onCompletedCallback(rows);
		};
		this.openDatabase(callback.bind(this));
	}
});
