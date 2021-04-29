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
const BeaconParserMinew = function() {
	// Private properties
	//this._EDDYSTONE_SERVICE_UUID = 'feaa';
};

/* ------------------------------------------------------------------
* Method: parse(peripheral)
* - peripheral: `Peripheral` object of the noble
* ---------------------------------------------------------------- */
BeaconParserMinew.prototype.parse = function(peripheral) {
	let ad = peripheral.advertisement;
	let serv = ad.serviceData[0];
	
	return this.parseServ(serv["data"])
};

//4f 02 02 cc 78 ab 5e 75 bd 04 03 09 64 0a 20 02 ff d8 ff dc fc 5f

BeaconParserMinew.prototype.parseServ = function(serv) {
    var accelerometer = this.parseAcc(serv);

	return {
		accelerometer: accelerometer,
		battery: serv.readInt8(2),
		mac: serv.slice(9,15).toString('hex').match(/.{2}/g).reverse().join("")
	}
}

BeaconParserMinew.prototype.parseAcc = function(serv) {
    let x = serv.readInt16BE(3) / 256.0;
    let y = serv.readInt16BE(5) / 256.0;
    let z = serv.readInt16BE(7) / 256.0;
	
	return {
		x: x,
		y: y,
		z: z
	}
}


module.exports = new BeaconParserMinew();