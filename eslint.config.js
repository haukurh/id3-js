import js from '@eslint/js';

// Our custom rules for eslint which we overwrite if needed
const rules = {
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
};

export default [
	{
		...js.configs.recommended,
		files: ['**/*.mjs', '**/*.js'],
		rules: {
			...js.configs.recommended.rules,
			...rules,
		}
	},
	{
		...js.configs.recommended,
		files: ['test/**/*.mjs'],
		rules: {
			...js.configs.recommended.rules,
			...rules,
			'no-undef': 'off',
		}
	}
];
