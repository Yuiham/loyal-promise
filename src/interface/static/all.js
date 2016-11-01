import {
  slice,
  isArguments,
  isConstructor,
  isIterable,
  hasIterator
} from '../../util/lang'
import { getNewCapability } from '../../internal/operation'

/**
 * create a new promise which is fulfilled with an array of fulfillment values
 * for the passed promises, or rejected with the reason of the first rejected
 * promise
 * 
 * @static
 * @memberOf Promise
 * @param  {(Array|String|Map|Set|Arguments|Generator)} iterable
 * @return {Promise}
 */
export default function all(iterable) {
  if ( !isConstructor(this) ) {
    throw new TypeError('the "all" method must be called on a constructor')
  }

  var deferred = getNewCapability(this)

  if (!isIterable(iterable)) {
    deferred.reject(new TypeError('the argument is not an iterable'))
    return deferred.promise
  }

  return performAll(iterable, this, deferred)
}

/**
 * iterate the passed iterable to resolve or reject the promise created by
 * Promise.all
 * 
 * @private
 * @param  {(Array|String|Map|Set|Arguments|Generator)} iterable
 * @param  {Function} constructor - the Promise constructor or its subclass
 * @param  {Object} deferred
 * @return {Promise}
 */
function performAll(iterable, constructor, deferred) {
  var store = {
    valueList: [],
    remain: 0,
    createResolve: function (index) {
      var isCalled = false

      /**
       * onFulfilled callback of a specific Promise.all element resolve
       * the promise created by Promise.all with an array of fulfillment
       * values
       * 
       * @param  {*} value [description]
       * @return {undefined}
       */
      return function resolveEach(value) {
        if (isCalled) {
          return
        }
        isCalled = true
        this.valueList[index] = value

        if (!--this.remain) {
          deferred.resolve(this.valueList)
          return
        }
      }.bind(store)
    }
  }

  try {
    iteratePromises(iterable, constructor, store, deferred)
  } catch (error) {
    deferred.reject(error)
  }

  return deferred.promise
}

/**
 * resolve all elements of the passed iterable to promises and call their "then"
 * method with wrapped resolve functions and reject functions as callbacks
 * 
 * @private
 * @param  {(Array|String|Map|Set|Arguments|Generator)} iterable
 * @param  {Function} constructor
 * @param  {Object} store - states of the iterating procedure
 * @param  {Object} deferred
 * @return {undefined}
 */
var iteratePromises = hasIterator ? function iteratePromises(iterable, constructor, store, deferred) {
  var index = 0,
      ite = iterable[Symbol.iterator](),
      step = ite.next()

  if (step.done) {
    deferred.resolve(store.valueList)
    return
  }

  while(!step.done) {
    store.valueList[index] = undefined
    constructor.resolve(step.value).then(store.createResolve(index), deferred.reject)
    index += 1
    store.remain += 1
    step = ite.next()
  }

} : function iteratePromises(iterable, constructor, store, deferred) {
  iterable = isArguments(iterable) ? slice(iterable) : iterable

  if (!iterable.length) {
    deferred.resolve(store.valueList)
    return
  }

  Array.prototype.forEach.call(iterable, function (el, index) {
    store.valueList[index] = undefined
    store.remain += 1
    constructor.resolve(el).then(store.createResolve(index), deferred.reject)
  })
}