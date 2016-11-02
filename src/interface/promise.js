import {
  isInitPromise, 
  createResolvingFunctions,
  PromiseState,
  GET_STATE
} from 'internal'
import { isCallable } from 'util'

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
    throw new TypeError('Promise resolver ' + String(executor) + ' is not a function')
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