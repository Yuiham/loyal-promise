var PENDING = 0
var FULFILLED = 1
var REJECTED = 2
var FULFILL_FLAG = 'F'
var REJECT_FLAG = 'R'
var STATE = '_PromiseState'
var RESULT = '_PromiseResult'
var FULFILL_REACTIONS = '_PromiseFulfillReactions'
var REJECT_REACTIONS = '_PromiseRejectReactions'
var PROMISE_ID = '_PromiseId'
var IS_HANDLED = '_PromiseIsHandled'
var GET_STATE = '_getState'
var CAPABILITY = '_Capability'
var TYPE = '_Type'
var HANDLER = '_Handler'
var PROMISIFIED_FLAG = '_isPromisified'
var SAFE_DEEP = Math.pow(2, 32) - 1

export {
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
  REJECT_FLAG,
  CAPABILITY,
  TYPE,
  HANDLER,
  PROMISIFIED_FLAG,
  SAFE_DEEP
}
