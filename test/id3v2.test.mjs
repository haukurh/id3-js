import { expect, test } from '@jest/globals';
import { readID3 } from '../src/id3.mjs';
import * as testFile from './files.mjs';

test('should parse ID3v2 flags correctly', () => {
	const id3v1v2 = readID3(new Uint8Array(testFile.id3v1v2.buffer));
	const id3v23 = readID3(new Uint8Array(testFile.id3v23.buffer));
	const id3v24 = readID3(new Uint8Array(testFile.id3v24.buffer));

	expect(id3v1v2.flags.unsynchronisation).toBe(false);
	expect(id3v1v2.flags.extendedHeader).toBe(false);
	expect(id3v1v2.flags.experimentalIndicator).toBe(false);
	expect(id3v1v2.flags.footerPresent).toBe(false);

	expect(id3v23.flags.unsynchronisation).toBe(false);
	expect(id3v23.flags.extendedHeader).toBe(false);
	expect(id3v23.flags.experimentalIndicator).toBe(false);
	expect(id3v23.flags.footerPresent).toBe(false);

	expect(id3v24.flags.unsynchronisation).toBe(false);
	expect(id3v24.flags.extendedHeader).toBe(true);
	expect(id3v24.flags.experimentalIndicator).toBe(false);
	expect(id3v24.flags.footerPresent).toBe(false);
});
