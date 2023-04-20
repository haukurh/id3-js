

import { readID3 } from '../src/id3.mjs';

test('readID3 should return an object', () => {
	const output = readID3([]);
	expect(output instanceof Object).toBe(true);
});
