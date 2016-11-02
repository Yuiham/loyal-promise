import {
  PENDING,
  FULFILLED,
  REJECTED,
  STATE,
  RESULT,
  FULFILL_REACTIONS,
  REJECT_REACTIONS,
  PROMISE_ID,
  IS_HANDLED,
  GET_STATE,
  FULFILL_FLAG,
  CAPABILITY,
  TYPE,
  HANDLER
} from './constants'
import { 
  PromiseState,
  promiseStore
} from './state'
import { isCycle } from './cycle'
import {
  isObject,
  isPlainObject,
  isCallable,
  isConstructor,
  scheduler
} from 'util'
import Promise from 'promise'


/**
 * create a new deferred object which provides a resolve function and a reject
 * function
 * 
 * @private
 * @param  {Function} fn - a constructor function
 * @return {Object}
 */
function getNewCapability(constructor) {
  var obj = Object.create(null)

  if (!isConstructor(constructor)) {
    throw new TypeError(String(constructor) + ' is not a constructor')
  }

  // assume the function "constructor" is the Promise constructor 
  // or the former's subclass constructor
  obj.promise = new constructor(function executor(resolve, reject) {
    obj.resolve = resolve
    obj.reject = reject
  })

  if ( !isCallable(obj.resolve) || !isCallable(obj.reject) ) {
    throw new TypeError('Promise resolve or reject function is not callable')
  }

  return obj
}

/**
 * create two functions to resolve the passed promise one can do the fulfillment
 * or rejection job, while the other one can only reject the promise
 * 
 * @private
 * @param  {Object} promise - a promise instance
 * @return {Object} resolving functions container
 */
function createResolvingFunctions(promise) {
  var alreadyResolved = false

  return {
    resolve: function _resolve(resolution) {
      if (alreadyResolved) {
        return
      }
      alreadyResolved = true
      resolvePromise(promise, resolution)
    },
    reject: function _reject(reason) {
      if (alreadyResolved) {
        return
      }
      alreadyResolved = true

      var record = PromiseState.getState(promise)
      settlePromise(record, reason, REJECTED)
    }
  }
}

/**
 * a built-in function for resolving the promise with the argument which can
 * decide the settlement type
 *
 * @private
 * @param  {Promise} promise - promise to resolve
 * @param  {*} resolution - value for fulfilling promise
 * @return {undefined}
 */
function resolvePromise(promise, resolution) {
  var record = PromiseState.getState(promise)
  var then

  if (resolution === promise) {
    return settlePromise(record, new TypeError('Chaining cycle detected for promise'), REJECTED)
  }

  if ( !isObject(resolution) && !isCallable(resolution) ) {
    return settlePromise(record, resolution, FULFILLED)
  }

  // access the argument's "then" property
  // handle the exception while accessing a getter
  try {
    then = resolution.then
  } catch(error) {
    return settlePromise(record, error, REJECTED)
  }

  if ( !isCallable(then) ) {
    return settlePromise(record, resolution, FULFILLED)
  }

  scheduler(resolveThenable, promise, record[PROMISE_ID], resolution, then)
}

/**
 * resolve a passed thenable and settle a promise instance
 *
 * @private
 * @param  {Promise} promise - a promise instance
 * @param  {String} id - promise unique id
 * @param  {Object|Promise} thenable
 * @param  {Function} then - "then" method of a thenable
 * @return {undefined}
 */
function resolveThenable(promise, id, thenable, then) {
  var handlers = createResolvingFunctions(promise),
    resolve = handlers.resolve,
    reject = handlers.reject
 
  if (isCycle(id, thenable)) {
    reject(new TypeError('Chaining cycle detected for promise'))
    return
  }

  try {
    then.call(thenable, resolve, reject)
  } catch (error) {
    reject(error)
  }
}

/**
 * fulfill/reject a promise with the argument
 *
 * @private
 * @param  {Object} record - promise inner record
 * @param  {*} data
 * @return {undefined}
 */
function settlePromise(record, data, status) {
  if (record[STATE] !== PENDING) {
    return
  }

  var isReject = status === REJECTED
  var reactions = record[isReject ? REJECT_REACTIONS : FULFILL_REACTIONS]

  record[FULFILL_REACTIONS] = null
  record[REJECT_REACTIONS] = null
  record[RESULT] = data
  record[STATE] = status

  // output an error if a rejected promise has no rejection callback
  if ( isReject && !record[IS_HANDLED] ) {
    // eslint-disable-next-line no-console
    console.error(data)
  }

  return reactions.length ? scheduleReactions(reactions, data) : undefined 
}

/**
 * schedule each of the promise's reactions
 *
 * @private
 * @param  {Object} reactions - fulfillReactions/rejectReactions
 * @param  {*} arg - The argument used in promiseReactionJob
 * @return {undefined}
 */
function scheduleReactions(reactions, arg) {
  return scheduler(function (reactions, arg) {
    for (var i = 0, len = reactions.length; i < len; i += 1) {
      reactions[i].handle(arg)
    }
  }, reactions, arg)
}

/**
 * promise's reaction record
 *
 * @private
 * @param  {Object} capability
 * @param  {String} type
 * @param  {Function} callback
 * @return {Object} reaction
 */
function Reaction(capability, type, callback) {
  this[CAPABILITY] = capability
  this[TYPE] = type
  this[HANDLER] = isCallable(callback) ? callback: undefined
}

/**
 * handle the reactions of a promise and settle another promise
 * 
 * @private
 * @param  {*} arg - result of a promise
 * @return {undefined}
 */
Reaction.prototype.handle = function handle(arg) {
  var handler = this[HANDLER],
    resolve = this[CAPABILITY].resolve,
    reject = this[CAPABILITY].reject,
    result

  if ( !handler ) {
    return this[TYPE] === FULFILL_FLAG ? resolve(arg) : reject(arg)
  }

  try {
    result = handler(arg)
    resolve(result)
  } catch(error) {
    reject(error)
  }
}

/**
 * check whether the passed argument is an initial promise
 *
 * @private
 * @param  {Promise} x 
 * @return {Boolean} 
 */
function isInitPromise(x) {
  return isPlainObject(x) 
        && (Object.getOwnPropertyNames(x).length === 0) 
        && (x instanceof Promise)
}

/**
 * analyze the passed argument and provide a result object with a boolean
 * property, indicating whether the argument is a promise, and a property which
 * is undefined or the argument's inner record if the argument is a promise
 * 
 * @private
 * @param  {Promise} x
 * @return {Boolean} 
 */
function analyzePromise(x) {
  var record = isPlainObject(x) && (x instanceof Promise) && isCallable(x[GET_STATE]) 
              ? PromiseState.getState(x) 
              : undefined

  return {
    isPromise: isPlainObject(record) && (String(record[PROMISE_ID]) in promiseStore.dict),
    record: record
  }
}

export {
  createResolvingFunctions,
  getNewCapability,
  Reaction,
  isInitPromise,
  analyzePromise
}