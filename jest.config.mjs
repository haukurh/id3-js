/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

export default {
	// Automatically clear mock calls, instances, contexts and results before every test
	clearMocks: true,

	// Indicates which provider should be used to instrument code for coverage
	coverageProvider: 'v8',

	// The glob patterns Jest uses to detect test files
	testMatch: [
		'**/__tests__/**/*.mjs?(x)',
		'**/?(*.)+(spec|test).mjs?(x)'
	],
};
