/* ------------------------------------------------------------------
* node-beacon-scanner - parser-eddystone.js
*
* Copyright (c) 2017-2018, Futomi Hatano, All rights reserved.
* Released under the MIT license
* Date: 2018-07-14
* ---------------------------------------------------------------- */
'use strict';

/*
{
  localName: 'P MOV B00924',
  shortName: undefined,
  txPowerLevel: undefined,
  manufacturerData: undefined,
  serviceData: [ { uuid: '2aa1', data: <Buffer e9 ff fd ff f4 03> } ],
  serviceUuids: [],
  solicitationServiceUuids: [],
  rssi: -78,
  macAddress: 'c6:92:6c:dd:31:2d',
  addressType: undefined
}
*/

/* ------------------------------------------------------------------
* Constructor: BeaconParserBlukii()
* ---------------------------------------------------------------- */
const BeaconParserBluePuck = function() {
	// Private properties
	//this._EDDYSTONE_SERVICE_UUID = 'feaa';
};

var macAddress = "";

/* ------------------------------------------------------------------
* Method: parse(peripheral)
* - peripheral: `Peripheral` object of the noble
* ---------------------------------------------------------------- */
BeaconParserBluePuck.prototype.parse = function(peripheral) {
	let ad = peripheral.advertisement;
	let serv = ad.serviceData[0];
	macAddress = ad.macAddress;
	
	return this.parseServ(serv["data"])
};

//a1 03 5e 00 33 ff f4 00 fa 00 5a a5 3f 23 ac

BeaconParserBluePuck.prototype.parseServ = function(serv) {
    var accelerometer = this.parseAcc(serv);

	return {
		accelerometer: accelerometer,
		macAddress: macAddress
		//battery: serv.readInt8(2),
		//mac: serv.slice(9,15).toString('hex').match(/.{2}/g).reverse().join("")
	}
}

BeaconParserBluePuck.prototype.parseAcc = function(serv) {
    let x = serv.readInt16LE(0) / 1000.0;
    let y = serv.readInt16LE(2) / 1000.0;
    let z = serv.readInt16LE(4) / 1000.0;
	
	return {
		x: x,
		y: y,
		z: z
	}
}


module.exports = new BeaconParserBluePuck();