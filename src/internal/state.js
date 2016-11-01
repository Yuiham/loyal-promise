import {
  PENDING,
  STATE,
  RESULT,
  FULFILL_REACTIONS,
  REJECT_REACTIONS,
  PROMISE_ID,
  IS_HANDLED,
  GET_STATE
} from './constants'

/**
 * get an initial promise state record
 *
 * @private
 * @return {Object} the settled state record
 */
export function PromiseState() {
  this[PROMISE_ID] = promiseStore.init()
  this[STATE] = PENDING
  this[RESULT] = null
  this[FULFILL_REACTIONS] = []
  this[REJECT_REACTIONS] = []
  this[IS_HANDLED] = false
}

/**
 * access the internal state record of a promise instance
 *
 * @param  {Promise} promise 
 * @return {Object}
 */
PromiseState.getState = function (promise) {
  return promise[GET_STATE].call(this.empty)
}

/**
 * an empty object
 * 
 * @type {Object}
 */
PromiseState.empty = Object.create(null)

/**
 * an object that stores promises id
 *
 * @private
 * @type {Object}
 */
export var promiseStore = {
  counter: 1,
  /**
   * create a unique id
   * 
   * @return {String}
   */
  init: function () {
    var id = (this.counter++) + '_' + new Date().getTime()

    this.dict[id] = null

    return id
  },
  /**
   * a map that stores promises id
   * 
   * @type {Object}
   */
  dict: Object.create(null)
}
