import * as fs from 'fs';
import { readID3 } from '../src/id3.mjs';
import { expect, test } from '@jest/globals';

const id3v1_file = fs.readFileSync('./test/files/id3v1.mp3');
const id3v1v2_file = fs.readFileSync('./test/files/id3v1v2.mp3');
const id3v23_file = fs.readFileSync('./test/files/id3v2.3.mp3');
const id3v24_file = fs.readFileSync('./test/files/id3v2.4.mp3');
const noMeta_file = fs.readFileSync('./test/files/no-meta.mp3');

test('should be able to read ID3v2', () => {
	const id3v1v2 = readID3(new Uint8Array(id3v1v2_file.buffer));
	const id3v23 = readID3(new Uint8Array(id3v23_file.buffer));
	const id3v24 = readID3(new Uint8Array(id3v24_file.buffer));
	expect(id3v24.version).toBe('ID3v2.4.0');
	expect(id3v23.version).toBe('ID3v2.3.0');
	expect(id3v1v2.version).toBe('ID3v2.3.0');
});

test('should be able to read ID3v1', () => {
	const id3v1 = readID3(new Uint8Array(id3v1_file.buffer));
	expect(id3v1.version).toBe('ID3v1.0');
});

test('should return null if no ID3 tag found', () => {
	const noMeta = readID3(new Uint8Array(noMeta_file.buffer));
	expect(noMeta).toBeNull();
});
