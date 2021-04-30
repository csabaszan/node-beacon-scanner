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
	
	return this.parseManu(manu)
};

BeaconParserRuuvi.prototype.parseManu = function(manu) {
	var accelerometer = this.parseAcc(manu);
	
	
	return {
		dataf: manu.readInt8(2),
		temp: manu.readInt16BE(3) * 0.005,
		humidity: manu.readUInt16BE(5) * 0.0025,
		pressure: manu.readUInt16BE(7) - 50000,
		accelerometer: accelerometer,
		mv_count: manu.readUInt8(17),
		m_seq_count: manu.readUInt16BE(18), 
		mac: manu.slice(20,26).toString('hex'),
	}
}


BeaconParserRuuvi.prototype.parseAcc = function(manu) {
    let x = manu.readInt16BE(9) / 1000.0;
    let y = manu.readInt16BE(11) / 1000.0;
    let z = manu.readInt16BE(13) / 1000.0;
	
	return {
		x: x,
		y: y,
		z: z
	}
}


module.exports = new BeaconParserRuuvi();