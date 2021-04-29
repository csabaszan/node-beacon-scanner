/* ------------------------------------------------------------------
* node-beacon-scanner - parser-eddystone.js
*
* Copyright (c) 2017-2018, Futomi Hatano, All rights reserved.
* Released under the MIT license
* Date: 2018-07-14
* ---------------------------------------------------------------- */
'use strict';

/* ------------------------------------------------------------------
* Constructor: BeaconParserRuuvi()
* ---------------------------------------------------------------- */
const BeaconParserRuuvi = function() {
	// Private properties
	//this._EDDYSTONE_SERVICE_UUID = 'feaa';
};

/* ------------------------------------------------------------------
* Method: parse(peripheral)
* - peripheral: `Peripheral` object of the noble
* ---------------------------------------------------------------- */
BeaconParserRuuvi.prototype.parse = function(peripheral) {
	let ad = peripheral.advertisement;
	let manu = ad.manufacturerData;
	
	//check it here
	//var b = Buffer.from("0512FC5394C37C0004FFFC040CAC364200CDCBB8334C884F", "hex")
	//console.log(this.parseMac(b))
	//https://github.com/ruuvi/ruuvi-sensor-protocols/blob/master/dataformat_05.md
	
	return this.parseMac(manu)
};

BeaconParserRuuvi.prototype.parseMac = function(manu) {
	return {
		dataf: manu.readInt8(2),
		temp: manu.readInt16BE(3) * 0.005,
		humidity: manu.readUInt16BE(5) * 0.0025,
		pressure: manu.readUInt16BE(7) - 50000,
		accX: manu.readInt16BE(9) / 1000.0,
		accY: manu.readInt16BE(11) / 1000.0, 
		accZ: manu.readInt16BE(13) / 1000.0,
		mv_count: manu.readUInt8(17),
		m_seq_count: manu.readUInt16BE(18), 
		mac: manu.slice(20,26).toString('hex'),
	}
}


module.exports = new BeaconParserRuuvi();