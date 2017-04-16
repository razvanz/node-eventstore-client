var ensure = require('../common/utils/ensure');

/**
 * @param {string} username
 * @param {string} password
 * @constructor
 * @property {string} username
 * @property {string} password
 */
function UserCredentials(username, password) {
  ensure.notNullOrEmpty(username, 'username');
  ensure.notNullOrEmpty(password, 'password');
  this.username = username;
  this.password = password;
  Object.freeze(this);
}

module.exports = UserCredentials;