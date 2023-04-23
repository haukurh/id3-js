
const readChars = (uint8Array, position, length) => {
	if (!(uint8Array instanceof Uint8Array)) { throw new TypeError('uint8Array must an instance of Uint8Array'); }
	if (!Number.isInteger(position)) { throw new TypeError('position must an integer'); }
	if (!Number.isInteger(length)) { throw new TypeError('length must an integer'); }

	let data = [...uint8Array.slice(position, position + length)];

	const nullByte = data.findIndex((byte) => byte === 0);
	if (nullByte !== -1) {
		data = [...data.slice(0, nullByte)];
	}

	return String.fromCharCode(...data);
};

const findMarker = (haystack, needle) => {
	if (!(haystack instanceof Uint8Array)) { throw new TypeError('haystack must an instance of Uint8Array'); }

	const marker = strToUint8Array(needle);
	const match = marker.toString();
	for (let i = 0; i < haystack.length; i++) {
		if (haystack.slice(i, i + marker.length).toString() === match) {
			return i;
		}
	}
	return null;
};

const findMarkers = (haystack, needle) => {
	if (!(haystack instanceof Uint8Array)) { throw new TypeError('haystack must an instance of Uint8Array'); }

	const marker = strToUint8Array(needle);
	const match = marker.toString();
	const markerPositions = [];
	for (let i = 0; i < haystack.length; i++) {
		if (haystack.slice(i, i + marker.length).toString() === match) {
			markerPositions.push(i);
		}
	}
	return markerPositions;
};

const strToUint8Array = (str) => {
	const chars = str.split('').map((letter) => letter.charCodeAt(0));
	return new Uint8Array(chars);
};

const getFixedPoint32 = (uint8Array, byteOffset) => {
	if (!Number.isInteger(byteOffset)) { throw new TypeError('Byte offset must be an integer'); }

	const first = (new DataView(uint8Array.buffer)).getUint16(byteOffset, false);
	const last = (new DataView(uint8Array.buffer)).getUint16(byteOffset + 2, false);
	return parseFloat(`${first}.${last}`);
};

const getFixedPoint16 = (uint8Array, byteOffset) => {
	if (!(uint8Array instanceof Uint8Array)) { throw new TypeError('uint8Array must an instance of Uint8Array'); }
	if (!Number.isInteger(byteOffset)) { throw new TypeError('Byte offset must be an integer'); }

	const first = uint8Array[byteOffset];
	const last = uint8Array[byteOffset + 1];
	return parseFloat(`${first}.${last}`);
};

const getInt8 = (uint8Array, byteOffset) => {
	if (!Number.isInteger(byteOffset)) { throw new TypeError('Byte offset must be an integer'); }

	return (new DataView(uint8Array.buffer))
		.getInt8(byteOffset);
};

const getUInt8 = (uint8Array, byteOffset) => {
	if (!Number.isInteger(byteOffset)) { throw new TypeError('Byte offset must be an integer'); }

	return (new DataView(uint8Array.buffer))
		.getUint8(byteOffset);
};

const getInt16 = (uint8Array, byteOffset) => {
	if (!Number.isInteger(byteOffset)) { throw new TypeError('Byte offset must be an integer'); }

	return (new DataView(uint8Array.buffer))
		.getInt16(byteOffset, false);
};

const getUInt16 = (uint8Array, byteOffset) => {
	if (!Number.isInteger(byteOffset)) { throw new TypeError('Byte offset must be an integer'); }

	return (new DataView(uint8Array.buffer))
		.getUint16(byteOffset, false);
};

const getInt32 = (uint8Array, byteOffset) => {
	if (!Number.isInteger(byteOffset)) { throw new TypeError('Byte offset must be an integer'); }

	return (new DataView(uint8Array.buffer))
		.getInt32(byteOffset, false);
};

const getUInt32 = (uint8Array, byteOffset) => {
	if (!Number.isInteger(byteOffset)) { throw new TypeError('Byte offset must be an integer'); }

	return (new DataView(uint8Array.buffer))
		.getUint32(byteOffset, false);
};

// Most integers in ID3v2 spec are stored as "syncsafe" integers for some reason.
// Inspiration: https://stackoverflow.com/questions/7898991/why-sync-safe-integer
const getSyncSafeInt32 = (uint8Array, byteOffset) => {
	const integer = getUInt32(uint8Array, byteOffset);
	return (integer & 0x7f) |
		(integer & 0x7f00) >> 1 |
		(integer & 0x7f0000) >> 2 |
		(integer & 0x7f000000) >> 3;
};

const getSyncSafeInt35 = (uint8Array, byteOffset) => {
	const data = new Uint8Array([...uint8Array.slice(byteOffset, byteOffset + 5)]);
	const last =  ((data[3] & 0x1) << 7) | data[4];
	const nr3 =  ((data[2] & 0x3) << 6) | (data[3] >> 1);
	const nr2 =  ((data[1] & 0x7) << 5) | (data[2] >> 2);
	const nr1 =  (data[0] << 4) | (data[1] >> 3);
	return getUInt32(new Uint8Array([nr1, nr2, nr3, last]), 0);
};

export {
	readChars,
	findMarker,
	findMarkers,
	strToUint8Array,
	getInt8,
	getInt16,
	getInt32,
	getUInt8,
	getUInt16,
	getUInt32,
	getFixedPoint16,
	getFixedPoint32,
	getSyncSafeInt32,
	getSyncSafeInt35,
};
