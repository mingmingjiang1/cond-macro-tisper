// index.js
const testCode = `
// #if DEBUG === 'true'
import { debug344 } from './debug';
// #elif DEBUG === 'false'
import { debug45 } from './debug';
// #else
import { debug } from './debug';

console.log(84848)
`;

const babel = require('@babel/core');
const plugin = require('./cond-plugin');

const result = babel.transform(testCode, {
  plugins: [[plugin, { debug: 'true' }]],
});

console.log(result.code);