import {
  then,
  caught,
  toString
} from './instance/index'
import {
  resolve,
  reject,
  all,
  race
} from './static/index'
import Promise from './promise'

Object.defineProperty(Promise, 'prototype', {
  writable: false,
  enumerable: false,
  configurable: false
})
Promise.prototype.toString = toString
Promise.prototype.then = then
Promise.prototype.catch = caught
Promise.reject = reject
Promise.resolve = resolve
Promise.all = all
Promise.race = race

export default Promise