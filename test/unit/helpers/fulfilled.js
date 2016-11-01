module.exports = function (promise) {
  return {
    then(fn) {
      return promise.then(
        val => fn.call(promise, val), 
        err => { throw err}
        )
    }
  }
}