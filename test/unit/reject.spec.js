'use strict'

const Promise = require('../../dist/lp.cjs')
const { expect } = require('chai')
const { shouldRejected } = require('./helpers')

describe('Promise.reject( x )', function () {
  it('should throw a TypeError exception if the "this" value is not a constructor', function () {
    const thrower = () => Promise.reject.call('str', null)

    expect(thrower).to.throw(TypeError)
  })

  it('should return a new promise whose constructor is the supplied constructor', function () {
    expect(Promise.reject('err')).to.be.instanceof(Promise)
  })

  it('should return a new promise rejected with the passed argument', function () {
    const obj = {}
    return shouldRejected(Promise.reject(obj)).catch(reason => {
      expect(reason).to.equal(obj)
    })
  })
})