/**
 * Error-handling related functions.
 */
import { error } from './log.js'

/**
 * Reject with the given reason.
 * @param {string} msg - Error message.
 * @param {Error} err - Original error object (used for debugging in Travis).
 * @return A Promise that is rejected with the given reason.
 */
export const reject = (msg, underlying) => {
  const error = new Error(msg)
  if (underlying) {
    error.stack = underlying.stack
  }
  return Promise.reject(error)
}

/**
 * Generic rejection handler (insert dating joke here).
 *
 * Intended to be used as part of a Promise chain.
 * @param {Error} err - Standard Javascript Error object.
 */
export const handleErrors = err => {
  error(err.message ? err.message : err)
  process.exit(1)
}

export default {
  handleErrors,
  reject
}
