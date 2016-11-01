import { isConstructor } from '../../util/lang'
import { analyzePromise, getNewCapability } from '../../internal/operation'

/**
 * resolve a promise instance with the argument as its value
 *
 * @static
 * @memberOf Promise
 * @param  {*} resolution
 * @return {Promise}
 */
export default function resolve(resolution) {
  if ( !isConstructor(this) ) {
    throw new TypeError('the "resolve" function must be called on a constructor')
  }

  if ( analyzePromise(resolution).isPromise && resolution.constructor === this ) {
    return resolution
  }

  var deferred = getNewCapability(this)
  deferred.resolve(resolution)

  return deferred.promise
}

