// inspired by: https://github.com/coomsie/topomap.co.nz/blob/master/Resources/leaflet/TileLayer.DB.js
L.TileLayer.MBTiles = L.TileLayer.extend({
	mbTilesDB: null,

	initialize: function(url, options, db) {
		this.mbTilesDB = db;

		L.Util.setOptions(this, options);
	},
	
	getTileUrl: function (tilePoint, zoom) {
		var z = this._getOffsetZoom(zoom);
		var x = tilePoint.x;
		var y = tilePoint.y;
		var base64Prefix = 'data:image/gif;base64,';

		var ret = this.mbTilesDB.plugin.callPluginMethod("executeSql", this.mbTilesDB.dbname, "SELECT tile_data FROM images INNER JOIN map ON images.tile_id = map.tile_id WHERE zoom_level = " + z + " AND tile_column = " + x + " AND tile_row = " + y);
		console.log(ret);
//		var json = enyo.json.parse(ret);
		return base64Prefix + ret.rows[0].tile_data;
	},
	
	_loadTile: function (tile, tilePoint, zoom) {
		tile._layer = this;
		tile.onload = this._tileOnLoad;
		tile.onerror = this._tileOnError;
		tile.src = this.getTileUrl(tilePoint, zoom);
	}
});
