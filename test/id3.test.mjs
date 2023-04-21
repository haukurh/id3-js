import * as testFile from './files.mjs';
import { readID3 } from '../src/id3.mjs';
import { expect, test } from '@jest/globals';

test('should be able to read ID3v2', () => {
	const id3v1v2 = readID3(new Uint8Array(testFile.id3v1v2.buffer));
	const id3v23 = readID3(new Uint8Array(testFile.id3v23.buffer));
	const id3v24 = readID3(new Uint8Array(testFile.id3v24.buffer));
	expect(id3v24.version).toBe('ID3v2.4.0');
	expect(id3v23.version).toBe('ID3v2.3.0');
	expect(id3v1v2.version).toBe('ID3v2.3.0');
});

test('should be able to read ID3v1', () => {
	const id3v1 = readID3(new Uint8Array(testFile.id3v1.buffer));
	expect(id3v1.version).toBe('ID3v1.0');
});

test('should return null if no ID3 tag found', () => {
	const noMeta = readID3(new Uint8Array(testFile.no_meta.buffer));
	expect(noMeta).toBeNull();
});
