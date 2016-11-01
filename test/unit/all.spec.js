'use strict'

const Promise = require('../../dist/lp.cjs')
const { expect } = require('chai')
const { shouldFulfilled, shouldRejected } = require('./helpers')

describe('Promise.all( iterable )', function () {
  it('should throw a TypeError exception if the "this" value is not a constructor', function () {
    const thrower = () => Promise.all.call({}, [])

    expect(thrower).to.throw(TypeError)
  })

  it('should return a new promise whose constructor is the supplied constructor', function () {
    expect(Promise.all([1, 2])).to.be.instanceof(Promise)
  })

  it('should return a rejected promise for non-iterable argument', function () {
    const notIter = {}

    return shouldRejected( Promise.all(notIter) ).catch(err => {
      expect(err).to.be.instanceof(TypeError)
    })
  })

  it('requires the supplied constructor to provide a "resolve" method', function () {
    const iter = [ Promise.resolve('iter') ]
    const FakeSub = class FakePromise extends Promise {
      constructor(resolver) {
        super(resolver)
      }
    }

    FakeSub.resolve = 1

    return shouldRejected( FakeSub.all(iter) ).catch(err => {
      expect(err).to.be.instanceof(TypeError)
    })
  })

  context('when the argument is an iterable without thenable elements', function () {
    it('should return a promise fulfilled with an empty array for the empty string argument', function () {
        return shouldFulfilled( Promise.all('') ).then(val => {
          expect(val).to.eql([])
        })
    })

    it('should return a promise fulfilled with an array of elements of the passed string', function () {
      return shouldFulfilled( Promise.all('str') ).then(val => {
        expect(val).to.eql(['s', 't', 'r'])
      })
    })

    it('should return a promise fulfilled with an empty array for the empty array argument', function () {
      return shouldFulfilled( Promise.all([]) ).then(val => {
        expect(val).to.eql([])
      })
    })

    it('should return a promise fulfilled with an array of elements of the passed array', function () {
      const arr = [ {}, function () {}, 'ab', false, 1, null, undefined ]

      return shouldFulfilled( Promise.all(arr) ).then(val => {
        expect(val).to.eql(arr)
      })
    })
  })

  context('when the argument is an iterable with thenable elements', function () {
    it('should return a promise fulfilled with an array of fulfillment values for the passed promises', function () {
      const iter = [ Promise.resolve('p1'), Promise.resolve('p2') ]

      return shouldFulfilled( Promise.all(iter) ).then(val => {
        expect(val).to.eql(['p1', 'p2'])
      })
    })

    it('should keep pending until all the passed promises fulfilled', function () {
      const p1 = new Promise((resolve, reject) => setTimeout(resolve, 10, 'p1'))
      const p2 = new Promise((resolve, reject) => setTimeout(resolve, 20, 'p2'))
      const queue = [1]

      p1.then(val => {
        expect(queue).to.eql([1])
        queue.push(2)
      })

      const res = shouldFulfilled( Promise.all([p1, p2]) ).then(val => {
        expect(queue).to.eql([1, 2, 3])
        queue.push(4)
      })

      p2.then(val => {
        expect(queue).to.eql([1, 2])
        queue.push(3)
      })

      return res
    })

    it('should return a promise rejected with the reason of the first passed promise that rejects', function () {
      const iter = [ Promise.resolve(1), Promise.reject(2), Promise.reject(3) ]

      return shouldRejected( Promise.all(iter) ).catch(reason => {
        expect(reason).to.equal(2)
      })
    })
  })
})