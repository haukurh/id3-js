
import {
	readChars,
	getUInt8,
	getUInt32,
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
	return readID3v1(file);
};
