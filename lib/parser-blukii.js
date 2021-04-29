/* ------------------------------------------------------------------
* node-beacon-scanner - parser-eddystone.js
*
* Copyright (c) 2017-2018, Futomi Hatano, All rights reserved.
* Released under the MIT license
* Date: 2018-07-14
* ---------------------------------------------------------------- */
'use strict';

/* ------------------------------------------------------------------
* Constructor: BeaconParserBlukii()
* ---------------------------------------------------------------- */
const BeaconParserBlukii = function() {
	// Private properties
	//this._EDDYSTONE_SERVICE_UUID = 'feaa';
};

/* ------------------------------------------------------------------
* Method: parse(peripheral)
* - peripheral: `Peripheral` object of the noble
* ---------------------------------------------------------------- */
BeaconParserBlukii.prototype.parse = function(peripheral) {
	let ad = peripheral.advertisement;
	let manu = ad.manufacturerData;
	
	//check it here
	//var b = Buffer.from("0512FC5394C37C0004FFFC040CAC364200CDCBB8334C884F", "hex")
	//console.log(this.parseMac(b))
	//https://github.com/ruuvi/ruuvi-sensor-protocols/blob/master/dataformat_05.md
	
	return this.parseManu(manu)
};

//4f 02 02 cc 78 ab 5e 75 bd 04 03 09 64 0a 20 02 ff d8 ff dc fc 5f

BeaconParserBlukii.prototype.parseManu = function(manu) {
    var magnetometer = {};
    var environment = {};
    var accelerometer = {};
	
	if ((manu[14] & 0x30) == 0x30) {
        magnetometer = this.parseMagneto(manu);
    } else if ((manu[14] & 0x10) == 0x10) {
        environment = this.parseEnv(manu);
    } else if ((manu[14] & 0x20) == 0x20) {
        accelerometer = this.parseAcc(manu);
    }

	return {
		accelerometer: accelerometer,
		environment: environment,
		magnetometer: magnetometer,
		mac: manu.slice(3,9).toString('hex'),
	}
}

BeaconParserBlukii.prototype.parseAcc = function(manu) {
    let range = manu[15] & 0xFF;
    let x = manu.readInt16BE(16) * (range / 2);
    let y = manu.readInt16BE(18) * (range / 2);
    let z = manu.readInt16BE(20) * (range / 2);
	
	return {
		x: x,
		y: y,
		z: z
	}
}


BeaconParserBlukii.prototype.parseMagneto = function(manu) {
    let x = manu.readInt16BE(16);
    let y = manu.readInt16BE(18);
    let z = manu.readInt16BE(20);

	return {
		x: x,
		y: y,
		z: z
	}
}


BeaconParserBlukii.prototype.parseEnv = function(manu) {
    let pressure = manu.readInt16BE(15) / 10;
    let luminance = manu.readInt16BE(17);
    let humidity = manu[19] & 0xFF;
    let temperature = (manu[20] << 8 | manu[21] & 0xFF) / 256;
	
	return {
		presssure: pressure,
		luminance: luminance,
		humidity: humidity,
		temperature: temperature
	}
}


module.exports = new BeaconParserBlukii();