'use strict'

const Promise = require('../../dist/lp.cjs')
const { expect } = require('chai')
const { shouldFulfilled, shouldRejected } = require('./helpers')

describe('the Promise Prototype Object', function () {
  context('Promise.prototype', function () {
    it('has an initial value which is the Promise Prototype Object', function () {
      const p1 = new Promise((resolve, reject) => resolve(1))

      expect(Object.getPrototypeOf(p1)).to.equal(Promise.prototype)
    })

    it('has the attributes [[Writable]]: false', function () {
      expect(Promise).ownPropertyDescriptor('prototype').to.have.property('writable', false)
    })

    it('has the attributes [[Enumerable]]: false', function () {
      expect(Promise).ownPropertyDescriptor('prototype').to.have.property('enumerable', false)
    })

    it('has the attributes [[Configurable]]: false', function () {
      expect(Promise).ownPropertyDescriptor('prototype').to.have.property('configurable', false)
    })
  })

  context('Properties of the Promise Prototype Object', function () {
    it('has a [[Prototype]] internal slot with the value of the Object Prototype Object', function () {
      expect(Object.getPrototypeOf(Promise.prototype)).to.equal(Object.prototype)
    })

    it('has a "catch" method - Promise.prototype.catch( onRejected )', function () {
      expect(Promise.prototype).to.have.ownProperty('catch')
      expect(Promise.prototype.catch).to.be.a('function')
    })

    it('has a "constructor" property whose value is Promise - Promise.prototype.constructor', function () {
      expect(Promise.prototype).to.have.ownProperty('constructor')
      expect(Promise.prototype.constructor).to.equal(Promise)
    })

    it('has a "then" method - Promise.prototype.then( onFulfilled, onRejected )', function () {
      expect(Promise.prototype).to.have.ownProperty('then')
      expect(Promise.prototype.then).to.be.a('function')
    })
  })
})