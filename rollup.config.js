import terser from '@rollup/plugin-terser';

export default {
	input: 'src/id3.mjs',
	output: [{
		file: 'dist/id3-min.mjs',
		format: 'es',
		name: 'playlist',
		plugins: [terser()],
	},{
		file: 'dist/id3-min.js',
		format: 'iife',
		name: 'playlistJS',
		plugins: [terser()],
	}],
};
