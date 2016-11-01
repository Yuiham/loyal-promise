import { isCallable, slice } from './lang'

/**
 * a job scheduler.
 * the setImmediate function is the first choice the process.nextTick function
 * is the second choice for Node.js the setTimeout function is uesd as the
 * absence of the APIs above
 *
 * @param {Function} a callback function
 * @param {...*} callback's arguments
 * @type {Function}
 */
export default (function () {
  if (typeof process === 'object' && process.nextTick) {
    return process.nextTick
  }

  if (typeof setImmediate !== 'undefined') {
    return setImmediate
  }

  return function (callback) {
    if ( !isCallable(callback) ) {
      return
    }
    return setTimeout( callback.bind.apply(callback, [null].concat(slice(arguments, 1))), 0)
  }
}())