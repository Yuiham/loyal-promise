'use strict'

const Promise = require('../../dist/lp.cjs')
const { expect } = require('chai')
const { shouldFulfilled, shouldRejected } = require('./helpers')

describe('Promise.resolve( x )', function () {
  it('should throw a TypeError exception if the "this" value is not a constructor', function () {
    const thrower = () => Promise.resolve.call('str', null)

    expect(thrower).to.throw(TypeError)
  })

  it('should return a promise whose constructor is the supplied constructor', function () {
    expect(Promise.resolve('p1')).to.be.instanceof(Promise)
  })

  it('should return a fulfilled promise if the argument is a primitive value', function () {
    return shouldFulfilled(Promise.resolve(1)).then(val => {
      expect(val).to.equal(1)
    })
  })

  it('should return a fulfilled promise if the argument is an object except a thenable', function () {
    const obj = { a: 1 }

    return shouldFulfilled(Promise.resolve(obj)).then(val => {
      expect(val).to.equal(obj)
    })
  })

  it('should return the argument itself if the argument is a promise produced by this constructor', function () {
    const p1 = new Promise((resolve, reject) => resolve('p1'))
    const p2 = new Promise((resolve, reject) => {
      expect(Promise.resolve(p1)).to.equal(p1)
      throw new Error('err')
    })
    
    expect(Promise.resolve(p2)).to.equal(p2)
  })

  it('should return a fulfilled promise if the argument is a thenable with a non-callable "then" property', 
    function () {
    const t1 = {
      then: {}
    }

    return shouldFulfilled(Promise.resolve(t1)).then(val => {
      expect(val).to.equal(t1)
    })
  })

  it('can resolve a thenable whose "then" property is a function', function () {
    const t1 = {
      then: (resolve) => resolve('t1')
    }

    return shouldFulfilled(Promise.resolve(t1)).then(val => {
      expect(val).to.equal('t1')
    })
  })

  it('can resolve a thenable whose "then" method resolves another thenable', function () {
    const t1 = {
      then: (resolve) => {
        resolve({
          then: (resolve) => resolve('t1')
        })
      }
    }

    return shouldFulfilled(Promise.resolve(t1)).then(val => {
      expect(val).to.equal('t1')
    })
  })

  it('can return a rejected promise if the "then" method of the passing thenable calls the "reject" callback', 
    function () {
    const t1 = {
      then: (resolve, reject) => reject('failed')
    }

    return shouldRejected(Promise.resolve(t1)).catch(reason => {
      expect(reason).to.equal('failed')
    })
  })

  it('can return a rejected promise if the argument is a thenable that participates in a circular thenable chain', function () {
    const last = {}
    const chain = [1, 2, last].reduce((pre, cur, idx, arr) => {
      const then = (resolve, reject) => resolve(pre)

      return idx === arr.length - 1 ? (cur.then = then, cur) : { then }
    }, last)

    return shouldRejected(Promise.resolve(chain)).catch(err => {
      expect(err).to.be.instanceof(TypeError)
    })
  })
})