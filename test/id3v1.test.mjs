import * as fs from 'fs';
import { readID3 } from '../src/id3.mjs';

const readFile = (file) => {
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

test('ID3v1.0: Test case 1: An ordinary ID3v1 tag with all fields set to a plausible value.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_001_basic.mp3'));
	expect(id3.metadata.title).toBe('Title');
	expect(id3.metadata.artist).toBe('Artist');
	expect(id3.metadata.album).toBe('Album');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('Comment');
	expect(id3.metadata.genre).toBe('Hip-Hop');
});

test('ID3v1.1: Test case 2: An ordinary ID3v1.1 tag with all fields set to a plausible value.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_002_basic.mp3'));
	expect(id3.metadata.title).toBe('Title');
	expect(id3.metadata.artist).toBe('Artist');
	expect(id3.metadata.album).toBe('Album');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('Comment');
	expect(id3.metadata.track).toBe(12);
	expect(id3.metadata.genre).toBe('Hip-Hop');
});

test('ID3v1.0: Test case 3: An ID3 tag with its header in the wrong case.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_003_basic_F.mp3'));
	expect(id3).toBeNull();
});

test('ID3v1.0: Test case 4: An ID3 tag with all fields set to shortest legal value.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_004_basic.mp3'));
	expect(id3.metadata.title).toBe('');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Blues');
});

test('ID3v1.0: Test case 5: An ID3v1 tag with all fields set to longest value.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_005_basic.mp3'));
	expect(id3.metadata.title).toBe('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaA');
	expect(id3.metadata.artist).toBe('bbbbbbbbbbbbbbbbbbbbbbbbbbbbbB');
	expect(id3.metadata.album).toBe('cccccccccccccccccccccccccccccC');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('dddddddddddddddddddddddddddddD');
	expect(id3.metadata.genre).toBe('Blues');
});

test('ID3v1.1: Test case 6: An ID3v1.1 tag with all fields set to longest value.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_006_basic.mp3'));
	expect(id3.metadata.title).toBe('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaA');
	expect(id3.metadata.artist).toBe('bbbbbbbbbbbbbbbbbbbbbbbbbbbbbB');
	expect(id3.metadata.album).toBe('cccccccccccccccccccccccccccccC');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('dddddddddddddddddddddddddddD');
	expect(id3.metadata.track).toBe(1);
	expect(id3.metadata.genre).toBe('Blues');
});

test('ID3v1.0: Test case 7: An ID3v1 tag with junk after string terminator. The junk should not show up for the user (i.e. only the string 12345 should show up).', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_007_basic_W.mp3'));
	expect(id3.metadata.title).toBe('12345');
	expect(id3.metadata.artist).toBe('12345');
	expect(id3.metadata.album).toBe('12345');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('12345');
	expect(id3.metadata.genre).toBe('Blues');
});

test('ID3v1.1: Test case 8: An ID3v1 tag with junk after string terminator. The junk should not show up for the user (i.e. only the string 12345 should show up).', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_008_basic_W.mp3'));
	expect(id3.metadata.title).toBe('12345');
	expect(id3.metadata.artist).toBe('12345');
	expect(id3.metadata.album).toBe('12345');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('12345');
	expect(id3.metadata.track).toBe(1);
	expect(id3.metadata.genre).toBe('Blues');
});

test('ID3v1.1: Test case 9: An ID3 tag with the track number set to max (255).', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_009_basic.mp3'));
	expect(id3.metadata.title).toBe('');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.track).toBe(255);
	expect(id3.metadata.genre).toBe('Blues');
});

test('ID3v1.0: Test case 10: An ID3 tag with the year set to 0000.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_010_year.mp3'));
	expect(id3.metadata.title).toBe('');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('0000');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Blues');
});

test('ID3v1.0: Test case 11: An ID3 tag with the year set to 9999.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_011_year.mp3'));
	expect(id3.metadata.title).toBe('');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('9999');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Blues');
});

test('ID3v1.0: Test case 12: An ID3 tag with the year set to "   3".', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_012_year_F.mp3'));
	expect(id3.metadata.title).toBe('');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('3');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Blues');
});

test('ID3v1.0: Test case 13: An ID3 tag with the year set to "112\0".', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_013_year_F.mp3'));
	expect(id3.metadata.title).toBe('');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('112');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Blues');
});

test('ID3v1.0: Test case 14: An ID3 tag with the year set to NULL.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_014_year_F.mp3'));
	expect(id3.metadata.title).toBe('');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Blues');
});

test('ID3v1.0: Test case 15: An ID3 tag with genre set to Blues.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_015_genre.mp3'));
	expect(id3.metadata.title).toBe('Blues');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Blues');
});

test('ID3v1.0: Test case 16: An ID3 tag with genre set to Classic Rock.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_016_genre.mp3'));
	expect(id3.metadata.title).toBe('Classic Rock');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Classic Rock');
});

test('ID3v1.0: Test case 17: An ID3 tag with genre set to Country.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_017_genre.mp3'));
	expect(id3.metadata.title).toBe('Country');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Country');
});

test('ID3v1.0: Test case 18: An ID3 tag with genre set to Dance.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_018_genre.mp3'));
	expect(id3.metadata.title).toBe('Dance');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Dance');
});

test('ID3v1.0: Test case 19: An ID3 tag with genre set to Disco.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_019_genre.mp3'));
	expect(id3.metadata.title).toBe('Disco');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Disco');
});

test('ID3v1.0: Test case 20: An ID3 tag with genre set to Funk.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_020_genre.mp3'));
	expect(id3.metadata.title).toBe('Funk');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Funk');
});

test('ID3v1.0: Test case 21: An ID3 tag with genre set to Grunge.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_021_genre.mp3'));
	expect(id3.metadata.title).toBe('Grunge');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Grunge');
});

test('ID3v1.0: Test case 22: An ID3 tag with genre set to Hip-Hop.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_022_genre.mp3'));
	expect(id3.metadata.title).toBe('Hip-Hop');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Hip-Hop');
});

test('ID3v1.0: Test case 23: An ID3 tag with genre set to Jazz.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_023_genre.mp3'));
	expect(id3.metadata.title).toBe('Jazz');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Jazz');
});

test('ID3v1.0: Test case 24: An ID3 tag with genre set to Metal.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_024_genre.mp3'));
	expect(id3.metadata.title).toBe('Metal');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Metal');
});

test('ID3v1.0: Test case 25: An ID3 tag with genre set to New Age.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_025_genre.mp3'));
	expect(id3.metadata.title).toBe('New Age');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('New Age');
});

test('ID3v1.0: Test case 26: An ID3 tag with genre set to Oldies.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_026_genre.mp3'));
	expect(id3.metadata.title).toBe('Oldies');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Oldies');
});

test('ID3v1.0: Test case 27: An ID3 tag with genre set to Other.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_027_genre.mp3'));
	expect(id3.metadata.title).toBe('Other');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Other');
});

test('ID3v1.0: Test case 28: An ID3 tag with genre set to Pop.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_028_genre.mp3'));
	expect(id3.metadata.title).toBe('Pop');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Pop');
});

test('ID3v1.0: Test case 29: An ID3 tag with genre set to R&B.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_029_genre.mp3'));
	expect(id3.metadata.title).toBe('R&B');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('R&B');
});

test('ID3v1.0: Test case 30: An ID3 tag with genre set to Rap.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_030_genre.mp3'));
	expect(id3.metadata.title).toBe('Rap');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Rap');
});

test('ID3v1.0: Test case 31: An ID3 tag with genre set to Reggae.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_031_genre.mp3'));
	expect(id3.metadata.title).toBe('Reggae');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Reggae');
});

test('ID3v1.0: Test case 32: An ID3 tag with genre set to Rock.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_032_genre.mp3'));
	expect(id3.metadata.title).toBe('Rock');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Rock');
});

test('ID3v1.0: Test case 33: An ID3 tag with genre set to Techno.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_033_genre.mp3'));
	expect(id3.metadata.title).toBe('Techno');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Techno');
});

test('ID3v1.0: Test case 34: An ID3 tag with genre set to Industrial.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_034_genre.mp3'));
	expect(id3.metadata.title).toBe('Industrial');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Industrial');
});

test('ID3v1.0: Test case 35: An ID3 tag with genre set to Alternative.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_035_genre.mp3'));
	expect(id3.metadata.title).toBe('Alternative');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Alternative');
});

test('ID3v1.0: Test case 36: An ID3 tag with genre set to Ska.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_036_genre.mp3'));
	expect(id3.metadata.title).toBe('Ska');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Ska');
});

test('ID3v1.0: Test case 37: An ID3 tag with genre set to Death Metal.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_037_genre.mp3'));
	expect(id3.metadata.title).toBe('Death Metal');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Death Metal');
});

test('ID3v1.0: Test case 38: An ID3 tag with genre set to Pranks.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_038_genre.mp3'));
	expect(id3.metadata.title).toBe('Pranks');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Pranks');
});

test('ID3v1.0: Test case 39: An ID3 tag with genre set to Soundtrack.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_039_genre.mp3'));
	expect(id3.metadata.title).toBe('Soundtrack');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Soundtrack');
});

test('ID3v1.0: Test case 40: An ID3 tag with genre set to Euro-Techno.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_040_genre.mp3'));
	expect(id3.metadata.title).toBe('Euro-Techno');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Euro-Techno');
});

test('ID3v1.0: Test case 41: An ID3 tag with genre set to Ambient.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_041_genre.mp3'));
	expect(id3.metadata.title).toBe('Ambient');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Ambient');
});

test('ID3v1.0: Test case 42: An ID3 tag with genre set to Trip-Hop.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_042_genre.mp3'));
	expect(id3.metadata.title).toBe('Trip-Hop');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Trip-Hop');
});

test('ID3v1.0: Test case 43: An ID3 tag with genre set to Vocal.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_043_genre.mp3'));
	expect(id3.metadata.title).toBe('Vocal');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Vocal');
});

test('ID3v1.0: Test case 44: An ID3 tag with genre set to Jazz+Funk.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_044_genre.mp3'));
	expect(id3.metadata.title).toBe('Jazz+Funk');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Jazz+Funk');
});

test('ID3v1.0: Test case 45: An ID3 tag with genre set to Fusion.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_045_genre.mp3'));
	expect(id3.metadata.title).toBe('Fusion');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Fusion');
});

test('ID3v1.0: Test case 46: An ID3 tag with genre set to Trance.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_046_genre.mp3'));
	expect(id3.metadata.title).toBe('Trance');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Trance');
});

test('ID3v1.0: Test case 47: An ID3 tag with genre set to Classical.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_047_genre.mp3'));
	expect(id3.metadata.title).toBe('Classical');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Classical');
});

test('ID3v1.0: Test case 48: An ID3 tag with genre set to Instrumental.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_048_genre.mp3'));
	expect(id3.metadata.title).toBe('Instrumental');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Instrumental');
});

test('ID3v1.0: Test case 49: An ID3 tag with genre set to Acid.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_049_genre.mp3'));
	expect(id3.metadata.title).toBe('Acid');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Acid');
});

test('ID3v1.0: Test case 50: An ID3 tag with genre set to House.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_050_genre.mp3'));
	expect(id3.metadata.title).toBe('House');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('House');
});

test('ID3v1.0: Test case 51: An ID3 tag with genre set to Game.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_051_genre.mp3'));
	expect(id3.metadata.title).toBe('Game');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Game');
});

test('ID3v1.0: Test case 52: An ID3 tag with genre set to Sound Clip.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_052_genre.mp3'));
	expect(id3.metadata.title).toBe('Sound Clip');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Sound Clip');
});

test('ID3v1.0: Test case 53: An ID3 tag with genre set to Gospel.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_053_genre.mp3'));
	expect(id3.metadata.title).toBe('Gospel');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Gospel');
});

test('ID3v1.0: Test case 54: An ID3 tag with genre set to Noise.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_054_genre.mp3'));
	expect(id3.metadata.title).toBe('Noise');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Noise');
});

test('ID3v1.0: Test case 55: An ID3 tag with genre set to AlternRock.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_055_genre.mp3'));
	expect(id3.metadata.title).toBe('AlternRock');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('AlternRock');
});

test('ID3v1.0: Test case 56: An ID3 tag with genre set to Bass.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_056_genre.mp3'));
	expect(id3.metadata.title).toBe('Bass');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Bass');
});

test('ID3v1.0: Test case 57: An ID3 tag with genre set to Soul.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_057_genre.mp3'));
	expect(id3.metadata.title).toBe('Soul');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Soul');
});

test('ID3v1.0: Test case 58: An ID3 tag with genre set to Punk.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_058_genre.mp3'));
	expect(id3.metadata.title).toBe('Punk');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Punk');
});

test('ID3v1.0: Test case 59: An ID3 tag with genre set to Space.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_059_genre.mp3'));
	expect(id3.metadata.title).toBe('Space');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Space');
});

test('ID3v1.0: Test case 60: An ID3 tag with genre set to Meditative.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_060_genre.mp3'));
	expect(id3.metadata.title).toBe('Meditative');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Meditative');
});

test('ID3v1.0: Test case 61: An ID3 tag with genre set to Instrumental Pop.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_061_genre.mp3'));
	expect(id3.metadata.title).toBe('Instrumental Pop');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Instrumental Pop');
});

test('ID3v1.0: Test case 62: An ID3 tag with genre set to Instrumental Rock.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_062_genre.mp3'));
	expect(id3.metadata.title).toBe('Instrumental Rock');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Instrumental Rock');
});

test('ID3v1.0: Test case 63: An ID3 tag with genre set to Ethnic.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_063_genre.mp3'));
	expect(id3.metadata.title).toBe('Ethnic');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Ethnic');
});

test('ID3v1.0: Test case 64: An ID3 tag with genre set to Gothic.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_064_genre.mp3'));
	expect(id3.metadata.title).toBe('Gothic');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Gothic');
});

test('ID3v1.0: Test case 65: An ID3 tag with genre set to Darkwave.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_065_genre.mp3'));
	expect(id3.metadata.title).toBe('Darkwave');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Darkwave');
});

test('ID3v1.0: Test case 66: An ID3 tag with genre set to Techno-Industrial.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_066_genre.mp3'));
	expect(id3.metadata.title).toBe('Techno-Industrial');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Techno-Industrial');
});

test('ID3v1.0: Test case 67: An ID3 tag with genre set to Electronic.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_067_genre.mp3'));
	expect(id3.metadata.title).toBe('Electronic');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Electronic');
});

test('ID3v1.0: Test case 68: An ID3 tag with genre set to Pop-Folk.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_068_genre.mp3'));
	expect(id3.metadata.title).toBe('Pop-Folk');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Pop-Folk');
});

test('ID3v1.0: Test case 69: An ID3 tag with genre set to Eurodance.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_069_genre.mp3'));
	expect(id3.metadata.title).toBe('Eurodance');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Eurodance');
});

test('ID3v1.0: Test case 70: An ID3 tag with genre set to Dream.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_070_genre.mp3'));
	expect(id3.metadata.title).toBe('Dream');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Dream');
});

test('ID3v1.0: Test case 71: An ID3 tag with genre set to Southern Rock.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_071_genre.mp3'));
	expect(id3.metadata.title).toBe('Southern Rock');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Southern Rock');
});

test('ID3v1.0: Test case 72: An ID3 tag with genre set to Comedy.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_072_genre.mp3'));
	expect(id3.metadata.title).toBe('Comedy');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Comedy');
});

test('ID3v1.0: Test case 73: An ID3 tag with genre set to Cult.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_073_genre.mp3'));
	expect(id3.metadata.title).toBe('Cult');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Cult');
});

test('ID3v1.0: Test case 74: An ID3 tag with genre set to Gangsta.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_074_genre.mp3'));
	expect(id3.metadata.title).toBe('Gangsta');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Gangsta');
});

test('ID3v1.0: Test case 75: An ID3 tag with genre set to Top 40.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_075_genre.mp3'));
	expect(id3.metadata.title).toBe('Top 40');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Top 40');
});

test('ID3v1.0: Test case 76: An ID3 tag with genre set to Christian Rap.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_076_genre.mp3'));
	expect(id3.metadata.title).toBe('Christian Rap');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Christian Rap');
});

test('ID3v1.0: Test case 77: An ID3 tag with genre set to Pop/Funk.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_077_genre.mp3'));
	expect(id3.metadata.title).toBe('Pop/Funk');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Pop/Funk');
});

test('ID3v1.0: Test case 78: An ID3 tag with genre set to Jungle.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_078_genre.mp3'));
	expect(id3.metadata.title).toBe('Jungle');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Jungle');
});

test('ID3v1.0: Test case 79: An ID3 tag with genre set to Native American.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_079_genre.mp3'));
	expect(id3.metadata.title).toBe('Native American');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Native American');
});

test('ID3v1.0: Test case 80: An ID3 tag with genre set to Cabaret.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_080_genre.mp3'));
	expect(id3.metadata.title).toBe('Cabaret');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Cabaret');
});

test('ID3v1.0: Test case 81: An ID3 tag with genre set to New Wave.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_081_genre.mp3'));
	expect(id3.metadata.title).toBe('New Wave');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('New Wave');
});

test('ID3v1.0: Test case 82: An ID3 tag with genre set to Psychadelic.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_082_genre.mp3'));
	expect(id3.metadata.title).toBe('Psychadelic');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Psychadelic');
});

test('ID3v1.0: Test case 83: An ID3 tag with genre set to Rave.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_083_genre.mp3'));
	expect(id3.metadata.title).toBe('Rave');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Rave');
});

test('ID3v1.0: Test case 84: An ID3 tag with genre set to Showtunes.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_084_genre.mp3'));
	expect(id3.metadata.title).toBe('Showtunes');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Showtunes');
});

test('ID3v1.0: Test case 85: An ID3 tag with genre set to Trailer.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_085_genre.mp3'));
	expect(id3.metadata.title).toBe('Trailer');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Trailer');
});

test('ID3v1.0: Test case 86: An ID3 tag with genre set to Lo-Fi.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_086_genre.mp3'));
	expect(id3.metadata.title).toBe('Lo-Fi');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Lo-Fi');
});

test('ID3v1.0: Test case 87: An ID3 tag with genre set to Tribal.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_087_genre.mp3'));
	expect(id3.metadata.title).toBe('Tribal');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Tribal');
});

test('ID3v1.0: Test case 88: An ID3 tag with genre set to Acid Punk.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_088_genre.mp3'));
	expect(id3.metadata.title).toBe('Acid Punk');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Acid Punk');
});

test('ID3v1.0: Test case 89: An ID3 tag with genre set to Acid Jazz.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_089_genre.mp3'));
	expect(id3.metadata.title).toBe('Acid Jazz');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Acid Jazz');
});

test('ID3v1.0: Test case 90: An ID3 tag with genre set to Polka.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_090_genre.mp3'));
	expect(id3.metadata.title).toBe('Polka');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Polka');
});

test('ID3v1.0: Test case 91: An ID3 tag with genre set to Retro.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_091_genre.mp3'));
	expect(id3.metadata.title).toBe('Retro');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Retro');
});

test('ID3v1.0: Test case 92: An ID3 tag with genre set to Musical.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_092_genre.mp3'));
	expect(id3.metadata.title).toBe('Musical');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Musical');
});

test('ID3v1.0: Test case 93: An ID3 tag with genre set to Rock & Roll.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_093_genre.mp3'));
	expect(id3.metadata.title).toBe('Rock & Roll');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Rock & Roll');
});

test('ID3v1.0: Test case 94: An ID3 tag with genre set to Hard Rock.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_094_genre.mp3'));
	expect(id3.metadata.title).toBe('Hard Rock');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Hard Rock');
});

test('ID3v1.0: Test case 95: An ID3 tag with genre set to Folk. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_095_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Folk');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Folk');
});

test('ID3v1.0: Test case 96: An ID3 tag with genre set to Folk-Rock. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_096_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Folk-Rock');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Folk-Rock');
});

test('ID3v1.0: Test case 97: An ID3 tag with genre set to National Folk. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_097_genre_W.mp3'));
	expect(id3.metadata.title).toBe('National Folk');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('National Folk');
});

test('ID3v1.0: Test case 98: An ID3 tag with genre set to Swing. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_098_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Swing');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Swing');
});

test('ID3v1.0: Test case 99: An ID3 tag with genre set to Fast Fusion. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_099_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Fast Fusion');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Fast Fusion');
});

test('ID3v1.0: Test case 100: An ID3 tag with genre set to Bebob. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_100_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Bebob');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Bebob');
});

test('ID3v1.0: Test case 101: An ID3 tag with genre set to Latin. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_101_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Latin');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Latin');
});

test('ID3v1.0: Test case 102: An ID3 tag with genre set to Revival. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_102_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Revival');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Revival');
});

test('ID3v1.0: Test case 103: An ID3 tag with genre set to Celtic. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_103_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Celtic');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Celtic');
});

test('ID3v1.0: Test case 104: An ID3 tag with genre set to Bluegrass. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_104_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Bluegrass');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Bluegrass');
});

test('ID3v1.0: Test case 105: An ID3 tag with genre set to Avantgarde. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_105_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Avantgarde');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Avantgarde');
});

test('ID3v1.0: Test case 106: An ID3 tag with genre set to Gothic Rock. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_106_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Gothic Rock');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Gothic Rock');
});

test('ID3v1.0: Test case 107: An ID3 tag with genre set to Progressive Rock. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_107_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Progressive Rock');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Progressive Rock');
});

test('ID3v1.0: Test case 108: An ID3 tag with genre set to Psychedelic Rock. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_108_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Psychedelic Rock');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Psychedelic Rock');
});

test('ID3v1.0: Test case 109: An ID3 tag with genre set to Symphonic Rock. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_109_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Symphonic Rock');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Symphonic Rock');
});

test('ID3v1.0: Test case 110: An ID3 tag with genre set to Slow Rock. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_110_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Slow Rock');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Slow Rock');
});

test('ID3v1.0: Test case 111: An ID3 tag with genre set to Big Band. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_111_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Big Band');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Big Band');
});

test('ID3v1.0: Test case 112: An ID3 tag with genre set to Chorus. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_112_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Chorus');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Chorus');
});

test('ID3v1.0: Test case 113: An ID3 tag with genre set to Easy Listening. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_113_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Easy Listening');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Easy Listening');
});

test('ID3v1.0: Test case 114: An ID3 tag with genre set to Acoustic. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_114_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Acoustic');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Acoustic');
});

test('ID3v1.0: Test case 115: An ID3 tag with genre set to Humour. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_115_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Humour');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Humour');
});

test('ID3v1.0: Test case 116: An ID3 tag with genre set to Speech. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_116_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Speech');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Speech');
});

test('ID3v1.0: Test case 117: An ID3 tag with genre set to Chanson. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_117_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Chanson');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Chanson');
});

test('ID3v1.0: Test case 118: An ID3 tag with genre set to Opera. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_118_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Opera');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Opera');
});

test('ID3v1.0: Test case 119: An ID3 tag with genre set to Chamber Music. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_119_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Chamber Music');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Chamber Music');
});

test('ID3v1.0: Test case 120: An ID3 tag with genre set to Sonata. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_120_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Sonata');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Sonata');
});

test('ID3v1.0: Test case 121: An ID3 tag with genre set to Symphony. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_121_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Symphony');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Symphony');
});

test('ID3v1.0: Test case 122: An ID3 tag with genre set to Booty Bass. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_122_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Booty Bass');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Booty Bass');
});

test('ID3v1.0: Test case 123: An ID3 tag with genre set to Primus. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_123_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Primus');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Primus');
});

test('ID3v1.0: Test case 124: An ID3 tag with genre set to Porn Groove. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_124_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Porn Groove');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Porn Groove');
});

test('ID3v1.0: Test case 125: An ID3 tag with genre set to Satire. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_125_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Satire');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Satire');
});

test('ID3v1.0: Test case 126: An ID3 tag with genre set to Slow Jam. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_126_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Slow Jam');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Slow Jam');
});

test('ID3v1.0: Test case 127: An ID3 tag with genre set to Club. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_127_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Club');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Club');
});

test('ID3v1.0: Test case 128: An ID3 tag with genre set to Tango. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_128_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Tango');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Tango');
});

test('ID3v1.0: Test case 129: An ID3 tag with genre set to Samba. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_129_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Samba');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Samba');
});

test('ID3v1.0: Test case 130: An ID3 tag with genre set to Folklore. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_130_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Folklore');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Folklore');
});

test('ID3v1.0: Test case 131: An ID3 tag with genre set to Ballad. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_131_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Ballad');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Ballad');
});

test('ID3v1.0: Test case 132: An ID3 tag with genre set to Power Ballad. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_132_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Power Ballad');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Power Ballad');
});

test('ID3v1.0: Test case 133: An ID3 tag with genre set to Rhythmic Soul. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_133_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Rhythmic Soul');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Rhythmic Soul');
});

test('ID3v1.0: Test case 134: An ID3 tag with genre set to Freestyle. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_134_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Freestyle');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Freestyle');
});

test('ID3v1.0: Test case 135: An ID3 tag with genre set to Duet. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_135_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Duet');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Duet');
});

test('ID3v1.0: Test case 136: An ID3 tag with genre set to Punk Rock. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_136_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Punk Rock');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Punk Rock');
});

test('ID3v1.0: Test case 137: An ID3 tag with genre set to Drum Solo. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_137_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Drum Solo');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Drum Solo');
});

test('ID3v1.0: Test case 138: An ID3 tag with genre set to A capella. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_138_genre_W.mp3'));
	expect(id3.metadata.title).toBe('A capella');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('A capella');
});

test('ID3v1.0: Test case 139: An ID3 tag with genre set to Euro-House. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_139_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Euro-House');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Euro-House');
});

test('ID3v1.0: Test case 140: An ID3 tag with genre set to Dance Hall. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_140_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Dance Hall');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Dance Hall');
});

test('ID3v1.0: Test case 141: An ID3 tag with genre set to Goa. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_141_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Goa');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Goa');
});

test('ID3v1.0: Test case 142: An ID3 tag with genre set to Drum & Bass. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_142_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Drum & Bass');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Drum & Bass');
});

test('ID3v1.0: Test case 143: An ID3 tag with genre set to Club-House. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_143_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Club-House');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Club-House');
});

test('ID3v1.0: Test case 144: An ID3 tag with genre set to Hardcore. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_144_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Hardcore');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Hardcore');
});

test('ID3v1.0: Test case 145: An ID3 tag with genre set to Terror. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_145_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Terror');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Terror');
});

test('ID3v1.0: Test case 146: An ID3 tag with genre set to Indie. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_146_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Indie');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Indie');
});

test('ID3v1.0: Test case 147: An ID3 tag with genre set to BritPop. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_147_genre_W.mp3'));
	expect(id3.metadata.title).toBe('BritPop');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('BritPop');
});

test('ID3v1.0: Test case 148: An ID3 tag with genre set to Negerpunk. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_148_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Negerpunk');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Negerpunk');
});

test('ID3v1.0: Test case 149: An ID3 tag with genre set to Polsk Punk. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_149_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Polsk Punk');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Polsk Punk');
});

test('ID3v1.0: Test case 150: An ID3 tag with genre set to Beat. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_150_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Beat');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Beat');
});

test('ID3v1.0: Test case 151: An ID3 tag with genre set to Christian. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_151_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Christian');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Christian');
});

test('ID3v1.0: Test case 152: An ID3 tag with genre set to Heavy Metal. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_152_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Heavy Metal');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Heavy Metal');
});

test('ID3v1.0: Test case 153: An ID3 tag with genre set to Black Metal. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_153_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Black Metal');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Black Metal');
});

test('ID3v1.0: Test case 154: An ID3 tag with genre set to Crossover. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_154_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Crossover');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Crossover');
});

test('ID3v1.0: Test case 155: An ID3 tag with genre set to Contemporary. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_155_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Contemporary');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Contemporary');
});

test('ID3v1.0: Test case 156: An ID3 tag with genre set to Christian Rock. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_156_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Christian Rock');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Christian Rock');
});

test('ID3v1.0: Test case 157: An ID3 tag with genre set to Merengue. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_157_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Merengue');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Merengue');
});

test('ID3v1.0: Test case 158: An ID3 tag with genre set to Salsa. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_158_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Salsa');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Salsa');
});

test('ID3v1.0: Test case 159: An ID3 tag with genre set to Thrash Metal. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_159_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Thrash Metal');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Thrash Metal');
});

test('ID3v1.0: Test case 160: An ID3 tag with genre set to Anime. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_160_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Anime');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Anime');
});

test('ID3v1.0: Test case 161: An ID3 tag with genre set to JPop. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_161_genre_W.mp3'));
	expect(id3.metadata.title).toBe('JPop');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('JPop');
});

test('ID3v1.0: Test case 162: An ID3 tag with genre set to Synthpop. Only the first 80 genres are defined in the original ID3.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_162_genre_W.mp3'));
	expect(id3.metadata.title).toBe('Synthpop');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Synthpop');
});

test('ID3v1.0: Test case 163: An ID3 tag with genre set to 148.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_163_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/148');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 164: An ID3 tag with genre set to 149.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_164_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/149');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 165: An ID3 tag with genre set to 150.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_165_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/150');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 166: An ID3 tag with genre set to 151.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_166_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/151');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 167: An ID3 tag with genre set to 152.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_167_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/152');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 168: An ID3 tag with genre set to 153.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_168_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/153');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 169: An ID3 tag with genre set to 154.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_169_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/154');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 170: An ID3 tag with genre set to 155.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_170_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/155');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 171: An ID3 tag with genre set to 156.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_171_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/156');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 172: An ID3 tag with genre set to 157.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_172_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/157');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 173: An ID3 tag with genre set to 158.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_173_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/158');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 174: An ID3 tag with genre set to 159.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_174_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/159');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 175: An ID3 tag with genre set to 160.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_175_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/160');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 176: An ID3 tag with genre set to 161.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_176_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/161');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 177: An ID3 tag with genre set to 162.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_177_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/162');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 178: An ID3 tag with genre set to 163.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_178_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/163');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 179: An ID3 tag with genre set to 164.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_179_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/164');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 180: An ID3 tag with genre set to 165.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_180_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/165');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 181: An ID3 tag with genre set to 166.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_181_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/166');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 182: An ID3 tag with genre set to 167.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_182_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/167');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 183: An ID3 tag with genre set to 168.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_183_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/168');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 184: An ID3 tag with genre set to 169.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_184_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/169');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 185: An ID3 tag with genre set to 170.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_185_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/170');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 186: An ID3 tag with genre set to 171.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_186_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/171');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 187: An ID3 tag with genre set to 172.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_187_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/172');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 188: An ID3 tag with genre set to 173.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_188_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/173');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 189: An ID3 tag with genre set to 174.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_189_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/174');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 190: An ID3 tag with genre set to 175.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_190_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/175');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 191: An ID3 tag with genre set to 176.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_191_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/176');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 192: An ID3 tag with genre set to 177.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_192_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/177');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 193: An ID3 tag with genre set to 178.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_193_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/178');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 194: An ID3 tag with genre set to 179.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_194_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/179');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 195: An ID3 tag with genre set to 180.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_195_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/180');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 196: An ID3 tag with genre set to 181.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_196_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/181');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 197: An ID3 tag with genre set to 182.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_197_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/182');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 198: An ID3 tag with genre set to 183.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_198_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/183');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 199: An ID3 tag with genre set to 184.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_199_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/184');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 200: An ID3 tag with genre set to 185.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_200_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/185');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 201: An ID3 tag with genre set to 186.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_201_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/186');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 202: An ID3 tag with genre set to 187.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_202_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/187');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 203: An ID3 tag with genre set to 188.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_203_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/188');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 204: An ID3 tag with genre set to 189.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_204_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/189');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 205: An ID3 tag with genre set to 190.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_205_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/190');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 206: An ID3 tag with genre set to 191.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_206_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/191');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 207: An ID3 tag with genre set to 192.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_207_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/192');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 208: An ID3 tag with genre set to 193.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_208_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/193');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 209: An ID3 tag with genre set to 194.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_209_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/194');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 210: An ID3 tag with genre set to 195.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_210_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/195');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 211: An ID3 tag with genre set to 196.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_211_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/196');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 212: An ID3 tag with genre set to 197.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_212_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/197');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 213: An ID3 tag with genre set to 198.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_213_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/198');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 214: An ID3 tag with genre set to 199.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_214_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/199');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 215: An ID3 tag with genre set to 200.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_215_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/200');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 216: An ID3 tag with genre set to 201.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_216_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/201');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 217: An ID3 tag with genre set to 202.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_217_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/202');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 218: An ID3 tag with genre set to 203.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_218_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/203');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 219: An ID3 tag with genre set to 204.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_219_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/204');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 220: An ID3 tag with genre set to 205.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_220_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/205');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 221: An ID3 tag with genre set to 206.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_221_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/206');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 222: An ID3 tag with genre set to 207.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_222_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/207');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 223: An ID3 tag with genre set to 208.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_223_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/208');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 224: An ID3 tag with genre set to 209.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_224_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/209');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 225: An ID3 tag with genre set to 210.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_225_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/210');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 226: An ID3 tag with genre set to 211.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_226_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/211');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 227: An ID3 tag with genre set to 212.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_227_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/212');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 228: An ID3 tag with genre set to 213.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_228_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/213');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 229: An ID3 tag with genre set to 214.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_229_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/214');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 230: An ID3 tag with genre set to 215.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_230_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/215');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 231: An ID3 tag with genre set to 216.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_231_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/216');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 232: An ID3 tag with genre set to 217.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_232_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/217');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 233: An ID3 tag with genre set to 218.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_233_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/218');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 234: An ID3 tag with genre set to 219.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_234_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/219');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 235: An ID3 tag with genre set to 220.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_235_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/220');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 236: An ID3 tag with genre set to 221.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_236_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/221');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 237: An ID3 tag with genre set to 222.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_237_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/222');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 238: An ID3 tag with genre set to 223.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_238_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/223');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 239: An ID3 tag with genre set to 224.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_239_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/224');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 240: An ID3 tag with genre set to 225.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_240_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/225');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 241: An ID3 tag with genre set to 226.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_241_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/226');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 242: An ID3 tag with genre set to 227.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_242_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/227');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 243: An ID3 tag with genre set to 228.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_243_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/228');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 244: An ID3 tag with genre set to 229.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_244_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/229');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 245: An ID3 tag with genre set to 230.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_245_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/230');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 246: An ID3 tag with genre set to 231.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_246_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/231');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 247: An ID3 tag with genre set to 232.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_247_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/232');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 248: An ID3 tag with genre set to 233.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_248_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/233');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 249: An ID3 tag with genre set to 234.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_249_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/234');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 250: An ID3 tag with genre set to 235.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_250_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/235');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 251: An ID3 tag with genre set to 236.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_251_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/236');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 252: An ID3 tag with genre set to 237.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_252_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/237');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 253: An ID3 tag with genre set to 238.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_253_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/238');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 254: An ID3 tag with genre set to 239.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_254_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/239');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 255: An ID3 tag with genre set to 240.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_255_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/240');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 256: An ID3 tag with genre set to 241.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_256_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/241');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 257: An ID3 tag with genre set to 242.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_257_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/242');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 258: An ID3 tag with genre set to 243.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_258_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/243');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 259: An ID3 tag with genre set to 244.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_259_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/244');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 260: An ID3 tag with genre set to 245.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_260_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/245');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 261: An ID3 tag with genre set to 246.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_261_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/246');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 262: An ID3 tag with genre set to 247.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_262_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/247');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 263: An ID3 tag with genre set to 248.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_263_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/248');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 264: An ID3 tag with genre set to 249.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_264_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/249');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 265: An ID3 tag with genre set to 250.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_265_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/250');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 266: An ID3 tag with genre set to 251.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_266_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/251');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 267: An ID3 tag with genre set to 252.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_267_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/252');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 268: An ID3 tag with genre set to 253.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_268_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/253');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 269: An ID3 tag with genre set to 254.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_269_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/254');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 270: An ID3 tag with genre set to 255.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_270_genre_F.mp3'));
	expect(id3.metadata.title).toBe('Unknown/255');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('');
	expect(id3.metadata.genre).toBe('Unknown');
});

test('ID3v1.0: Test case 271: Title with 8-bit iso-8859-1 characters (would be written as r&auml;ksm&ouml;rg&aring;s in HTML).', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_271_extra.mp3'));
	expect(id3.metadata.title).toBe('räksmörgås');
	expect(id3.metadata.artist).toBe('räksmörgås');
	expect(id3.metadata.album).toBe('räksmörgås');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('räksmörgås');
	expect(id3.metadata.genre).toBe('Blues');
});

test('ID3v1.0: Test case 272: Title with utf-8-encoded 8-bit string (would be written as r&auml;ksm&ouml;rg&aring;s in HTML).', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_272_extra.mp3'));
	expect(id3.metadata.title).toBe('rÃ¤ksmÃ¶rgÃ¥s');
	expect(id3.metadata.artist).toBe('rÃ¤ksmÃ¶rgÃ¥s');
	expect(id3.metadata.album).toBe('rÃ¤ksmÃ¶rgÃ¥s');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('rÃ¤ksmÃ¶rgÃ¥s');
	expect(id3.metadata.genre).toBe('Blues');
});

test('ID3v1.0: Test case 273: Comment field with http://-style URL.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_273_extra.mp3'));
	expect(id3.metadata.title).toBe('');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('http://www.id3.org/');
	expect(id3.metadata.genre).toBe('Blues');
});

test('ID3v1.0: Test case 274: Comment field with unprefixed URL.', () => {
	const id3 = readID3(readTestFile('id3v1/id3v1_274_extra.mp3'));
	expect(id3.metadata.title).toBe('');
	expect(id3.metadata.artist).toBe('');
	expect(id3.metadata.album).toBe('');
	expect(id3.metadata.year).toBe('2003');
	expect(id3.metadata.comment).toBe('www.id3.org/');
	expect(id3.metadata.genre).toBe('Blues');
});

