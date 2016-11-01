'use strict'

const Promise = require('../../dist/lp.cjs')
const { expect } = require('chai')
const { shouldFulfilled, shouldRejected } = require('./helpers')

describe('Promise.race( iterable )', function () {
  it('should throw a TypeError exception if the "this" value is not a constructor', function () {
    const thrower = () => Promise.race.call({}, [])

    expect(thrower).to.throw(TypeError)
  })

  it('should return a new promise whose constructor is the supplied constructor', function () {
    expect( Promise.race([1, 2]) ).to.be.instanceof(Promise)
  })

  it('should return a rejected promise for non-iterable argument', function () {
    const notIter = {}

    return shouldRejected( Promise.race(notIter) ).catch(err => {
      expect(err).to.be.instanceof(TypeError)
    })
  })

  it('requires the supplied constructor to provide a "resolve" method', function () {
    const iter = [ 1 ]
    const FakeSub = class FakePromise extends Promise {
      constructor(resolver) {
        super(resolver)
      }
    }

    FakeSub.resolve = 1

    return shouldRejected( FakeSub.race(iter) ).catch(err => {
      expect(err).to.be.instanceof(TypeError)
    })
  })

  context('when the argument is an iterable without thenable elements', function () {
    it('should return a pending promise for the empty string argument', function (done) {
      this.timeout(200)

      const queue = [1]
      const p1 = Promise.race('').then(val => queue.push(2))

      setTimeout((seq, done) => {
        expect(seq).to.eql([1])
        done()
      }, 100, queue, done)
    })

    it('should return a promise fulfilled with the first element of the passed string', function () {
      const str = 'str'

      return shouldFulfilled( Promise.race(str) ).then(val => {
        expect(val).to.equal(str.charAt(0))
      })
    })

    it('should return a pending promise for the empty array argument', function (done) {
      this.timeout(200)

      const queue = [1]
      const p1 = Promise.race( [] ).then(val => queue.push(2))

      setTimeout((seq, done) => {
        expect(seq).to.eql([1])
        done()
      }, 100, queue, done)
    })

    it('should return a promise fulfilled with the first elements of the passed array', function () {
      const arr = [ 'ab', false, 1, null, undefined, {}, function () {} ]

      return shouldFulfilled( Promise.race(arr) ).then(val => {
        expect(val).to.equal(arr[0])
      })
    })
  })

  context('when the argument is an iterable with thenable elements', function () {
    it('should return a promise fulfilled with the value of the first passed promise that fulfills', function () {
      const p1 = new Promise(rs => setTimeout(rs, 0, 'p1'))
      const p2 = Promise.resolve('p2')

      return shouldFulfilled( Promise.race([p1, p2]) ).then(val => {
        expect(val).to.equal('p2')
      })
    })

    it('should keep pending until one of the passed promises fulfilled', function () {
      const p1 = new Promise(rs => setTimeout(rs, 10, 'p1'))
      const p2 = new Promise(rs => setTimeout(rs, 30, 'p2'))
      const queue = [1]

      p1.then(val => {
        expect(queue).to.eql([1])
        queue.push(2)
      })

      const res = shouldFulfilled( Promise.race([p1, p2]) ).then(val => {
        expect(queue).to.eql([1, 2])
        queue.push(3)
      })

      p2.then(val => {
        expect(queue).to.eql([1, 2, 3])
        queue.push(4)
      })

      return res
    })

    it('should return a promise rejected with the reason of the first passed promise that rejects', function () {
      const iter = [ Promise.reject(1), Promise.reject(2) ]

      return shouldRejected( Promise.race(iter) ).catch(reason => {
        expect(reason).to.equal(1)
      })
    })

    it('should return a promise whose state depends on the status of the first passed promise', function () {
      const p1 = new Promise((rs, rj) => setTimeout(rj, 0, 'p1'))
      const p2 = Promise.resolve('p2')
      const p3 = Promise.reject('p3')

      return shouldFulfilled( Promise.race([p1, p2, p3]) ).then(val => {
        expect(val).to.equal('p2')
      })
    })
  })
})