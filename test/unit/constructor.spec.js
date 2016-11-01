'use strict'

const Promise = require('../../dist/lp.cjs')
const { expect } = require('chai')
const { shouldFulfilled, shouldRejected } = require('./helpers')

describe('The Promise Constructor', function () {
  it('creates and initializes a new Promise object when called as a constructor', function () {
    let p1

    expect(p1).to.be.undefined

    p1 = new Promise((resolve, reject) => resolve('p1'))

    expect(p1).to.be.instanceof(Promise)
  })

  context('is designed to be subclassable', function () {
    it('may be used as the value in an extends clause of a class definition', function () {
      const subPromise = class SubPromise extends Promise {}

      expect( Object.getPrototypeOf(subPromise) ).to.equal(Promise)
      expect( Object.getPrototypeOf(subPromise.prototype) ).to.equal(Promise.prototype)
    })
  })

  context('Promise( executor )', function () {
    it('should throw TypeError when called as a function', function() {
      const thrower = () => {
        Promise((rs, rj) => {})
      }
      expect( thrower ).to.throw(TypeError)
    })

    it('should throw TypeError if "this" is not of type object', function () {
      const thrower = () => {
        Promise.call({}, () => {})
      }
      expect( thrower ).to.throw(TypeError)
    })

    it('should throw TypeError if "this" is not a new instance of the supplied constructor', function () {
      const p1 = Promise.resolve(1)
      const thrower = () => {
        Promise.call(p1, (rs, rj) => rs('p1'))
      }
      expect( thrower ).to.throw(TypeError)
    })

    it('should throw TypeError if the passed executor is not callable', function () {
      const notCall = ''
      const thrower = () => new Promise(notCall)

      expect( thrower ).to.throw(TypeError)
    })

    it('should return a rejected promise if the executor throws exceptions', function () {
      const errMsg = 'thrown from the executor'
      const p1 = new Promise((resolve, reject) => {
        throw new Error(errMsg)
      })

      return shouldRejected(p1).catch(err => {
        expect(err.message).to.equal(errMsg)
      })
    })
  })

  context('Properties of the Promise Constructor', function () {
    it('has a [[Protoype]] internal slot whose value is the Function prototype object', function () {
      expect( Object.getPrototypeOf(Promise) ).to.equal(Function.prototype)
    })

    it('has a "all" method - Promise.all( iterable )', function () {
      expect(Promise).to.have.ownProperty('all')
      expect(Promise.all).to.be.a('function')
    })

    it('has a "prototype" property - Promise.prototype', function () {
      expect(Promise).to.have.ownProperty('prototype')
      expect(Promise.prototype).to.be.an('object')
    })

    it('has a "race" method - Promise.race( iterable )', function () {
      expect(Promise).to.have.ownProperty('race')
      expect(Promise.race).to.be.a('function')
    })

    it('has a "reject" method - Promise.reject( r )', function () {
      expect(Promise).to.have.ownProperty('reject')
      expect(Promise.reject).to.be.a('function')
    })

    it('has a "resolve" method - Promise.resolve( x )', function () {
      expect(Promise).to.have.ownProperty('resolve')
      expect(Promise.resolve).to.be.a('function')
    })
  })
})