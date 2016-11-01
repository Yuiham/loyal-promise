import Promise from '../interface/constructor'
import promisify from './promisify'
import promisifyAll from './promisifyAll'

/**
 * extend the Promise
 * 
 * @constructor
 * @param {Function} executor
 */
export default function PromiseExt(executor) {
  Promise.call(this, executor)
}

PromiseExt.prototype = Object.create(Promise.prototype, {
  constructor: {
    value: PromiseExt,
    writable:true, 
    configurable:true
  }
})
PromiseExt.promisify = promisify
PromiseExt.promisifyAll = promisifyAll

if (Object.setPrototypeOf) {
  Object.setPrototypeOf(PromiseExt, Promise)
} else if (PromiseExt.__proto__ === Function.prototype) {
  PromiseExt.__proto__ = Promise
} else {
  PromiseExt.resolve = Promise.resolve.bind(PromiseExt)
  PromiseExt.reject = Promise.reject.bind(PromiseExt)
  PromiseExt.all = Promise.all.bind(PromiseExt)
  PromiseExt.race = Promise.race.bind(PromiseExt)
}