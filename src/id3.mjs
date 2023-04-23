
import {
	readChars,
	getUInt8,
	getUInt32,
	getInt32,
	getSyncSafeInt32,
	getSyncSafeInt35,
} from './binary.mjs';

import { genre } from './genre.mjs';

const readID3v1 = (file) => {
	// in ID3v1 it's always the last 128 bytes of the file
	const tag = file.slice(-128);

	// ID3v1 should always start with TAG
	if (readChars(tag, 0, 3) !== 'TAG') {
		return null;
	}

	const genreIndex = getUInt8(tag, 127);
	const id3 = {
		version: 'ID3v1.0',
		metadata: {
			title: readChars(tag, 3, 30).trim(),
			artist: readChars(tag, 33, 30).trim(),
			album: readChars(tag, 63, 30).trim(),
			year: readChars(tag, 93, 4).trim(),
			comment: readChars(tag, 97, 30).trim(),
			genre: genreIndex in genre ? genre[genreIndex] : 'Unknown',
		},
	};

	const isID3v1_1 = tag[125] === 0 && tag[126] !== 0;
	if (isID3v1_1) {
		id3.version = 'ID3v1.1';
		id3.metadata.track = getUInt8(tag, 126);
	}

	return id3;
};

const readID3v2 = (file) => {
	// The first 3 bytes of the file should write out 'ID3' for v2
	if (readChars(file, 0, 3) !== 'ID3') {
		return null;
	}

	// We get the size first so we can trim down to the ID3 tag only and work from that
	const size = getSyncSafeInt32(file, 6);
	let id3 = file.slice(0, size + 10);

	file = null;

	const minor = getUInt8(id3, 3);
	const patch = getUInt8(id3, 4);

	const data = {
		version: `ID3v2.${minor}.${patch}`,
		flags: {
			unsynchronisation: ((id3[5] & 0x80) >> 7) === 1,
			extendedHeader: ((id3[5] & 0x40) >> 6) === 1,
			experimentalIndicator: ((id3[5] & 0x20) >> 5) === 1,
			footerPresent: ((id3[5] & 0x10) >> 4) === 1,
		},
		size: size,
	};

	id3 = id3.slice(10);

	if (data.flags.extendedHeader) {
		data.extendedHeader = {
			size: getSyncSafeInt32(id3, 0),
			numberOfFlags: getUInt8(id3, 4),
			flags: [],
		};
		// An extended header can never have a size of fewer than six bytes.
		let extendedHeaderSize = 5;
		let extendedHeader = id3.slice(5);
		for (let i = 0; i < data.extendedHeader.numberOfFlags; i++) {
			extendedHeaderSize += 1;
			const flag = extendedHeader[0];
			const flagHeader = {};
			const hasUpdate = ((flag & 0x40) >> 6) === 1;
			const hasCRC = ((flag & 0x20) >> 5) === 1;
			const hasTagRestrictions = ((flag & 0x10) >> 4) === 1;
			extendedHeader = extendedHeader.slice(1);
			flagHeader.update = hasUpdate;
			flagHeader.CRC = null;
			flagHeader.tagRestrictions = null;
			if (hasCRC) {
				flagHeader.CRC = getSyncSafeInt35(extendedHeader, 1);
				// CRC flag data length us always 5, and then we have to account for the length bit as well
				extendedHeader = extendedHeader.slice(5 + 1);
				extendedHeaderSize += 5 + 1;
			}
			if (hasTagRestrictions) {
				flagHeader.tagRestrictions = {
					tagSize: ((extendedHeader[1] & 0xc0) >> 6) & 0x3,
					textEncoding: ((extendedHeader[1] & 0x20) >> 5) === 1,
					textFieldsSize: (extendedHeader[1] & 0x18) >> 3,
					imageEncoding: ((extendedHeader[1] & 0x4) >> 2) === 1,
					imageSize: extendedHeader[1] & 0x3,
				};
				extendedHeader = extendedHeader.slice(2);
				extendedHeaderSize += 2;
			}
			data.extendedHeader.flags.push(flagHeader);
		}
		// Let's throw a fatal error if the reported header size does not match up with out calculations
		if (data.extendedHeader.size !== extendedHeaderSize) {
			throw 'Unexpected header size in ID3v2 extended header';
		}
	}

	return data;
};

export const readID3 = (file) => {

	const id3v2 = readID3v2(file);
	if (id3v2) {
		return id3v2;
	}
	return readID3v1(file);
};
