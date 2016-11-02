import { analyzePromise } from 'internal'

/**
 * a catch method which would be called then a promise is rejected 
 * the keyword "catch" cannot be used as an identifier 
 *
 * @instance
 * @memberOf Promise.prototype
 * @param  {Function} onRejected - a rejection callback
 * @return {Promise} 
 */
export default function caught(onRejected) {
  if ( !analyzePromise(this).isPromise ) {
    throw new TypeError(String(this) + 'is not a promise')
  }

  return this.then(undefined, onRejected)
}