import { isInitPromise, createResolvingFunctions } from '../internal/operation'
import { GET_STATE } from '../internal/constants'
import { PromiseState } from '../internal/state.js'
import { isCallable, valueToString } from '../util/lang'
import then from './instance/then'
import caught from './instance/catch'
import toString from './instance/toString'
import resolve from './static/resolve'
import reject from './static/reject'
import all from './static/all'
import race from './static/race'

/**
 * create a promise instance
 *
 * @constructor
 * @param {Function} executor - a promise resolver
 */
export default function Promise(executor) {
  if ( !isInitPromise(this) ) {
    throw new TypeError('The Promise constructor must be called with the "new" operator')
  }

  if ( !isCallable(executor) ) {
    throw new TypeError('Promise resolver ' + valueToString(executor) + ' is not a function')
  }

  // create an internal state record
  var record = new PromiseState()

  Object.defineProperty(this, GET_STATE, {
    get: function () {
      return function () {
        return this === PromiseState.empty ? record : undefined
      }
    }
  })

  var handlers = createResolvingFunctions(this)
    
  try {
    executor(handlers.resolve, handlers.reject)
  } catch(error) {
    handlers.reject(error)
  }
}

Object.defineProperty(Promise, 'prototype', { writable: false })
Promise.prototype.toString = toString
Promise.prototype.then = then
Promise.prototype.catch = caught
Promise.reject = reject
Promise.resolve = resolve
Promise.all = all
Promise.race = race
