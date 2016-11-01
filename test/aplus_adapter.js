/**
 * Adapter for the "Promises/A+ Tests" and the "Promise ES6 Tests" test runner
 */

'use strict'

const assert = require('assert')
const Promise = require('../dist/lp.cjs')

module.exports = {
    resolved(value) {
        return Promise.resolve(value)
    },
    rejected(reason) {
        return Promise.reject(reason)
    },
    deferred() {
        const obj = Object.create(null)
        obj.promise = new Promise(function (resolve, reject) {
            obj.resolve = resolve
            obj.reject = reject
        })
        return obj
    }
}