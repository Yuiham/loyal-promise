import {
  PENDING,
  FULFILLED,
  REJECTED,
  STATE,
  RESULT,
  FULFILL_REACTIONS,
  REJECT_REACTIONS,
  IS_HANDLED,
  FULFILL_FLAG,
  REJECT_FLAG
} from '../../internal/constants'
import {
  analyzePromise,
  getNewCapability,
  Reaction
} from '../../internal/operation'
import {
  getConstructor,
  valueToString
} from '../../util/lang'
import scheduler from '../../util/scheduler'
import Promise from '../constructor'

/**
 * handle a promise's onFulfilled/onRejected callbacks
 *
 * @instance
 * @memberOf Promise.prototype
 * @param  {Function} onFulfilled - a fulfilled callback
 * @param  {Function} onRejected - a rejected callback
 * @return {Promise} a new promise instance
 */
export default function then(onFulfilled, onRejected) {
  var result = analyzePromise(this)

  if ( !result.isPromise ) {
    throw new TypeError(valueToString(this) + ' is not a promise')
  }

  var deferred = getNewCapability( getConstructor(this, Promise) )

  return performThen(result.record, onFulfilled, onRejected, deferred)
}


/**
 * schedule the settlement reaction according to a promise state
 * 
 * @private
 * @param  {Object} record - the inner record of a promise instance
 * @param  {Function} onFulfilled
 * @param  {Function} onRejected
 * @param  {Object} deferred
 * @return {Promise} newPromise
 */
function performThen(record, onFulfilled, onRejected, deferred) {
  var fulfillR = new Reaction(deferred, FULFILL_FLAG, onFulfilled)
  var rejectR = new Reaction(deferred, REJECT_FLAG, onRejected)

  switch(record[STATE]) {
  case PENDING:
    record[FULFILL_REACTIONS].push(fulfillR)
    record[REJECT_REACTIONS].push(rejectR)
    break
  case FULFILLED:
    scheduler(fulfillR.handle.bind(fulfillR), record[RESULT])
    break
  case REJECTED:
    if ( !record[IS_HANDLED] ) {
      // eslint-disable-next-line no-console
      console.error(record[RESULT])
    }
    scheduler(rejectR.handle.bind(rejectR), record[RESULT])
    break
  default:
    break
  }

  record[IS_HANDLED] = true

  return deferred.promise
}
