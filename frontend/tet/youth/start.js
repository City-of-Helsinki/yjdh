// This line is needed so we can use import statements in server.js file
// https://github.com/standard-things/esm#getting-started
require = require('esm')(module);

// HDS injects component styles to document. Document needs to be initialized to global object
// see pages/_document.ts, it takes the generated styles from document.head and renders them
// to server side rendered head
const jsdom = require('jsdom');
const document = new jsdom.JSDOM('<!DOCTYPE html>').window.document;
global.document = document;

module.exports = require('../../shared/src/server/next-server');
