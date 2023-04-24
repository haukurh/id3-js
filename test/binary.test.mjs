import { expect, test } from '@jest/globals';
import { getSyncSafeInt35 } from './../src/binary.mjs';

test('35bit madness', () => {
	const data = new Uint8Array([0xf, 0x7f, 0x7f, 0x7f, 0x7f]);
	expect(getSyncSafeInt35(data, 0)).toBe(0xffffffff);

	const data2 = new Uint8Array([0x07, 0x13, 0x6B, 0x4F, 0x46]);
	expect(getSyncSafeInt35(data2, 0)).toBe(0x727AE7C6);
});
