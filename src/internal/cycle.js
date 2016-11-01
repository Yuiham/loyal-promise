import { SAFE_DEEP } from './constants'

/**
 * an object that caches circular thenables
 *
 * @private
 * @type {Object}
 */
var cycleCache = Object.create(null)

/**
 * check whether a thenable participates in a circular thenable chain
 *
 * @private
 * @param  {String} promiseId
 * @param  {Object} thenable
 * @return {Boolean}
 */
export function isCycle(promiseId, thenable) {
  var cache = cycleCache[promiseId] = cycleCache[promiseId] || {
    list: [],
    preIdx: -1,
    reIdx: 1,
    step: 0,
    isMax: false
  }

  if (cache.isMax) {
    return false
  }

  var list = cache.list
  var len = list.length

  if (len) {
    if (list[len - 1] === thenable) {
      delete cycleCache[promiseId]
      return true
    }
    if (cache.preIdx > -1 && list[cache.preIdx + cache.step + 1] === thenable) {
      cache.step += 1
            
      if (cache.preIdx === cache.reIdx - cache.step - 1) {
        delete cycleCache[promiseId]
        return true
      }
    } else {
      cache.preIdx = list.lastIndexOf(thenable)
      cache.reIdx = len
      cache.step = 0
    }
  }
    
  if (len < SAFE_DEEP) {
    list.push(thenable)
  } else {
    cache.list = null
    cache.isMax = true
  }

  return false
}