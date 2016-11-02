import { isConstructor } from 'util'
import { getNewCapability } from 'internal'

/**
 * reject a promise instance with the argument as the reason
 *
 * @static
 * @memberOf Promise
 * @param  {*} reason
 * @return {Promise}
 */
export default function reject(reason) {
  if (!isConstructor(this)) {
    throw new TypeError('the "resolve" function must be called on a constructor')
  }

  var deferred = getNewCapability(this)
  deferred.reject(reason)

  return deferred.promise
}