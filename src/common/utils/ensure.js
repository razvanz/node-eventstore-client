module.exports.notNullOrEmpty = function(value, name) {
  if (value === null)
    throw new Error(name + " is null.");
  if (value === '')
    throw new Error(name + " is empty.");
};

module.exports.notNull = function(value, name) {
  if (value === null)
    throw new Error(name + " is null.");
};

module.exports.isInteger = function(value, name) {
  if (typeof value !== 'number' || value % 1 !== 0)
    throw new TypeError(name + " is not an integer.");
};

module.exports.isArrayOf = function(expectedType, value, name) {
  if (!Array.isArray(value))
    throw new TypeError(name + " is not an array.");
  if (!value.every(function(x) { return x instanceof expectedType; }))
    throw new TypeError([name, " is not an array of ", expectedType, "."].join(""));
};