import {
  slice, 
  isCallable,
  isConstructor,
  isPlainObject
} from '../util/lang'
import { PROMISIFIED_FLAG } from '../internal/constants'
import { getNewCapability } from '../internal/operation'

/**
 * check whether the function has been promisified
 *
 * @private
 * @param  {Function} fn 
 * @return {Boolean} 
 */
function isPromisified(fn) {
  return fn[PROMISIFIED_FLAG] === true
}

/**
 * create a promisified function
 *
 * @private
 * @param  {Function} constructor 
 * @param  {Function} fn
 * @param  {*} context 
 * @param  {Boolen} multi
 * @return {Function}
 */
function performPromisify(constructor, fn, context, multi) {
  var ret = function () {
    var deferred = getNewCapability(constructor)
        
    function callback(err) {
      if (err) {
        deferred.reject(err)
      }
      deferred.resolve(multi ? slice(arguments, 1) : arguments[1])
    }

    fn.apply(context || this, slice(arguments).concat(callback))

    return deferred.promise
  }

  Object.defineProperty(ret, PROMISIFIED_FLAG, {
    value: true,
    configurable: false
  })

  return ret
}

/**
 * convert a callback-based Node.js API to a promise-based one
 * 
 * @param  {Function} fn - a function that need to be promisified
 * @param  {Object} [option = {}] - an optional config for performPromisify function
 * @param  {*} [option.context] - the context of calling fn
 * @param  {Boolen} [option.multiArgs = false] - if fn's callback accept multi arguments or not
 * @return {Function} a promisified function
 */
export default function promisify(fn, option) {
  if ( !isConstructor(this) ) {
    throw new TypeError('the "promisify" function must be called on a constructor')
  }
  if ( !isCallable(fn) ) {
    throw new TypeError('cannot promisify the unCallable object')
  }
  if ( isPromisified(fn) ) {
    return fn
  }

  option = isPlainObject(option) ? option : Object.create(null)

  return performPromisify(this, fn, option.context, option.multiArgs ? true : false)
}