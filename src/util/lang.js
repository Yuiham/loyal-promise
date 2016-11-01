var getType = Object.prototype.toString.call.bind(Object.prototype.toString)
var slice = Array.prototype.slice.call.bind(Array.prototype.slice)
var isArray = Array.isArray || function isArray(arr) {
  return getType(arr) === '[object Array]'
}
var hasSymbol = typeof Symbol !== 'undefined'
var hasIterator = hasSymbol 
                && typeof Symbol.iterator !== 'undefined'
                && isCallable(Array.prototype[Symbol.iterator]) 
                && isCallable(String.prototype[Symbol.iterator])
var isIterable = hasIterator ? function isIterable(x) { 
  return x !== undefined 
      && x !== null 
      && isCallable(x[Symbol.iterator]) 
      && isObject(x[Symbol.iterator]())
} : function isIterable(x) {
  return x !== undefined 
      && x !== null 
      && (isArray(x) || isString(x.valueOf()) || isArguments(x))
}
var isConstructor = isCallable

function isPlainObject(o) {
  return getType(o) === '[object Object]'
}

function isObject(o) {
  return typeof o === 'object' && o !== null
}

function isString(str) {
  return typeof str === 'string'
}

function isCallable(fn) {
  return typeof fn === 'function'
}

function isArguments(x) {
  return getType(x) === '[object Arguments]'
}

function valueToString(x) {
  return x === undefined || x === null ? x + '' : x.toString()
}

/**
 * get the constructor of an object
 *
 * @private
 * @param  {Object} x
 * @param  {Function} defaultFn - a default constructor
 * @return {Function} 
 */
function getConstructor(x, defaultFn) {
  var proto = x.__proto__ || Object.getPrototypeOf(x) 

  if (!isObject(proto) || proto.constructor === undefined) {
    return defaultFn
  }
  if (isConstructor(proto.constructor)) {
    return proto.constructor
  }

  throw new TypeError('the object has no constructor')
}

export {
  slice,
  isArray,
  isString,
  isObject,
  isPlainObject,
  isCallable,
  isConstructor,
  isArguments,
  isIterable,
  hasIterator,
  valueToString,
  getConstructor
}