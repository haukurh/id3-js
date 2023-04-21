
import {
	readChars,
	getUInt8,
	getUInt32,
} from './binary.mjs';

const readIDv1 = (file) => {
	// in ID3v1 it's always the last 128 bytes of the file
	const tag = file.slice(-128);

	// ID3v1 should always start with TAG
	if (readChars(tag, 0, 3) !== 'TAG') {
		return null;
	}
	return {
		version: 'ID3v1',
	};
};

const readID3v2 = (file) => {
	const id3Tag = readChars(file, 0, 3);

	if (id3Tag !== 'ID3') {
		return null;
	}

	const minor = getUInt8(file, 3);
	const patch = getUInt8(file, 4);

	return {
		version: `${id3Tag}v2.${minor}.${patch}`,
		size: getUInt32(file, 6),
	};
};

export const readID3 = (file) => {

	const id3v2 = readID3v2(file);
	if (id3v2) {
		return id3v2;
	}
	return readIDv1(file);
};
