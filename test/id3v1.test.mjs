import * as fs from 'fs';
import { readID3 } from '../src/id3.mjs';

const readFile = (file) => {
	console.log(`Reading file: '${file}'`);
	const stats = fs.statSync(file);
	// We manage how we read files smaller than 4kb because Node has a gaping security hole
	// and can't handle really small files but I can't be bothered to file an issue
	if (stats.size < 4096) {
		const fd = fs.openSync(file, 'r');
		const buffer= Buffer.alloc(stats.size);
		fs.readSync(fd, buffer, 0, stats.size, 0);
		fs.closeSync(fd);
		return buffer;
	}
	return fs.readFileSync(file);
}

const readTestFile = (filepath) => {
	const data = readFile(`./test/files/${filepath}`);
	return new Uint8Array(data.buffer);
};

test('ID3v1: Test case 1: An ordinary ID3v1 tag with all fields set to a plausible value.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_001_basic.mp3'));
	expect(id3.metadata.title).toBe('Title');
	expect(id3.metadata.artist).toBe('Artist');
	expect(id3.metadata.album).toBe('Album');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('Comment');
	expect(id3.metadata.genre).toBe('Hip-Hop');
});

