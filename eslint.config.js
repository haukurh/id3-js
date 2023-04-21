import js from '@eslint/js';

export default [
	{
		...js.configs.recommended,
		files: ['**/*.mjs', '**/*.js'],
		rules: {
			...js.configs.recommended.rules,
			'strict': 'error',
			'no-undef': 'error',
			'no-unused-vars': 'error',
			'indent': [
				'error',
				'tab'
			],
			'linebreak-style': [
				'error',
				'unix'
			],
			'quotes': [
				'error',
				'single'
			],
			'semi': [
				'error',
				'always'
			],
		}
	},
];
