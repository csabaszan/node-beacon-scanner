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
	
	var dataf = manu.readInt8(2);
	
	if (manu[2] == 0xAC & manu[3] == 0x00) {
		var ret = {
			dataf: 0xAC,
			p2p_x: manu.readInt16BE(4),
			p2p_y: manu.readInt16BE(6),
			p2p_z: manu.readInt16BE(8),
			rms_x: manu.readInt16BE(10),
			rms_y: manu.readInt16BE(12),
			rms_z: manu.readInt16BE(14),
			std_x: manu.readInt16BE(16),
			std_y: manu.readInt16BE(18),
			std_z: manu.readInt16BE(20),
			battery: manu.readInt16BE(22),
			count: manu.readInt16BE(24),
		};
		return ret;
	}
	
	return {
		dataf: dataf,
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