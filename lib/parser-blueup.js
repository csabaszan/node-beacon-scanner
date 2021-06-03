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
localName: 'BlueUp-04-042197',
shortName: undefined,
txPowerLevel: undefined,
manufacturerData: undefined,
serviceData: [
{ uuid: '180f', data: <Buffer 64> },
{ uuid: '8800', data: <Buffer 48> }
],
serviceUuids: [],
solicitationServiceUuids: [],
rssi: -79,
macAddress: 'c4:fe:d8:08:4b:18',
addressType: undefined
}


{
	localName: undefined,
	shortName: undefined,
	txPowerLevel: undefined,
	manufacturerData: undefined,
	serviceData: [
		{
			uuid: '181a',
			data: <Buffer 6e 2a 00 00 6f 2a 00 00 6d 2a 00 00 00 00 ac ce 03 00 02 00 fc 00>
		}
	],
	serviceUuids: [],
	solicitationServiceUuids: [],
	rssi: -30,
	macAddress: 'c4:fe:d8:08:4b:18',
	addressType: undefined
}

*/

/* ------------------------------------------------------------------
* Constructor: BeaconParserBlukii()
* ---------------------------------------------------------------- */
const BeaconParserBlueUp = function() {
	// Private properties
	//this._EDDYSTONE_SERVICE_UUID = 'feaa';
};

var macAddress = "";

/* ------------------------------------------------------------------
* Method: parse(peripheral)
* - peripheral: `Peripheral` object of the noble
* ---------------------------------------------------------------- */
BeaconParserBlueUp.prototype.parse = function(peripheral) {
	let ad = peripheral.advertisement;
	let serv = ad.serviceData[0];
	macAddress = ad.macAddress;
	
	return this.parseServ(serv["data"])
};


BeaconParserBlueUp.prototype.parseServ = function(serv) {
    var accelerometer = this.parseAcc(serv);

	return {
		accelerometer: accelerometer,
		macAddress: macAddress
		//battery: serv.readInt8(2),
		//mac: serv.slice(9,15).toString('hex').match(/.{2}/g).reverse().join("")
	}
}

BeaconParserBlueUp.prototype.parseAcc = function(serv) {
    let x = serv.readInt16LE(16) / 256.0;
    let y = serv.readInt16LE(18) / 256.0;
    let z = serv.readInt16LE(20) / 256.0;
	
	return {
		x: x,
		y: y,
		z: z
	}
}


module.exports = new BeaconParserBlueUp();