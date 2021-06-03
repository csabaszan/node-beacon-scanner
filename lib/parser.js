/* ------------------------------------------------------------------
* node-beacon-scanner - parser.js
*
* Copyright (c) 2017-2018, Futomi Hatano, All rights reserved.
* Released under the MIT license
* Date: 2019-11-24
* ---------------------------------------------------------------- */
'use strict';

const mIbeacon = require('./parser-ibeacon.js');
const mEstimote = require('./parser-estimote.js');
const mEddystone = require('./parser-eddystone.js');
const mBlukii = require('./parser-blukii.js');
const mRuuvi = require('./parser-ruuvi.js');
const mMinew = require('./parser-minew.js');
const mBluePuck = require('./parser-bluepuck.js');
const mBlueUp = require('./parser-blueup.js');

/* ------------------------------------------------------------------
* Constructor: EstimoteAdvertising()
* ---------------------------------------------------------------- */
const BeaconParser = function () {
        // Private properties
        this._ESTIMOTE_TELEMETRY_SERVICE_UUID = 'fe9a';
        this._ESTIMOTE_COMPANY_ID = 0x015d;
        this._EDDYSTONE_SERVICE_UUID = 'feaa';
        this._RUUVI_COMPANY_ID = 0x0499;
		this._BLUKII_COMPANY_ID = 0x4f;
		this._MINEW_SERVICE_UUID = 'ffe1'
};

// beacon type ids
var ESTIMOTE_TELEMETRY_SERVICE_UUID = 'fe9a';
var ESTIMOTE_COMPANY_ID = 0x015d;
var EDDYSTONE_SERVICE_UUID = 'feaa';
var RUUVI_COMPANY_ID = 0x0499;
var BLUKII_COMPANY_ID = 0x4f;
var MINEW_SERVICE_UUID = 'ffe1';
var BLUEPUCK_SERVICE_UUID = '2aa1';
var BLUEUP_SERVICE_UUID = '181a';

const allowed = {
	iBeacon: false,
	eddystoneUid: false,
	eddystoneUrl: false,
	eddystoneTlm: false,
	eddystoneEid: false,
	estimoteTelemetry: false,
	estimoteNearable: false,
	ruuviTag: true,
	blukii: true,
	minewAcc: true,
	bluePuckAcc: true,
	blueUpAcc: true
} 

/* ------------------------------------------------------------------
* Method: parse(peripheral)
* - peripheral: `Peripheral` object of the noble
* ---------------------------------------------------------------- */
BeaconParser.prototype.parse = function (peripheral) {
        let ad = peripheral.advertisement;
        let res = {
                id: peripheral.id,
                address: peripheral.address,
                localName: ad.localName || null,
                txPowerLevel: ad.txPowerLevel || null,
                rssi: peripheral.rssi
        };
		
		
        let beacon_type = this._detectBeaconType(peripheral);
        res['beaconType'] = beacon_type;
        let parsed = null;
		
        if (!allowed[beacon_type]) {
        	return null
        }
		
		if (beacon_type === 'iBeacon') {
			parsed = mIbeacon.parse(peripheral);
        } else if (beacon_type === 'eddystoneUid') {
			parsed = mEddystone.parseUid(peripheral);
        } else if (beacon_type === 'eddystoneUrl') {
			parsed = mEddystone.parseUrl(peripheral);
        } else if (beacon_type === 'eddystoneTlm') {
			parsed = mEddystone.parseTlm(peripheral);
        } else if (beacon_type === 'eddystoneEid') {
			parsed = mEddystone.parseEid(peripheral);
			// Estimote
        } else if (beacon_type === 'estimoteTelemetry') {
			parsed = mEstimote.parseTelemetry(peripheral);
        } else if (beacon_type === 'estimoteNearable') {
			parsed = mEstimote.parseNearable(peripheral);
        } else if (beacon_type === 'ruuviTag') {
			parsed = mRuuvi.parse(peripheral);
		} else if (beacon_type === 'blukii') {
			parsed = mBlukii.parse(peripheral);
		} else if (beacon_type === 'minewAcc') {
			parsed = mMinew.parse(peripheral);
		} else if (beacon_type === 'blueUpAcc') {
			parsed = mBlueUp.parse(peripheral);
		} else if (beacon_type === 'bluePuckAcc') {
			parsed = mBluePuck.parse(peripheral);
		}

		if (parsed) {
			res[beacon_type] = parsed;
			return res;
		} else {
			return null;
		}
};


BeaconParser.prototype._detectBeaconType = function (peripheral) {
        let ad = peripheral.advertisement;
        let manu = ad.manufacturerData;
        // Eddiystone
        if (ad.serviceData) {
                let eddystone_service = ad.serviceData.find((el) => {
                        return el.uuid === this._EDDYSTONE_SERVICE_UUID;
                });
                if (eddystone_service && eddystone_service.data) {
                        // https://github.com/google/eddystone/blob/master/protocol-specification.md
                        let frame_type = eddystone_service.data.readUInt8(0) >>> 4;
                        if (frame_type === 0b0000) {
                                return 'eddystoneUid';
                        } else if (frame_type === 0b0001) {
                                return 'eddystoneUrl';
                        } else if (frame_type === 0b0010) {
                                return 'eddystoneTlm';
                        } else if (frame_type === 0b0011) {
                                return 'eddystoneEid';
                        }
                }
        }
        // iBeacon
        if (manu && manu.length >= 4 && manu.readUInt32BE(0) === 0x4c000215) {
                return 'iBeacon';
        }
	    // Estimote Telemetry
	    if (ad.serviceData) {
	            let telemetry_service = ad.serviceData.find((el) => {
	                    return el.uuid === ESTIMOTE_TELEMETRY_SERVICE_UUID;
	            });
	            if (telemetry_service && telemetry_service.data) {
	                    return 'estimoteTelemetry';
	            }
	    }
	    // Estimote Nearable
	    if (manu && manu.length >= 2 && manu.readUInt16LE(0) === ESTIMOTE_COMPANY_ID) {
	            return 'estimoteNearable';
	    }
	    // RUUVI
	    if (manu && manu.length >= 2 && manu.readUInt16LE(0) === RUUVI_COMPANY_ID) {
			return 'ruuviTag';
	    }
		// BLUKII
	    if (manu && manu.length >= 2 && manu[0] === BLUKII_COMPANY_ID) {
	            return 'blukii';
	    }
	
	    if (ad.serviceData) {
			let minew_service = ad.serviceData.find((el) => {
				return el.uuid === MINEW_SERVICE_UUID;
			});
			if (minew_service && minew_service.data) {
				let frame_type = minew_service.data[0];
				if (frame_type === 0xa1) {
					return 'minewAcc'
				}
			}
		};

	    if (ad.serviceData) {
			let bluepuck_service = ad.serviceData.find((el) => {
				return el.uuid === BLUEPUCK_SERVICE_UUID;
			});
			if (bluepuck_service && ad.serviceData[0].data) {
				let frame_type = ad.serviceData[0]['uuid'];
				if (frame_type === '2aa1') {
					return 'bluePuckAcc'
				}
			}
		};
	
		if (ad.serviceData) {
			let blueup_service = ad.serviceData.find((el) => {
				return el.uuid === BLUEUP_SERVICE_UUID;
			});
			if (blueup_service && ad.serviceData[0].data) {
				let frame_type = ad.serviceData[0]['uuid'];
				if (frame_type === '181a') {
					return 'blueUpAcc'
				}
			}
		};

		return null;


};

module.exports = new BeaconParser();
		