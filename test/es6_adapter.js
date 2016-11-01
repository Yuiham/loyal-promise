/**
 * Adapter for the "Promise ES6 Tests" test runner
 */

'use strict'

const assert = require('assert')
const Promise = require('../dist/lp.cjs')
const config = require('./aplus_adapter')

module.exports = Object.assign({}, config, {
    defineGlobalPromise(globalScope) {
        globalScope.Promise = Promise
        globalScope.assert = assert
    },
    removeGlobalPromise(globalScope) {
        delete globalScope.Promise
    }
}