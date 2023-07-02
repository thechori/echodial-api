/**
 * Clever way to do asynchronous sleep.
 * Check this: https://stackoverflow.com/a/46720712/778272
 *
 * @param {Number} millis - how long to sleep in milliseconds
 * @return {Promise<void>}
 */
async function sleep(millis) {
  return new Promise((resolve) => setTimeout(resolve, millis));
}

module.exports = sleep;
