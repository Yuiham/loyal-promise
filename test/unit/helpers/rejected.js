module.exports = function (promise) {
  return {
    catch(fn) {
      return promise.then(
        val => { throw new Error('should not fulfilled') }, 
        err => fn.call(promise, err)
        )
    }
  }
}