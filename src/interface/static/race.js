import {
  slice,
  isArguments,
  isConstructor,
  isIterable,
  hasIterator
} from '../../util/lang'
import { getNewCapability } from '../../internal/operation'

/**
 * create a new promise which is settled in the same way as the first passed
 * promise to settle
 * 
 * @static
 * @memberOf Promise
 * @param  {(Array|String|Map|Set|Arguments|Generator)} iterator
 * @return {Promise}
 */
export default function race(iterable) {
  var deferred

  if ( !isConstructor(this) ) {
    throw new TypeError('the "all" method must be called on a constructor')
  }

  deferred = getNewCapability(this)

  if (!isIterable(iterable)) {
    deferred.reject(new TypeError('the argument is not an iterable'))
    return deferred.promise
  }

  try {
    performRace(iterable, this, deferred)
  } catch (error) {
    deferred.reject(error)
  }

  return deferred.promise
}

/**
 * iterate the passed iterable to resolve or reject the promise created by
 * Promise.all
 * 
 * @private
 * @param  {(Array|String|Map|Set|Arguments|Generator)} iterable
 * @param  {Function} constructor - the Promise constructor or its subclass
 * @param  {Object} deferred
 * @return {undefined}
 */
var performRace = hasIterator ? function performRace(iterable, constructor, deferred) {
  var ite = iterable[Symbol.iterator](),
      step = ite.next()

  if (step.done) {
    return
  }
  while(!step.done) {
    constructor.resolve(step.value).then(deferred.resolve, deferred.reject)
    step = ite.next()
  }

} : function performRace(iterable, constructor, deferred) {
  iterable = isArguments(iterable) ? slice(iterable) : iterable

  if (!iterable.length) {
    return
  }

  Array.prototype.forEach.call(iterable, function (el) {
    constructor.resolve(el).then(deferred.resolve, deferred.reject)
  })
}