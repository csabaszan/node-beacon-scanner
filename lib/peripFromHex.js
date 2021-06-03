function peripFromHexString(incomingString) {

    try {
        var array = Buffer.from(JSON.parse(incomingString)); //Buffer.data
    } catch (error) {
      //  console.log(error);
        return;
    }

    var gapAddr = array.slice(8, 14);
    var rssi = array.readInt8(18);
    var arrayLen = array.readUInt8(28);
    var advertiseData = array.slice(29, 29 + arrayLen);
    /*  console.log('LE Advertising Report');
      console.log('\t' + gapAddr.toString('hex').match(/.{1,2}/g).reverse().join(':'));
      console.log('\t' + rssi);
      console.log('\t datalen from number: ' + arrayLen);
      console.log('\t datalen from array:' + arrayLen);
      console.log('\t' + advertiseData.toString('hex'));*/

    var perip = {
        localName: undefined,
        shortName: undefined,
        txPowerLevel: undefined,
        manufacturerData: undefined,
        serviceData: [],
        serviceUuids: [],
        solicitationServiceUuids: [],
        rssi: rssi,
        macAddress: gapAddr.toString('hex').match(/.{1,2}/g).reverse().join(':'),
        addressType: undefined
    }

    let i = 0;
    eir = advertiseData;

    while ((i + 1) < eir.length) {
        var length = eir.readUInt8(i);

        if (length < 1) {
            // debug(`invalid EIR data, length = ${length}`);
            break;
        }

        const eirType = eir.readUInt8(i + 1); // https://www.bluetooth.org/en-us/specification/assigned-numbers/generic-access-profile

        if ((i + length + 1) > eir.length) {
            //   debug('invalid EIR data, out of range of buffer length');
            break;
        }

        const bytes = eir.slice(i + 2).slice(0, length - 1);

        switch (eirType) {
            case 0x02: // Incomplete List of 16-bit Service Class UUID
            case 0x03: // Complete List of 16-bit Service Class UUIDs
                for (let j = 0; j < bytes.length; j += 2) {
                    const serviceUuid = bytes.readUInt16LE(j).toString(16);
                    if (perip.serviceUuids.indexOf(serviceUuid) === -1) {
                        perip.serviceUuids.push(serviceUuid);
                    }
                }
                break;

            case 0x06: // Incomplete List of 128-bit Service Class UUIDs
            case 0x07: // Complete List of 128-bit Service Class UUIDs
                for (let j = 0; j < bytes.length; j += 16) {
                    const serviceUuid = bytes.slice(j, j + 16).toString('hex').match(/.{1,2}/g).reverse().join('');
                    if (perip.serviceUuids.indexOf(serviceUuid) === -1) {
                        perip.serviceUuids.push(serviceUuid);
                    }
                }
                break;

            case 0x08: // Shortened Local Name
                perip.shortName = bytes.toString('utf8');
                break;
            case 0x09: // Complete Local Name»
                perip.localName = bytes.toString('utf8');
                break;

            case 0x0a: // Tx Power Level
                perip.txPowerLevel = bytes.readInt8(0);
                break;

            case 0x14: // List of 16 bit solicitation UUIDs
                for (let j = 0; j < bytes.length; j += 2) {
                    const serviceSolicitationUuid = bytes.readUInt16LE(j).toString(16);
                    if (perip.serviceSolicitationUuids.indexOf(serviceSolicitationUuid) === -1) {
                        perip.serviceSolicitationUuids.push(serviceSolicitationUuid);
                    }
                }
                break;

            case 0x15: // List of 128 bit solicitation UUIDs
                for (let j = 0; j < bytes.length; j += 16) {
                    const serviceSolicitationUuid = bytes.slice(j, j + 16).toString('hex').match(/.{1,2}/g).reverse().join('');
                    if (perip.serviceSolicitationUuids.indexOf(serviceSolicitationUuid) === -1) {
                        perip.serviceSolicitationUuids.push(serviceSolicitationUuid);
                    }
                }
                break;

            case 0x16: // 16-bit Service Data, there can be multiple occurences
                perip.serviceData.push({
                    uuid: bytes.slice(0, 2).toString('hex').match(/.{1,2}/g).reverse().join(''),
                    data: bytes.slice(2, bytes.length)
                });
                break;

            case 0x20: // 32-bit Service Data, there can be multiple occurences
                perip.serviceData.push({
                    uuid: bytes.slice(0, 4).toString('hex').match(/.{1,2}/g).reverse().join(''),
                    data: bytes.slice(4, bytes.length)
                });
                break;

            case 0x21: // 128-bit Service Data, there can be multiple occurences
                perip.serviceData.push({
                    uuid: bytes.slice(0, 16).toString('hex').match(/.{1,2}/g).reverse().join(''),
                    data: bytes.slice(16, bytes.length)
                });
                break;

            case 0x1f: // List of 32 bit solicitation UUIDs
                for (let j = 0; j < bytes.length; j += 4) {
                    const serviceSolicitationUuid = bytes.readUInt32LE(j).toString(16);
                    if (perip.serviceSolicitationUuids.indexOf(serviceSolicitationUuid) === -1) {
                        perip.serviceSolicitationUuids.push(serviceSolicitationUuid);
                    }
                }
                break;

            case 0xff: // Manufacturer Specific Data
                perip.manufacturerData = bytes;
                break;
        }

        i += (length + 1);
    }

    return perip;

}

module.exports.peripFromHexString=peripFromHexString;