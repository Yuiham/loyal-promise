import {
  isPlainObject,
  isCallable,
  isConstructor,
  isString
} from '../util/lang'
import promisify from './promisify'

var defaultSuffix = 'Async'
var matchSuffix = 'Sync'

/**
 * Convert callback-based Node.js APIs to promise-based functions
 * with names ending in the "Sync" suffix
 *
 * @param  {Object} target - a module object with sync-functions member
 * @param  {Object} [option = {}] - an optional config
 * @param  {*} [option.context] - context for calling fn
 * @param  {String} [option.suffix = 'Async'] - a suffix for the promisified functions name
 * @param  {Boolen} [option.multiArgs = false] - allow callback's multi arguments or not
 * @return {Object}
 */
export default function promisifyAll(target, option) {
  var constructor = this, suffix

  if ( !isConstructor(this) ) {
    throw new TypeError('the "promisify" function must be called on a constructor')
  }

  if ( !isPlainObject(target) ) {
    throw new TypeError('the target is not a plain object')
  }

  option = isPlainObject(option) ? option : Object.create(null)
  suffix = isString(option.suffix) ? option.suffix : defaultSuffix

  return Object.getOwnPropertyNames(target).reduce(function (pre, cur) {
    if ( target.hasOwnProperty(cur + matchSuffix) && isCallable(target[cur]) ) {
      pre[cur + suffix] = promisify.call(constructor, target[cur], option)
    } else {
      pre[cur] = target[cur]
    }

    return pre
  }, {})
}