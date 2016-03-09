function UserCredentials(username, password) {
  if (!username || username === '') throw new TypeError("username must be a non-empty string.");
  if (!password || password === '') throw new TypeError("password must be a non-empty string.");

  this.username = username;
  this.password = password;
}

module.exports = UserCredentials;